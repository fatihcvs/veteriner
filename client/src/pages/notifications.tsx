import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Bell, Send, Settings, Filter, Search, MessageSquare, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import LoadingSpinner from '@/components/common/loading-spinner';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  userId: string;
  clinicId?: string;
  type: 'VACCINATION_REMINDER' | 'APPOINTMENT_REMINDER' | 'FOOD_DEPLETION' | 'SYSTEM' | 'CUSTOM' | 'ORDER_UPDATE';
  title: string;
  body: string;
  channels: string[];
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
  scheduledFor?: string;
  sentAt?: string;
  meta?: any;
  createdAt: string;
  updatedAt: string;
}

export default function Notifications() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [activeTab, setActiveTab] = useState('all');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const { toast } = useToast();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
  });

  const notificationTypes = {
    'VACCINATION_REMINDER': { label: 'Aşı Hatırlatması', color: 'bg-green-100 text-green-800', icon: '💉' },
    'APPOINTMENT_REMINDER': { label: 'Randevu Hatırlatması', color: 'bg-blue-100 text-blue-800', icon: '📅' },
    'FOOD_DEPLETION': { label: 'Mama Uyarısı', color: 'bg-orange-100 text-orange-800', icon: '🥘' },
    'ORDER_UPDATE': { label: 'Sipariş Güncellemesi', color: 'bg-teal-100 text-teal-800', icon: '📦' },
    'SYSTEM': { label: 'Sistem', color: 'bg-purple-100 text-purple-800', icon: '⚙️' },
    'CUSTOM': { label: 'Özel Mesaj', color: 'bg-gray-100 text-gray-800', icon: '✉️' },
  };

  const channels = {
    'WHATSAPP': { label: 'WhatsApp', color: 'bg-green-100 text-green-800', icon: '📱' },
    'EMAIL': { label: 'E-posta', color: 'bg-blue-100 text-blue-800', icon: '📧' },
    'SMS': { label: 'SMS', color: 'bg-yellow-100 text-yellow-800', icon: '💬' },
    'PUSH': { label: 'Push', color: 'bg-purple-100 text-purple-800', icon: '🔔' },
    'IN_APP': { label: 'Uygulama', color: 'bg-gray-100 text-gray-800', icon: '📱' },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'bg-green-100 text-green-800';
      case 'DELIVERED': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SENT': return 'Gönderildi';
      case 'DELIVERED': return 'Teslim Edildi';
      case 'PENDING': return 'Bekliyor';
      case 'FAILED': return 'Başarısız';
      case 'CANCELLED': return 'İptal Edildi';
      default: return status;
    }
  };

  const filteredNotifications = (notifications || []).filter((notification: Notification) => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notification.meta?.petName && notification.meta.petName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = !selectedType || notification.type === selectedType;
    const matchesStatus = !selectedStatus || notification.status === selectedStatus;
    const matchesChannel = !selectedChannel || (notification.channels && notification.channels.includes(selectedChannel));
    
    let matchesTab = true;
    if (activeTab === 'pending') matchesTab = notification.status === 'PENDING';
    else if (activeTab === 'sent') matchesTab = notification.status === 'SENT' || notification.status === 'DELIVERED';
    else if (activeTab === 'failed') matchesTab = notification.status === 'FAILED';
    
    return matchesSearch && matchesType && matchesStatus && matchesChannel && matchesTab;
  });

  // Statistics
  const totalNotifications = (notifications || []).length;
  const pendingNotifications = (notifications || []).filter((n: Notification) => n.status === 'PENDING').length;
  const sentNotifications = (notifications || []).filter((n: Notification) => n.status === 'SENT' || n.status === 'DELIVERED').length;
  const failedNotifications = (notifications || []).filter((n: Notification) => n.status === 'FAILED').length;

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
          <h1 className="text-2xl font-bold text-slate-800">Bildirimler</h1>
          <p className="text-professional-gray">Otomatik hatırlatmalar ve özel mesajlar</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Ayarlar
          </Button>
          
          <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-medical-blue hover:bg-medical-blue/90"
                data-testid="button-compose"
              >
                <Send className="h-4 w-4 mr-2" />
                Mesaj Gönder
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Yeni Mesaj Oluştur</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Alıcı Türü</label>
                  <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                    <option value="ALL_OWNERS">Tüm Hayvan Sahipleri</option>
                    <option value="ALL_STAFF">Tüm Personel</option>
                    <option value="SPECIFIC_USER">Belirli Kullanıcı</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Kanal</label>
                  <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="EMAIL">E-posta</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Başlık</label>
                  <Input placeholder="Mesaj başlığı" className="mt-1" />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Mesaj</label>
                  <Textarea 
                    placeholder="Mesajınızı yazın..." 
                    className="mt-1"
                    rows={4}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                    İptal
                  </Button>
                  <Button className="bg-medical-blue hover:bg-medical-blue/90">
                    Gönder
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-professional-gray">Toplam</p>
                <p className="text-2xl font-bold text-slate-800">{totalNotifications}</p>
              </div>
              <Bell className="h-8 w-8 text-medical-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-professional-gray">Bekleyen</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingNotifications}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-professional-gray">Gönderilen</p>
                <p className="text-2xl font-bold text-green-600">{sentNotifications}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-professional-gray">Başarısız</p>
                <p className="text-2xl font-bold text-red-600">{failedNotifications}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="pending">Bekleyen</TabsTrigger>
          <TabsTrigger value="sent">Gönderilen</TabsTrigger>
          <TabsTrigger value="failed">Başarısız</TabsTrigger>
        </TabsList>

        {/* Search and Filters */}
        <Card className="mt-4">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-professional-gray" />
                <Input
                  placeholder="Başlık, mesaj veya alıcı ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-notifications"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-medical-blue focus:border-medical-blue"
                >
                  <option value="">Tüm Türler</option>
                  {Object.entries(notificationTypes).map(([key, type]) => (
                    <option key={key} value={key}>{type.label}</option>
                  ))}
                </select>
                
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-medical-blue focus:border-medical-blue"
                >
                  <option value="">Tüm Kanallar</option>
                  {Object.entries(channels).map(([key, channel]) => (
                    <option key={key} value={key}>{channel.label}</option>
                  ))}
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
          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.map((notification: Notification) => (
              <Card key={notification.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-medical-blue text-white">
                          {notificationTypes[notification.type].icon}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-slate-800">{notification.title}</h3>
                          <Badge className={notificationTypes[notification.type].color}>
                            {notificationTypes[notification.type].label}
                          </Badge>
                          {notification.channels?.map((channel: string, index: number) => (
                            <Badge key={index} className={channels[channel]?.color || 'bg-gray-100 text-gray-800'}>
                              {channels[channel]?.icon || '📱'} {channels[channel]?.label || channel}
                            </Badge>
                          ))}
                          <Badge className={getStatusColor(notification.status)}>
                            {getStatusLabel(notification.status)}
                          </Badge>
                        </div>
                        
                        <p className="text-professional-gray">{notification.body}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-professional-gray">
                          {notification.meta?.petName && (
                            <span>Hayvan: {notification.meta.petName}</span>
                          )}
                          <span>
                            Oluşturulma: {format(new Date(notification.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                          </span>
                          {notification.sentAt && (
                            <span>
                              Gönderilme: {format(new Date(notification.sentAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                            </span>
                          )}
                        </div>

                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {notification.status === 'PENDING' && (
                        <Button variant="outline" size="sm">
                          İptal Et
                        </Button>
                      )}
                      
                      {notification.status === 'FAILED' && (
                        <Button variant="outline" size="sm">
                          Tekrar Gönder
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        Detaylar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredNotifications.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-professional-gray mb-4">
                  <Bell className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">
                  {activeTab === 'all' ? 'Henüz bildirim yok' : 
                   activeTab === 'pending' ? 'Bekleyen bildirim yok' : 
                   activeTab === 'sent' ? 'Gönderilen bildirim yok' :
                   'Başarısız bildirim yok'}
                </h3>
                <p className="text-professional-gray mb-4">
                  İlk bildiriminizi göndermek için yukarıdaki butonu kullanın.
                </p>
                <Button 
                  className="bg-medical-blue hover:bg-medical-blue/90"
                  onClick={() => setIsComposeOpen(true)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  İlk Mesajı Gönder
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}