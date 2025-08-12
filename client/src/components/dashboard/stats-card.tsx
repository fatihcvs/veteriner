import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: 'medical-blue' | 'healthcare-green' | 'action-teal' | 'orange' | 'alert-red';
}

export default function StatsCard({
  title,
  value,
  change,
  changeType,
  icon,
  color
}: StatsCardProps) {
  const colorClasses = {
    'medical-blue': 'bg-medical-blue/10 text-medical-blue',
    'healthcare-green': 'bg-healthcare-green/10 text-healthcare-green',
    'action-teal': 'bg-action-teal/10 text-action-teal',
    'orange': 'bg-orange-500/10 text-orange-500',
    'alert-red': 'bg-alert-red/10 text-alert-red'
  };

  const changeColorClasses = {
    positive: 'text-healthcare-green',
    negative: 'text-alert-red',
    neutral: 'text-professional-gray'
  };

  const changeIconClasses = {
    positive: 'fas fa-arrow-up',
    negative: 'fas fa-exclamation-triangle',
    neutral: 'fas fa-plus'
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-professional-gray">{title}</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
            <p className={cn("text-sm mt-1 flex items-center", changeColorClasses[changeType])}>
              <i className={cn(changeIconClasses[changeType], "text-xs mr-1")}></i>
              {change}
            </p>
          </div>
          <div className={cn("p-3 rounded-lg", colorClasses[color])}>
            <i className={cn(icon, "text-xl")}></i>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
