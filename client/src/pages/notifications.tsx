import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bell, Send, Settings, Filter, Search, MessageSquare, Calendar, AlertTriangle, CheckCircle, Clock, X, Check, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
  });

  interface NotificationStats {
    total?: number;
    pending?: number;
    sent?: number;
    failed?: number;
  }

  const { data: notificationStats, isLoading: statsLoading } = useQuery<NotificationStats>({
    queryKey: ['/api/notifications/stats'],
  });

  // Form schema for creating notifications
  const notificationFormSchema = z.object({
    title: z.string().min(1, 'Başlık gereklidir'),
    body: z.string().min(1, 'Mesaj içeriği gereklidir'),
    type: z.string().min(1, 'Bildirim türü seçiniz'),
    channels: z.array(z.string()).min(1, 'En az bir kanal seçiniz'),
    recipientId: z.string().optional(),
    scheduledFor: z.string().optional(),
  });

  const form = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      title: '',
      body: '',
      type: 'CUSTOM',
      channels: [],
      recipientId: '',
      scheduledFor: '',
    },
  });

  // Mutations
  const createNotificationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof notificationFormSchema>) => {
      const res = await apiRequest('POST', '/api/notifications', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/stats'] });
      setIsComposeOpen(false);
      form.reset();
      toast({
        title: 'Bildirim Oluşturuldu',
        description: 'Yeni bildirim başarıyla oluşturuldu.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: 'Bildirim oluşturulurken bir hata oluştu.',
        variant: 'destructive',
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('PUT', `/api/notifications/${id}/read`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/notifications/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/stats'] });
      toast({
        title: 'Bildirim Silindi',
        description: 'Bildirim başarıyla silindi.',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest('PUT', `/api/notifications/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/stats'] });
    },
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
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Ayarlar
          </Button>
          
          <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-medical-blue hover:bg-medical-blue/90"
                data-testid="button-new-notification"
              >
                <Send className="h-4 w-4 mr-2" />
                Yeni Bildirim
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Yeni Bildirim Oluştur</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => createNotificationMutation.mutate(data))} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Başlık</FormLabel>
                          <FormControl>
                            <Input placeholder="Bildirim başlığı" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tür</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Bildirim türü seçin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(notificationTypes).map(([key, type]) => (
                                <SelectItem key={key} value={key}>
                                  {type.icon} {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mesaj İçeriği</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Bildirim mesajınızı yazın..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="channels"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gönderim Kanalları</FormLabel>
                          <div className="space-y-2">
                            {Object.entries(channels).map(([key, channel]) => (
                              <label key={key} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={field.value.includes(key)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      field.onChange([...field.value, key]);
                                    } else {
                                      field.onChange(field.value.filter(v => v !== key));
                                    }
                                  }}
                                />
                                <span>{channel.icon} {channel.label}</span>
                              </label>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="scheduledFor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zamanlama (Opsiyonel)</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsComposeOpen(false)}>
                      İptal
                    </Button>
                    <Button type="submit" disabled={createNotificationMutation.isPending}>
                      {createNotificationMutation.isPending ? 'Oluşturuluyor...' : 'Gönder'}
                    </Button>
                  </div>
                </form>
              </Form>
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
                <p className="text-2xl font-bold text-slate-800">{notificationStats?.total ?? totalNotifications}</p>
              </div>
              <Bell className="h-8 w-8 text-medical-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-professional-gray">Bekliyor</p>
                <p className="text-2xl font-bold text-yellow-600">{notificationStats?.pending ?? pendingNotifications}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-professional-gray">Gönderildi</p>
                <p className="text-2xl font-bold text-green-600">{notificationStats?.sent ?? sentNotifications}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-professional-gray">Başarısız</p>
                <p className="text-2xl font-bold text-red-600">{notificationStats?.failed ?? failedNotifications}</p>
              </div>
              <X className="h-8 w-8 text-red-600" />
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
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-professional-gray" />
            <Input
              placeholder="Bildirim ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-notifications"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
            data-testid="select-type"
          >
            <option value="">Tüm Türler</option>
            {Object.entries(notificationTypes).map(([key, type]) => (
              <option key={key} value={key}>{type.label}</option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
            data-testid="select-status"
          >
            <option value="">Tüm Durumlar</option>
            <option value="PENDING">Bekliyor</option>
            <option value="SENT">Gönderildi</option>
            <option value="DELIVERED">Teslim Edildi</option>
            <option value="FAILED">Başarısız</option>
          </select>
          
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
            data-testid="select-channel"
          >
            <option value="">Tüm Kanallar</option>
            {Object.entries(channels).map(([key, channel]) => (
              <option key={key} value={key}>{channel.label}</option>
            ))}
          </select>
        </div>

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
                            {notification.channels?.map((channel: string, index: number) => {
                              const ch = channels[channel as keyof typeof channels];
                              return (
                                <Badge key={index} className={ch?.color || 'bg-gray-100 text-gray-800'}>
                                  {ch?.icon || '📱'} {ch?.label || channel}
                                </Badge>
                              );
                            })}
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: notification.id, status: 'CANCELLED' })}
                          data-testid={`button-cancel-${notification.id}`}
                        >
                          <X className="h-4 w-4 mr-1" />
                          İptal Et
                        </Button>
                      )}
                      
                      {notification.status === 'FAILED' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: notification.id, status: 'PENDING' })}
                          data-testid={`button-retry-${notification.id}`}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Tekrar Gönder
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        data-testid={`button-read-${notification.id}`}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Okundu
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteNotificationMutation.mutate(notification.id)}
                        data-testid={`button-delete-${notification.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Sil
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
                  data-testid="button-create-first"
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