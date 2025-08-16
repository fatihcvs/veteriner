import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Search, Filter, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import LoadingSpinner from '@/components/common/loading-spinner';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface PetOwner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  whatsappPhone?: string;
  whatsappOptIn: boolean;
  pets: Array<{
    id: string;
    name: string;
    species: string;
  }>;
  profileDetails?: {
    address?: string;
    emergencyContact?: string;
  };
}

export default function PetOwners() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const { toast } = useToast();

  const { data: petOwners = [], isLoading } = useQuery<PetOwner[]>({
    queryKey: ['/api/pet-owners'],
  });

  const filteredOwners = petOwners.filter((owner: PetOwner) => {
    const matchesSearch = 
      owner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
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
          <h1 className="text-2xl font-bold text-slate-800">Hayvan Sahipleri</h1>
          <p className="text-professional-gray">Müşteri bilgileri ve iletişim detayları</p>
        </div>
        
        <Button
          className="bg-medical-blue hover:bg-medical-blue/90"
          data-testid="button-add-owner"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Müşteri
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-professional-gray" />
              <Input
                placeholder="İsim, e-posta veya telefon ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-owners"
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrele
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pet Owners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOwners.map((owner: PetOwner) => (
          <Card key={owner.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-medical-blue text-white">
                      {owner.firstName[0]}{owner.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {owner.firstName} {owner.lastName}
                    </CardTitle>
                    <p className="text-sm text-professional-gray">{owner.email}</p>
                  </div>
                </div>
                
                {owner.whatsappOptIn && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    WhatsApp
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                {owner.phone && (
                  <div className="flex items-center text-sm text-professional-gray">
                    <Phone className="h-4 w-4 mr-2" />
                    {owner.phone}
                  </div>
                )}
                
                <div className="flex items-center text-sm text-professional-gray">
                  <Mail className="h-4 w-4 mr-2" />
                  {owner.email}
                </div>
                
                {owner.profileDetails?.address && (
                  <div className="flex items-center text-sm text-professional-gray">
                    <MapPin className="h-4 w-4 mr-2" />
                    {owner.profileDetails.address}
                  </div>
                )}
              </div>

              {/* Pets */}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Evcil Hayvanları ({owner.pets?.length || 0})
                </p>
                <div className="flex flex-wrap gap-1">
                  {owner.pets?.slice(0, 3).map((pet) => (
                    <Badge key={pet.id} variant="outline" className="text-xs">
                      {pet.name} ({pet.species === 'DOG' ? '🐕' : '🐱'})
                    </Badge>
                  ))}
                  {owner.pets?.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{owner.pets.length - 3} daha
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Detaylar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  İletişim
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredOwners.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-professional-gray mb-4">
              <i className="fas fa-users text-4xl"></i>
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              Henüz müşteri kaydı yok
            </h3>
            <p className="text-professional-gray mb-4">
              İlk müşteri kaydınızı oluşturmak için yukarıdaki butonu kullanın.
            </p>
            <Button className="bg-medical-blue hover:bg-medical-blue/90">
              <Plus className="h-4 w-4 mr-2" />
              İlk Müşteriyi Ekle
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}