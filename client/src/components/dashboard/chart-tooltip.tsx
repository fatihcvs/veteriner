interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: number, name: string) => [string, string];
}

export function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]">
      <p className="font-medium text-gray-900 mb-2">{label}</p>
      {payload.map((entry, index) => {
        const [formattedValue, name] = formatter 
          ? formatter(entry.value, entry.name)
          : [entry.value, entry.name];
        
        return (
          <div key={index} className="flex items-center justify-between mb-1 last:mb-0">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">{name}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {formattedValue}
            </span>
          </div>
        );
      })}
    </div>
  );
}