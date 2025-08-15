import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { FileText, Plus, Search, Filter, Download, Eye, Calendar, Stethoscope, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/common/loading-spinner';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MedicalRecord {
  id: string;
  petId: string;
  petName: string;
  petSpecies: string;
  ownerName: string;
  vetName: string;
  type: 'EXAMINATION' | 'SURGERY' | 'VACCINATION' | 'LABORATORY' | 'EMERGENCY';
  title: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  attachments?: string[];
  visitDate: string;
  nextVisitDate?: string;
  createdAt: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

interface Pet {
  id: string;
  name: string;
}

export default function MedicalRecords() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedPet, setSelectedPet] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  const { data: medicalRecords = [], isLoading } = useQuery<MedicalRecord[]>({
    queryKey: ['/api/medical-records'],
  });

  const { data: pets = [] } = useQuery<Pet[]>({
    queryKey: ['/api/pets'],
  });

  const recordTypes = {
    'EXAMINATION': { label: 'Muayene', color: 'bg-blue-100 text-blue-800', icon: '🔍' },
    'SURGERY': { label: 'Ameliyat', color: 'bg-red-100 text-red-800', icon: '⚕️' },
    'VACCINATION': { label: 'Aşılama', color: 'bg-green-100 text-green-800', icon: '💉' },
    'LABORATORY': { label: 'Laboratuvar', color: 'bg-purple-100 text-purple-800', icon: '🧪' },
    'EMERGENCY': { label: 'Acil', color: 'bg-orange-100 text-orange-800', icon: '🚨' },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Devam Ediyor';
      case 'COMPLETED': return 'Tamamlandı';
      case 'CANCELLED': return 'İptal Edildi';
      default: return status;
    }
  };

  const recordFormSchema = z.object({
    petId: z.string().min(1, 'Hayvan seçiniz'),
    type: z.string().min(1, 'Tür seçiniz'),
    title: z.string().min(1, 'Başlık gereklidir'),
    description: z.string().min(1, 'Açıklama gereklidir'),
    visitDate: z.string().min(1, 'Tarih gereklidir'),
    nextVisitDate: z.string().optional(),
    diagnosis: z.string().optional(),
    treatment: z.string().optional(),
    prescription: z.string().optional(),
  });

  const form = useForm<z.infer<typeof recordFormSchema>>({
    resolver: zodResolver(recordFormSchema),
    defaultValues: {
      petId: '',
      type: '',
      title: '',
      description: '',
      visitDate: '',
      nextVisitDate: '',
      diagnosis: '',
      treatment: '',
      prescription: '',
    },
  });

  const createRecordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof recordFormSchema>) => {
      const res = await apiRequest('POST', '/api/medical-records', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medical-records'] });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: 'Kayıt Oluşturuldu',
        description: 'Yeni tıbbi kayıt eklendi.',
      });
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'Kayıt oluşturulamadı.',
        variant: 'destructive',
      });
    },
  });

  const deleteRecordMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/medical-records/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medical-records'] });
      toast({ title: 'Kayıt silindi' });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Kayıt silinemedi.',
        variant: 'destructive',
      });
    },
  });

  const filteredRecords = medicalRecords.filter((record: MedicalRecord) => {
    const matchesSearch = 
      record.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !selectedType || record.type === selectedType;
    const matchesPet = !selectedPet || record.petId === selectedPet;
    
    let matchesTab = true;
    if (activeTab === 'active') matchesTab = record.status === 'ACTIVE';
    else if (activeTab === 'completed') matchesTab = record.status === 'COMPLETED';
    
    return matchesSearch && matchesType && matchesPet && matchesTab;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tıbbi Kayıtlar</h1>
          <p className="text-professional-gray">Muayene, tedavi ve medikal geçmiş kayıtları</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Rapor İndir
          </Button>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-medical-blue hover:bg-medical-blue/90"
                data-testid="button-add-record"
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Kayıt
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Yeni Tıbbi Kayıt</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) => createRecordMutation.mutate(data))}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="petId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hayvan</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Hayvan seçiniz" />
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
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tür</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Tür seçiniz" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(recordTypes).map(([key, type]) => (
                              <SelectItem key={key} value={key}>
                                {type.label}
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
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Başlık</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Açıklama</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="visitDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ziyaret Tarihi</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nextVisitDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sonraki Ziyaret</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="diagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teşhis</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="treatment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tedavi</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="prescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reçete</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-medical-blue hover:bg-medical-blue/90">
                    Kaydı Oluştur
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Tüm Kayıtlar</TabsTrigger>
          <TabsTrigger value="active">Devam Eden</TabsTrigger>
          <TabsTrigger value="completed">Tamamlanan</TabsTrigger>
        </TabsList>

        {/* Search and Filters */}
        <Card className="mt-4">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-professional-gray" />
                <Input
                  placeholder="Hayvan adı, sahip, teşhis ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-records"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-medical-blue focus:border-medical-blue"
                >
                  <option value="">Tüm Türler</option>
                  {Object.entries(recordTypes).map(([key, type]) => (
                    <option key={key} value={key}>{type.label}</option>
                  ))}
                </select>
                
                <select
                  value={selectedPet}
                  onChange={(e) => setSelectedPet(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-medical-blue focus:border-medical-blue"
                >
                  <option value="">Tüm Hayvanlar</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>{pet.name}</option>
                  ))}
                </select>
                
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrele
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Medical Records List */}
          <div className="space-y-4">
            {filteredRecords.map((record: MedicalRecord) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-medical-blue text-white">
                          {record.petName[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{record.title}</CardTitle>
                          <Badge className={recordTypes[record.type].color}>
                            {recordTypes[record.type].icon} {recordTypes[record.type].label}
                          </Badge>
                          <Badge className={getStatusColor(record.status)}>
                            {getStatusLabel(record.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-professional-gray">
                          <span>{record.petName} ({record.petSpecies})</span>
                          <span>•</span>
                          <span>{record.ownerName}</span>
                          <span>•</span>
                          <span>Dr. {record.vetName}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-professional-gray">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(record.visitDate), 'dd MMMM yyyy', { locale: tr })}</span>
                          {record.nextVisitDate && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="text-medical-blue">
                                Sonraki: {format(new Date(record.nextVisitDate), 'dd MMMM yyyy', { locale: tr })}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Görüntüle
                      </Button>
                      
                      {record.attachments && record.attachments.length > 0 && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Dosyalar
                        </Button>
                      )}

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteRecordMutation.mutate(record.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Sil
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {record.diagnosis && (
                      <div>
                        <h4 className="font-medium text-slate-700 mb-1">Teşhis</h4>
                        <p className="text-sm text-professional-gray">{record.diagnosis}</p>
                      </div>
                    )}
                    
                    {record.treatment && (
                      <div>
                        <h4 className="font-medium text-slate-700 mb-1">Tedavi</h4>
                        <p className="text-sm text-professional-gray">{record.treatment}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-slate-700 mb-1">Açıklama</h4>
                    <p className="text-sm text-professional-gray">{record.description}</p>
                  </div>
                  
                  {record.prescription && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="font-medium text-blue-800 mb-1 flex items-center">
                        <Stethoscope className="h-4 w-4 mr-1" />
                        Reçete
                      </h4>
                      <p className="text-sm text-blue-700">{record.prescription}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredRecords.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-professional-gray mb-4">
                  <FileText className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">
                  {activeTab === 'all' ? 'Henüz tıbbi kayıt yok' : 
                   activeTab === 'active' ? 'Devam eden tedavi yok' : 
                   'Tamamlanan tedavi yok'}
                </h3>
                <p className="text-professional-gray mb-4">
                  İlk tıbbi kaydınızı oluşturmak için yukarıdaki butonu kullanın.
                </p>
                <Button className="bg-medical-blue hover:bg-medical-blue/90">
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Kaydı Oluştur
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}