import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, Syringe, Bell } from 'lucide-react';

interface NotificationFilterProps {
  onFilterChange: (filters: string[]) => void;
  notificationCounts: Record<string, number>;
}

export function NotificationFilter({ onFilterChange, notificationCounts }: NotificationFilterProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>(['all']);

  const filterOptions = [
    { id: 'all', label: 'Tümü', icon: Bell, count: Object.values(notificationCounts).reduce((a, b) => a + b, 0) },
    { id: 'urgent', label: 'Acil', icon: AlertTriangle, count: notificationCounts.urgent || 0 },
    { id: 'appointment', label: 'Randevular', icon: Calendar, count: notificationCounts.appointment || 0 },
    { id: 'vaccination', label: 'Aşılar', icon: Syringe, count: notificationCounts.vaccination || 0 }
  ];

  const handleFilterToggle = (filterId: string) => {
    let newFilters: string[];
    
    if (filterId === 'all') {
      newFilters = ['all'];
    } else {
      const otherFilters = activeFilters.filter(f => f !== 'all');
      if (otherFilters.includes(filterId)) {
        newFilters = otherFilters.filter(f => f !== filterId);
        if (newFilters.length === 0) newFilters = ['all'];
      } else {
        newFilters = [...otherFilters, filterId];
      }
    }
    
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
      {filterOptions.map((option) => {
        const Icon = option.icon;
        const isActive = activeFilters.includes(option.id);
        
        return (
          <Button
            key={option.id}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterToggle(option.id)}
            className="flex items-center gap-2"
          >
            <Icon className="w-3 h-3" />
            {option.label}
            {option.count > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {option.count}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
}