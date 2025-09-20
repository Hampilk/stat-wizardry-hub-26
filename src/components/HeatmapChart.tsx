interface HeatmapData {
  x: string;
  y: string;
  value: number;
}

interface HeatmapChartProps {
  data: HeatmapData[];
  title?: string;
  maxValue?: number;
}

const HeatmapChart = ({ data, title, maxValue }: HeatmapChartProps) => {
  const max = maxValue || Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  
  // Get unique x and y values
  const xValues = [...new Set(data.map(d => d.x))];
  const yValues = [...new Set(data.map(d => d.y))];

  // Create matrix for easier rendering
  const matrix = yValues.map(y => 
    xValues.map(x => {
      const cell = data.find(d => d.x === x && d.y === y);
      return cell ? cell.value : 0;
    })
  );

  const getIntensity = (value: number) => {
    return (value - min) / (max - min);
  };

  const getColor = (intensity: number) => {
    // Create gradient from transparent primary to full primary
    const alpha = Math.max(0.1, intensity);
    return `hsla(262, 83%, 58%, ${alpha})`;
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      
      <div className="overflow-auto">
        <div className="grid grid-cols-1 gap-2 min-w-fit">
          {/* Header row */}
          <div className="grid gap-1" style={{ gridTemplateColumns: `100px repeat(${xValues.length}, 60px)` }}>
            <div></div>
            {xValues.map(x => (
              <div key={x} className="text-xs text-center text-muted-foreground p-2">
                {x}
              </div>
            ))}
          </div>
          
          {/* Data rows */}
          {yValues.map((y, yIndex) => (
            <div key={y} className="grid gap-1" style={{ gridTemplateColumns: `100px repeat(${xValues.length}, 60px)` }}>
              <div className="text-xs text-muted-foreground p-2 flex items-center">
                {y}
              </div>
              {matrix[yIndex].map((value, xIndex) => (
                <div
                  key={`${xIndex}-${yIndex}`}
                  className="h-12 rounded-sm border border-white/5 flex items-center justify-center text-xs font-medium transition-all duration-200 hover:scale-110"
                  style={{
                    backgroundColor: getColor(getIntensity(value))
                  }}
                  title={`${y} vs ${xValues[xIndex]}: ${value}`}
                >
                  {value > 0 && (
                    <span className={value > max * 0.7 ? 'text-white' : 'text-foreground'}>
                      {value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center mt-4 space-x-2">
        <span className="text-xs text-muted-foreground">Kevés</span>
        <div className="flex space-x-1">
          {[0.1, 0.3, 0.5, 0.7, 0.9].map(intensity => (
            <div
              key={intensity}
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: getColor(intensity) }}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">Sok</span>
      </div>
    </div>
  );
};

export default HeatmapChart;