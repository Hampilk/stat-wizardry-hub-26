import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Stats {
  total: number;
  home: number;
  draw: number;
  away: number;
  btts: number;
  homePercent: number;
  drawPercent: number;
  awayPercent: number;
  bttsYesPercent: number;
  bttsNoPercent: number;
}

interface ChartsDisplayProps {
  stats: Stats;
}

export const ChartsDisplay: React.FC<ChartsDisplayProps> = ({ stats }) => {
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "rgba(255, 255, 255, 0.7)" },
      },
      x: {
        grid: { display: false },
        ticks: { color: "rgba(255, 255, 255, 0.7)" },
      },
    },
  };

  const resultsChartData = {
    labels: ["Hazai", "Döntetlen", "Vendég"],
    datasets: [{
      data: [stats.home, stats.draw, stats.away],
      backgroundColor: [
        "hsl(var(--success) / 0.8)", 
        "hsl(var(--warning) / 0.8)", 
        "hsl(var(--info) / 0.8)"
      ],
      borderColor: [
        "hsl(var(--success))", 
        "hsl(var(--warning))", 
        "hsl(var(--info))"
      ],
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  const bttsChartData = {
    labels: ["BTTS Igen", "BTTS Nem"],
    datasets: [{
      data: [stats.btts, stats.total - stats.btts],
      backgroundColor: [
        "hsl(var(--primary) / 0.8)", 
        "hsl(var(--muted) / 0.8)"
      ],
      borderColor: [
        "hsl(var(--primary))", 
        "hsl(var(--muted))"
      ],
      borderWidth: 2,
      hoverOffset: 12,
    }],
  };

  const bttsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      }
    },
    cutout: "70%",
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Results Chart */}
      <div className="glass-effect rounded-2xl p-6 hover:bg-white/5 transition-smooth group">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Eredmények megoszlása</h3>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
        </div>
        
        <div className="rounded-lg bg-white/[0.03] ring-1 ring-white/10 p-4">
          <div className="relative h-64 sm:h-72">
            <Bar options={chartOptions as any} data={resultsChartData} />
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/10 flex shadow-inner">
              <div 
                className="h-full bg-success transition-all duration-1000 ease-out" 
                style={{ width: `${stats.homePercent}%` }}
              ></div>
              <div 
                className="h-full bg-warning transition-all duration-1000 ease-out" 
                style={{ width: `${stats.drawPercent}%` }}
              ></div>
              <div 
                className="h-full bg-info transition-all duration-1000 ease-out" 
                style={{ width: `${stats.awayPercent}%` }}
              ></div>
            </div>
            
            {/* Legend */}
            <div className="flex justify-between mt-3 text-xs text-zinc-400">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                Hazai {stats.homePercent}%
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                Döntetlen {stats.drawPercent}%
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-info"></div>
                Vendég {stats.awayPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BTTS Chart */}
      <div className="glass-effect rounded-2xl p-6 hover:bg-white/5 transition-smooth group">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">BTTS Statisztika</h3>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
        </div>
        
        <div className="rounded-lg bg-white/[0.03] ring-1 ring-white/10 p-4">
          <div className="relative h-64 sm:h-72">
            <Doughnut data={bttsChartData} options={bttsChartOptions} />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm uppercase tracking-tight text-zinc-400 font-medium">BTTS Igen</div>
                <div className="text-4xl font-bold tracking-tight text-primary mt-1">
                  {stats.bttsYesPercent}%
                </div>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4">
            <span className="flex items-center gap-2 text-sm text-zinc-300">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              BTTS Igen ({stats.btts})
            </span>
            <span className="flex items-center gap-2 text-sm text-zinc-300">
              <div className="w-3 h-3 rounded-full bg-muted"></div>
              BTTS Nem ({stats.total - stats.btts})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};