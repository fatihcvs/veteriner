import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ORDER_STATUS } from '@/lib/constants';

interface OrderTimelineProps {
  order: {
    id: string;
    status: string;
    createdAt: Date | string | null;
    updatedAt?: Date | string | null;
  };
}

export default function OrderTimeline({ order }: OrderTimelineProps) {
  const getTimelineSteps = () => {
    const baseSteps = [
      {
        status: 'PENDING',
        label: 'Sipariş Alındı',
        description: 'Siparişiniz başarıyla oluşturuldu',
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
      },
      {
        status: 'PAID',
        label: 'Ödeme Onaylandı',
        description: 'Ödemeniz başarıyla işlendi',
        icon: CheckCircle,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      },
      {
        status: 'SHIPPED',
        label: 'Kargoya Verildi',
        description: 'Siparişiniz kargo şirketine teslim edildi',
        icon: Truck,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
      },
      {
        status: 'DELIVERED',
        label: 'Teslim Edildi',
        description: 'Siparişiniz başarıyla teslim edildi',
        icon: Package,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      },
    ];

    // Handle cancelled orders
    if (order.status === 'CANCELLED') {
      return [
        baseSteps[0], // PENDING
        {
          status: 'CANCELLED',
          label: 'İptal Edildi',
          description: 'Sipariş iptal edildi',
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
        },
      ];
    }

    return baseSteps;
  };

  const getCurrentStepIndex = () => {
    const statusOrder = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'];
    return Math.max(0, statusOrder.indexOf(order.status || 'PENDING'));
  };

  const timelineSteps = getTimelineSteps();
  const currentStepIndex = getCurrentStepIndex();
  const isCancelled = order.status === 'CANCELLED';

  const getStepState = (stepIndex: number) => {
    if (isCancelled) {
      if (stepIndex === 0) return 'completed'; // PENDING is always completed
      if (stepIndex === 1 && timelineSteps[1].status === 'CANCELLED') return 'completed';
      return 'inactive';
    }
    
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Sipariş Durumu</h3>
        <Badge className={
          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
          order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
          order.status === 'PAID' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }>
          {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS] || order.status}
        </Badge>
      </div>

      <div className="relative">
        {timelineSteps.map((step, index) => {
          const stepState = getStepState(index);
          const Icon = step.icon;
          const isLast = index === timelineSteps.length - 1;

          return (
            <div key={step.status} className="relative flex items-start">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-5 top-12 w-0.5 h-16 bg-slate-200" />
              )}
              
              {/* Step indicator */}
              <div className={`
                relative flex items-center justify-center w-10 h-10 rounded-full border-2 z-10
                ${stepState === 'completed' ? `${step.bgColor} border-transparent` : 
                  stepState === 'current' ? `${step.bgColor} border-2 ${step.color.replace('text-', 'border-')}` : 
                  'bg-slate-100 border-slate-300'}
              `}>
                <Icon className={`w-5 h-5 ${
                  stepState === 'completed' || stepState === 'current' ? step.color : 'text-slate-400'
                }`} />
              </div>

              {/* Step content */}
              <div className="ml-6 pb-8">
                <div className="flex items-center space-x-2">
                  <h4 className={`font-medium ${
                    stepState === 'completed' || stepState === 'current' ? 'text-slate-800' : 'text-slate-500'
                  }`}>
                    {step.label}
                  </h4>
                  {stepState === 'completed' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {stepState === 'current' && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </div>
                
                <p className={`text-sm mt-1 ${
                  stepState === 'completed' || stepState === 'current' ? 'text-professional-gray' : 'text-slate-400'
                }`}>
                  {step.description}
                </p>
                
                {/* Show timestamp for completed or current steps */}
                {(stepState === 'completed' || stepState === 'current') && order.createdAt && (
                  <p className="text-xs text-slate-400 mt-1">
                    {step.status === 'PENDING' || (stepState === 'current' && order.updatedAt) ? 
                      format(
                        new Date(step.status === 'PENDING' ? order.createdAt : order.updatedAt || order.createdAt),
                        'dd MMM yyyy, HH:mm',
                        { locale: tr }
                      ) : 
                      format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm', { locale: tr })
                    }
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order tracking info */}
      <div className="bg-slate-50 rounded-lg p-4 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-800">Sipariş Takip</p>
            <p className="text-xs text-professional-gray mt-1">
              Sipariş No: #{order.id?.slice(-8) || 'N/A'}
            </p>
          </div>
          
          {order.status === 'SHIPPED' && (
            <div className="text-right">
              <p className="text-sm text-slate-800 font-medium">Kargo Takip</p>
              <p className="text-xs text-professional-gray">
                WhatsApp'tan bilgilendirileceksiniz
              </p>
            </div>
          )}
          
          {order.status === 'DELIVERED' && (
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-700">
                Teslim Tamamlandı
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}