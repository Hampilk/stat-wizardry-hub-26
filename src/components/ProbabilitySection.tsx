import { CircleDot } from "lucide-react";
import { useState, useEffect } from "react";
import { MatchStats } from "@/lib/supabase";

interface ProbabilitySectionProps {
  stats: MatchStats | null;
  loading: boolean;
}

const ProbabilitySection = ({ stats, loading }: ProbabilitySectionProps) => {
  const bttsPercentage = stats?.btts_percentage || 0;
  const [value, setValue] = useState(bttsPercentage);
  
  // Update value when stats change
  useEffect(() => {
    if (stats) {
      setValue(stats.btts_percentage);
    }
  }, [stats]);

  if (loading) {
    return (
      <section className="mb-8">
        <div className="rounded-2xl glass-card p-5 sm:p-6 animate-pulse">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-white/10"></div>
              <div>
                <div className="w-64 h-6 bg-white/10 rounded mb-2"></div>
                <div className="w-48 h-4 bg-white/10 rounded"></div>
              </div>
            </div>
            <div className="flex items-end gap-6">
              <div className="text-right">
                <div className="w-16 h-8 bg-white/10 rounded mb-1"></div>
                <div className="w-24 h-3 bg-white/10 rounded"></div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="h-3 rounded-full bg-white/10"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!stats) {
    return (
      <section className="mb-8">
        <div className="rounded-2xl glass-card p-5 sm:p-6">
          <div className="text-center py-8">
            <CircleDot className="size-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nincs elérhető adat a BTTS statisztikához.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="rounded-2xl glass-card p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-primary/20 ring-1 ring-primary/30 grid place-items-center">
              <CircleDot className="size-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-semibold tracking-tight">Mindkét csapat gólt szerzett</h3>
              <p className="text-sm text-white/60">
                A szűrt mérkőzések alapján • Minta méret: <span className="text-white/80">{stats.total_matches}</span>
              </p>
            </div>
          </div>
          <div className="flex items-end gap-6">
            <div className="text-right">
              <p className="text-3xl font-semibold tracking-tight text-white">{bttsPercentage.toFixed(1)}%</p>
              <p className="text-xs text-white/60">
                {stats.btts_count} / {stats.total_matches} mérkőzés
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-3 bg-gradient-to-r from-primary to-fuchsia-500 transition-all duration-300"
              style={{ width: `${bttsPercentage}%` }}
            />
          </div>
          <div className="mt-4 flex items-center gap-4">
            <span className="text-xs text-white/50">0%</span>
            <div className="flex-1 h-2 bg-white/10 rounded-full relative">
              <div 
                className="h-2 bg-gradient-to-r from-primary to-fuchsia-500 rounded-full"
                style={{ width: `${bttsPercentage}%` }}
              />
            </div>
            <span className="text-xs text-white/50">100%</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProbabilitySection;