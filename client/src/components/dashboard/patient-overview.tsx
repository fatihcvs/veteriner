import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  owner: string;
  lastVisit: string;
  nextAppointment?: string;
  healthStatus: 'excellent' | 'good' | 'fair' | 'critical';
  temperature: number;
  weight: number;
  vaccinations: {
    completed: number;
    total: number;
  };
  avatar: string;
}

const samplePatients: Patient[] = [
  {
    id: '1',
    name: 'Max',
    species: 'Köpek',
    breed: 'Golden Retriever',
    age: '3 yaş',
    owner: 'Ahmet Yılmaz',
    lastVisit: '2 gün önce',
    nextAppointment: 'Yarın 14:30',
    healthStatus: 'good',
    temperature: 38.5,
    weight: 28.5,
    vaccinations: { completed: 4, total: 5 },
    avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'
  },
  {
    id: '2',
    name: 'Luna',
    species: 'Kedi',
    breed: 'British Shorthair',
    age: '2 yaş',
    owner: 'Fatma Demir',
    lastVisit: '1 hafta önce',
    healthStatus: 'excellent',
    temperature: 38.2,
    weight: 4.2,
    vaccinations: { completed: 5, total: 5 },
    avatar: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'
  },
  {
    id: '3',
    name: 'Charlie',
    species: 'Köpek',
    breed: 'Labrador',
    age: '7 yaş',
    owner: 'Mehmet Kaya',
    lastVisit: '3 gün önce',
    nextAppointment: 'Pazartesi 10:00',
    healthStatus: 'fair',
    temperature: 39.1,
    weight: 32.1,
    vaccinations: { completed: 3, total: 5 },
    avatar: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'
  }
];

export default function PatientOverview() {
  const getHealthStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Mükemmel</Badge>;
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">İyi</Badge>;
      case 'fair':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Orta</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Kritik</Badge>;
      default:
        return <Badge variant="outline">Bilinmiyor</Badge>;
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'good':
        return <Heart className="w-4 h-4 text-blue-600" />;
      case 'fair':
        return <Activity className="w-4 h-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getVaccinationProgress = (completed: number, total: number) => {
    return (completed / total) * 100;
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white via-green-50/30 to-green-100/50 dark:from-gray-900 dark:via-green-950/30 dark:to-green-900/50">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5" />
      <CardHeader className="relative">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Heart className="w-5 h-5 text-green-600" />
          Hasta Durumu
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-4">
          {samplePatients.map((patient) => (
            <div
              key={patient.id}
              className="
                bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl p-4
                hover:shadow-md transition-all duration-300 cursor-pointer
                dark:bg-gray-800/70 dark:border-gray-700
              "
            >
              {/* Patient Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={patient.avatar}
                      alt={patient.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1">
                      {getHealthIcon(patient.healthStatus)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {patient.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {patient.breed} • {patient.age}
                    </p>
                    <p className="text-xs text-gray-500">
                      Sahibi: {patient.owner}
                    </p>
                  </div>
                </div>
                {getHealthStatusBadge(patient.healthStatus)}
              </div>

              {/* Health Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Thermometer className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Ateş</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {patient.temperature}°C
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Ağırlık</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {patient.weight} kg
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Activity className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Aşılar</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {patient.vaccinations.completed}/{patient.vaccinations.total}
                  </p>
                </div>
              </div>

              {/* Vaccination Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Aşı Durumu
                  </span>
                  <span className="text-xs text-gray-500">
                    {Math.round(getVaccinationProgress(patient.vaccinations.completed, patient.vaccinations.total))}%
                  </span>
                </div>
                <Progress 
                  value={getVaccinationProgress(patient.vaccinations.completed, patient.vaccinations.total)}
                  className="h-2"
                />
              </div>

              {/* Visit Information */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Son ziyaret: {patient.lastVisit}
                </div>
                {patient.nextAppointment && (
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Sonraki: {patient.nextAppointment}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}