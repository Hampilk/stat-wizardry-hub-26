import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
    }[];
  };
  title?: string;
  horizontal?: boolean;
}

const BarChart = ({ data, title, horizontal = false }: BarChartProps) => {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || `hsla(262, 83%, 58%, ${0.8 - index * 0.1})`,
      borderColor: dataset.borderColor || 'hsl(262, 83%, 58%)',
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false,
    }))
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' as const : 'x' as const,
    plugins: {
      legend: {
        display: data.datasets.length > 1,
        labels: {
          color: 'rgba(255,255,255,0.8)',
          font: { size: 12 }
        }
      },
      tooltip: {
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
          maxTicksLimit: 8
        },
        grid: { color: 'rgba(255,255,255,0.06)' }
      },
      y: {
        ticks: { 
          color: 'rgba(255,255,255,0.6)',
          maxTicksLimit: 6
        },
        grid: { color: 'rgba(255,255,255,0.06)' }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart' as const
    }
  };

  return (
    <div className="w-full h-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;