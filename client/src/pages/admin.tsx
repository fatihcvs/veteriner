import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Shield, Users, Building, Settings, BarChart3, Database, 
  FileText, Bell, Package, Calendar, Stethoscope, CreditCard,
  Activity, AlertTriangle, TrendingUp, Download, Edit3, Trash2,
  Home, RefreshCw, Upload, Plus, Syringe, Eye, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import LoadingSpinner from '@/components/common/loading-spinner';

interface AdminStats {
  totalUsers: number;
  totalClinics: number;
  totalPets: number;
  totalAppointments: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  systemHealth: string;
}

interface SystemUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  clinicId?: string;
  clinicName?: string;
  createdAt: string;
  lastLoginAt?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

interface SystemClinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  userCount: number;
  petCount: number;
  createdAt: string;
  status: 'ACTIVE' | 'INACTIVE';
}

function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<SystemClinic | null>(null);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [editUserForm, setEditUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    status: '',
  });

  // Check admin access
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'CLINIC_ADMIN')) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              Erişim Yetkisi Yok
            </h3>
            <p className="text-professional-gray">
              Bu sayfaya erişim için admin yetkisi gereklidir.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  const { data: allClinics, isLoading: clinicsLoading } = useQuery({
    queryKey: ['/api/admin/clinics'],
  });

  const { data: allPets, isLoading: petsLoading } = useQuery({
    queryKey: ['/api/admin/pets'],
  });

  const { data: systemLogs } = useQuery({
    queryKey: ['/api/admin/logs'],
  });

  // Vaccination data queries
  const { data: allVaccines, isLoading: vaccinesLoading } = useQuery({
    queryKey: ['/api/vaccines'],
  });

  const { data: allVaccinationEvents, isLoading: vaccinationEventsLoading } = useQuery({
    queryKey: ['/api/admin/vaccination-events'],
  });

  const { data: overdueVaccinations, isLoading: overdueLoading } = useQuery({
    queryKey: ['/api/vaccinations/overdue'],
  });

  // Food tracking data queries
  const { data: allProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: allOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/orders'],
  });

  const { data: lowStockProducts, isLoading: lowStockLoading } = useQuery({
    queryKey: ['/api/admin/low-stock-products'],
  });

  // User management mutations
  const updateUserMutation = useMutation({
    mutationFn: async (data: { userId: string; updates: any }) => {
      return await apiRequest('PUT', `/api/admin/users/${data.userId}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "Kullanıcı güncellendi" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest('DELETE', `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "Kullanıcı silindi" });
    },
  });

  // Pet management mutations
  const updatePetMutation = useMutation({
    mutationFn: async (data: { petId: string; updates: any }) => {
      return await apiRequest('PUT', `/api/admin/pets/${data.petId}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pets'] });
      toast({ title: "Hayvan güncellendi" });
    },
  });

  const deletePetMutation = useMutation({
    mutationFn: async (petId: string) => {
      return await apiRequest('DELETE', `/api/admin/pets/${petId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pets'] });
      toast({ title: "Hayvan silindi" });
    },
  });

  // Clinic management mutations
  const updateClinicMutation = useMutation({
    mutationFn: async (data: { clinicId: string; updates: any }) => {
      return await apiRequest('PUT', `/api/admin/clinics/${data.clinicId}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clinics'] });
      toast({ title: "Klinik güncellendi" });
    },
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800';
      case 'CLINIC_ADMIN': return 'bg-blue-100 text-blue-800';
      case 'VET': return 'bg-green-100 text-green-800';
      case 'STAFF': return 'bg-gray-100 text-gray-800';
      case 'PET_OWNER': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Süper Admin';
      case 'CLINIC_ADMIN': return 'Klinik Yöneticisi';
      case 'VET': return 'Veteriner';
      case 'STAFF': return 'Personel';
      case 'PET_OWNER': return 'Hayvan Sahibi';
      default: return role;
    }
  };

  if (statsLoading) {
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
          <h1 className="text-2xl font-bold text-slate-800">Admin Paneli</h1>
          <p className="text-professional-gray">Sistem yönetimi ve kontrol merkezi</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Sistem Raporu
          </Button>
          
          <Button
            className="bg-medical-blue hover:bg-medical-blue/90"
            data-testid="button-system-settings"
          >
            <Settings className="h-4 w-4 mr-2" />
            Sistem Ayarları
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-professional-gray">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold text-slate-800">{adminStats?.totalUsers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-medical-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-professional-gray">Aktif Klinik</p>
                <p className="text-2xl font-bold text-slate-800">{adminStats?.totalClinics || 0}</p>
              </div>
              <Building className="h-8 w-8 text-healthcare-green" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-professional-gray">Toplam Hayvan</p>
                <p className="text-2xl font-bold text-slate-800">{adminStats?.totalPets || 0}</p>
              </div>
              <Stethoscope className="h-8 w-8 text-action-teal" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-professional-gray">Sistem Durumu</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700">Çevrimiçi</span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-11">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
          <TabsTrigger value="pets">Hayvanlar</TabsTrigger>
          <TabsTrigger value="vaccinations">Aşı Kayıtları</TabsTrigger>
          <TabsTrigger value="food-tracking">Mama Takibi</TabsTrigger>
          <TabsTrigger value="clinics">Klinikler</TabsTrigger>
          <TabsTrigger value="pages">Sayfalar</TabsTrigger>
          <TabsTrigger value="content">İçerik</TabsTrigger>
          <TabsTrigger value="database">Veritabanı</TabsTrigger>
          <TabsTrigger value="system">Sistem</TabsTrigger>
          <TabsTrigger value="logs">Loglar</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Son Aktiviteler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Yeni kullanıcı kaydı</p>
                      <p className="text-xs text-professional-gray">2 dakika önce</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Sistem güncellemesi</p>
                      <p className="text-xs text-professional-gray">1 saat önce</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Bakım modu aktif</p>
                      <p className="text-xs text-professional-gray">3 saat önce</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Sistem Performansı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU Kullanımı</span>
                      <span>45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Bellek Kullanımı</span>
                      <span>67%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Disk Kullanımı</span>
                      <span>23%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '23%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tüm Kullanıcılar ({(allUsers || []).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-4">
                  {(allUsers || []).map((user: SystemUser) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-professional-gray">{user.email}</p>
                          {user.clinicName && (
                            <p className="text-xs text-professional-gray">Klinik: {user.clinicName}</p>
                          )}
                        </div>
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                        <Badge className={user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {user.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setEditUserForm({
                              firstName: user.firstName,
                              lastName: user.lastName,
                              email: user.email,
                              role: user.role,
                              status: user.status,
                            });
                            setEditUserDialogOpen(true);
                          }}
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          Düzenle
                        </Button>
                        
                        {user.role !== 'SUPER_ADMIN' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteUserMutation.mutate(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Sil
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pets Tab */}
        <TabsContent value="pets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Tüm Hayvanlar ({(allPets || []).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {petsLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-4">
                  {(allPets || []).map((pet: any) => (
                    <div key={pet.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-lg">{pet.name}</p>
                            <Badge className="bg-blue-100 text-blue-800">
                              {pet.species}
                            </Badge>
                            {pet.breed && (
                              <Badge variant="outline">
                                {pet.breed}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-professional-gray">
                            <div>
                              <span className="font-medium">Yaş:</span> {pet.age || 'Belirtilmemiş'}
                            </div>
                            <div>
                              <span className="font-medium">Kilo:</span> {pet.weight ? `${pet.weight} kg` : 'Belirtilmemiş'}
                            </div>
                            <div>
                              <span className="font-medium">Cinsiyet:</span> {pet.gender || 'Belirtilmemiş'}
                            </div>
                            <div>
                              <span className="font-medium">Kayıt:</span> {new Date(pet.createdAt).toLocaleDateString('tr-TR')}
                            </div>
                          </div>

                          {/* Owner Information */}
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm font-medium text-slate-800 mb-1">
                              <span className="text-professional-gray">Sahip:</span> {pet.ownerFirstName} {pet.ownerLastName}
                            </p>
                            <p className="text-sm text-professional-gray">
                              <span className="font-medium">E-posta:</span> {pet.ownerEmail}
                            </p>
                          </div>

                          {pet.description && (
                            <div className="mt-2">
                              <p className="text-sm text-professional-gray">
                                <span className="font-medium">Açıklama:</span> {pet.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Hayvan düzenleme modalı açılacak
                            toast({ title: "Hayvan düzenleme özelliği yakında aktif olacak" });
                          }}
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          Düzenle
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (confirm(`${pet.name} adlı hayvanı silmek istediğinizden emin misiniz?`)) {
                              deletePetMutation.mutate(pet.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Sil
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {(allPets || []).length === 0 && (
                    <div className="text-center py-8">
                      <Stethoscope className="h-16 w-16 mx-auto text-professional-gray mb-4" />
                      <p className="text-professional-gray">Henüz kayıtlı hayvan bulunmuyor</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vaccination Records Tab */}
        <TabsContent value="vaccinations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-professional-gray">Toplam Aşı Kayıtları</p>
                    <p className="text-2xl font-bold text-slate-800">{(allVaccinationEvents || []).length}</p>
                  </div>
                  <Syringe className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-professional-gray">Geciken Aşılar</p>
                    <p className="text-2xl font-bold text-red-600">{(overdueVaccinations || []).length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-professional-gray">Aşı Türleri</p>
                    <p className="text-2xl font-bold text-slate-800">{(allVaccines || []).length}</p>
                  </div>
                  <Package className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="events" className="w-full">
            <TabsList>
              <TabsTrigger value="events">Aşı Kayıtları</TabsTrigger>
              <TabsTrigger value="overdue">Geciken Aşılar</TabsTrigger>
              <TabsTrigger value="vaccines">Aşı Türleri</TabsTrigger>
            </TabsList>
            
            <TabsContent value="events" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Syringe className="h-5 w-5" />
                      Tüm Aşı Kayıtları ({(allVaccinationEvents || []).length})
                    </CardTitle>
                    <Button 
                      onClick={() => {
                        toast({ title: "Yeni aşı kaydı ekleme özelliği yakında aktif olacak" });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Yeni Aşı Kaydı
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {vaccinationEventsLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="space-y-4">
                      {(allVaccinationEvents || []).map((event: any) => (
                        <div key={event.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-lg">{event.petName || 'Bilinmeyen Hayvan'}</h4>
                                <Badge className="bg-blue-100 text-blue-800">
                                  {event.vaccineId || 'Aşı Bilgisi'}
                                </Badge>
                                <Badge className={event.status === 'DONE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                  {event.status === 'DONE' ? 'Tamamlandı' : 'Bekliyor'}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-professional-gray">
                                <div>
                                  <span className="font-medium">Veriliş Tarihi:</span><br />
                                  {event.administeredAt ? new Date(event.administeredAt).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                                </div>
                                <div>
                                  <span className="font-medium">Sonraki Tarih:</span><br />
                                  {event.nextDueAt ? new Date(event.nextDueAt).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                                </div>
                                <div>
                                  <span className="font-medium">Lot No:</span><br />
                                  {event.lotNo || 'Belirtilmemiş'}
                                </div>
                                <div>
                                  <span className="font-medium">Veteriner:</span><br />
                                  {event.vetUserId || 'Belirtilmemiş'}
                                </div>
                              </div>

                              {event.notes && (
                                <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                                  <p className="text-sm text-slate-700">
                                    <span className="font-medium">Notlar:</span> {event.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Görüntüle
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit3 className="h-4 w-4 mr-1" />
                                Düzenle
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {(allVaccinationEvents || []).length === 0 && (
                        <div className="text-center py-8">
                          <Syringe className="h-16 w-16 mx-auto text-professional-gray mb-4" />
                          <p className="text-professional-gray">Henüz aşı kaydı bulunmuyor</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="overdue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Geciken Aşılar ({(overdueVaccinations || []).length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {overdueLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="space-y-4">
                      {(overdueVaccinations || []).map((vaccination: any) => (
                        <div key={vaccination.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-red-800">{vaccination.petName}</h4>
                              <p className="text-sm text-red-600">
                                Aşı: {vaccination.vaccineName} - 
                                Son Tarih: {new Date(vaccination.nextDueAt).toLocaleDateString('tr-TR')}
                              </p>
                              <p className="text-xs text-red-500">
                                {Math.floor((Date.now() - new Date(vaccination.nextDueAt).getTime()) / (1000 * 60 * 60 * 24))} gün gecikmiş
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                <Syringe className="h-4 w-4 mr-1" />
                                Aşı Yap
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {(overdueVaccinations || []).length === 0 && (
                        <div className="text-center py-8">
                          <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                          <p className="text-green-600 font-medium">Harika! Geciken aşı bulunmuyor</p>
                          <p className="text-professional-gray text-sm">Tüm aşılar zamanında yapılmış</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="vaccines" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Aşı Türleri ({(allVaccines || []).length})
                    </CardTitle>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Yeni Aşı Türü
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {vaccinesLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(allVaccines || []).map((vaccine: any) => (
                        <div key={vaccine.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{vaccine.name}</h4>
                              <Badge className="bg-slate-100 text-slate-800 mt-1">
                                {vaccine.species}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm text-professional-gray">
                            <div>
                              <span className="font-medium">Üretici:</span> {vaccine.manufacturer}
                            </div>
                            <div>
                              <span className="font-medium">Aralık:</span> {vaccine.defaultIntervalDays} gün
                            </div>
                            {vaccine.description && (
                              <div>
                                <span className="font-medium">Açıklama:</span> {vaccine.description}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Food Tracking Tab */}
        <TabsContent value="food-tracking" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-professional-gray">Toplam Ürün</p>
                    <p className="text-2xl font-bold text-slate-800">{(allProducts || []).length}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-professional-gray">Düşük Stok</p>
                    <p className="text-2xl font-bold text-red-600">
                      {(allProducts || []).filter(p => p.stockQty < 10).length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-professional-gray">Toplam Sipariş</p>
                    <p className="text-2xl font-bold text-slate-800">{(allOrders || []).length}</p>
                  </div>
                  <Package className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-professional-gray">Toplam Değer</p>
                    <p className="text-2xl font-bold text-slate-800">
                      ₺{(allProducts || []).reduce((sum, p) => sum + (parseFloat(p.price || '0') * (p.stockQty || 0)), 0).toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="inventory" className="w-full">
            <TabsList>
              <TabsTrigger value="inventory">Stok Durumu</TabsTrigger>
              <TabsTrigger value="low-stock">Düşük Stok</TabsTrigger>
              <TabsTrigger value="orders">Siparişler</TabsTrigger>
              <TabsTrigger value="analytics">Analitikler</TabsTrigger>
            </TabsList>
            
            <TabsContent value="inventory" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Mama & Ürün Envanteri ({(allProducts || []).length})
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button onClick={() => {
                        toast({ title: "Yeni ürün ekleme özelliği yakında aktif olacak" });
                      }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Yeni Ürün
                      </Button>
                      <Button variant="outline" onClick={() => {
                        toast({ title: "Excel export özelliği yakında aktif olacak" });
                      }}>
                        <Download className="h-4 w-4 mr-2" />
                        Excel İndir
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {productsLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="space-y-4">
                      {(allProducts || []).map((product: any) => (
                        <div key={product.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-4 flex-1">
                              {product.images && product.images[0] && (
                                <img 
                                  src={product.images[0]} 
                                  alt={product.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium text-lg">{product.name}</h4>
                                  <Badge className="bg-blue-100 text-blue-800">
                                    {product.brand}
                                  </Badge>
                                  <Badge className={product.species === 'DOG' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}>
                                    {product.species === 'DOG' ? 'Köpek' : 'Kedi'}
                                  </Badge>
                                  {product.stockQty < 10 && (
                                    <Badge className="bg-red-100 text-red-800">
                                      Düşük Stok!
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-professional-gray mb-3">
                                  <div>
                                    <span className="font-medium">Fiyat:</span><br />
                                    ₺{parseFloat(product.price || '0').toLocaleString('tr-TR')}
                                  </div>
                                  <div>
                                    <span className="font-medium">Stok:</span><br />
                                    <span className={product.stockQty < 10 ? 'text-red-600 font-medium' : ''}>
                                      {product.stockQty} adet
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Paket:</span><br />
                                    {product.packageSizeGrams ? `${product.packageSizeGrams}g` : 'Belirtilmemiş'}
                                  </div>
                                  <div>
                                    <span className="font-medium">SKU:</span><br />
                                    {product.sku}
                                  </div>
                                </div>

                                {product.description && (
                                  <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-700">
                                      {product.description.substring(0, 150)}
                                      {product.description.length > 150 && '...'}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Görüntüle
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit3 className="h-4 w-4 mr-1" />
                                Düzenle
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Sil
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {(allProducts || []).length === 0 && (
                        <div className="text-center py-8">
                          <Package className="h-16 w-16 mx-auto text-professional-gray mb-4" />
                          <p className="text-professional-gray">Henüz ürün bulunmuyor</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="low-stock" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Düşük Stok Uyarıları ({(allProducts || []).filter(p => p.stockQty < 10).length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(allProducts || [])
                      .filter(product => product.stockQty < 10)
                      .map((product: any) => (
                        <div key={product.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {product.images && product.images[0] && (
                                <img 
                                  src={product.images[0]} 
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                              )}
                              <div>
                                <h4 className="font-medium text-red-800">{product.name}</h4>
                                <p className="text-sm text-red-600">
                                  Marka: {product.brand} - Kalan: {product.stockQty} adet
                                </p>
                                <p className="text-xs text-red-500">
                                  Kritik seviye: 10 adet altında
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                <Plus className="h-4 w-4 mr-1" />
                                Stok Ekle
                              </Button>
                              <Button size="sm" variant="outline">
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Sipariş Ver
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {(allProducts || []).filter(p => p.stockQty < 10).length === 0 && (
                      <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                        <p className="text-green-600 font-medium">Harika! Düşük stok uyarısı yok</p>
                        <p className="text-professional-gray text-sm">Tüm ürünler yeterli stokta</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Sipariş Yönetimi ({(allOrders || []).length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="space-y-4">
                      {(allOrders || []).map((order: any) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">Sipariş #{order.id.substring(0, 8)}</h4>
                                <Badge className={
                                  order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                  order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'PAID' ? 'bg-purple-100 text-purple-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }>
                                  {order.status === 'DELIVERED' ? 'Teslim Edildi' :
                                   order.status === 'SHIPPED' ? 'Kargoda' :
                                   order.status === 'PAID' ? 'Ödendi' : 'Bekliyor'}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-professional-gray">
                                <div>
                                  <span className="font-medium">Müşteri:</span><br />
                                  {order.customerName || 'Bilinmeyen'}
                                </div>
                                <div>
                                  <span className="font-medium">Tutar:</span><br />
                                  ₺{parseFloat(order.totalAmount || '0').toLocaleString('tr-TR')}
                                </div>
                                <div>
                                  <span className="font-medium">Tarih:</span><br />
                                  {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                                </div>
                                <div>
                                  <span className="font-medium">Ürün Sayısı:</span><br />
                                  {order.itemCount || 0} adet
                                </div>
                              </div>

                              {order.shippingAddress && (
                                <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                                  <p className="text-sm text-slate-700">
                                    <span className="font-medium">Teslimat Adresi:</span> {JSON.stringify(order.shippingAddress)}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Detay
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit3 className="h-4 w-4 mr-1" />
                                Düzenle
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {(allOrders || []).length === 0 && (
                        <div className="text-center py-8">
                          <Package className="h-16 w-16 mx-auto text-professional-gray mb-4" />
                          <p className="text-professional-gray">Henüz sipariş bulunmuyor</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>En Çok Satan Ürünler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(allProducts || [])
                        .sort((a, b) => (b.stockQty || 0) - (a.stockQty || 0))
                        .slice(0, 5)
                        .map((product: any, index: number) => (
                          <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-professional-gray">{product.brand}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">₺{parseFloat(product.price || '0').toLocaleString('tr-TR')}</p>
                              <p className="text-sm text-professional-gray">{product.stockQty} stok</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Kategori Dağılımı</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                          <span>Köpek Ürünleri</span>
                        </div>
                        <span className="font-medium">
                          {(allProducts || []).filter(p => p.species === 'DOG').length} ürün
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                          <span>Kedi Ürünleri</span>
                        </div>
                        <span className="font-medium">
                          {(allProducts || []).filter(p => p.species === 'CAT').length} ürün
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                          <span>Genel Ürünler</span>
                        </div>
                        <span className="font-medium">
                          {(allProducts || []).filter(p => !p.species || (p.species !== 'DOG' && p.species !== 'CAT')).length} ürün
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Stok Durumu Özeti</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {(allProducts || []).filter(p => p.stockQty >= 20).length}
                      </div>
                      <div className="text-sm text-professional-gray">Yeterli Stok</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {(allProducts || []).filter(p => p.stockQty >= 10 && p.stockQty < 20).length}
                      </div>
                      <div className="text-sm text-professional-gray">Orta Seviye</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {(allProducts || []).filter(p => p.stockQty < 10).length}
                      </div>
                      <div className="text-sm text-professional-gray">Düşük Stok</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Clinics Tab */}
        <TabsContent value="clinics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Tüm Klinikler ({(allClinics || []).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clinicsLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-4">
                  {(allClinics || []).map((clinic: SystemClinic) => (
                    <div key={clinic.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{clinic.name}</p>
                          <p className="text-sm text-professional-gray">{clinic.email}</p>
                          <p className="text-xs text-professional-gray">{clinic.address}</p>
                          <div className="flex gap-4 text-xs text-professional-gray mt-1">
                            <span>{clinic.userCount} kullanıcı</span>
                            <span>{clinic.petCount} hayvan</span>
                          </div>
                        </div>
                        <Badge className={clinic.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {clinic.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedClinic(clinic)}
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          Düzenle
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Page Management Tab */}
        <TabsContent value="pages" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Ana Sayfa Yönetimi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Başlık Metni</label>
                  <Input defaultValue="VetTrack Pro ile Evcil Hayvanınızı Takip Edin" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alt Başlık</label>
                  <Input defaultValue="Dijital sağlık kartı, aşı takibi ve daha fazlası" />
                </div>
                <Button className="w-full">Güncelle</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Auth Sayfası
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Giriş Mesajı</label>
                  <Input defaultValue="Evcil hayvanınızın dijital sağlık kartına erişin" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kayıt Mesajı</label>
                  <Input defaultValue="Ücretsiz hesap oluşturun" />
                </div>
                <Button className="w-full">Güncelle</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Dashboard Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">PET_OWNER Dashboard</label>
                  <select className="w-full p-2 border rounded">
                    <option>Hayvan Odaklı Dashboard</option>
                    <option>Klinik Odaklı Dashboard</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Varsayılan Tema</label>
                  <select className="w-full p-2 border rounded">
                    <option>Açık Tema</option>
                    <option>Koyu Tema</option>
                  </select>
                </div>
                <Button className="w-full">Güncelle</Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sayfa Erişim Kontrolleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Dashboard</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>PET_OWNER</span>
                        <Badge variant="secondary">Aktif</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>CLINIC_ADMIN</span>
                        <Badge variant="secondary">Aktif</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Pets</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>PET_OWNER</span>
                        <Badge variant="secondary">Aktif</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>VET</span>
                        <Badge variant="secondary">Aktif</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Admin Panel</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>SUPER_ADMIN</span>
                        <Badge variant="secondary">Aktif</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>CLINIC_ADMIN</span>
                        <Badge variant="secondary">Aktif</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Content Management Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Ürün Yönetimi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Toplam Ürün</span>
                  <Badge>24</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Aktif Ürün</span>
                  <Badge variant="secondary">18</Badge>
                </div>
                <div className="space-y-2">
                  <Button className="w-full" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Ürün Ekle
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Toplu Düzenle
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Excel İndir
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Bildirim Yönetimi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">WhatsApp Bildirimleri</label>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Aktif</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">E-posta Bildirimleri</label>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Aktif</span>
                  </div>
                </div>
                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Şablon Ayarları
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                İçerik Yönetimi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="vaccines" className="w-full">
                <TabsList>
                  <TabsTrigger value="vaccines">Aşılar</TabsTrigger>
                  <TabsTrigger value="species">Hayvan Türleri</TabsTrigger>
                  <TabsTrigger value="brands">Markalar</TabsTrigger>
                </TabsList>
                
                <TabsContent value="vaccines" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Aşı Veritabanı</h4>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Yeni Aşı
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span>Kuduz Aşısı</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Düzenle</Button>
                        <Button size="sm" variant="outline">Sil</Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span>5'li Aşı</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Düzenle</Button>
                        <Button size="sm" variant="outline">Sil</Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="species" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Hayvan Türleri</h4>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Yeni Tür
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 border rounded">Köpek</div>
                    <div className="p-2 border rounded">Kedi</div>
                    <div className="p-2 border rounded">Kuş</div>
                    <div className="p-2 border rounded">Tavşan</div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Management Tab */}
        <TabsContent value="database" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Veritabanı Durumu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Toplam Kayıt</span>
                  <Badge>1,247</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Kullanılan Alan</span>
                  <Badge variant="secondary">245 MB</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Son Yedek</span>
                  <Badge variant="outline">2 saat önce</Badge>
                </div>
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Yedek Al
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Veri Temizleme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Eski Logları Temizle</label>
                  <select className="w-full p-2 border rounded">
                    <option>30 günden eski</option>
                    <option>60 günden eski</option>
                    <option>90 günden eski</option>
                  </select>
                </div>
                <Button className="w-full" variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Temizle
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Tablo İstatistikleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Kullanıcılar</span>
                    <Badge>2</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Evcil Hayvanlar</span>
                    <Badge>0</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Randevular</span>
                    <Badge>8</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Aşı Kayıtları</span>
                    <Badge>6</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Veri İçe/Dışa Aktarma</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">İçe Aktarma</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Kullanıcı Listesi (.csv)
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Evcil Hayvan Listesi (.csv)
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Ürün Listesi (.csv)
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Dışa Aktarma</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Tüm Veriler (.sql)
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Sadece Kullanıcılar (.csv)
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Rapor Verileri (.xlsx)
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced System Settings Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Genel Ayarlar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Site Adı</label>
                  <Input defaultValue="VetTrack Pro" className="mt-1" />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Sistem E-postası</label>
                  <Input defaultValue="system@vettrack.pro" className="mt-1" />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Bakım Modu</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="checkbox" />
                    <span className="text-sm">Aktif</span>
                  </div>
                </div>
                
                <Button className="w-full">Ayarları Kaydet</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Güvenlik Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Oturum Süresi (dakika)</label>
                  <Input defaultValue="60" className="mt-1" type="number" />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Şifre Zorlaması</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Güçlü şifre zorunlu</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">2FA</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="checkbox" />
                    <span className="text-sm">İki faktörlü doğrulama</span>
                  </div>
                </div>
                
                <Button className="w-full">Güvenlik Kaydet</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  API Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">WhatsApp API</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Bağlı</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Email Service</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Bağlı</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">PDF Service</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Bağlı</span>
                  </div>
                </div>
                
                <Button className="w-full" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  API Yapılandırması
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Sistem Monitörü
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Sunucu Durumu</span>
                    <Badge className="bg-green-100 text-green-800">Çalışıyor</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Veritabanı</span>
                    <Badge className="bg-green-100 text-green-800">Bağlı</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Bildirim Servisi</span>
                    <Badge className="bg-green-100 text-green-800">Aktif</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Yedekleme Servisi</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Beklemede</Badge>
                  </div>
                </div>
                
                <Button className="w-full" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Durumu Yenile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Response Time</span>
                      <span>125ms</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Uptime</span>
                      <span>99.9%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '99%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Error Rate</span>
                      <span>0.1%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Enhanced Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Sistem Logları</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Logları İndir
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Yenile
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">1,247</div>
                <div className="text-sm text-professional-gray">Toplam Log</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">12</div>
                <div className="text-sm text-professional-gray">Hata</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">38</div>
                <div className="text-sm text-professional-gray">Uyarı</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">1,197</div>
                <div className="text-sm text-professional-gray">Bilgi</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Son Loglar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(systemLogs || []).map((log: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Badge 
                      variant={log.level === 'ERROR' ? 'destructive' : log.level === 'WARNING' ? 'secondary' : 'outline'}
                      className="mt-1"
                    >
                      {log.level}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{log.message}</p>
                      <p className="text-xs text-professional-gray">{log.timestamp}</p>
                      {log.details && (
                        <p className="text-xs text-professional-gray mt-1 font-mono">{log.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kullanıcı Düzenle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Ad</label>
                  <Input 
                    value={editUserForm.firstName}
                    onChange={(e) => setEditUserForm(prev => ({...prev, firstName: e.target.value}))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Soyad</label>
                  <Input 
                    value={editUserForm.lastName}
                    onChange={(e) => setEditUserForm(prev => ({...prev, lastName: e.target.value}))}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">E-posta</label>
                <Input 
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm(prev => ({...prev, email: e.target.value}))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Rol</label>
                <select 
                  value={editUserForm.role}
                  onChange={(e) => setEditUserForm(prev => ({...prev, role: e.target.value}))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="SUPER_ADMIN">Süper Admin</option>
                  <option value="CLINIC_ADMIN">Klinik Yöneticisi</option>
                  <option value="VET">Veteriner</option>
                  <option value="STAFF">Personel</option>
                  <option value="PET_OWNER">Hayvan Sahibi</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Durum</label>
                <select 
                  value={editUserForm.status}
                  onChange={(e) => setEditUserForm(prev => ({...prev, status: e.target.value}))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Pasif</option>
                  <option value="SUSPENDED">Askıya Alındı</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setSelectedUser(null)}
                  variant="outline"
                  className="flex-1"
                >
                  İptal
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedUser) {
                      updateUserMutation.mutate({
                        userId: selectedUser.id,
                        updates: {
                          firstName: editUserForm.firstName,
                          lastName: editUserForm.lastName,
                          email: editUserForm.email,
                          role: editUserForm.role,
                          status: editUserForm.status,
                        }
                      });
                      setSelectedUser(null);
                    }
                  }}
                  className="flex-1"
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Export with role protection
export default function Admin() {
  const { user } = useAuth();

  // Only allow SUPER_ADMIN and CLINIC_ADMIN access
  if (!user || !['SUPER_ADMIN', 'CLINIC_ADMIN'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto text-slate-400 mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Erişim Reddedildi</h1>
          <p className="text-slate-600">Bu sayfayı görüntüleme yetkiniz bulunmuyor.</p>
        </div>
      </div>
    );
  }

  return <AdminPanel />;
}