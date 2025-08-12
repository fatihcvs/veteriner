import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Search, Filter, Eye, Calendar, Syringe, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/common/loading-spinner';
import PetForm from '@/components/pets/pet-form';
import { PET_SPECIES } from '@/lib/constants';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Pet } from '@shared/schema';
import { getSpeciesIcon } from '@/lib/species-utils';

export default function Pets() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('');
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: pets, isLoading } = useQuery({
    queryKey: ['/api/pets'],
  });

  const createPetMutation = useMutation({
    mutationFn: async (petData: any) => {
      await apiRequest('POST', '/api/pets', petData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pets'] });
      setIsFormOpen(false);
      toast({
        title: 'Başarılı',
        description: 'Evcil hayvan kaydı oluşturuldu.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: 'Evcil hayvan kaydı oluşturulamadı.',
        variant: 'destructive',
      });
    },
  });

  const filteredPets = pets?.filter((pet: Pet) => {
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (pet.breed && pet.breed.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpecies = !selectedSpecies || pet.species === selectedSpecies;
    return matchesSearch && matchesSpecies;
  }) || [];

  const handleCreatePet = (data: any) => {
    createPetMutation.mutate(data);
  };



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
          <h2 className="text-2xl font-bold text-slate-800">
            {user?.role === 'PET_OWNER' ? 'Hayvanlarım' : 'Evcil Hayvanlar'}
          </h2>
          <p className="text-professional-gray">
            {user?.role === 'PET_OWNER' 
              ? 'Evcil hayvanlarınızın detay bilgileri ve aşı takvimleri'
              : 'Kayıtlı evcil hayvanları yönetin'
            }
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-medical-blue hover:bg-medical-blue/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Hayvan Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Evcil Hayvan Ekle</DialogTitle>
            </DialogHeader>
            <PetForm
              onSubmit={handleCreatePet}
              isLoading={createPetMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-professional-gray h-4 w-4" />
                <Input
                  placeholder="Hayvan adı veya cins ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-professional-gray" />
              <select
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-medical-blue focus:border-medical-blue"
              >
                <option value="">Tüm Türler</option>
                {PET_SPECIES.map((species) => (
                  <option key={species.value} value={species.value}>{species.label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pets Grid */}
      {filteredPets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="bg-slate-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <i className="fas fa-paw text-professional-gray text-2xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {searchTerm || selectedSpecies ? 'Evcil hayvan bulunamadı' : 'Henüz evcil hayvan yok'}
                </h3>
                <p className="text-professional-gray">
                  {searchTerm || selectedSpecies 
                    ? 'Arama kriterlerinize uygun evcil hayvan bulunamadı.' 
                    : 'İlk evcil hayvan kaydınızı oluşturmak için yukarıdaki butonu kullanın.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map((pet: Pet) => (
            <Card key={pet.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={pet.avatarUrl || ''} alt={pet.name} />
                    <AvatarFallback className="bg-medical-blue/10">
                      <i className={`${getSpeciesIcon(pet.species)} text-medical-blue text-xl`}></i>
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-slate-800 truncate">{pet.name}</h3>
                    <p className="text-sm text-professional-gray">
                      {PET_SPECIES.find(s => s.value === pet.species)?.label || pet.species} 
                      {pet.breed && ` • ${pet.breed}`}
                    </p>
                    {pet.birthDate && (
                      <p className="text-xs text-professional-gray mt-1">
                        Doğum: {new Date(pet.birthDate).toLocaleDateString('tr-TR')}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline" className="text-xs">
                        {pet.sex === 'MALE' ? 'Erkek' : pet.sex === 'FEMALE' ? 'Dişi' : 'Belirtilmemiş'}
                      </Badge>
                      
                      {pet.microchipNo && (
                        <span className="text-xs text-professional-gray">
                          Çip: {pet.microchipNo.slice(-4)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setSelectedPet(pet)}
                    data-testid={`button-view-pet-${pet.id}`}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Detay
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setSelectedPet(pet)}
                    data-testid={`button-vaccination-pet-${pet.id}`}
                  >
                    <Syringe className="w-4 h-4 mr-1" />
                    Aşı
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pet Detail Dialog */}
      <Dialog open={!!selectedPet} onOpenChange={() => setSelectedPet(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <i className={`${selectedPet ? getSpeciesIcon(selectedPet.species) : 'fas fa-paw'} text-medical-blue`}></i>
              <span>{selectedPet?.name} - Detay Bilgileri</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPet && <PetDetailView pet={selectedPet} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Pet Detail View Component
function PetDetailView({ pet }: { pet: Pet }) {
  const { data: vaccinations, isLoading: vaccinationsLoading } = useQuery({
    queryKey: ['/api/pets', pet.id, 'vaccinations'],
    queryFn: async () => {
      const response = await fetch(`/api/pets/${pet.id}/vaccinations`);
      if (!response.ok) throw new Error('Failed to fetch vaccinations');
      return response.json();
    },
  });

  const calculateAge = (birthDate: string | Date) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const ageMs = today.getTime() - birth.getTime();
    const ageYears = Math.floor(ageMs / (1000 * 60 * 60 * 24 * 365.25));
    const ageMonths = Math.floor((ageMs % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
    
    if (ageYears > 0) {
      return `${ageYears} yaş${ageMonths > 0 ? `, ${ageMonths} ay` : ''}`;
    }
    return `${ageMonths} ay`;
  };

  const getUpcomingVaccinations = () => {
    if (!vaccinations) return [];
    const now = new Date();
    return vaccinations.filter((vacc: any) => 
      vacc.nextDueAt && new Date(vacc.nextDueAt) > now
    ).sort((a: any, b: any) => new Date(a.nextDueAt).getTime() - new Date(b.nextDueAt).getTime());
  };

  const getOverdueVaccinations = () => {
    if (!vaccinations) return [];
    const now = new Date();
    return vaccinations.filter((vacc: any) => 
      vacc.nextDueAt && new Date(vacc.nextDueAt) <= now && vacc.status !== 'DONE'
    );
  };

  const getCompletedVaccinations = () => {
    if (!vaccinations) return [];
    return vaccinations.filter((vacc: any) => vacc.status === 'DONE')
      .sort((a: any, b: any) => new Date(b.administeredAt).getTime() - new Date(a.administeredAt).getTime());
  };

  return (
    <div className="space-y-6">
      {/* Pet Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="w-5 h-5" />
              <span>Temel Bilgiler</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={pet.avatarUrl || ''} alt={pet.name} />
                <AvatarFallback className="bg-medical-blue/10">
                  <i className={`${getSpeciesIcon(pet.species)} text-medical-blue text-2xl`}></i>
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold text-slate-800">{pet.name}</h3>
                <p className="text-professional-gray">
                  {PET_SPECIES.find(s => s.value === pet.species)?.label || pet.species}
                </p>
                {pet.breed && (
                  <p className="text-sm text-professional-gray">{pet.breed}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm font-medium text-slate-600">Cinsiyet</p>
                <p className="text-slate-800">
                  {pet.sex === 'MALE' ? '♂ Erkek' : pet.sex === 'FEMALE' ? '♀ Dişi' : 'Belirtilmemiş'}
                </p>
              </div>
              
              {pet.birthDate && (
                <div>
                  <p className="text-sm font-medium text-slate-600">Yaş</p>
                  <p className="text-slate-800">{calculateAge(pet.birthDate)}</p>
                </div>
              )}
              
              {pet.weightKg && (
                <div>
                  <p className="text-sm font-medium text-slate-600">Ağırlık</p>
                  <p className="text-slate-800">{pet.weightKg} kg</p>
                </div>
              )}
              
              {pet.microchipNo && (
                <div>
                  <p className="text-sm font-medium text-slate-600">Mikroçip</p>
                  <p className="text-slate-800 font-mono text-sm">{pet.microchipNo}</p>
                </div>
              )}
            </div>
            
            {pet.birthDate && (
              <div className="pt-2">
                <p className="text-sm font-medium text-slate-600">Doğum Tarihi</p>
                <p className="text-slate-800">
                  {new Date(pet.birthDate).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vaccination Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Syringe className="w-5 h-5" />
              <span>Aşı Durumu</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {vaccinationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-800">Tamamlanan Aşılar</p>
                    <p className="text-sm text-green-600">Son yapılan aşı takibi</p>
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    {getCompletedVaccinations().length}
                  </div>
                </div>

                {getOverdueVaccinations().length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-800">Geciken Aşılar</p>
                      <p className="text-sm text-red-600">Acil yapılması gerekenler</p>
                    </div>
                    <div className="text-2xl font-bold text-red-700">
                      {getOverdueVaccinations().length}
                    </div>
                  </div>
                )}

                {getUpcomingVaccinations().length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-800">Yaklaşan Aşılar</p>
                      <p className="text-sm text-blue-600">Planlanmış aşı takvimiğin devamı</p>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">
                      {getUpcomingVaccinations().length}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vaccination Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Aşı Geçmişi ve Planı</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vaccinationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <Tabs defaultValue="completed" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="completed">Tamamlanan</TabsTrigger>
                <TabsTrigger value="upcoming">Yaklaşan</TabsTrigger>
                <TabsTrigger value="overdue">Geciken</TabsTrigger>
              </TabsList>

              <TabsContent value="completed" className="space-y-4">
                {getCompletedVaccinations().length > 0 ? (
                  getCompletedVaccinations().map((vaccination: any) => (
                    <div key={vaccination.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <Syringe className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{vaccination.vaccineName || 'Aşı'}</p>
                          <p className="text-sm text-professional-gray">
                            {vaccination.administeredAt && 
                              new Date(vaccination.administeredAt).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            }
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Tamamlandı
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-professional-gray">Henüz tamamlanmış aşı kaydı bulunmuyor</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-4">
                {getUpcomingVaccinations().length > 0 ? (
                  getUpcomingVaccinations().map((vaccination: any) => (
                    <div key={vaccination.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{vaccination.vaccineName || 'Aşı'}</p>
                          <p className="text-sm text-professional-gray">
                            {vaccination.nextDueAt && 
                              new Date(vaccination.nextDueAt).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            }
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Planlandı
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-professional-gray">Yaklaşan aşı planı bulunmuyor</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="overdue" className="space-y-4">
                {getOverdueVaccinations().length > 0 ? (
                  getOverdueVaccinations().map((vaccination: any) => (
                    <div key={vaccination.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-center space-x-3">
                        <div className="bg-red-100 p-2 rounded-full">
                          <Syringe className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{vaccination.vaccineName || 'Aşı'}</p>
                          <p className="text-sm text-red-600">
                            Gecikme: {vaccination.nextDueAt && 
                              Math.floor((Date.now() - new Date(vaccination.nextDueAt).getTime()) / (1000 * 60 * 60 * 24))
                            } gün
                          </p>
                        </div>
                      </div>
                      <Badge variant="destructive">
                        Gecikti
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-professional-gray">Geciken aşı bulunmuyor</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


