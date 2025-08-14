import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  UserPlus, 
  Syringe, 
  MessageCircle, 
  ShoppingCart, 
  FileText,
  Search,
  Activity,
  Bell,
  Settings,
  QrCode,
  Stethoscope
} from 'lucide-react';
import { Link } from 'wouter';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  hoverColor: string;
}

const quickActions: QuickAction[] = [
  {
    title: 'Yeni Randevu',
    description: 'Hasta için randevu oluştur',
    icon: <Calendar className="w-6 h-6" />,
    route: '/appointments',
    color: 'text-blue-600',
    hoverColor: 'hover:bg-blue-50 hover:border-blue-300'
  },
  {
    title: 'Hasta Ekle',
    description: 'Yeni hasta kaydı oluştur',
    icon: <UserPlus className="w-6 h-6" />,
    route: '/pets',
    color: 'text-green-600',
    hoverColor: 'hover:bg-green-50 hover:border-green-300'
  },
  {
    title: 'Aşı Kaydet',
    description: 'Aşı işlemini kaydet',
    icon: <Syringe className="w-6 h-6" />,
    route: '/vaccinations',
    color: 'text-purple-600',
    hoverColor: 'hover:bg-purple-50 hover:border-purple-300'
  },
  {
    title: 'WhatsApp Gönder',
    description: 'Hasta sahibine mesaj',
    icon: <MessageCircle className="w-6 h-6" />,
    route: '/notifications',
    color: 'text-emerald-600',
    hoverColor: 'hover:bg-emerald-50 hover:border-emerald-300'
  },
  {
    title: 'Mağaza',
    description: 'Ürün satışı yap',
    icon: <ShoppingCart className="w-6 h-6" />,
    route: '/shop',
    color: 'text-orange-600',
    hoverColor: 'hover:bg-orange-50 hover:border-orange-300'
  },
  {
    title: 'Tıbbi Kayıt',
    description: 'Muayene kaydı oluştur',
    icon: <Stethoscope className="w-6 h-6" />,
    route: '/medical-records',
    color: 'text-red-600',
    hoverColor: 'hover:bg-red-50 hover:border-red-300'
  },
  {
    title: 'QR Kod',
    description: 'Dijital aşı kartı oluştur',
    icon: <QrCode className="w-6 h-6" />,
    route: '/pets',
    color: 'text-indigo-600',
    hoverColor: 'hover:bg-indigo-50 hover:border-indigo-300'
  },
  {
    title: 'Raporlar',
    description: 'Analitik raporları görüntüle',
    icon: <Activity className="w-6 h-6" />,
    route: '/admin',
    color: 'text-teal-600',
    hoverColor: 'hover:bg-teal-50 hover:border-teal-300'
  }
];

export default function QuickActionsHub() {
  return (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white via-gray-50/30 to-gray-100/50 dark:from-gray-900 dark:via-gray-950/30 dark:to-gray-800/50">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-slate-500/5" />
      <CardHeader className="relative">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Activity className="w-5 h-5 text-gray-600" />
          Hızlı İşlemler
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.route}>
              <Button
                variant="outline"
                className={`
                  flex flex-col items-center justify-center p-4 h-24 w-full text-center
                  border-2 border-gray-200 bg-white/60 backdrop-blur-sm
                  transition-all duration-300 ease-in-out transform
                  hover:scale-105 hover:shadow-lg active:scale-95
                  dark:bg-gray-800/60 dark:border-gray-700
                  ${action.hoverColor}
                `}
              >
                <div className={`${action.color} mb-2 transition-transform duration-300 group-hover:scale-110`}>
                  {action.icon}
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">
                  {action.title}
                </span>
              </Button>
            </Link>
          ))}
        </div>
        
        {/* Search Bar */}
        <div className="mt-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Hasta ara, randevu bul, ürün ara..."
            className="
              w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
              bg-white/70 backdrop-blur-sm
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              dark:bg-gray-800/70 dark:border-gray-600 dark:text-gray-200
              transition-all duration-200
            "
          />
        </div>
      </CardContent>
    </Card>
  );
}