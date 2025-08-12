import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bell, Clock, MessageCircle } from 'lucide-react';

interface UrgentNotification {
  id: string;
  type: 'VACCINATION_OVERDUE' | 'APPOINTMENT_REMINDER' | 'FEEDING_ALERT' | 'MEDICAL_URGENT';
  message: string;
  petName?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
}

interface UrgentNotificationsProps {
  notifications?: UrgentNotification[];
}

export default function UrgentNotifications({ notifications = [] }: UrgentNotificationsProps) {
  // Mock data for demonstration
  const mockNotifications: UrgentNotification[] = [
    {
      id: '1',
      type: 'VACCINATION_OVERDUE',
      message: 'Minnoş isimli kedinin kuduz aşısının süresi doldu',
      petName: 'Minnoş',
      priority: 'HIGH',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'FEEDING_ALERT',
      message: 'Karabaş için mama stoku azalıyor (3 gün kaldı)',
      petName: 'Karabaş',
      priority: 'MEDIUM',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      type: 'APPOINTMENT_REMINDER',
      message: 'Yarın için 5 onaylanmamış randevu var',
      priority: 'MEDIUM',
      createdAt: new Date().toISOString(),
    }
  ];

  const activeNotifications = notifications.length > 0 ? notifications : mockNotifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'VACCINATION_OVERDUE':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'APPOINTMENT_REMINDER':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'FEEDING_ALERT':
        return <Bell className="h-4 w-4 text-orange-500" />;
      case 'MEDICAL_URGENT':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'LOW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
          Acil Bildirimler
        </CardTitle>
        <Button variant="outline" size="sm">
          <MessageCircle className="h-4 w-4 mr-2" />
          Tümünü Gör
        </Button>
      </CardHeader>
      <CardContent>
        {activeNotifications.length > 0 ? (
          <div className="space-y-3">
            {activeNotifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {notification.message}
                  </p>
                  {notification.petName && (
                    <p className="text-xs text-professional-gray mt-1">
                      Evcil Hayvan: {notification.petName}
                    </p>
                  )}
                  <p className="text-xs text-professional-gray mt-1">
                    {new Date(notification.createdAt).toLocaleString('tr-TR')}
                  </p>
                </div>
                <Badge className={getPriorityColor(notification.priority)}>
                  {notification.priority === 'HIGH' ? 'Yüksek' : 
                   notification.priority === 'MEDIUM' ? 'Orta' : 'Düşük'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Acil bildirim yok</p>
            <p className="text-sm text-gray-500">Tüm sistemler normal çalışıyor</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}