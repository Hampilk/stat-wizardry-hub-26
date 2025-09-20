import React from 'react';
import { Button } from "@/components/ui/button";
import { ChartsDisplay } from './ChartsDisplay';

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

interface StatisticsSectionProps {
  stats: Stats;
}

export const StatisticsSection: React.FC<StatisticsSectionProps> = ({ stats }) => {
  return (
    <section id="statistics" className="relative py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
            Statisztikák
          </h2>
          <Button variant="outline" size="sm" className="glass-effect border-white/10 hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
              <path d="M18 17V9"></path>
              <path d="M13 17V5"></path>
              <path d="M8 17v-3"></path>
            </svg>
            Bővített statisztika
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="col-span-2 md:col-span-1 glass-effect rounded-2xl p-6 hover:bg-white/10 transition-smooth group">
            <p className="text-xs text-zinc-400 uppercase font-medium tracking-wider">Összes mérkőzés</p>
            <p className="text-3xl font-bold tracking-tight mt-2 group-hover:text-primary-glow transition-colors">
              {stats.total}
            </p>
          </div>
          
          <div className="glass-effect rounded-2xl p-6 hover:bg-white/10 transition-smooth group">
            <p className="text-xs text-zinc-400 uppercase font-medium tracking-wider">Hazai győzelem</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-success group-hover:scale-105 transition-transform">
              {stats.home}
            </p>
          </div>
          
          <div className="glass-effect rounded-2xl p-6 hover:bg-white/10 transition-smooth group">
            <p className="uppercase text-xs text-zinc-400 font-medium tracking-wider">Döntetlen</p>
            <p className="text-3xl font-bold text-warning tracking-tight mt-2 group-hover:scale-105 transition-transform">
              {stats.draw}
            </p>
          </div>
          
          <div className="glass-effect rounded-2xl p-6 hover:bg-white/10 transition-smooth group">
            <p className="text-xs text-zinc-400 uppercase font-medium tracking-wider">Vendég győzelem</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-info group-hover:scale-105 transition-transform">
              {stats.away}
            </p>
          </div>
          
          <div className="glass-effect rounded-2xl p-6 hover:bg-white/10 transition-smooth group">
            <p className="text-xs text-zinc-400 uppercase font-medium tracking-wider">BTTS Igen</p>
            <p className="text-3xl font-bold text-primary tracking-tight mt-2 group-hover:scale-105 transition-transform">
              {stats.btts}
            </p>
          </div>
        </div>

        {/* Charts */}
        <ChartsDisplay stats={stats} />
      </div>
    </section>
  );
};