import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Syringe, AlertTriangle, Plus, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/common/loading-spinner';
import VaccinationForm from '@/components/vaccinations/vaccination-form';
import { VACCINATION_STATUS } from '@/lib/constants';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function Vaccinations() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overdue');
  const { toast } = useToast();

  const { data: overdueVaccinations = [], isLoading: overdueLoading } = useQuery({
    queryKey: ['/api/vaccinations/overdue'],
  });

  const { data: vaccines = [] } = useQuery({
    queryKey: ['/api/vaccines'],
  });

  const { data: pets = [] } = useQuery({
    queryKey: ['/api/pets'],
  });

  const createVaccinationMutation = useMutation({
    mutationFn: async (vaccinationData: any) => {
      await apiRequest('POST', '/api/vaccinations', vaccinationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vaccinations/overdue'] });
      setIsFormOpen(false);
      toast({
        title: 'Başarılı',
        description: 'Aşı kaydı oluşturuldu.',
      });
    },
    onError: (error) => {
      console.error('Vaccination creation error:', error);
      toast({
        title: 'Hata',
        description: error.message || 'Aşı kaydı oluşturulamadı.',
        variant: 'destructive',
      });
    },
  });

  const handleCreateVaccination = (data: any) => {
    console.log('Vaccination data being submitted:', data);
    createVaccinationMutation.mutate(data);
  };

  const handleDownloadCard = async (petId: string, petName: string) => {
    try {
      const response = await fetch(`/api/pets/${petId}/vaccination-card`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `aşı-kartı-${petName}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: 'Başarılı',
          description: 'Aşı kartı indirildi.',
        });
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Aşı kartı indirilemedi.',
        variant: 'destructive',
      });
    }
  };

  if (overdueLoading) {
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
          <h2 className="text-2xl font-bold text-slate-800">Aşı Kayıtları</h2>
          <p className="text-professional-gray">Aşı takibi ve hatırlatma sistemi</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-medical-blue hover:bg-medical-blue/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Aşı Kaydet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Aşı Kaydı</DialogTitle>
            </DialogHeader>
            <VaccinationForm
              pets={pets || []}
              vaccines={vaccines || []}
              onSubmit={handleCreateVaccination}
              isLoading={createVaccinationMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert Summary */}
      {overdueVaccinations?.length > 0 && (
        <Card className="border-alert-red bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-alert-red" />
              <div>
                <h3 className="font-semibold text-alert-red">
                  {overdueVaccinations.length} Aşı Vadesi Geçmiş
                </h3>
                <p className="text-sm text-red-700">
                  Acil müdahale gereken aşılar var. Lütfen hayvan sahipleriyle iletişime geçin.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overdue" className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Vadesi Geçen ({overdueVaccinations?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            <Calendar className="h-4 w-4 mr-2" />
            Yaklaşan
          </TabsTrigger>
          <TabsTrigger value="completed">
            <Syringe className="h-4 w-4 mr-2" />
            Tamamlanan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overdue" className="space-y-4">
          {!overdueVaccinations || overdueVaccinations.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                    <Syringe className="text-healthcare-green h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      Vadesi geçen aşı yok
                    </h3>
                    <p className="text-professional-gray">
                      Tüm aşılar zamanında yapılmış durumda.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {overdueVaccinations.map((vaccination: any) => (
                <Card key={vaccination.id} className="border-red-200 bg-red-50/50">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={vaccination.pet?.avatarUrl} alt={vaccination.pet?.name} />
                        <AvatarFallback className="bg-alert-red/10">
                          <i className="fas fa-paw text-alert-red text-xl"></i>
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg text-slate-800">
                              {vaccination.pet?.name || 'Bilinmeyen Hayvan'}
                            </h3>
                            <p className="text-sm text-professional-gray">
                              {vaccination.pet?.species} • {vaccination.pet?.breed}
                            </p>
                            <div className="flex items-center mt-2">
                              <Syringe className="h-4 w-4 text-alert-red mr-2" />
                              <span className="text-sm font-medium text-alert-red">
                                {vaccination.vaccine?.name || 'Bilinmeyen Aşı'}
                              </span>
                            </div>
                          </div>
                          
                          <Badge variant="destructive" className="bg-alert-red">
                            Gecikti
                          </Badge>
                        </div>

                        <div className="bg-white p-3 rounded-lg mt-3 border">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-professional-gray">Beklenen Tarih:</span>
                            <span className="font-medium text-alert-red">
                              {vaccination.nextDueAt 
                                ? format(new Date(vaccination.nextDueAt), 'dd MMMM yyyy', { locale: tr })
                                : 'Bilinmiyor'
                              }
                            </span>
                          </div>
                          {vaccination.administeredAt && (
                            <div className="flex items-center justify-between text-sm mt-1">
                              <span className="text-professional-gray">Son Aşı:</span>
                              <span className="font-medium">
                                {format(new Date(vaccination.administeredAt), 'dd MMMM yyyy', { locale: tr })}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2 mt-4">
                          <Button size="sm" className="bg-medical-blue hover:bg-medical-blue/90 text-white">
                            <Syringe className="h-3 w-3 mr-1" />
                            Aşıyı Yap
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadCard(vaccination.pet.id, vaccination.pet.name)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Aşı Kartı
                          </Button>
                          <Button variant="outline" size="sm">
                            <i className="fab fa-whatsapp mr-1"></i>
                            Hatırlat
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="bg-slate-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Calendar className="text-professional-gray h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    Yaklaşan Aşılar
                  </h3>
                  <p className="text-professional-gray">
                    Önümüzdeki 30 gün içinde yapılması gereken aşılar burada görünecek.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Syringe className="text-healthcare-green h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    Tamamlanan Aşılar
                  </h3>
                  <p className="text-professional-gray">
                    Son 30 gün içinde yapılan aşıların listesi burada görünecek.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
