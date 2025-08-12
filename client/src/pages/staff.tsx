import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { UserPlus, Search, Filter, Mail, Phone, Shield, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/common/loading-spinner';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'SUPER_ADMIN' | 'CLINIC_ADMIN' | 'VET' | 'STAFF';
  specialization?: string;
  licenseNumber?: string;
  workingHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  joinedAt: string;
  lastLoginAt?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  permissions?: string[];
}

export default function Staff() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  const { data: staffMembers, isLoading } = useQuery({
    queryKey: ['/api/staff'],
  });

  const roles = {
    'SUPER_ADMIN': { label: 'Süper Admin', color: 'bg-purple-100 text-purple-800', icon: '👑' },
    'CLINIC_ADMIN': { label: 'Klinik Yöneticisi', color: 'bg-blue-100 text-blue-800', icon: '👨‍💼' },
    'VET': { label: 'Veteriner', color: 'bg-green-100 text-green-800', icon: '👨‍⚕️' },
    'STAFF': { label: 'Personel', color: 'bg-gray-100 text-gray-800', icon: '👤' },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'ON_LEAVE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Aktif';
      case 'INACTIVE': return 'Pasif';
      case 'ON_LEAVE': return 'İzinli';
      default: return status;
    }
  };

  const getLastLoginText = (lastLoginAt?: string) => {
    if (!lastLoginAt) return 'Hiç giriş yapmadı';
    
    const lastLogin = new Date(lastLoginAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    
    return lastLogin.toLocaleDateString('tr-TR');
  };

  const filteredStaff = (staffMembers || []).filter((member: StaffMember) => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !selectedRole || member.role === selectedRole;
    const matchesStatus = !selectedStatus || member.status === selectedStatus;
    
    let matchesTab = true;
    if (activeTab === 'vets') matchesTab = member.role === 'VET';
    else if (activeTab === 'admin') matchesTab = member.role === 'CLINIC_ADMIN' || member.role === 'SUPER_ADMIN';
    
    return matchesSearch && matchesRole && matchesStatus && matchesTab;
  });

  // Statistics
  const totalStaff = (staffMembers || []).length;
  const activeStaff = (staffMembers || []).filter((member: StaffMember) => member.status === 'ACTIVE').length;
  const veterinarians = (staffMembers || []).filter((member: StaffMember) => member.role === 'VET').length;
  const onLeaveStaff = (staffMembers || []).filter((member: StaffMember) => member.status === 'ON_LEAVE').length;

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
          <h1 className="text-2xl font-bold text-slate-800">Personel Yönetimi</h1>
          <p className="text-professional-gray">Ekip üyeleri ve yetkilendirme</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            Vardiya Planı
          </Button>
          
          <Button
            className="bg-medical-blue hover:bg-medical-blue/90"
            data-testid="button-add-staff"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Personel Ekle
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-professional-gray">Toplam Personel</p>
                <p className="text-2xl font-bold text-slate-800">{totalStaff}</p>
              </div>
              <Users className="h-8 w-8 text-medical-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-professional-gray">Aktif</p>
                <p className="text-2xl font-bold text-green-600">{activeStaff}</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-professional-gray">Veteriner</p>
                <p className="text-2xl font-bold text-healthcare-green">{veterinarians}</p>
              </div>
              <div className="text-2xl">👨‍⚕️</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-professional-gray">İzinli</p>
                <p className="text-2xl font-bold text-amber-600">{onLeaveStaff}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Tüm Personel</TabsTrigger>
          <TabsTrigger value="vets">Veterinerler</TabsTrigger>
          <TabsTrigger value="admin">Yöneticiler</TabsTrigger>
        </TabsList>

        {/* Search and Filters */}
        <Card className="mt-4">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-professional-gray" />
                <Input
                  placeholder="İsim, e-posta veya uzmanlık alanı ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-staff"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-medical-blue focus:border-medical-blue"
                >
                  <option value="">Tüm Roller</option>
                  {Object.entries(roles).map(([key, role]) => (
                    <option key={key} value={key}>{role.label}</option>
                  ))}
                </select>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-medical-blue focus:border-medical-blue"
                >
                  <option value="">Tüm Durumlar</option>
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Pasif</option>
                  <option value="ON_LEAVE">İzinli</option>
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
          {/* Staff Members */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((member: StaffMember) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-medical-blue text-white">
                          {member.firstName[0]}{member.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {member.firstName} {member.lastName}
                        </CardTitle>
                        <p className="text-sm text-professional-gray">{member.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Badge className={roles[member.role].color}>
                      {roles[member.role].icon} {roles[member.role].label}
                    </Badge>
                    <Badge className={getStatusColor(member.status)}>
                      {getStatusLabel(member.status)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    {member.phone && (
                      <div className="flex items-center text-sm text-professional-gray">
                        <Phone className="h-4 w-4 mr-2" />
                        {member.phone}
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-professional-gray">
                      <Mail className="h-4 w-4 mr-2" />
                      {member.email}
                    </div>
                  </div>

                  {/* Professional Info */}
                  {member.specialization && (
                    <div>
                      <p className="text-sm font-medium text-slate-700">Uzmanlık</p>
                      <p className="text-sm text-professional-gray">{member.specialization}</p>
                    </div>
                  )}

                  {member.licenseNumber && (
                    <div>
                      <p className="text-sm font-medium text-slate-700">Lisans No</p>
                      <p className="text-sm text-professional-gray">{member.licenseNumber}</p>
                    </div>
                  )}

                  {/* Activity */}
                  <div>
                    <p className="text-sm font-medium text-slate-700">Son Giriş</p>
                    <p className="text-sm text-professional-gray">
                      {getLastLoginText(member.lastLoginAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Düzenle
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Mesaj
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredStaff.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-professional-gray mb-4">
                  <Users className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">
                  {activeTab === 'all' ? 'Henüz personel kaydı yok' : 
                   activeTab === 'vets' ? 'Veteriner kaydı yok' : 
                   'Yönetici kaydı yok'}
                </h3>
                <p className="text-professional-gray mb-4">
                  İlk personel kaydınızı oluşturmak için yukarıdaki butonu kullanın.
                </p>
                <Button className="bg-medical-blue hover:bg-medical-blue/90">
                  <UserPlus className="h-4 w-4 mr-2" />
                  İlk Personeli Ekle
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}