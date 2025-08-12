import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CalendarDays, Clock, Plus, User, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/common/loading-spinner';
import { APPOINTMENT_TYPES, APPOINTMENT_STATUS } from '@/lib/constants';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@shared/schema';

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const { toast } = useToast();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['/api/appointments'],
  });

  const { data: pets } = useQuery({
    queryKey: ['/api/pets'],
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      await apiRequest('POST', '/api/appointments', appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      setIsFormOpen(false);
      toast({
        title: 'Başarılı',
        description: 'Randevu oluşturuldu.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: 'Randevu oluşturulamadı.',
        variant: 'destructive',
      });
    },
  });

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VACCINATION':
        return 'fas fa-syringe';
      case 'SURGERY':
        return 'fas fa-user-md';
      case 'EMERGENCY':
        return 'fas fa-ambulance';
      default:
        return 'fas fa-stethoscope';
    }
  };

  const filterAppointmentsByDate = (date: Date) => {
    return appointments?.filter((apt: any) => 
      isSameDay(parseISO(apt.scheduledAt), date)
    ) || [];
  };

  const getWeekDates = (startDate: Date) => {
    const weekStart = startOfWeek(startDate, { locale: tr });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

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
          <h2 className="text-2xl font-bold text-slate-800">Randevular</h2>
          <p className="text-professional-gray">Randevu planlaması ve takibi</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'day' | 'week')}>
            <TabsList>
              <TabsTrigger value="day">Günlük</TabsTrigger>
              <TabsTrigger value="week">Haftalık</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-medical-blue hover:bg-medical-blue/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Randevu
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Yeni Randevu Oluştur</DialogTitle>
              </DialogHeader>
              <AppointmentForm 
                onSuccess={() => setIsFormOpen(false)}
                pets={pets || []}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Date Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            >
              ← Önceki
            </Button>
            
            <div className="text-center">
              <h3 className="font-semibold text-lg">
                {format(selectedDate, 'dd MMMM yyyy', { locale: tr })}
              </h3>
              <p className="text-sm text-professional-gray">
                {format(selectedDate, 'EEEE', { locale: tr })}
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            >
              Sonraki →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointments View */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'day' | 'week')}>
        <TabsContent value="day">
          <DayView 
            date={selectedDate} 
            appointments={filterAppointmentsByDate(selectedDate)}
            getStatusColor={getStatusColor}
            getTypeIcon={getTypeIcon}
          />
        </TabsContent>
        
        <TabsContent value="week">
          <WeekView
            weekStart={startOfWeek(selectedDate, { locale: tr })}
            appointments={appointments}
            getStatusColor={getStatusColor}
            getTypeIcon={getTypeIcon}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DayView({ 
  date, 
  appointments, 
  getStatusColor, 
  getTypeIcon 
}: {
  date: Date;
  appointments: any[];
  getStatusColor: (status: string) => string;
  getTypeIcon: (type: string) => string;
}) {
  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <div className="bg-slate-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <CalendarDays className="text-professional-gray h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Bu tarihte randevu yok
              </h3>
              <p className="text-professional-gray">
                {format(date, 'dd MMMM yyyy', { locale: tr })} tarihinde henüz randevu planlanmamış.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment: any) => (
        <Card key={appointment.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="text-center min-w-0">
                <div className="bg-medical-blue/10 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-medical-blue" />
                </div>
                <p className="text-sm font-medium text-medical-blue mt-1">
                  {format(parseISO(appointment.scheduledAt), 'HH:mm')}
                </p>
                <p className="text-xs text-professional-gray">
                  {appointment.duration || 30} dk
                </p>
              </div>

              <Avatar className="h-12 w-12">
                <AvatarImage src={appointment.pet?.avatarUrl} alt={appointment.pet?.name} />
                <AvatarFallback className="bg-healthcare-green/10">
                  <i className={`fas fa-paw text-healthcare-green`}></i>
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {appointment.pet?.name || 'Bilinmeyen Hayvan'}
                    </h3>
                    <p className="text-sm text-professional-gray">
                      {appointment.owner?.firstName} {appointment.owner?.lastName}
                    </p>
                    <p className="text-xs text-professional-gray mt-1">
                      <i className={`${getTypeIcon(appointment.type)} mr-1`}></i>
                      {APPOINTMENT_TYPES[appointment.type as keyof typeof APPOINTMENT_TYPES] || appointment.type}
                    </p>
                  </div>
                  
                  <Badge className={getStatusColor(appointment.status)}>
                    {APPOINTMENT_STATUS[appointment.status as keyof typeof APPOINTMENT_STATUS] || appointment.status}
                  </Badge>
                </div>

                {appointment.notes && (
                  <p className="text-sm text-professional-gray mt-2">
                    {appointment.notes}
                  </p>
                )}

                <div className="flex space-x-2 mt-3">
                  <Button variant="outline" size="sm">
                    <User className="h-3 w-3 mr-1" />
                    Detay
                  </Button>
                  <Button variant="outline" size="sm">
                    <Stethoscope className="h-3 w-3 mr-1" />
                    Muayene
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function WeekView({ 
  weekStart, 
  appointments, 
  getStatusColor, 
  getTypeIcon 
}: {
  weekStart: Date;
  appointments: any[];
  getStatusColor: (status: string) => string;
  getTypeIcon: (type: string) => string;
}) {
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {weekDates.map((date) => {
        const dayAppointments = appointments.filter((apt: any) => 
          isSameDay(parseISO(apt.scheduledAt), date)
        );

        return (
          <Card key={date.toISOString()} className="min-h-[200px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-center">
                <div className="text-xs text-professional-gray">
                  {format(date, 'EEE', { locale: tr })}
                </div>
                <div className="text-lg font-bold">
                  {format(date, 'd')}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-2">
              {dayAppointments.length === 0 ? (
                <p className="text-xs text-professional-gray text-center py-4">
                  Randevu yok
                </p>
              ) : (
                dayAppointments.map((appointment: any) => (
                  <div 
                    key={appointment.id}
                    className="bg-slate-50 p-2 rounded text-xs"
                  >
                    <p className="font-medium text-slate-800 truncate">
                      {appointment.pet?.name}
                    </p>
                    <p className="text-professional-gray">
                      {format(parseISO(appointment.scheduledAt), 'HH:mm')}
                    </p>
                    <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function AppointmentForm({ onSuccess, pets }: { onSuccess: () => void; pets: any[] }) {
  const [selectedPet, setSelectedPet] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('CHECKUP');
  const [notes, setNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const { toast } = useToast();

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      await apiRequest('POST', '/api/appointments', appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      onSuccess();
      toast({
        title: 'Başarılı',
        description: 'Randevu talebiniz oluşturuldu.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: 'Randevu oluşturulamadı.',
        variant: 'destructive',
      });
    },
  });

  const fetchAvailableSlots = async (date: string, petId: string) => {
    if (!date || !petId) return;
    
    setIsLoadingSlots(true);
    try {
      const pet = pets.find(p => p.id === petId);
      if (!pet) return;
      
      const response = await fetch(`/api/appointments/available-slots?date=${date}&clinicId=${pet.clinicId}`);
      const slots = await response.json();
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPet || !selectedDate || !selectedTime || !appointmentType) {
      toast({
        title: 'Eksik Bilgi',
        description: 'Lütfen tüm gerekli alanları doldurun.',
        variant: 'destructive',
      });
      return;
    }

    const pet = pets.find(p => p.id === selectedPet);
    if (!pet) return;

    createAppointmentMutation.mutate({
      petId: selectedPet,
      clinicId: pet.clinicId,
      vetUserId: pet.clinicId, // Default to clinic for now - backend will set proper vet
      type: appointmentType,
      scheduledAt: new Date(`${selectedDate}T${selectedTime}:00`),
      notes: notes || undefined,
      status: 'SCHEDULED',
      duration: 30,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="appointment-form">
      {/* Pet Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Hayvan Seçin</label>
        <select
          value={selectedPet}
          onChange={(e) => {
            setSelectedPet(e.target.value);
            if (selectedDate) {
              fetchAvailableSlots(selectedDate, e.target.value);
            }
          }}
          className="w-full p-3 border rounded-md"
          data-testid="select-pet"
        >
          <option value="">Hayvan seçin...</option>
          {pets.map(pet => (
            <option key={pet.id} value={pet.id}>
              {pet.name} ({pet.species} - {pet.breed})
            </option>
          ))}
        </select>
      </div>

      {/* Date Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Tarih Seçin</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            if (selectedPet) {
              fetchAvailableSlots(e.target.value, selectedPet);
            }
          }}
          min={new Date().toISOString().split('T')[0]}
          className="w-full p-3 border rounded-md"
          data-testid="input-date"
        />
      </div>

      {/* Time Slot Selection */}
      {selectedDate && selectedPet && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Saat Seçin</label>
          {isLoadingSlots ? (
            <div className="text-center py-4">
              <LoadingSpinner size="sm" />
              <p className="text-sm text-professional-gray mt-2">Müsait saatler yükleniyor...</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {availableSlots.map(slot => (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => setSelectedTime(slot.time)}
                  disabled={!slot.available}
                  className={`p-2 text-sm rounded border transition-colors ${
                    selectedTime === slot.time
                      ? 'bg-medical-blue text-white border-medical-blue'
                      : slot.available
                      ? 'bg-white text-slate-700 border-gray-300 hover:border-medical-blue'
                      : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  }`}
                  data-testid={`slot-${slot.time}`}
                >
                  {slot.time}
                  {!slot.available && (
                    <div className="text-xs text-red-500">Dolu</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Appointment Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Randevu Türü</label>
        <select
          value={appointmentType}
          onChange={(e) => setAppointmentType(e.target.value)}
          className="w-full p-3 border rounded-md"
          data-testid="select-type"
        >
          {Object.entries(APPOINTMENT_TYPES).map(([key, value]) => (
            <option key={key} value={key}>{value}</option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Notlar (Opsiyonel)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Randevu ile ilgili özel notlarınız..."
          className="w-full p-3 border rounded-md h-24 resize-none"
          data-testid="textarea-notes"
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={createAppointmentMutation.isPending || !selectedPet || !selectedDate || !selectedTime}
          className="flex-1 bg-medical-blue hover:bg-medical-blue/90"
          data-testid="button-submit"
        >
          {createAppointmentMutation.isPending ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Oluşturuluyor...</span>
            </>
          ) : (
            'Randevu Oluştur'
          )}
        </Button>
      </div>
    </form>
  );
}
