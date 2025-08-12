import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import LoadingSpinner from '@/components/common/loading-spinner';
import PetForm from '@/components/pets/pet-form';
import { PET_SPECIES } from '@/lib/constants';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Pet } from '@shared/schema';

export default function Pets() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('');
  const { toast } = useToast();

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

  const getSpeciesIcon = (species: string) => {
    switch (species) {
      case 'DOG':
        return 'fas fa-dog';
      case 'CAT':
        return 'fas fa-cat';
      case 'BIRD':
        return 'fas fa-dove';
      default:
        return 'fas fa-paw';
    }
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
          <h2 className="text-2xl font-bold text-slate-800">Evcil Hayvanlar</h2>
          <p className="text-professional-gray">Kayıtlı evcil hayvanları yönetin</p>
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
                {Object.entries(PET_SPECIES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
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
                      {PET_SPECIES[pet.species as keyof typeof PET_SPECIES]} 
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
                  <Button variant="outline" size="sm" className="flex-1">
                    <i className="fas fa-eye mr-1"></i>
                    Detay
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <i className="fas fa-syringe mr-1"></i>
                    Aşı
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
