import { LineChart, Sparkles, BarChart3, CheckCircle, TrendingUp, Bell } from "lucide-react";
import { Line } from 'react-chartjs-2';
import { Button } from "@/components/ui/button";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartSection = () => {
  const chartData = {
    labels: Array.from({ length: 20 }, (_, i) => i + 1),
    datasets: [
      {
        label: 'Gólátlag',
        data: [2.0, 2.1, 2.2, 2.1, 2.3, 2.5, 2.4, 2.6, 2.7, 2.5, 2.8, 2.9, 3.0, 2.7, 2.8, 2.9, 3.1, 3.0, 3.2, 3.1],
        borderColor: 'hsl(262, 83%, 58%)',
        backgroundColor: (ctx: any) => {
          const canvas = ctx.chart.ctx;
          const gradient = canvas.createLinearGradient(0, 0, 0, 240);
          gradient.addColorStop(0, 'hsla(262, 83%, 58%, 0.35)');
          gradient.addColorStop(1, 'hsla(262, 83%, 58%, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(17,17,22,0.9)',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#fff'
      }
    },
    scales: {
      x: {
        ticks: { 
          color: 'rgba(255,255,255,0.6)', 
          maxTicksLimit: 6 
        },
        grid: { 
          color: 'rgba(255,255,255,0.06)' 
        }
      },
      y: {
        ticks: { 
          color: 'rgba(255,255,255,0.6)', 
          maxTicksLimit: 5 
        },
        grid: { 
          color: 'rgba(255,255,255,0.06)' 
        },
        suggestedMin: 1.5,
        suggestedMax: 3.5
      }
    }
  };

  const insights = [
    {
      icon: CheckCircle,
      text: "A favorit csapat 68%-ban szerezte az első gólt.",
      color: "text-sports-emerald"
    },
    {
      icon: TrendingUp,
      text: "BTTS arány növekvő trendben az utolsó 6 fordulóban.",
      color: "text-primary"
    },
    {
      icon: Bell,
      text: "1.5 fölötti gólvonal 74%-ban jött azonos szűrőkkel.",
      color: "text-sports-amber"
    }
  ];

  return (
    <section className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="rounded-2xl glass-card p-5 sm:p-6 lg:col-span-2">
        <h2 className="text-lg md:text-xl font-semibold tracking-tight flex items-center gap-2">
          <LineChart className="size-5 text-white/70" />
          Gólátlag trend
        </h2>
        <p className="text-sm text-white/60 mt-1">Utolsó 20 mérkőzés mozgóátlaga</p>
        <div className="mt-4">
          <div className="relative h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl glass-card p-5 sm:p-6">
        <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <Sparkles className="size-5 text-white/70" />
          Gyors betekintés
        </h3>
        <ul className="mt-4 space-y-3 text-sm">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <li key={index} className="flex items-start gap-2">
                <Icon className={`mt-0.5 size-4 ${insight.color}`} />
                {insight.text}
              </li>
            );
          })}
        </ul>
        <div className="mt-6 p-3 rounded-xl bg-gradient-to-r from-primary/15 to-fuchsia-600/10 ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/70">Ajánlott piac</p>
              <p className="text-base font-semibold tracking-tight">2.5 gól felett</p>
            </div>
            <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30">
              <BarChart3 className="size-4 mr-2" />
              Részletek
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChartSection;