import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, MapPin } from 'lucide-react';

interface TodayScheduleProps {
  appointments?: any[];
  isLoading?: boolean;
}

export default function TodaySchedule({ appointments = [], isLoading }: TodayScheduleProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bugünkü Program</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
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
          <span>Bugünkü Program</span>
          <Badge variant="outline">{appointments.length} randevu</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Bugün için randevu bulunmuyor</p>
            </div>
          ) : (
            appointments.map((appointment, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg border">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={appointment.petAvatar} />
                  <AvatarFallback>
                    <i className="fas fa-paw text-medical-blue" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {appointment.petName} - {appointment.ownerName}
                    </p>
                    <Badge 
                      variant={appointment.status === 'CONFIRMED' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {appointment.status === 'CONFIRMED' ? 'Onaylandı' : 'Bekliyor'}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground space-x-4">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {appointment.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {appointment.type}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}