import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Syringe, ShoppingCart, Heart, Edit3 } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { updatePetSchema } from '@shared/schema';
import type { UpdatePet } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface PetEditModalProps {
  pet: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function PetEditModal({ pet, isOpen, onClose }: PetEditModalProps) {
  const [activeTab, setActiveTab] = useState('info');
  const { toast } = useToast();

  const form = useForm<UpdatePet>({
    resolver: zodResolver(updatePetSchema),
    defaultValues: {
      name: pet?.name || '',
      species: pet?.species || '',
      breed: pet?.breed || undefined,
      sex: pet?.sex || undefined,
      birthDate: pet?.birthDate || undefined,
      weightKg: pet?.weightKg || undefined,
      microchipNo: pet?.microchipNo || undefined,
    },
  });

  // Fetch pet's detailed information
  const { data: petDetails } = useQuery({
    queryKey: ['/api/admin/pets', pet?.id, 'details'],
    enabled: !!pet?.id && isOpen,
  });

  const { data: petVaccinations = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/pets', pet?.id, 'vaccinations'],
    enabled: !!pet?.id && isOpen,
  });

  const { data: petAppointments = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/pets', pet?.id, 'appointments'],
    enabled: !!pet?.id && isOpen,
  });

  const { data: petFeedingPlans = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/pets', pet?.id, 'feeding-plans'],
    enabled: !!pet?.id && isOpen,
  });

  const updatePetMutation = useMutation({
    mutationFn: async (data: UpdatePet) => {
      return await apiRequest('PUT', `/api/admin/pets/${pet.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pets'] });
      toast({
        title: 'Başarılı',
        description: 'Hayvan bilgileri güncellendi.',
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: error.message || 'Hayvan güncellenirken hata oluştu.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: UpdatePet) => {
    updatePetMutation.mutate(data);
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'Belirtilmemiş';
    const today = new Date();
    const birth = new Date(birthDate);
    const diffTime = Math.abs(today.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} gün`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay`;
    return `${Math.floor(diffDays / 365)} yaş`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            {pet?.name} - Hayvan Düzenle
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Temel Bilgiler</TabsTrigger>
            <TabsTrigger value="vaccinations">Aşılar</TabsTrigger>
            <TabsTrigger value="appointments">Randevular</TabsTrigger>
            <TabsTrigger value="feeding">Beslenme</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hayvan Adı *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="species"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tür *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Tür seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DOG">Köpek</SelectItem>
                            <SelectItem value="CAT">Kedi</SelectItem>
                            <SelectItem value="BIRD">Kuş</SelectItem>
                            <SelectItem value="RABBIT">Tavşan</SelectItem>
                            <SelectItem value="HAMSTER">Hamster</SelectItem>
                            <SelectItem value="FISH">Balık</SelectItem>
                            <SelectItem value="OTHER">Diğer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="breed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cins</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cinsiyet</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Cinsiyet seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MALE">Erkek</SelectItem>
                            <SelectItem value="FEMALE">Dişi</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doğum Tarihi</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weightKg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ağırlık (kg)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="microchipNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mikroçip Numarası</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    İptal
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updatePetMutation.isPending}
                    className="bg-medical-blue hover:bg-medical-blue/90"
                  >
                    {updatePetMutation.isPending ? 'Güncelleniyor...' : 'Güncelle'}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="vaccinations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Syringe className="h-5 w-5" />
                  Aşı Geçmişi ({petVaccinations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {petVaccinations.length === 0 ? (
                  <p className="text-center text-professional-gray py-8">
                    Henüz aşı kaydı bulunmuyor.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {petVaccinations.map((vaccination: any) => (
                      <div key={vaccination.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{vaccination.vaccineName}</p>
                          <p className="text-sm text-professional-gray">
                            {new Date(vaccination.administeredAt).toLocaleDateString('tr-TR')}
                          </p>
                          {vaccination.nextDueAt && (
                            <p className="text-sm text-blue-600">
                              Sonraki: {new Date(vaccination.nextDueAt).toLocaleDateString('tr-TR')}
                            </p>
                          )}
                        </div>
                        <Badge variant={vaccination.status === 'DONE' ? 'default' : 'secondary'}>
                          {vaccination.status === 'DONE' ? 'Tamamlandı' : vaccination.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Randevu Geçmişi ({petAppointments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {petAppointments.length === 0 ? (
                  <p className="text-center text-professional-gray py-8">
                    Henüz randevu kaydı bulunmuyor.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {petAppointments.map((appointment: any) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{appointment.appointmentType}</p>
                          <p className="text-sm text-professional-gray">
                            {new Date(appointment.appointmentDate).toLocaleDateString('tr-TR')} - {appointment.appointmentTime}
                          </p>
                          {appointment.notes && (
                            <p className="text-sm text-professional-gray mt-1">{appointment.notes}</p>
                          )}
                        </div>
                        <Badge variant={appointment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                          {appointment.status === 'COMPLETED' ? 'Tamamlandı' : 
                           appointment.status === 'SCHEDULED' ? 'Planlandı' : appointment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feeding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Beslenme Planları ({petFeedingPlans.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {petFeedingPlans.length === 0 ? (
                  <p className="text-center text-professional-gray py-8">
                    Henüz beslenme planı bulunmuyor.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {petFeedingPlans.map((plan: any) => (
                      <div key={plan.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{plan.foodProductName}</p>
                          <p className="text-sm text-professional-gray">
                            Günlük: {plan.dailyGramsRecommended}g | Ağırlık: {plan.petWeightKg}kg
                          </p>
                          <p className="text-sm text-professional-gray">
                            Başlangıç: {new Date(plan.startDate).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <Badge variant={plan.active ? 'default' : 'secondary'}>
                          {plan.active ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}