import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: {
    labels: string[];
    values: number[];
    colors?: string[];
  };
  title?: string;
  showLegend?: boolean;
}

const PieChart = ({ data, title, showLegend = true }: PieChartProps) => {
  const defaultColors = [
    'hsl(159, 60%, 50%)', // emerald
    'hsl(38, 85%, 55%)',  // amber  
    'hsl(199, 89%, 48%)', // sky
  ];

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: data.colors || defaultColors,
        borderColor: data.colors?.map(color => color.replace(')', ', 0.8)').replace('hsl', 'hsla')) || 
                     defaultColors.map(color => color.replace(')', ', 0.8)').replace('hsl', 'hsla')),
        borderWidth: 2,
        hoverOffset: 8,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'right' as const,
        labels: {
          color: 'rgba(255,255,255,0.8)',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17,17,22,0.9)',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((context.parsed / total) * 100);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutQuart' as const
    }
  };

  return (
    <div className="w-full h-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      )}
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default PieChart;