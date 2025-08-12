import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, Clock } from 'lucide-react';

interface UrgentNotificationsProps {
  notifications?: any[];
  isLoading?: boolean;
}

export default function UrgentNotifications({ notifications = [], isLoading }: UrgentNotificationsProps) {
  // Mock urgent notifications for demo
  const urgentItems = [
    {
      id: '1',
      type: 'VACCINATION_OVERDUE',
      title: 'Vadesi Geçen Aşı',
      description: 'Bella (Golden Retriever) - Kuduz aşısı 5 gün gecikti',
      priority: 'high',
      time: '2 saat önce'
    },
    {
      id: '2',
      type: 'APPOINTMENT_REMINDER',
      title: 'Randevu Hatırlatması',
      description: 'Max (Scottish Fold) - Yarın saat 14:00 kontrol randevusu',
      priority: 'medium',
      time: '4 saat önce'
    },
    {
      id: '3',
      type: 'FOOD_DEPLETION',
      title: 'Mama Azalıyor',
      description: 'Charlie (Beagle) - Royal Canin mama stoku %20 seviyesinde',
      priority: 'low',
      time: '6 saat önce'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPriorityIcon = (type: string) => {
    switch (type) {
      case 'VACCINATION_OVERDUE':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'APPOINTMENT_REMINDER':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'FOOD_DEPLETION':
        return <Bell className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acil Bildirimler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-gray-200 h-8 w-8"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Acil Bildirimler</span>
          <Badge variant="destructive">{urgentItems.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {urgentItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Acil bildirim bulunmuyor</p>
            </div>
          ) : (
            urgentItems.map((notification) => (
              <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                <div className="mt-0.5">
                  {getPriorityIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <Badge 
                      variant={getPriorityColor(notification.priority)}
                      className="text-xs"
                    >
                      {notification.priority === 'high' ? 'Yüksek' : 
                       notification.priority === 'medium' ? 'Orta' : 'Düşük'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {notification.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {notification.time}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        {urgentItems.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" className="w-full">
              Tüm Bildirimleri Görüntüle
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}