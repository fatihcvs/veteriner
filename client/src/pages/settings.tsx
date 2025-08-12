import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { Settings as SettingsIcon, User, Bell, Shield, MessageCircle, Hospital } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Profile settings state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // WhatsApp settings state
  const [whatsappSettings, setWhatsappSettings] = useState({
    whatsappPhone: user?.whatsappPhone || '',
    whatsappOptIn: user?.whatsappOptIn || false,
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    whatsappNotifications: true,
    pushNotifications: true,
    vaccinationReminders: true,
    appointmentReminders: true,
    orderUpdates: true,
  });

  // Hospital settings state
  const [clinicSettings, setClinicSettings] = useState({
    name: 'Merkez Veteriner Kliniği',
    address: 'Merkez Mah. Sağlık Sok. No:15 Ankara',
    phone: '+90 312 555 0123',
    whatsappProvider: 'META',
    whatsappBusinessNumber: '',
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('PUT', '/api/profile', data);
    },
    onSuccess: () => {
      toast({
        title: 'Başarılı',
        description: 'Profil bilgileri güncellendi.',
      });
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'Profil bilgileri güncellenemedi.',
        variant: 'destructive',
      });
    },
  });

  const updateWhatsAppMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('PUT', '/api/whatsapp-settings', data);
    },
    onSuccess: () => {
      toast({
        title: 'Başarılı',
        description: 'WhatsApp ayarları güncellendi.',
      });
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'WhatsApp ayarları güncellenemedi.',
        variant: 'destructive',
      });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateWhatsAppMutation.mutate(whatsappSettings);
  };

  const handleWhatsAppTest = async () => {
    try {
      await apiRequest('POST', '/api/whatsapp/test', {
        to: whatsappSettings.whatsappPhone,
        message: 'VetTrack Pro test mesajı - WhatsApp bağlantınız çalışıyor! 🐾',
      });
      toast({
        title: 'Test Mesajı Gönderildi',
        description: 'WhatsApp numaranızı kontrol edin.',
      });
    } catch (error) {
      toast({
        title: 'Test Başarısız',
        description: 'WhatsApp mesajı gönderilemedi.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Ayarlar</h2>
        <p className="text-professional-gray">Hesap ve sistem ayarlarını yönetin</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center">
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Bildirimler
          </TabsTrigger>
          <TabsTrigger value="clinic" className="flex items-center">
            <Hospital className="h-4 w-4 mr-2" />
            Klinik
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Güvenlik
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profil Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Ad</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      placeholder="Adınızı girin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Soyad</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      placeholder="Soyadınızı girin"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="E-posta adresinizi girin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="Telefon numaranızı girin"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="bg-medical-blue hover:bg-medical-blue/90"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? 'Kaydediliyor...' : 'Profili Güncelle'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Settings */}
        <TabsContent value="whatsapp">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-green-500" />
                  WhatsApp Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleWhatsAppSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="whatsappPhone">WhatsApp Telefon Numarası</Label>
                    <Input
                      id="whatsappPhone"
                      value={whatsappSettings.whatsappPhone}
                      onChange={(e) => setWhatsappSettings({ ...whatsappSettings, whatsappPhone: e.target.value })}
                      placeholder="+90 5xx xxx xx xx"
                    />
                    <p className="text-sm text-professional-gray">
                      Bildirimler bu numaraya gönderilecektir. Ülke kodu ile birlikte girin.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <Label htmlFor="whatsappOptIn" className="font-medium">
                        WhatsApp Bildirimlerine İzin Ver
                      </Label>
                      <p className="text-sm text-professional-gray mt-1">
                        Aşı hatırlatmaları ve diğer bildirimleri WhatsApp üzerinden alın
                      </p>
                    </div>
                    <Switch
                      id="whatsappOptIn"
                      checked={whatsappSettings.whatsappOptIn}
                      onCheckedChange={(checked) => setWhatsappSettings({ ...whatsappSettings, whatsappOptIn: checked })}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      type="submit" 
                      className="bg-medical-blue hover:bg-medical-blue/90"
                      disabled={updateWhatsAppMutation.isPending}
                    >
                      {updateWhatsAppMutation.isPending ? 'Kaydediliyor...' : 'WhatsApp Ayarlarını Kaydet'}
                    </Button>
                    
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={handleWhatsAppTest}
                      disabled={!whatsappSettings.whatsappPhone || !whatsappSettings.whatsappOptIn}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Test Mesajı Gönder
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* WhatsApp Compliance Info */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <i className="fas fa-info-circle text-blue-600 mt-1"></i>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">WhatsApp Kullanım Koşulları</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• WhatsApp bildirimleri sadece tıbbi hatırlatmalar için kullanılır</li>
                      <li>• İstediğiniz zaman "STOP" yazarak bildirimleri durdurabilirsiniz</li>
                      <li>• Telefon numaranız üçüncü kişilerle paylaşılmaz</li>
                      <li>• Mesaj gönderim saatleri: 08:00 - 20:00 arası</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Bildirim Tercihleri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>E-posta Bildirimleri</Label>
                    <p className="text-sm text-professional-gray">Önemli bildirimler e-posta ile gönderilir</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>WhatsApp Bildirimleri</Label>
                    <p className="text-sm text-professional-gray">Hatırlatmalar WhatsApp ile gönderilir</p>
                  </div>
                  <Switch
                    checked={notificationSettings.whatsappNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, whatsappNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Aşı Hatırlatmaları</Label>
                    <p className="text-sm text-professional-gray">Aşı tarihleri yaklaştığında bildirim gönder</p>
                  </div>
                  <Switch
                    checked={notificationSettings.vaccinationReminders}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, vaccinationReminders: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Randevu Hatırlatmaları</Label>
                    <p className="text-sm text-professional-gray">Randevu öncesi hatırlatma bildirimi</p>
                  </div>
                  <Switch
                    checked={notificationSettings.appointmentReminders}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, appointmentReminders: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sipariş Güncellemeleri</Label>
                    <p className="text-sm text-professional-gray">Sipariş durumu değişikliklerinde bildirim</p>
                  </div>
                  <Switch
                    checked={notificationSettings.orderUpdates}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, orderUpdates: checked })}
                  />
                </div>
              </div>

              <Button className="bg-medical-blue hover:bg-medical-blue/90">
                Bildirim Ayarlarını Kaydet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hospital Settings */}
        <TabsContent value="clinic">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Klinik Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="clinicName">Klinik Adı</Label>
                  <Input
                    id="clinicName"
                    value={clinicSettings.name}
                    onChange={(e) => setClinicSettings({ ...clinicSettings, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicAddress">Adres</Label>
                  <Textarea
                    id="clinicAddress"
                    value={clinicSettings.address}
                    onChange={(e) => setClinicSettings({ ...clinicSettings, address: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicPhone">Telefon</Label>
                  <Input
                    id="clinicPhone"
                    value={clinicSettings.phone}
                    onChange={(e) => setClinicSettings({ ...clinicSettings, phone: e.target.value })}
                  />
                </div>

                <Button className="bg-medical-blue hover:bg-medical-blue/90">
                  Klinik Bilgilerini Kaydet
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>WhatsApp İş Hesabı</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="whatsappProvider">WhatsApp Sağlayıcısı</Label>
                  <select
                    id="whatsappProvider"
                    value={clinicSettings.whatsappProvider}
                    onChange={(e) => setClinicSettings({ ...clinicSettings, whatsappProvider: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-medical-blue focus:border-medical-blue"
                  >
                    <option value="META">Meta WhatsApp Business API</option>
                    <option value="TWILIO">Twilio WhatsApp</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsappBusinessNumber">İş Hesabı Numarası</Label>
                  <Input
                    id="whatsappBusinessNumber"
                    value={clinicSettings.whatsappBusinessNumber}
                    onChange={(e) => setClinicSettings({ ...clinicSettings, whatsappBusinessNumber: e.target.value })}
                    placeholder="+90 5xx xxx xx xx"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <i className="fas fa-exclamation-triangle text-yellow-600 mt-1"></i>
                    <div className="text-sm">
                      <p className="font-semibold text-yellow-800 mb-1">WhatsApp Business API Kurulumu</p>
                      <p className="text-yellow-700">
                        WhatsApp Business API kullanmak için Meta veya Twilio'dan onaylı hesap almanız gerekir. 
                        Detaylar için sistem yöneticinizle iletişime geçin.
                      </p>
                    </div>
                  </div>
                </div>

                <Button className="bg-medical-blue hover:bg-medical-blue/90">
                  WhatsApp Ayarlarını Kaydet
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Güvenlik Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-50 border rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="h-8 w-8 text-medical-blue" />
                  <div>
                    <h3 className="font-semibold text-slate-800">Replit Authentication</h3>
                    <p className="text-sm text-professional-gray">Hesabınız Replit ile güvence altındadır</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">İki faktörlü doğrulama</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Aktif
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Son giriş</span>
                    <span className="text-sm text-professional-gray">Bugün, 14:30</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Hesap durumu</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Doğrulanmış
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Replit Hesap Ayarları
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/api/logout'}
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Çıkış Yap
                </Button>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">
                  <strong>Not:</strong> Güvenlik ayarları Replit hesabınız üzerinden yönetilir. 
                  Şifre değiştirmek veya güvenlik ayarlarını güncellemek için Replit'e gidin.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
