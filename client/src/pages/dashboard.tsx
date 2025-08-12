import { useQuery } from '@tanstack/react-query';
import StatsCard from '@/components/dashboard/stats-card';
import TodaySchedule from '@/components/dashboard/today-schedule';
import UrgentNotifications from '@/components/dashboard/urgent-notifications';
import LoadingSpinner from '@/components/common/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, MessageCircle } from 'lucide-react';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    retry: false,
  });

  const { data: todayAppointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/appointments/today'],
    retry: false,
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Bugünkü Randevular"
          value={stats?.todayAppointments || 0}
          change="+3 yeni randevu"
          changeType="positive"
          icon="fas fa-calendar-check"
          color="medical-blue"
        />
        <StatsCard
          title="Vadesi Geçen Aşılar"
          value={stats?.overdueVaccinations || 0}
          change="Acil müdahale gerekli"
          changeType="negative"
          icon="fas fa-syringe"
          color="orange"
        />
        <StatsCard
          title="Aktif Hastalar"
          value={stats?.activePatients || 0}
          change="+8 yeni kayıt"
          changeType="positive"
          icon="fas fa-paw"
          color="healthcare-green"
        />
        <StatsCard
          title="Aylık Gelir"
          value={`₺${stats?.monthlyRevenue?.toLocaleString('tr-TR') || '0'}`}
          change="%12 artış"
          changeType="positive"
          icon="fas fa-chart-line"
          color="action-teal"
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <TodaySchedule appointments={todayAppointments || []} isLoading={appointmentsLoading} />

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

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Urgent Notifications */}
          <UrgentNotifications />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center p-4 h-auto text-center hover:border-medical-blue hover:bg-blue-50"
                >
                  <i className="fas fa-calendar-plus text-medical-blue text-xl mb-2"></i>
                  <span className="text-sm font-medium">Yeni Randevu</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center p-4 h-auto text-center hover:border-healthcare-green hover:bg-green-50"
                >
                  <i className="fas fa-paw text-healthcare-green text-xl mb-2"></i>
                  <span className="text-sm font-medium">Hasta Ekle</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center p-4 h-auto text-center hover:border-action-teal hover:bg-teal-50"
                >
                  <i className="fas fa-syringe text-action-teal text-xl mb-2"></i>
                  <span className="text-sm font-medium">Aşı Kaydet</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center p-4 h-auto text-center hover:border-green-500 hover:bg-green-50"
                >
                  <MessageCircle className="text-green-500 h-5 w-5 mb-2" />
                  <span className="text-sm font-medium">WhatsApp Gönder</span>
                </Button>
              </div>
            </CardContent>
          </Card>

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
