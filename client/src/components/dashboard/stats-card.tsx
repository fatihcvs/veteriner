import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: string;
  color?: string;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  color = 'medical-blue',
  className,
}: StatsCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getIconColor = () => {
    switch (color) {
      case 'medical-blue':
        return 'text-medical-blue';
      case 'healthcare-green':
        return 'text-healthcare-green';
      case 'orange':
        return 'text-orange-500';
      default:
        return 'text-medical-blue';
    }
  };

  return (
    <Card className={cn(
      'relative overflow-hidden border-0 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl group bg-gradient-to-br from-white via-blue-50/30 to-blue-100/50 dark:from-gray-900 dark:via-blue-950/30 dark:to-blue-900/50',
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300" />
      <CardContent className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-medium tracking-wide uppercase">{title}</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{value}</p>
            {change && (
              <p className={cn('text-xs font-medium flex items-center gap-1', getChangeColor())}>
                {changeType === 'positive' && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                {changeType === 'negative' && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                {change}
              </p>
            )}
          </div>
          {icon && (
            <div className={cn(
              'text-3xl p-3 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110',
              getIconColor()
            )}>
              <i className={icon} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}