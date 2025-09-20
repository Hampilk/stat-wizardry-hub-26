import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { DetailedMatchStats } from "@/lib/supabase";

interface DetailedStatsCardProps {
  homeTeam: string;
  awayTeam: string;
  stats: DetailedMatchStats;
}

const DetailedStatsCard = ({ homeTeam, awayTeam, stats }: DetailedStatsCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="glass-card border-white/10">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg">
                {homeTeam} vs {awayTeam}
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white p-1">
                {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Basic Stats */}
            <div className="space-y-3">
              <h4 className="text-white font-medium">Alapvető statisztikák</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Összes mérkőzés:</span>
                  <span className="text-white font-medium">{stats.basic.total_matches}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Hazai győzelem:</span>
                  <span className="text-white font-medium">{stats.basic.home_win_percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Döntetlen:</span>
                  <span className="text-white font-medium">{stats.basic.draw_percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Vendég győzelem:</span>
                  <span className="text-white font-medium">{stats.basic.away_win_percentage}%</span>
                </div>
              </div>
            </div>

            {/* Goal Stats */}
            <div className="space-y-3">
              <h4 className="text-white font-medium">Gól statisztikák</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Hazai átlag gól:</span>
                  <span className="text-white font-medium">{stats.goalStats.home_goals_per_match}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Vendég átlag gól:</span>
                  <span className="text-white font-medium">{stats.goalStats.away_goals_per_match}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Hazai "clean sheet":</span>
                  <span className="text-white font-medium">{stats.goalStats.home_clean_sheet_percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Vendég "clean sheet":</span>
                  <span className="text-white font-medium">{stats.goalStats.away_clean_sheet_percentage}%</span>
                </div>
              </div>
            </div>

            {/* Over/Under Stats */}
            <div className="space-y-3">
              <h4 className="text-white font-medium">Over/Under statisztikák</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Over 2.5 gól</span>
                  <span className="text-white font-medium">{stats.overUnder.over_25_percentage}%</span>
                </div>
                <Progress value={stats.overUnder.over_25_percentage} className="h-2" />
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Over 3.5 gól</span>
                  <span className="text-white font-medium">{stats.overUnder.over_35_percentage}%</span>
                </div>
                <Progress value={stats.overUnder.over_35_percentage} className="h-2" />
              </div>
            </div>

            {/* Frequent Results */}
            {stats.frequentResults.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-white font-medium">Leggyakoribb eredmények</h4>
                <div className="space-y-2">
                  {stats.frequentResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-white/70">{result.result}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{result.count}x</span>
                        <span className="text-white/60">({result.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Half-Time Analysis */}
            {stats.halfTimeAnalysis.ht_home_leads > 0 || stats.halfTimeAnalysis.ht_away_leads > 0 && (
              <div className="space-y-3">
                <h4 className="text-white font-medium">Félidős elemzés</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Félidei hazai vezetés:</span>
                    <span className="text-white font-medium">{stats.halfTimeAnalysis.ht_home_leads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Félidei vendég vezetés:</span>
                    <span className="text-white font-medium">{stats.halfTimeAnalysis.ht_away_leads}</span>
                  </div>
                  {stats.halfTimeAnalysis.ht_home_leads > 0 && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Hazai vezetés megtartás:</span>
                      <span className="text-white font-medium">{stats.halfTimeAnalysis.home_lead_hold_percentage}%</span>
                    </div>
                  )}
                  {stats.halfTimeAnalysis.ht_away_leads > 0 && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Vendég vezetés megtartás:</span>
                      <span className="text-white font-medium">{stats.halfTimeAnalysis.away_lead_hold_percentage}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default DetailedStatsCard;