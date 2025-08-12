import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UrgentNotifications() {
  const { data: overdueVaccinations } = useQuery({
    queryKey: ['/api/vaccinations/overdue'],
  });

  const urgentNotifications = [
    {
      id: 'overdue-vaccinations',
      type: 'alert',
      title: 'Vadesi Geçen Aşılar',
      description: `${overdueVaccinations?.length || 0} hayvan için aşı vadesi geçmiş`,
      action: 'Detayları Gör',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-alert-red',
      icon: AlertTriangle,
      visible: (overdueVaccinations?.length || 0) > 0,
    },
    {
      id: 'low-stock',
      type: 'warning',
      title: 'Düşük Stok Uyarısı',
      description: '3 ürün için stok azaldı',
      action: 'Envanter Yönet',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-500',
      icon: Package,
      visible: true,
    },
  ];

  const visibleNotifications = urgentNotifications.filter(notification => notification.visible);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acil Bildirimler</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {visibleNotifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <i className="fas fa-check-circle text-healthcare-green text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Her şey yolunda</h3>
            <p className="text-professional-gray text-sm">Acil müdahale gereken durum yok.</p>
          </div>
        ) : (
          visibleNotifications.map((notification) => {
            const IconComponent = notification.icon;
            
            return (
              <div 
                key={notification.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border ${notification.bgColor} ${notification.borderColor}`}
              >
                <IconComponent className={`h-5 w-5 mt-1 ${notification.textColor}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {notification.title}
                  </p>
                  <p className="text-xs text-professional-gray mt-1">
                    {notification.description}
                  </p>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className={`text-xs mt-2 p-0 h-auto font-medium hover:bg-transparent ${notification.textColor}`}
                  >
                    {notification.action}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
