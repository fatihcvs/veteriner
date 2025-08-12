import { useState } from 'react';
import { Plus, Calendar, Clock, AlertTriangle, Weight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Pet, FoodProduct, FeedingPlan, insertFeedingPlanSchema } from '@shared/schema';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// Köpek ağırlığına göre günlük mama hesaplama tablosu
const DAILY_FEEDING_CHART = [
  { weightKg: 5, dailyGrams: 105 },
  { weightKg: 7, dailyGrams: 135 },
  { weightKg: 10, dailyGrams: 175 },
  { weightKg: 15, dailyGrams: 240 },
  { weightKg: 20, dailyGrams: 300 },
  { weightKg: 25, dailyGrams: 355 },
  { weightKg: 30, dailyGrams: 405 },
  { weightKg: 40, dailyGrams: 500 },
];

// Form şeması
const feedingFormSchema = insertFeedingPlanSchema.extend({
  petWeightKg: z.number().min(1, 'Ağırlık en az 1 kg olmalıdır').max(100, 'Ağırlık en fazla 100 kg olabilir'),
  packageSizeGrams: z.number().min(100, 'Paket boyutu en az 100g olmalıdır'),
});

type FeedingFormData = z.infer<typeof feedingFormSchema>;

export default function FeedingPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Feeding plans sorgula
  const { data: feedingPlans = [], isLoading: isLoadingPlans } = useQuery<FeedingPlan[]>({
    queryKey: ['/api/feeding-plans'],
  });

  // Pets sorgula
  const { data: pets = [] } = useQuery<Pet[]>({
    queryKey: ['/api/pets'],
  });

  // Food products sorgula
  const { data: foodProducts = [] } = useQuery<FoodProduct[]>({
    queryKey: ['/api/food-products'],
  });

  // Form kontrolü
  const form = useForm<FeedingFormData>({
    resolver: zodResolver(feedingFormSchema),
    defaultValues: {
      petWeightKg: 10,
      packageSizeGrams: 3000,
      startDate: new Date().toISOString().split('T')[0],
      active: true,
    },
  });

  // Günlük mama miktarını hesapla
  const calculateDailyGrams = (weightKg: number): number => {
    // En yakın ağırlık aralığını bul
    const closest = DAILY_FEEDING_CHART.reduce((prev, curr) => 
      Math.abs(curr.weightKg - weightKg) < Math.abs(prev.weightKg - weightKg) ? curr : prev
    );
    
    // Lineer interpolasyon
    if (weightKg === closest.weightKg) return closest.dailyGrams;
    
    const lower = DAILY_FEEDING_CHART.filter(c => c.weightKg <= weightKg).slice(-1)[0];
    const upper = DAILY_FEEDING_CHART.filter(c => c.weightKg >= weightKg)[0];
    
    if (!lower) return upper.dailyGrams;
    if (!upper) return lower.dailyGrams;
    
    const ratio = (weightKg - lower.weightKg) / (upper.weightKg - lower.weightKg);
    return Math.round(lower.dailyGrams + (upper.dailyGrams - lower.dailyGrams) * ratio);
  };

  // Kaç gün yeteceğini hesapla
  const calculateDaysLeft = (packageSizeGrams: number, dailyGrams: number): number => {
    return Math.floor(packageSizeGrams / dailyGrams);
  };

  // Mama planı oluştur
  const createFeedingPlan = useMutation({
    mutationFn: async (data: FeedingFormData) => {
      const dailyGrams = calculateDailyGrams(data.petWeightKg);
      const daysLeft = calculateDaysLeft(data.packageSizeGrams, dailyGrams);
      const expectedDepletionDate = new Date();
      expectedDepletionDate.setDate(expectedDepletionDate.getDate() + daysLeft);

      const planData = {
        ...data,
        dailyGramsRecommended: dailyGrams,
        estimatedDaysLeft: daysLeft,
        expectedDepletionDate: expectedDepletionDate.toISOString().split('T')[0],
      };

      return await apiRequest('/api/feeding-plans', 'POST', planData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feeding-plans'] });
      setIsFormOpen(false);
      form.reset();
      toast({
        title: 'Başarılı',
        description: 'Mama takibi başarıyla eklendi.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: 'Mama takibi eklenirken hata oluştu.',
        variant: 'destructive',
      });
    },
  });

  // Mama planını sil
  const deleteFeedingPlan = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/feeding-plans/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feeding-plans'] });
      toast({
        title: 'Başarılı',
        description: 'Mama takibi silindi.',
      });
    },
  });

  const onSubmit = (data: FeedingFormData) => {
    createFeedingPlan.mutate(data);
  };

  const getStatusBadge = (plan: FeedingPlan & { pet: Pet; foodProduct: FoodProduct }) => {
    const daysLeft = plan.estimatedDaysLeft || 0;
    
    if (daysLeft <= 0) {
      return <Badge variant="destructive">Mama Bitti</Badge>;
    } else if (daysLeft <= 7) {
      return <Badge className="bg-orange-100 text-orange-800">Azalıyor</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Yeterli</Badge>;
    }
  };

  const weightKg = form.watch('petWeightKg');
  const packageSize = form.watch('packageSizeGrams');
  const dailyGrams = calculateDailyGrams(weightKg || 10);
  const estimatedDays = calculateDaysLeft(packageSize || 3000, dailyGrams);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Mama Takibi</h1>
          <p className="text-professional-gray mt-1">
            Evcil hayvanlarınızın mama tüketimini takip edin ve bitiş tarihlerini hesaplayın
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-medical-blue hover:bg-medical-blue/90">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Mama Takibi
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Mama Takibi Ekle</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="petId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Evcil Hayvan</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Evcil hayvan seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {pets.map((pet) => (
                              <SelectItem key={pet.id} value={pet.id}>
                                {pet.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="foodProductId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mama Ürünü</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Mama ürünü seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {foodProducts.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - {product.brand}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="petWeightKg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hayvan Ağırlığı (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="packageSizeGrams"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Paket Boyutu (gram)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="100"
                            step="100"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Başlangıç Tarihi</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hesaplama Önizlemesi */}
                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium text-slate-800">Hesaplama Önizlemesi</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Weight className="h-4 w-4 text-professional-gray" />
                      <span>Günlük: {dailyGrams}g</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-professional-gray" />
                      <span>Paket: {packageSize || 0}g</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-professional-gray" />
                      <span>~{estimatedDays} gün yeter</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFormOpen(false)}
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={createFeedingPlan.isPending}
                    className="bg-medical-blue hover:bg-medical-blue/90"
                  >
                    {createFeedingPlan.isPending ? 'Ekleniyor...' : 'Mama Takibi Ekle'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mama Takibi Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingPlans ? (
          <div className="col-span-full text-center py-8 text-professional-gray">
            Mama takipleri yükleniyor...
          </div>
        ) : feedingPlans.length === 0 ? (
          <div className="col-span-full text-center py-8 text-professional-gray">
            Henüz mama takibi bulunmuyor. İlk mama takibinizi ekleyin.
          </div>
        ) : (
          feedingPlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{plan.pet?.name}</CardTitle>
                    <p className="text-sm text-professional-gray">
                      {plan.foodProduct?.name}
                    </p>
                  </div>
                  {getStatusBadge(plan)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Weight className="h-4 w-4 text-professional-gray" />
                    <span>{plan.petWeightKg}kg</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-professional-gray" />
                    <span>{plan.dailyGramsRecommended}g/gün</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-professional-gray" />
                    <span>{plan.packageSizeGrams}g</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-professional-gray" />
                    <span>{plan.estimatedDaysLeft} gün</span>
                  </div>
                </div>

                {plan.expectedDepletionDate && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-professional-gray">
                      Tahmini bitiş: {format(new Date(plan.expectedDepletionDate), 'd MMMM yyyy', { locale: tr })}
                    </p>
                  </div>
                )}

                {plan.estimatedDaysLeft && plan.estimatedDaysLeft <= 7 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-orange-800">
                        Mama yakında bitecek! 1 hafta kaldı.
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => deleteFeedingPlan.mutate(plan.id)}
                    disabled={deleteFeedingPlan.isPending}
                  >
                    Sil
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}