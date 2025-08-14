import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, AlertTriangle, Calendar, Syringe, HeartHandshake, Clock } from 'lucide-react';

interface Notification {
  id: string;
  type: 'urgent' | 'warning' | 'info' | 'appointment';
  title: string;
  message: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
}

const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'urgent',
    title: 'Acil Vaka',
    message: 'Max (Golden Retriever) - Trafik kazası, acil müdahale gerekiyor',
    time: '5 dk önce',
    priority: 'high',
    icon: <AlertTriangle className="w-4 h-4" />
  },
  {
    id: '2',
    type: 'warning',
    title: 'Aşı Hatırlatması',
    message: 'Luna için rabies aşısının süresi 3 gün içinde doluyor',
    time: '15 dk önce',
    priority: 'medium',
    icon: <Syringe className="w-4 h-4" />
  },
  {
    id: '3',
    type: 'appointment',
    title: 'Randevu Hatırlatması',
    message: 'Bugün 14:30 - Bella ile kontrol randevusu',
    time: '30 dk önce',
    priority: 'medium',
    icon: <Calendar className="w-4 h-4" />
  },
  {
    id: '4',
    type: 'info',
    title: 'Tedavi Tamamlandı',
    message: 'Charlie için antibiyotik tedavisi başarıyla tamamlandı',
    time: '1 saat önce',
    priority: 'low',
    icon: <HeartHandshake className="w-4 h-4" />
  },
  {
    id: '5',
    type: 'warning',
    title: 'Stok Uyarısı',
    message: 'Royal Canin köpek maması stokta azalıyor (5 adet kaldı)',
    time: '2 saat önce',
    priority: 'medium',
    icon: <AlertTriangle className="w-4 h-4" />
  }
];

export default function NotificationCenter() {
  const getNotificationStyle = (type: string, priority: string) => {
    const baseStyle = "relative flex items-start space-x-3 p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer group";
    
    switch (type) {
      case 'urgent':
        return `${baseStyle} bg-red-50 border-red-200 hover:bg-red-100 dark:bg-red-950/30 dark:border-red-800`;
      case 'warning':
        return `${baseStyle} bg-yellow-50 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-950/30 dark:border-yellow-800`;
      case 'appointment':
        return `${baseStyle} bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:border-blue-800`;
      default:
        return `${baseStyle} bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-950/30 dark:border-gray-800`;
    }
  };

  const getIconStyle = (type: string) => {
    switch (type) {
      case 'urgent':
        return "p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400";
      case 'warning':
        return "p-2 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400";
      case 'appointment':
        return "p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400";
      default:
        return "p-2 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">Yüksek</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Orta</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Düşük</Badge>;
    }
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white via-purple-50/30 to-purple-100/50 dark:from-gray-900 dark:via-purple-950/30 dark:to-purple-900/50">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-600" />
          Bildirimler
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            {sampleNotifications.length} yeni
          </Badge>
          <Button variant="ghost" size="sm" className="text-xs">
            Tümünü Gör
          </Button>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {sampleNotifications.map((notification) => (
              <div
                key={notification.id}
                className={getNotificationStyle(notification.type, notification.priority)}
              >
                <div className={getIconStyle(notification.type)}>
                  {notification.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {notification.title}
                    </p>
                    {getPriorityBadge(notification.priority)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {notification.time}
                  </div>
                </div>
                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}