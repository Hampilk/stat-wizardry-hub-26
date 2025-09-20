import { TrendingUp, TrendingDown, Minus, Trophy, Target, BarChart3 } from "lucide-react";
import NumberCounter from "./NumberCounter";
import { MatchStats } from "@/lib/supabase";
import LoadingSpinner from "./LoadingSpinner";

interface StatisticsCardsProps {
  stats: MatchStats | null;
  loading: boolean;
}

const StatisticsCards = ({ stats, loading }: StatisticsCardsProps) => {
  if (loading) {
    return (
      <section className="space-y-6 winmix-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="winmix-section-title">Statisztikai áttekintő</h2>
          <LoadingSpinner size="sm" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="winmix-stat-card rounded-xl p-6 animate-pulse"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="size-12 bg-white/10 rounded-lg"></div>
                <div className="text-right">
                  <div className="w-12 h-4 bg-white/10 rounded mb-1"></div>
                  <div className="w-16 h-2 bg-white/10 rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-32 h-5 bg-white/10 rounded"></div>
                <div className="w-20 h-8 bg-white/10 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!stats) {
    return (
      <section className="space-y-6 winmix-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="winmix-section-title">Statisztikai áttekintő</h2>
          <span className="text-sm text-muted-foreground">Nincs adat</span>
        </div>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nincs megjeleníthető statisztika a jelenlegi szűrők alapján.</p>
        </div>
      </section>
    );
  }

  const statsConfig = [
    {
      title: "Hazai győzelem",
      value: stats.home_wins,
      percentage: stats.home_win_percentage,
      color: "success",
      icon: TrendingUp,
      gradient: "from-success/20 via-success/10 to-transparent",
      ringColor: "success",
      iconBg: "success/20",
      borderColor: "success/30",
      glowColor: "success/40",
    },
    {
      title: "Döntetlen",
      value: stats.draws,
      percentage: stats.draw_percentage,
      color: "warning",
      icon: Minus,
      gradient: "from-warning/20 via-warning/10 to-transparent",
      ringColor: "warning",
      iconBg: "warning/20",
      borderColor: "warning/30",
      glowColor: "warning/40",
    },
    {
      title: "Vendég győzelem",
      value: stats.away_wins,
      percentage: stats.away_win_percentage,
      color: "info",
      icon: TrendingDown,
      gradient: "from-info/20 via-info/10 to-transparent",
      ringColor: "info",
      iconBg: "info/20",
      borderColor: "info/30",
      glowColor: "info/40",
    },
    {
      title: "Összesen meccs",
      value: stats.total_matches,
      percentage: 100,
      color: "winmix-violet",
      icon: Trophy,
      gradient: "from-winmix-violet/20 via-winmix-violet/10 to-transparent",
      ringColor: "winmix-violet",
      iconBg: "winmix-violet/20",
      borderColor: "winmix-violet/30",
      glowColor: "winmix-violet/40",
    },
    {
      title: "BTTS arány",
      value: stats.btts_percentage,
      percentage: stats.btts_percentage,
      color: "chart-2",
      icon: Target,
      gradient: "from-chart-2/20 via-chart-2/10 to-transparent",
      ringColor: "chart-2",
      iconBg: "chart-2/20",
      borderColor: "chart-2/30",
      glowColor: "chart-2/40",
      suffix: "%",
      decimal: 1
    },
    {
      title: "Átlag gólok",
      value: stats.avg_goals,
      percentage: Math.min((stats.avg_goals / 5) * 100, 100), // Scale to max 5 goals
      color: "chart-5",
      icon: BarChart3,
      gradient: "from-chart-5/20 via-chart-5/10 to-transparent",
      ringColor: "chart-5",
      iconBg: "chart-5/20",
      borderColor: "chart-5/30",
      glowColor: "chart-5/40",
      decimal: 1
    },
  ];

  return (
    <section className="space-y-6 winmix-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="winmix-section-title">Statisztikai áttekintő</h2>
        <span className="text-sm text-muted-foreground">
          {stats.total_matches} mérkőzés alapján
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon;
          const getHoverClass = () => {
            if (stat.title.includes("Hazai")) return "hazai-hover";
            if (stat.title.includes("Döntetlen")) return "dontetlen-hover";
            if (stat.title.includes("Vendég")) return "vendeg-hover";
            return "";
          };

          return (
            <div
              key={stat.title}
              className={`winmix-stat-card rounded-xl p-6 group ${getHoverClass()} winmix-slide-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.iconBg} ring-1 ring-${stat.borderColor} group-hover:ring-2 transition-all duration-300`}>
                  <Icon className={`size-5 text-${stat.color} group-hover:scale-110 transition-transform duration-300`} />
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground mb-1">
                    {stat.percentage}%
                  </div>
                  <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-${stat.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="winmix-card-title text-foreground group-hover:text-white transition-colors stat-content">
                  {stat.title}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground group-hover:text-white transition-colors stat-number">
                    <NumberCounter 
                      value={stat.value} 
                      duration={1500} 
                      decimal={stat.decimal}
                    />
                    {stat.suffix && <span className="text-xl">{stat.suffix}</span>}
                  </span>
                </div>
              </div>

              {/* Background Gradient */}
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default StatisticsCards;