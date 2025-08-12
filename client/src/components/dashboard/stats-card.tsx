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
    <Card className={cn('', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className={cn('text-xs', getChangeColor())}>{change}</p>
            )}
          </div>
          {icon && (
            <div className={cn('text-2xl', getIconColor())}>
              <i className={icon} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}