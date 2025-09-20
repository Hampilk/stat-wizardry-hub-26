import { useState } from "react";
import { 
  LineChart, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  Settings,
  RefreshCw,
  Maximize2,
  Target,
  Trophy
} from "lucide-react";
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAdvancedAnalytics } from "@/hooks/use-advanced-analytics";
import LoadingSpinner from "./LoadingSpinner";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
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
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const EnhancedChartSection = ({ filters }: { filters?: import('@/lib/supabase').MatchFilters }) => {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("30");
  const [chartType, setChartType] = useState("results");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { analytics, loading, error, refetch } = useAdvancedAnalytics(filters);

  if (loading) {
    return (
      <section className="mb-8">
        <Card className="glass-card border-white/10">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <LoadingSpinner />
            </div>
          </CardContent>
        </Card>
      </section>
    )
  }

  if (error || !analytics) {
    return (
      <section className="mb-8">
        <Card className="glass-card border-white/10">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                Hiba az analitika betöltése során: {error}
              </div>
              {filters && Object.keys(filters).length > 0 && (
                <p className="text-white/60 text-sm">
                  Próbálj meg más szűrőket alkalmazni, vagy töröld a szűrőket.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    )
  }

  // Most Common Results Chart Data
  const mostCommonResultsData = {
    labels: analytics.mostCommonResults.slice(0, 8).map(r => r.result),
    datasets: [
      {
        label: 'Gyakoriság (%)',
        data: analytics.mostCommonResults.slice(0, 8).map(r => r.percentage),
        backgroundColor: [
          'hsl(262, 83%, 58%)',
          'hsl(158, 64%, 52%)',
          'hsl(43, 96%, 56%)',
          'hsl(213, 94%, 68%)',
          'hsl(316, 73%, 52%)',
          'hsl(198, 93%, 60%)',
          'hsl(24, 95%, 53%)',
          'hsl(295, 72%, 61%)',
        ],
        borderWidth: 0,
        borderRadius: 8,
      }
    ]
  };

  // Goals Trend (Over/Under 2.5) Chart Data
  const goalsTrendData = {
    labels: ['2.5+ gól', '2.5 alatt'],
    datasets: [
      {
        data: [analytics.goalsTrend.over25Percentage, analytics.goalsTrend.under25Percentage],
        backgroundColor: [
          'hsl(158, 64%, 52%)',
          'hsl(213, 94%, 68%)',
        ],
        borderWidth: 0,
        hoverOffset: 10,
      }
    ]
  };

  // BTTS Professional Analysis Chart Data
  const bttsAnalysisData = {
    labels: analytics.bttsAnalysis.monthlyTrend.map(m => m.month),
    datasets: [
      {
        label: 'BTTS arány (%)',
        data: analytics.bttsAnalysis.monthlyTrend.map(m => m.bttsRate),
        borderColor: 'hsl(158, 64%, 52%)',
        backgroundColor: 'hsla(158, 64%, 52%, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };

  // Weekly Results Chart Data (Mixed Chart - Bar + Line)
  const weeklyResultsData = {
    labels: analytics.weeklyResults.map(w => w.day),
    datasets: [
      {
        label: 'Mérkőzések száma',
        data: analytics.weeklyResults.map(w => w.matches),
        backgroundColor: 'hsla(262, 83%, 58%, 0.8)',
        borderWidth: 0,
        borderRadius: 8,
        yAxisID: 'y',
      }
    ]
  };

  // Separate data for line chart overlay
  const weeklyGoalsData = {
    labels: analytics.weeklyResults.map(w => w.day),
    datasets: [
      {
        label: 'Átlag gólszám',
        data: analytics.weeklyResults.map(w => w.avgGoals),
        borderColor: 'hsl(43, 96%, 56%)',
        backgroundColor: 'hsla(43, 96%, 56%, 0.1)',
        fill: false,
        tension: 0.4,
      }
    ]
  };

  // Comeback Analysis Chart Data
  const comebackData = {
    labels: analytics.comebackAnalysis?.byScoreline.map(item => item.scenario) || [],
    datasets: [
      {
        label: 'Fordítások száma',
        data: analytics.comebackAnalysis?.byScoreline.map(item => item.count) || [],
        backgroundColor: [
          'hsl(43, 96%, 56%)',
          'hsl(158, 64%, 52%)',
          'hsl(213, 94%, 68%)',
          'hsl(316, 73%, 52%)',
          'hsl(198, 93%, 60%)',
        ],
        borderWidth: 0,
        borderRadius: 8,
      }
    ]
  };

  // Halftime vs Fulltime Correlation Chart Data
  const halftimeData = {
    labels: analytics.halftimeVsFulltime?.scenarios.slice(0, 6).map(s => `${s.halftime} → ${s.fulltime}`) || [],
    datasets: [
      {
        label: 'Gyakoriság (%)',
        data: analytics.halftimeVsFulltime?.scenarios.slice(0, 6).map(s => s.percentage) || [],
        backgroundColor: 'hsla(262, 83%, 58%, 0.8)',
        borderColor: 'hsl(262, 83%, 58%)',
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  };

  // Seasonal Trends Chart Data
  const seasonalData = {
    labels: analytics.seasonalTrends?.monthlyGoalAverage.map(m => m.month) || [],
    datasets: [
      {
        label: 'Átlag gólszám',
        data: analytics.seasonalTrends?.monthlyGoalAverage.map(m => m.avgGoals) || [],
        borderColor: 'hsl(43, 96%, 56%)',
        backgroundColor: 'hsla(43, 96%, 56%, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'BTTS arány (%)',
        data: analytics.seasonalTrends?.monthlyGoalAverage.map(m => m.bttsRate) || [],
        borderColor: 'hsl(158, 64%, 52%)',
        backgroundColor: 'hsla(158, 64%, 52%, 0.1)',
        fill: false,
        tension: 0.4,
        yAxisID: 'y1',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'rgba(255,255,255,0.8)',
          usePointStyle: true,
          padding: 20,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17,17,22,0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
      }
    },
    scales: chartType !== 'goals' ? {
      x: {
        ticks: { 
          color: 'rgba(255,255,255,0.6)',
          maxTicksLimit: 8 
        },
        grid: { 
          color: 'rgba(255,255,255,0.08)',
          drawBorder: false
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        ticks: { 
          color: 'rgba(255,255,255,0.6)',
          maxTicksLimit: 6 
        },
        grid: { 
          color: 'rgba(255,255,255,0.08)',
          drawBorder: false
        }
      }
    } : undefined
  };

  const handleExport = () => {
    toast({
      title: "Grafikon exportálás",
      description: "PNG formátumban letöltés indítása...",
    });
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Adatok frissítése",
      description: "Legfrissebb analitikai adatok betöltése...",
    });
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    toast({
      title: isFullscreen ? "Kilépés teljes képernyőből" : "Teljes képernyő",
      description: isFullscreen ? "Normál nézet visszaállítva" : "Grafikon nagyított nézetben",
    });
  };

  const renderChart = () => {
    switch (chartType) {
      case 'results':
        return <Bar data={mostCommonResultsData} options={chartOptions} />;
      case 'goals':
        return <Doughnut data={goalsTrendData} options={chartOptions} />;
      case 'btts':
        return <Line data={bttsAnalysisData} options={chartOptions} />;
      case 'weekly':
        return <Bar data={weeklyResultsData} options={chartOptions} />;
      case 'comeback':
        return <Bar data={comebackData} options={chartOptions} />;
      case 'halftime':
        return <Bar data={halftimeData} options={chartOptions} />;
      case 'seasonal':
        return <Line data={seasonalData} options={{
          ...chartOptions,
          scales: {
            ...chartOptions.scales,
            y1: {
              type: 'linear' as const,
              display: true,
              position: 'right' as const,
              ticks: { 
                color: 'rgba(255,255,255,0.6)',
                maxTicksLimit: 6 
              },
              grid: { 
                drawOnChartArea: false,
                color: 'rgba(255,255,255,0.08)'
              }
            }
          }
        }} />;
      default:
        return <Bar data={mostCommonResultsData} options={chartOptions} />;
    }
  };

  return (
    <section className="mb-8">
      <Card className="glass-card border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-primary/20 grid place-items-center ring-1 ring-primary/30">
                    <BarChart3 className="size-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold">Haladó Analitika</CardTitle>
                    <p className="text-sm text-white/60 mt-1">
                      {filters && Object.keys(filters).length > 0 
                        ? 'Szűrt eredmények alapján számítva' 
                        : 'Összes meccs alapján számítva'
                      }
                    </p>
                  </div>
                </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="text-white/70 hover:text-white hover:bg-white/5"
                aria-label="Adatok frissítése"
              >
                <RefreshCw className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFullscreen}
                className="text-white/70 hover:text-white hover:bg-white/5"
                aria-label="Teljes képernyő"
              >
                <Maximize2 className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExport}
                className="text-white/70 hover:text-white hover:bg-white/5"
                aria-label="Grafikon exportálása"
              >
                <Download className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Controls */}
            <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/70 block mb-2">Időtartam</label>
                  <Select value={timeRange} onValueChange={setTimeRange} disabled>
                    <SelectTrigger className="bg-white/5 border-white/10 opacity-50">
                      <SelectValue />
                  </SelectTrigger>
                    <SelectContent className="bg-card border-white/10">
                      <SelectItem value="filtered">Szűrt eredmények</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-white/50 mt-1">Az analitika a szűrt adatokra vonatkozik</p>
                </div>

              <div>
                <label className="text-sm text-white/70 block mb-2">Analitika típus</label>
                <Tabs value={chartType} onValueChange={setChartType} orientation="vertical">
                  <TabsList className="grid w-full grid-cols-1 bg-white/5 border border-white/10 h-auto p-1">
                    <TabsTrigger 
                      value="results" 
                      className="w-full justify-start data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                    >
                      <BarChart3 className="size-4 mr-2" />
                      Leggyakoribb eredmények
                    </TabsTrigger>
                    <TabsTrigger 
                      value="goals" 
                      className="w-full justify-start data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                    >
                      <Target className="size-4 mr-2" />
                      2.5+ gól trend
                    </TabsTrigger>
                    <TabsTrigger 
                      value="btts" 
                      className="w-full justify-start data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                    >
                      <LineChart className="size-4 mr-2" />
                      BTTS arány profi
                    </TabsTrigger>
                    <TabsTrigger 
                      value="weekly" 
                      className="w-full justify-start data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                    >
                      <Calendar className="size-4 mr-2" />
                      Heti elemzés
                    </TabsTrigger>
                    <TabsTrigger 
                      value="comeback" 
                      className="w-full justify-start data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                    >
                      <TrendingUp className="size-4 mr-2" />
                      Fordítás elemzés
                    </TabsTrigger>
                    <TabsTrigger 
                      value="halftime" 
                      className="w-full justify-start data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                    >
                      <Trophy className="size-4 mr-2" />
                      Félidő vs Végeredmény
                    </TabsTrigger>
                    <TabsTrigger 
                      value="seasonal" 
                      className="w-full justify-start data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                    >
                      <Settings className="size-4 mr-2" />
                      Szezonális trendek
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Advanced Analytics Stats */}
              <div className="pt-4 space-y-3">
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Leggyakoribb</span>
                    <span className="font-semibold text-primary">
                      {analytics.mostCommonResults[0]?.result || 'N/A'}
                    </span>
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    {analytics.mostCommonResults[0]?.percentage || 0}% gyakoriság
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">2.5+ gól</span>
                    <span className="font-semibold text-sports-emerald">
                      {analytics.goalsTrend.over25Percentage}%
                    </span>
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    {analytics.goalsTrend.over25Goals} meccsből
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">BTTS arány</span>
                    <span className="font-semibold text-sports-amber">
                      {analytics.bttsAnalysis.bttsPercentage}%
                    </span>
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    {analytics.bttsAnalysis.bttsTrue} BTTS meccs
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Fordítások</span>
                    <span className="font-semibold text-orange-400">
                      {analytics.comebackAnalysis?.comebackPercentage || 0}%
                    </span>
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    {analytics.comebackAnalysis?.totalComebacks || 0} comeback
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">HT-FT korreláció</span>
                    <span className="font-semibold text-blue-400">
                      {analytics.halftimeVsFulltime?.correlationRate || 0}%
                    </span>
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    Félidő-véger egyezés
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="lg:col-span-3">
              <div 
                className={`bg-white/5 rounded-xl p-4 border border-white/10 ${
                  isFullscreen ? 'fixed inset-4 z-50 flex flex-col' : 'h-80'
                }`}
              >
                {isFullscreen && (
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Grafikon - Teljes képernyő</h3>
                    <Button
                      variant="ghost"
                      onClick={handleFullscreen}
                      className="text-white/70 hover:text-white"
                    >
                      ✕ Bezárás
                    </Button>
                  </div>
                )}
                <div className={isFullscreen ? 'flex-1' : 'h-full'}>
                  {renderChart()}
                </div>
              </div>
              
              {/* Advanced Chart Insights */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="bg-gradient-to-r from-primary/15 to-purple-600/10 rounded-lg p-3 ring-1 ring-white/10">
                  <div className="flex items-center gap-2">
                    <Trophy className="size-4 text-primary" />
                    <span className="text-sm text-white/80">
                      Top eredmény: {analytics.mostCommonResults[0]?.result}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    {analytics.mostCommonResults[0]?.count} alkalommal
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-sports-emerald/15 to-green-600/10 rounded-lg p-3 ring-1 ring-white/10">
                  <div className="flex items-center gap-2">
                    {analytics.goalsTrend.over25Percentage > 50 ? (
                      <TrendingUp className="size-4 text-sports-emerald" />
                    ) : (
                      <TrendingDown className="size-4 text-blue-400" />
                    )}
                    <span className="text-sm text-white/80">
                      {analytics.goalsTrend.over25Percentage > 50 ? 'Magas' : 'Alacsony'} gólátlag
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    {analytics.goalsTrend.over25Percentage}% 2.5+ gól
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-sports-amber/15 to-yellow-600/10 rounded-lg p-3 ring-1 ring-white/10">
                  <div className="flex items-center gap-2">
                    <Target className="size-4 text-sports-amber" />
                    <span className="text-sm text-white/80">
                      BTTS trend: {analytics.bttsAnalysis.bttsPercentage}%
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    {analytics.bttsAnalysis.monthlyTrend.length > 0 && 
                      analytics.bttsAnalysis.monthlyTrend[analytics.bttsAnalysis.monthlyTrend.length - 1]?.bttsRate
                    }% utóbbi hónapban
                  </p>
                </div>

                <div className="bg-gradient-to-r from-orange-500/15 to-red-600/10 rounded-lg p-3 ring-1 ring-white/10">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-orange-400" />
                    <span className="text-sm text-white/80">
                      Fordítás arány: {analytics.comebackAnalysis?.comebackPercentage || 0}%
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    {analytics.comebackAnalysis?.totalComebacks || 0} comeback meccs
                  </p>
                </div>
              </div>

              {/* AI Insights Section */}
              <div className="mt-6 bg-gradient-to-r from-primary/10 to-purple-600/5 rounded-xl p-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-6 rounded-full bg-primary/20 grid place-items-center">
                    <span className="text-xs text-primary font-bold">AI</span>
                  </div>
                  <h4 className="font-semibold text-white">Intelligens Elemzés</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="size-1.5 rounded-full bg-sports-emerald mt-2"></div>
                      <p className="text-white/80">
                        A <span className="text-sports-emerald font-medium">{analytics.mostCommonResults[0]?.result}</span> eredmény a leggyakoribb ({analytics.mostCommonResults[0]?.percentage}%)
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="size-1.5 rounded-full bg-sports-amber mt-2"></div>
                      <p className="text-white/80">
                        BTTS trend: {analytics.bttsAnalysis.bttsPercentage > 50 ? 'Magas' : 'Alacsony'} aktivitás ({analytics.bttsAnalysis.bttsPercentage}%)
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="size-1.5 rounded-full bg-orange-400 mt-2"></div>
                      <p className="text-white/80">
                        {analytics.comebackAnalysis?.comebackPercentage && analytics.comebackAnalysis.comebackPercentage > 15 
                          ? 'Gyakori fordítások' 
                          : 'Ritkán fordulnak'} ({analytics.comebackAnalysis?.comebackPercentage || 0}%)
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="size-1.5 rounded-full bg-blue-400 mt-2"></div>
                      <p className="text-white/80">
                        HT-FT korreláció: {analytics.halftimeVsFulltime?.correlationRate && analytics.halftimeVsFulltime.correlationRate > 60 ? 'Stabil' : 'Változékony'} ({analytics.halftimeVsFulltime?.correlationRate || 0}%)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default EnhancedChartSection;