import PieChart from "@/components/PieChart";
import type { DetailedMatchStats } from "@/lib/supabase";

interface FrequentResultsChartProps {
  stats: DetailedMatchStats;
  title?: string;
}

const FrequentResultsChart = ({ stats, title = "Leggyakoribb eredmények" }: FrequentResultsChartProps) => {
  if (stats.frequentResults.length === 0) {
    return (
      <div className="text-center text-white/60 py-8">
        Nincs elég adat a grafikon megjelenítéséhez
      </div>
    );
  }

  const chartData = {
    labels: stats.frequentResults.map(r => r.result),
    values: stats.frequentResults.map(r => r.count),
    colors: [
      "hsl(var(--primary))",
      "hsl(var(--secondary))",
      "hsl(var(--accent))",
      "hsl(var(--muted))"
    ]
  };

  return (
    <div className="space-y-4">
      <h4 className="text-white font-medium text-center">{title}</h4>
      <div className="max-w-sm mx-auto">
        <PieChart data={chartData} showLegend />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {stats.frequentResults.map((result, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded bg-white/5">
            <span className="text-white/70">{result.result}</span>
            <span className="text-white font-medium">{result.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FrequentResultsChart;