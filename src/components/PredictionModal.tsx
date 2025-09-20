import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMatches } from "@/hooks/use-matches";
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle, Trash2 } from "lucide-react";
import type { MatchFilters, MatchStats, DetailedMatchStats } from "@/lib/supabase";
import { calculateDetailedStats } from "@/services/advanced-statistics";
import DetailedStatsCard from "@/components/DetailedStatsCard";
import FrequentResultsChart from "@/components/FrequentResultsChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PredictedMatch {
  id: number;
  home_team: string;
  away_team: string;
}

interface PredictionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PredictionModal = ({ open, onOpenChange }: PredictionModalProps) => {
  const { toast } = useToast();
  const { fetchTeams } = useMatches();
  const [teams, setTeams] = useState<string[]>([]);
  const [selectedMatches, setSelectedMatches] = useState<PredictedMatch[]>([]);
  const [predictions, setPredictions] = useState<{ match: PredictedMatch; stats: MatchStats | null; detailedStats: DetailedMatchStats | null }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const loadTeams = async () => {
      const teamList = await fetchTeams();
      setTeams(teamList);
    };

    loadTeams();
    // Initialize 8 empty matches only when opening
    const emptyMatches = Array.from({ length: 8 }, (_, index) => ({
      id: index + 1,
      home_team: "",
      away_team: ""
    }));
    setSelectedMatches(emptyMatches);
    setPredictions([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const getUsedTeams = () => {
    const used = new Set<string>();
    selectedMatches.forEach(match => {
      if (match.home_team) used.add(match.home_team);
      if (match.away_team) used.add(match.away_team);
    });
    return used;
  };

  const getAvailableTeams = (currentMatchId: number, side: 'home' | 'away') => {
    const usedTeams = getUsedTeams();
    const currentMatch = selectedMatches.find(m => m.id === currentMatchId);
    
    return teams.filter(team => {
      // Don't show already used teams
      if (usedTeams.has(team)) {
        // Unless it's the current selection for this match
        if (side === 'home' && team === currentMatch?.home_team) return true;
        if (side === 'away' && team === currentMatch?.away_team) return true;
        return false;
      }
      // Don't allow same team on both sides of the same match
      if (side === 'home' && team === currentMatch?.away_team) return false;
      if (side === 'away' && team === currentMatch?.home_team) return false;
      return true;
    });
  };

  const updateMatch = (matchId: number, side: 'home' | 'away', team: string) => {
    setSelectedMatches(prev => prev.map(match => 
      match.id === matchId 
        ? { ...match, [side === 'home' ? 'home_team' : 'away_team']: team }
        : match
    ));
  };

  const clearMatch = (matchId: number) => {
    setSelectedMatches(prev => prev.map(match => 
      match.id === matchId 
        ? { ...match, home_team: "", away_team: "" }
        : match
    ));
  };

  const runPredictions = async () => {
    const validMatches = selectedMatches.filter(match => match.home_team && match.away_team);
    
    if (validMatches.length === 0) {
      toast({
        title: "Nincs érvényes mérkőzés",
        description: "Legalább egy mérkőzést be kell állítani",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const results: { match: PredictedMatch; stats: MatchStats | null; detailedStats: DetailedMatchStats | null }[] = [];

    try {
      // Import the hook to get statistics calculation
      const { useMatches } = await import("@/hooks/use-matches");
      
      for (const match of validMatches) {
        // Create filters for this specific match pair
        const filters: MatchFilters = {
          home_team: match.home_team,
          away_team: match.away_team
        };

        // We'll need to calculate stats manually since we can't use hooks here
        // This is a simplified version - in a real app you'd extract the calculation logic
        try {
          const { supabase } = await import("@/lib/supabase");
          
          let query = supabase
            .from('matches')
            .select('*');

          if (filters.home_team) {
            query = query.eq('home_team', filters.home_team);
          }
          if (filters.away_team) {
            query = query.eq('away_team', filters.away_team);
          }

          const { data, error } = await query;

          if (error) throw error;

          if (data && data.length > 0) {
            const totalMatches = data.length;
            const homeWins = data.filter(m => m.result_computed === 'H').length;
            const draws = data.filter(m => m.result_computed === 'D').length;
            const awayWins = data.filter(m => m.result_computed === 'A').length;
            const bttsCount = data.filter(m => m.btts_computed === true).length;
            const comebackCount = data.filter(m => m.comeback_computed === true).length;
          
            const totalGoals = data.reduce((sum, match) => 
              sum + match.full_time_home_goals + match.full_time_away_goals, 0
            );
            const avgGoals = totalGoals / totalMatches;

            const stats: MatchStats = {
              total_matches: totalMatches,
              home_wins: homeWins,
              draws: draws,
              away_wins: awayWins,
              btts_count: bttsCount,
              comeback_count: comebackCount,
              avg_goals: Number(avgGoals.toFixed(1)),
              home_win_percentage: Number(((homeWins / totalMatches) * 100).toFixed(1)),
              draw_percentage: Number(((draws / totalMatches) * 100).toFixed(1)),
              away_win_percentage: Number(((awayWins / totalMatches) * 100).toFixed(1)),
              btts_percentage: Number(((bttsCount / totalMatches) * 100).toFixed(1)),
              comeback_percentage: Number(((comebackCount / totalMatches) * 100).toFixed(1))
            };

            const detailedStats = calculateDetailedStats(data);
            results.push({ match, stats, detailedStats });
          } else {
            results.push({ match, stats: null, detailedStats: null });
          }
        } catch (error) {
          console.error(`Error calculating stats for ${match.home_team} vs ${match.away_team}:`, error);
          results.push({ match, stats: null, detailedStats: null });
        }
      }

      setPredictions(results);
      toast({
        title: "Predikciók elkészültek",
        description: `${results.length} mérkőzés elemzése befejezve`,
      });

    } catch (error) {
      toast({
        title: "Hiba történt",
        description: "Nem sikerült elkészíteni a predikciókat",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isValid = selectedMatches.some(match => match.home_team && match.away_team);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card border-white/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Predikció készítése
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Match Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedMatches.map((match) => (
              <Card key={match.id} className="glass-card border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-white/80">
                      {match.id}. mérkőzés
                    </h3>
                    {(match.home_team || match.away_team) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearMatch(match.id)}
                        className="text-white/60 hover:text-white p-1 h-auto"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-white/60 mb-1 block">Hazai csapat</label>
                      <Select
                        value={match.home_team}
                        onValueChange={(value) => updateMatch(match.id, 'home', value)}
                      >
                        <SelectTrigger className="bg-background/80 border-white/20 text-white backdrop-blur-sm">
                          <SelectValue placeholder="Válassz hazai csapatot" />
                        </SelectTrigger>
                        <SelectContent className="bg-background/95 backdrop-blur-md border-white/20 z-50">
                          {getAvailableTeams(match.id, 'home').map((team) => (
                            <SelectItem key={team} value={team} className="text-white hover:bg-white/10 focus:bg-white/10">
                              {team}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs text-white/60 mb-1 block">Vendég csapat</label>
                      <Select
                        value={match.away_team}
                        onValueChange={(value) => updateMatch(match.id, 'away', value)}
                      >
                        <SelectTrigger className="bg-background/80 border-white/20 text-white backdrop-blur-sm">
                          <SelectValue placeholder="Válassz vendég csapatot" />
                        </SelectTrigger>
                        <SelectContent className="bg-background/95 backdrop-blur-md border-white/20 z-50">
                          {getAvailableTeams(match.id, 'away').map((team) => (
                            <SelectItem key={team} value={team} className="text-white hover:bg-white/10 focus:bg-white/10">
                              {team}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Run Predictions Button */}
          <div className="flex justify-center">
            <Button
              onClick={runPredictions}
              disabled={!isValid || loading}
              className="winmix-btn-primary winmix-hover-lift winmix-focus"
            >
              <PlayCircle className="size-4 mr-2" />
              {loading ? "Futtatás..." : "Futtatás"}
            </Button>
          </div>

          {/* Predictions Results */}
          {predictions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Predikciós eredmények</h3>
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm">
                  <TabsTrigger value="basic" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20">
                    Alapvető
                  </TabsTrigger>
                  <TabsTrigger value="detailed" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20">
                    Részletes
                  </TabsTrigger>
                  <TabsTrigger value="charts" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20">
                    Grafikonok
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {predictions.map(({ match, stats }, index) => (
                      <Card key={index} className="glass-card border-white/10">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-3">
                            {match.home_team} vs {match.away_team}
                          </h4>
                          {stats ? (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-white/70">Összes mérkőzés:</span>
                                <span className="text-white">{stats.total_matches}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">Hazai győzelem:</span>
                                <span className="text-white">{stats.home_win_percentage}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">Döntetlen:</span>
                                <span className="text-white">{stats.draw_percentage}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">Vendég győzelem:</span>
                                <span className="text-white">{stats.away_win_percentage}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">BTTS:</span>
                                <span className="text-white">{stats.btts_percentage}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">Átlag gólok:</span>
                                <span className="text-white">{stats.avg_goals}</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-white/60 text-sm">Nincs történeti adat ehhez a párosításhoz</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="detailed" className="space-y-4">
                  {predictions.map(({ match, detailedStats }, index) => 
                    detailedStats ? (
                      <DetailedStatsCard
                        key={index}
                        homeTeam={match.home_team}
                        awayTeam={match.away_team}
                        stats={detailedStats}
                      />
                    ) : (
                      <Card key={index} className="glass-card border-white/10">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-3">
                            {match.home_team} vs {match.away_team}
                          </h4>
                          <p className="text-white/60 text-sm">Nincs történeti adat ehhez a párosításhoz</p>
                        </CardContent>
                      </Card>
                    )
                  )}
                </TabsContent>

                <TabsContent value="charts" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {predictions.map(({ match, detailedStats }, index) => 
                      detailedStats ? (
                        <Card key={index} className="glass-card border-white/10">
                          <CardContent className="p-4">
                            <FrequentResultsChart 
                              stats={detailedStats}
                              title={`${match.home_team} vs ${match.away_team}`}
                            />
                          </CardContent>
                        </Card>
                      ) : (
                        <Card key={index} className="glass-card border-white/10">
                          <CardContent className="p-4">
                            <h4 className="font-medium text-white mb-3">
                              {match.home_team} vs {match.away_team}
                            </h4>
                            <p className="text-white/60 text-sm">Nincs elég adat a grafikon megjelenítéséhez</p>
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PredictionModal;