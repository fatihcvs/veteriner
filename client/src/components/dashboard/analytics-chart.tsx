import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const sampleData = [
  { name: 'Oca', appointments: 65, revenue: 12000, patients: 23 },
  { name: 'Şub', appointments: 78, revenue: 15800, patients: 31 },
  { name: 'Mar', appointments: 90, revenue: 18200, patients: 45 },
  { name: 'Nis', appointments: 81, revenue: 16500, patients: 38 },
  { name: 'May', appointments: 95, revenue: 19800, patients: 52 },
  { name: 'Haz', appointments: 88, revenue: 17900, patients: 47 },
  { name: 'Tem', appointments: 102, revenue: 22100, patients: 58 },
];

interface AnalyticsChartProps {
  type?: 'appointments' | 'revenue' | 'patients';
  title: string;
  className?: string;
}

export default function AnalyticsChart({ 
  type = 'appointments', 
  title,
  className = ''
}: AnalyticsChartProps) {
  const getDataKey = () => {
    switch (type) {
      case 'revenue': return 'revenue';
      case 'patients': return 'patients';
      default: return 'appointments';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'revenue': return '#10b981';
      case 'patients': return '#6366f1';
      default: return '#3b82f6';
    }
  };

  const formatValue = (value: number) => {
    if (type === 'revenue') {
      return `₺${value.toLocaleString('tr-TR')}`;
    }
    return value.toString();
  };

  return (
    <Card className={`relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white via-blue-50/30 to-blue-100/50 dark:from-gray-900 dark:via-blue-950/30 dark:to-blue-900/50 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
      <CardHeader className="relative">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sampleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getColor()} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={getColor()} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatValue}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: number) => [formatValue(value), title]}
                labelStyle={{ color: '#374151' }}
              />
              <Area
                type="monotone"
                dataKey={getDataKey()}
                stroke={getColor()}
                strokeWidth={3}
                fill={`url(#gradient-${type})`}
                dot={{ fill: getColor(), strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: getColor(), strokeWidth: 2, fill: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}