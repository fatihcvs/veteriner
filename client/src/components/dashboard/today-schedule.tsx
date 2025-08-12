import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LoadingSpinner from '@/components/common/loading-spinner';
import { APPOINTMENT_TYPES, APPOINTMENT_STATUS } from '@/lib/constants';

interface TodayScheduleProps {
  appointments: any[];
  isLoading: boolean;
}

export default function TodaySchedule({ appointments, isLoading }: TodayScheduleProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-healthcare-green text-white';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
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
          <CardTitle>Bugünkü Program</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle>Bugünkü Program</CardTitle>
          <Button variant="ghost" className="text-medical-blue hover:text-medical-blue/80">
            Tümünü Gör
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-slate-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="text-professional-gray h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Bugün randevu yok</h3>
            <p className="text-professional-gray">Bugün için planlanmış randevu bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment: any) => (
              <div 
                key={appointment.id}
                className="flex items-center space-x-4 p-4 rounded-lg border border-slate-200 hover:border-medical-blue hover:bg-blue-50 transition-all cursor-pointer"
              >
                <div className="text-center min-w-0">
                  <p className="text-sm font-medium text-medical-blue">
                    {appointment.scheduledAt 
                      ? format(new Date(appointment.scheduledAt), 'HH:mm')
                      : '00:00'
                    }
                  </p>
                  <p className="text-xs text-professional-gray">
                    {appointment.duration || 30} dk
                  </p>
                </div>

                <Avatar className="h-12 w-12">
                  <AvatarImage src={appointment.pet?.avatarUrl} alt={appointment.pet?.name} />
                  <AvatarFallback className="bg-healthcare-green/10">
                    <i className="fas fa-paw text-healthcare-green"></i>
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-800">
                        {appointment.pet?.name || 'Bilinmeyen Hayvan'}
                      </p>
                      <p className="text-sm text-professional-gray">
                        {appointment.owner?.firstName} {appointment.owner?.lastName}
                      </p>
                      <p className="text-xs text-professional-gray">
                        {APPOINTMENT_TYPES[appointment.type as keyof typeof APPOINTMENT_TYPES] || appointment.type}
                      </p>
                    </div>
                    
                    <Badge className={getStatusColor(appointment.status)}>
                      {APPOINTMENT_STATUS[appointment.status as keyof typeof APPOINTMENT_STATUS] || appointment.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
