import { useQuery } from '@tanstack/react-query';
import StatsCard from '@/components/dashboard/stats-card';
import TodaySchedule from '@/components/dashboard/today-schedule';
import UrgentNotifications from '@/components/dashboard/urgent-notifications';
import AnalyticsChart from '@/components/dashboard/analytics-chart';
import NotificationCenter from '@/components/dashboard/notification-center';
import QuickActionsHub from '@/components/dashboard/quick-actions-hub';
import PatientOverview from '@/components/dashboard/patient-overview';
import LoadingSpinner from '@/components/common/loading-spinner';
import PetCareAssistant from '@/components/ai/pet-care-assistant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, MessageCircle, Calendar, ShoppingCart, QrCode, Bell, Shield, Heart, Brain, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';

export default function Dashboard() {
  const { user } = useAuth();
  const isPetOwner = user?.role === 'PET_OWNER';

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    retry: false,
    enabled: !isPetOwner, // Only fetch clinic stats for staff
  });

  const { data: todayAppointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/appointments/today'],
    retry: false,
  });

  const { data: userPets, isLoading: petsLoading } = useQuery({
    queryKey: ['/api/pets'],
    retry: false,
    enabled: isPetOwner, // Only fetch user pets for pet owners
  });

  const { data: userOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/orders'],
    retry: false,
    enabled: isPetOwner, // Only fetch user orders for pet owners
  });

  if (statsLoading || petsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isPetOwner) {
    return <PetOwnerDashboard pets={(userPets as any) || []} orders={(userOrders as any) || []} appointments={(todayAppointments as any) || []} />;
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Bugünkü Randevular"
          value={(stats as any)?.todayAppointments || 0}
          change="+3 yeni randevu"
          changeType="positive"
          icon="fas fa-calendar-check"
          color="medical-blue"
        />
        <StatsCard
          title="Vadesi Geçen Aşılar"
          value={(stats as any)?.overdueVaccinations || 0}
          change="Acil müdahale gerekli"
          changeType="negative"
          icon="fas fa-syringe"
          color="orange"
        />
        <StatsCard
          title="Aktif Hastalar"
          value={(stats as any)?.activePatients || 0}
          change="+8 yeni kayıt"
          changeType="positive"
          icon="fas fa-paw"
          color="healthcare-green"
        />
        <StatsCard
          title="Aylık Gelir"
          value={`₺${(stats as any)?.monthlyRevenue?.toLocaleString('tr-TR') || '0'}`}
          change="%12 artış"
          changeType="positive"
          icon="fas fa-chart-line"
          color="action-teal"
        />
      </div>

      {/* Quick Actions Hub */}
      <QuickActionsHub />

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChart 
          type="appointments" 
          title="Randevu Trendi" 
          className="lg:col-span-1"
        />
        <AnalyticsChart 
          type="revenue" 
          title="Gelir Analizi" 
          className="lg:col-span-1"
        />
        <AnalyticsChart 
          type="patients" 
          title="Hasta Sayısı" 
          className="lg:col-span-1"
        />
      </div>

      {/* Enhanced Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <TodaySchedule appointments={(todayAppointments as any) || []} isLoading={appointmentsLoading} />

          {/* Recent Activities */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Son Aktiviteler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-healthcare-green/10 p-2 rounded-lg">
                    <i className="fas fa-syringe text-healthcare-green"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      Max için rabies aşısı tamamlandı
                    </p>
                    <p className="text-xs text-professional-gray">
                      15 dakika önce • Dr. Ayşe Yılmaz
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-medical-blue/10 p-2 rounded-lg">
                    <i className="fas fa-plus text-medical-blue"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      Yeni hasta kaydı: Bella (Kedi)
                    </p>
                    <p className="text-xs text-professional-gray">
                      1 saat önce • Fatma Demir
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-action-teal/10 p-2 rounded-lg">
                    <i className="fas fa-shopping-cart text-action-teal"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      Sipariş tamamlandı: Köpek maması (Royal Canin)
                    </p>
                    <p className="text-xs text-professional-gray">
                      2 saat önce • Online Sipariş
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Center */}
        <div className="lg:col-span-2">
          <NotificationCenter />
        </div>
      </div>

      {/* Patient Overview and Additional Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Overview */}
        <div className="lg:col-span-2">
          <PatientOverview />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Urgent Notifications */}
          <UrgentNotifications />

          {/* AI Pet Care Assistant */}
          <PetCareAssistant />

          {/* Featured Products */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Öne Çıkan Ürünler</CardTitle>
                <Button variant="ghost" size="sm" className="text-medical-blue hover:text-medical-blue/80">
                  Mağaza
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1589924691995-400dc9ecc119?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                      alt="Royal Canin Köpek Maması" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">Royal Canin Adult</p>
                    <p className="text-xs text-professional-gray">₺245</p>
                  </div>
                  <span className="text-xs bg-healthcare-green text-white px-2 py-1 rounded-full">
                    12 adet
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                      alt="Feline Vaccine" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">Feline Vaccine Kit</p>
                    <p className="text-xs text-professional-gray">₺85</p>
                  </div>
                  <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                    3 adet
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                      alt="Beslenme Takviyeleri" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">Vitamin Takviyeleri</p>
                    <p className="text-xs text-professional-gray">₺120</p>
                  </div>
                  <span className="text-xs bg-healthcare-green text-white px-2 py-1 rounded-full">
                    25 adet
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <Button className="bg-medical-blue hover:bg-medical-blue/90 text-white p-4 rounded-full shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

// Pet Owner Dashboard Component
function PetOwnerDashboard({ pets, orders, appointments }: { pets: any[], orders: any[], appointments: any[] }) {
  return (
    <div className="space-y-6">
      {/* Hero Section with QR Feature */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🐾 Dijital Pet Pasaportu</h1>
              <p className="text-blue-100 text-lg">Türkiye'nin ilk QR kodlu pet sağlık sistemi</p>
            </div>
            <div className="hidden md:block">
              <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30">
                <QrCode className="h-5 w-5 mr-2" />
                QR Kodu Oluştur
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
      </div>

      {/* Smart Dashboard Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <i className="fas fa-paw text-blue-600 text-xl"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pets?.length || 0}</p>
              <p className="text-sm text-gray-600">Evcil Hayvanım</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{appointments?.length || 0}</p>
              <p className="text-sm text-gray-600">Randevularım</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-xl">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{orders?.length || 0}</p>
              <p className="text-sm text-gray-600">Siparişlerim</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">100%</p>
              <p className="text-sm text-gray-600">Sağlık Skoru</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2 text-blue-600" />
            Hızlı İşlemler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/pets">
              <Button variant="outline" className="w-full h-20 flex-col space-y-2 hover:border-blue-500 hover:bg-blue-50">
                <i className="fas fa-plus text-blue-600 text-xl"></i>
                <span className="text-sm">Hayvan Ekle</span>
              </Button>
            </Link>
            <Link href="/appointments">
              <Button variant="outline" className="w-full h-20 flex-col space-y-2 hover:border-green-500 hover:bg-green-50">
                <Calendar className="h-6 w-6 text-green-600" />
                <span className="text-sm">Randevu Al</span>
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="outline" className="w-full h-20 flex-col space-y-2 hover:border-orange-500 hover:bg-orange-50">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
                <span className="text-sm">Alışveriş</span>
              </Button>
            </Link>
            <Button variant="outline" className="w-full h-20 flex-col space-y-2 hover:border-purple-500 hover:bg-purple-50">
              <QrCode className="h-6 w-6 text-purple-600" />
              <span className="text-sm">QR Kod</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* My Pets Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Evcil Hayvanlarım</CardTitle>
          <Link href="/pets">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Hayvan Ekle
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {pets && pets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.map((pet: any) => (
                <div key={pet.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-professional-gray/20 rounded-full flex items-center justify-center">
                      {pet.images && pet.images.length > 0 ? (
                        <img src={pet.images[0]} alt={pet.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <i className={`fas fa-${pet.species === 'DOG' ? 'dog' : pet.species === 'CAT' ? 'cat' : 'paw'} text-professional-gray`}></i>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{pet.name}</h4>
                      <p className="text-sm text-professional-gray">
                        {pet.breed} • {pet.species === 'DOG' ? 'Köpek' : pet.species === 'CAT' ? 'Kedi' : pet.species === 'RABBIT' ? 'Tavşan' : pet.species === 'BIRD' ? 'Kuş' : pet.species}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-between text-sm">
                    <span className="text-professional-gray">Ağırlık: {pet.weightKg}kg</span>
                    <span className="text-professional-gray">
                      {pet.isNeutered ? 'Kısırlaştırıldı' : 'Kısırlaştırılmadı'}
                    </span>
                  </div>
                  
                  {pet.description && (
                    <p className="mt-2 text-sm text-professional-gray">{pet.description}</p>
                  )}
                  
                  <div className="mt-4 flex justify-between">
                    <Button size="sm" variant="outline" className="text-blue-600 hover:bg-blue-50">
                      <QrCode className="h-4 w-4 mr-1" />
                      QR Kod
                    </Button>
                    <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50">
                      <Calendar className="h-4 w-4 mr-1" />
                      Randevu
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-paw text-gray-400 text-3xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz evcil hayvanınız yok</h3>
              <p className="text-gray-600 mb-6">İlk evcil hayvanınızı ekleyerek dijital sağlık pasaportunu oluşturun</p>
              <Link href="/pets">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Hayvanımı Ekle
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Pet Care Assistant */}
      <div className="mb-6">
        <PetCareAssistant />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-orange-600" />
              Son Aktiviteler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Randevu tamamlandı</p>
                  <p className="text-xs text-gray-500">2 saat önce • Rutin kontrol</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Sipariş verildi</p>
                  <p className="text-xs text-gray-500">1 gün önce • Royal Canin mama</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <QrCode className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">QR kod oluşturuldu</p>
                  <p className="text-xs text-gray-500">3 gün önce • Bella için dijital pasaport</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-500" />
              Sağlık Durumu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Aşılar güncel</span>
                </div>
                <span className="text-sm text-green-600">✓</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium">Kontrol randevusu</span>
                </div>
                <span className="text-sm text-yellow-600">2 hafta</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">Beslenme planı</span>
                </div>
                <span className="text-sm text-blue-600">Aktif</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <Link href="/appointments">
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Sağlık Kontrolü Randevusu Al
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


