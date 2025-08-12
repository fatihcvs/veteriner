import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/common/loading-spinner';
import { Calendar, Clock, User, Plus } from 'lucide-react';
import { APPOINTMENT_STATUS } from '@/lib/constants';

interface Appointment {
  id: string;
  petName: string;
  ownerName: string;
  type: string;
  scheduledFor: string;
  status: string;
  notes?: string;
}

interface TodayScheduleProps {
  appointments: Appointment[];
  isLoading: boolean;
}

export default function TodaySchedule({ appointments, isLoading }: TodayScheduleProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Bugünün Programı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Bugünün Programı
        </CardTitle>
        <Button size="sm" className="bg-medical-blue hover:bg-medical-blue/90">
          <Plus className="h-4 w-4 mr-2" />
          Randevu Ekle
        </Button>
      </CardHeader>
      <CardContent>
        {appointments && appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-medical-blue/10 p-2 rounded-lg">
                    <User className="h-4 w-4 text-medical-blue" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{appointment.petName}</p>
                    <p className="text-sm text-professional-gray">{appointment.ownerName}</p>
                    <p className="text-sm text-professional-gray">{appointment.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="flex items-center text-sm text-professional-gray">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(appointment.scheduledFor).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {APPOINTMENT_STATUS[appointment.status as keyof typeof APPOINTMENT_STATUS] || appointment.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Bugün için randevu yok</p>
            <p className="text-sm text-gray-500">Yeni randevu eklemek için yukarıdaki butonu kullanın</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}