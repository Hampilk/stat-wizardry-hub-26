import { X, Brain, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useMatches } from "@/hooks/use-matches";
import { useToast } from "@/hooks/use-toast";
import { MatchSelector } from "@/components/MatchSelector";
import { PredictionResults } from "@/components/PredictionResults";
import type { MatchStats } from "@/lib/supabase";

interface PredictionBuilderPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PredictedMatch {
  id: number;
  home_team: string;
  away_team: string;
}

interface ExtendedMatchStats extends MatchStats {
  prediction_quality?: {
    home_qualified: boolean;
    away_qualified: boolean;
    draw_highlighted: boolean;
    btts_qualified: boolean;
    confidence_level: number;
    recommendation: string;
    confidence: string;
  };
  home_avg_goals?: number;
  away_avg_goals?: number;
  most_frequent_results?: Array<{
    score: string;
    percentage: number;
  }>;
  halftime_transformations?: number;
}

const PredictionBuilderPanel = ({ isOpen, onClose }: PredictionBuilderPanelProps) => {
  const [teams, setTeams] = useState<string[]>([]);
  const [matches, setMatches] = useState<PredictedMatch[]>([
    { id: 1, home_team: "", away_team: "" },
    { id: 2, home_team: "", away_team: "" },
    { id: 3, home_team: "", away_team: "" },
    { id: 4, home_team: "", away_team: "" },
    { id: 5, home_team: "", away_team: "" },
    { id: 6, home_team: "", away_team: "" },
    { id: 7, home_team: "", away_team: "" },
    { id: 8, home_team: "", away_team: "" },
  ]);
  const [predictions, setPredictions] = useState<{ match: PredictedMatch; stats: ExtendedMatchStats | null }[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const { fetchTeams } = useMatches();
  const { toast } = useToast();

  useEffect(() => {
    const loadTeams = async () => {
      const teamList = await fetchTeams();
      setTeams(teamList);
    };
    loadTeams();
  }, []);

  const updateMatch = (matchId: number, side: 'home' | 'away', team: string) => {
    setMatches(matches.map(match => 
      match.id === matchId 
        ? { ...match, [side === 'home' ? 'home_team' : 'away_team']: team }
        : match
    ));
  };

  const clearMatch = (matchId: number) => {
    setMatches(matches.map(match => 
      match.id === matchId 
        ? { ...match, home_team: "", away_team: "" }
        : match
    ));
  };

  const generatePredictionQuality = (stats: MatchStats): ExtendedMatchStats => {
    const home_qualified = stats.home_win_percentage >= 65;
    const away_qualified = stats.away_win_percentage >= 65;
    const draw_highlighted = stats.draw_percentage > 30;
    const btts_qualified = stats.btts_percentage >= 55;
    
    let confidence_level = 0;
    let confidence = 'low';
    let recommendation = '';

    if (home_qualified) {
      confidence_level = stats.home_win_percentage;
      recommendation = `Hazai győzelem ajánlott (${stats.home_win_percentage}% esély)`;
    } else if (away_qualified) {
      confidence_level = stats.away_win_percentage;
      recommendation = `Vendég győzelem ajánlott (${stats.away_win_percentage}% esély)`;
    } else if (draw_highlighted) {
      confidence_level = stats.draw_percentage;
      recommendation = `Magas döntetlen esély (${stats.draw_percentage}%)`;
    } else if (btts_qualified) {
      confidence_level = stats.btts_percentage;
      recommendation = `BTTS ajánlott (${stats.btts_percentage}% esély)`;
    } else {
      confidence_level = Math.max(stats.home_win_percentage, stats.away_win_percentage, stats.draw_percentage);
      recommendation = 'Bizonytalan kimenetel, óvatosság ajánlott';
    }

    if (confidence_level >= 65) confidence = 'high';
    else if (confidence_level >= 50) confidence = 'medium';

    return {
      ...stats,
      prediction_quality: {
        home_qualified,
        away_qualified,
        draw_highlighted,
        btts_qualified,
        confidence_level,
        recommendation,
        confidence
      },
      home_avg_goals: Number((stats.home_wins * 2.1 / stats.total_matches).toFixed(1)),
      away_avg_goals: Number((stats.away_wins * 1.8 / stats.total_matches).toFixed(1)),
      most_frequent_results: [
        { score: "1-0", percentage: 15 },
        { score: "2-1", percentage: 12 },
        { score: "1-1", percentage: 18 },
        { score: "0-0", percentage: 8 },
        { score: "2-0", percentage: 10 },
        { score: "3-1", percentage: 7 }
      ],
      halftime_transformations: Math.floor(stats.comeback_count * 1.2)
    };
  };

  const simulateMatchStats = (homeTeam: string, awayTeam: string): ExtendedMatchStats => {
    // Simulate realistic stats based on team names
    const homeStrength = homeTeam.length % 5 + 3;
    const awayStrength = awayTeam.length % 5 + 3;
    const totalStrength = homeStrength + awayStrength;
    
    const total_matches = 50 + Math.floor(Math.random() * 100);
    const home_wins = Math.floor((homeStrength / totalStrength) * total_matches * 1.2);
    const away_wins = Math.floor((awayStrength / totalStrength) * total_matches);
    const draws = total_matches - home_wins - away_wins;
    
    const baseStats: MatchStats = {
      total_matches,
      home_wins,
      away_wins,
      draws,
      btts_count: Math.floor(total_matches * 0.6),
      comeback_count: Math.floor(total_matches * 0.15),
      avg_goals: Number((2.2 + Math.random() * 1.3).toFixed(1)),
      home_win_percentage: Number(((home_wins / total_matches) * 100).toFixed(1)),
      away_win_percentage: Number(((away_wins / total_matches) * 100).toFixed(1)),
      draw_percentage: Number(((draws / total_matches) * 100).toFixed(1)),
      btts_percentage: Number((60 + Math.random() * 30).toFixed(1)),
      comeback_percentage: Number(((Math.floor(total_matches * 0.15) / total_matches) * 100).toFixed(1))
    };

    return generatePredictionQuality(baseStats);
  };

  const handleGeneratePredictions = async () => {
    const validMatches = matches.filter(match => match.home_team && match.away_team);
    
    if (validMatches.length === 0) {
      toast({
        title: "Hiba",
        description: "Legalább egy teljes mérkőzést be kell állítani",
        variant: "destructive"
      });
      return;
    }
    
    setIsCalculating(true);
    
    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const results = validMatches.map(match => ({
      match,
      stats: simulateMatchStats(match.home_team, match.away_team)
    }));
    
    setPredictions(results);
    setIsCalculating(false);
    
    toast({
      title: "Predikció kész!",
      description: `${results.length} mérkőzés elemzése elkészült`,
    });
  };

  const handleReset = () => {
    setPredictions([]);
    setMatches(matches.map(match => ({ ...match, home_team: "", away_team: "" })));
  };

  const validMatchCount = matches.filter(match => match.home_team && match.away_team).length;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-[90vw] sm:w-[600px] lg:w-[800px] xl:w-[1000px] bg-card/95 backdrop-blur-md border-l border-border z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Brain className="size-6 text-primary" />
            <h2 className="text-xl font-semibold text-white">Predikció készítő</h2>
          </div>
          <div className="flex items-center gap-2">
            {predictions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-white border-white/20 hover:bg-white/10"
              >
                <RefreshCw className="size-4 mr-2" />
                Új predikció
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-muted rounded-full text-white"
            >
              <X className="size-6" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-6 space-y-8">
            {predictions.length === 0 ? (
              <>
                <MatchSelector
                  matches={matches}
                  teams={teams}
                  onUpdateMatch={updateMatch}
                  onClearMatch={clearMatch}
                />
                
                {/* Generate Button */}
                <div className="flex justify-center pt-4">
                  <Button 
                    className="winmix-btn-primary flex items-center gap-2"
                    onClick={handleGeneratePredictions}
                    disabled={validMatchCount === 0 || isCalculating}
                    size="lg"
                  >
                    {isCalculating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        Elemzés folyamatban...
                      </>
                    ) : (
                      <>
                        <Play className="size-5" />
                        Predikció generálása ({validMatchCount})
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <PredictionResults predictions={predictions} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
};

export default PredictionBuilderPanel;