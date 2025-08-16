// @ts-nocheck
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Shield, Users, Building, Settings, BarChart3, Database, 
  FileText, Package, Stethoscope, Edit3, Trash2,
  Home, Eye, Activity, AlertTriangle, Download, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import LoadingSpinner from '@/components/common/loading-spinner';
import PetEditModal from '@/components/admin/pet-edit-modal';

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
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [editPetModalOpen, setEditPetModalOpen] = useState(false);
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

  // User management mutations
  const updateUserMutation = useMutation({
    mutationFn: async (data: { userId: string; updates: any }) => {
      return await apiRequest('PUT', `/api/admin/users/${data.userId}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setEditUserDialogOpen(false);
      toast({ title: "Kullanıcı güncellendi" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Güncelleme hatası", 
        description: error.message,
        variant: "destructive" 
      });
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

  const deletePetMutation = useMutation({
    mutationFn: async (petId: string) => {
      return await apiRequest('DELETE', `/api/admin/pets/${petId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pets'] });
      toast({ title: "Hayvan silindi" });
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
                <p className="text-sm font-medium text-professional-gray">Toplam Randevu</p>
                <p className="text-2xl font-bold text-slate-800">{adminStats?.totalAppointments || 0}</p>
              </div>
              <Package className="h-8 w-8 text-healthcare-green" />
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

      {/* Modern Admin Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Genel Bakış', icon: Home },
              { id: 'users', name: 'Kullanıcılar', icon: Users },
              { id: 'pets', name: 'Hayvanlar', icon: Stethoscope },
              { id: 'database', name: 'Veritabanı', icon: Database },
              { id: 'system', name: 'Sistem', icon: Settings },
              { id: 'logs', name: 'Loglar', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-medical-blue text-medical-blue bg-medical-blue/5'
                      : 'border-transparent text-professional-gray hover:text-slate-700 hover:border-gray-300'
                  } whitespace-nowrap flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm transition-all duration-200 rounded-t-lg`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
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
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
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
        )}

        {/* Pets Tab */}
        {activeTab === 'pets' && (
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
                            setSelectedPet(pet);
                            setEditPetModalOpen(true);
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
        )}

        {/* Database Tab */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Veritabanı Yönetimi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Veritabanı İstatistikleri</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Toplam Tablo</span>
                        <Badge>15</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Toplam Kayıt</span>
                        <Badge>{(adminStats?.totalUsers || 0) + (adminStats?.totalPets || 0)}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Veritabanı Boyutu</span>
                        <Badge>2.1 MB</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Yedekleme İşlemleri</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Yedek Al
                      </Button>
                      <Button variant="outline" className="w-full">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Veritabanını Sıfırla
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Sistem Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Genel Ayarlar</h4>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sistem Adı</label>
                      <Input defaultValue="VetTrack Pro" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Varsayılan Tema</label>
                      <Select defaultValue="light">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Açık Tema</SelectItem>
                          <SelectItem value="dark">Koyu Tema</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Güvenlik Ayarları</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">İki Faktörlü Doğrulama</span>
                        <Badge variant="secondary">Aktif</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Oturum Süresi</span>
                        <Badge>24 saat</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <Button className="w-full">
                    Ayarları Kaydet
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Sistem Logları
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Kullanıcı girişi</p>
                    <p className="text-sm text-professional-gray">12:34 - admin@vettrack.pro</p>
                  </div>
                  <Badge variant="secondary">INFO</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Sistem güncellemesi</p>
                    <p className="text-sm text-professional-gray">11:20 - Automatic update completed</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">SUCCESS</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Database backup</p>
                    <p className="text-sm text-professional-gray">09:15 - Daily backup created</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">SUCCESS</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
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
                  onChange={(e) => setEditUserForm({...editUserForm, firstName: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Soyad</label>
                <Input
                  value={editUserForm.lastName}
                  onChange={(e) => setEditUserForm({...editUserForm, lastName: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">E-posta</label>
              <Input
                value={editUserForm.email}
                onChange={(e) => setEditUserForm({...editUserForm, email: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Rol</label>
              <Select value={editUserForm.role} onValueChange={(value) => setEditUserForm({...editUserForm, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PET_OWNER">Hayvan Sahibi</SelectItem>
                  <SelectItem value="VET">Veteriner</SelectItem>
                  <SelectItem value="STAFF">Personel</SelectItem>
                  <SelectItem value="CLINIC_ADMIN">Klinik Yöneticisi</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Süper Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Durum</label>
              <Select value={editUserForm.status} onValueChange={(value) => setEditUserForm({...editUserForm, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="INACTIVE">Pasif</SelectItem>
                  <SelectItem value="SUSPENDED">Askıya Alınmış</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1"
                onClick={() => {
                  if (selectedUser) {
                    updateUserMutation.mutate({
                      userId: selectedUser.id,
                      updates: editUserForm
                    });
                  }
                }}
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? 'Güncelleniyor...' : 'Güncelle'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditUserDialogOpen(false)}
              >
                İptal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pet Edit Modal */}
      <PetEditModal
        pet={selectedPet}
        isOpen={editPetModalOpen}
        onClose={() => {
          setEditPetModalOpen(false);
          setSelectedPet(null);
        }}
      />
    </div>
  );
}

export default AdminPanel;