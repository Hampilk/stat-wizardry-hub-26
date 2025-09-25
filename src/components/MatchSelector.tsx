import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface PredictedMatch {
  id: number;
  home_team: string;
  away_team: string;
}

interface MatchSelectorProps {
  matches: PredictedMatch[];
  teams: string[];
  onUpdateMatch: (matchId: number, side: 'home' | 'away', team: string) => void;
  onClearMatch: (matchId: number) => void;
}

export const MatchSelector = ({ matches, teams, onUpdateMatch, onClearMatch }: MatchSelectorProps) => {
  const getUsedTeams = () => {
    const used = new Set<string>();
    matches.forEach(match => {
      if (match.home_team) used.add(match.home_team);
      if (match.away_team) used.add(match.away_team);
    });
    return used;
  };

  const getAvailableTeams = (currentMatchId: number, side: 'home' | 'away') => {
    const usedTeams = getUsedTeams();
    const currentMatch = matches.find(m => m.id === currentMatchId);
    
    return teams.filter(team => {
      if (usedTeams.has(team)) {
        if (side === 'home' && team === currentMatch?.home_team) return true;
        if (side === 'away' && team === currentMatch?.away_team) return true;
        return false;
      }
      if (side === 'home' && team === currentMatch?.away_team) return false;
      if (side === 'away' && team === currentMatch?.home_team) return false;
      return true;
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Mérkőzések beállítása</h3>
        <p className="text-sm text-white/70">Válassz ki legfeljebb 8 mérkőzést az elemzéshez</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {matches.map((match) => (
          <Card key={match.id} className="glass-card border-white/10 hover:border-white/20 transition-colors">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-white/90">
                  {match.id}. mérkőzés
                </h4>
                {(match.home_team || match.away_team) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onClearMatch(match.id)}
                    className="text-white/60 hover:text-white p-1 h-auto hover:bg-white/10"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-white/60 mb-1.5 block font-medium">
                    Hazai csapat
                  </label>
                  <Select
                    value={match.home_team}
                    onValueChange={(value) => onUpdateMatch(match.id, 'home', value)}
                  >
                    <SelectTrigger className="bg-background/80 border-white/20 text-white backdrop-blur-sm h-10 text-sm touch-manipulation">
                      <SelectValue placeholder="Válassz hazai csapatot" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-md border-white/20 z-[60] max-h-60">
                      {getAvailableTeams(match.id, 'home').map((team) => (
                        <SelectItem 
                          key={team} 
                          value={team} 
                          className="text-white hover:bg-white/10 focus:bg-white/10 py-2.5 px-3 text-sm cursor-pointer"
                        >
                          {team}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-center text-white/40 text-xs">VS</div>

                <div>
                  <label className="text-xs text-white/60 mb-1.5 block font-medium">
                    Vendég csapat
                  </label>
                  <Select
                    value={match.away_team}
                    onValueChange={(value) => onUpdateMatch(match.id, 'away', value)}
                  >
                    <SelectTrigger className="bg-background/80 border-white/20 text-white backdrop-blur-sm h-10 text-sm touch-manipulation">
                      <SelectValue placeholder="Válassz vendég csapatot" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-md border-white/20 z-[60] max-h-60">
                      {getAvailableTeams(match.id, 'away').map((team) => (
                        <SelectItem 
                          key={team} 
                          value={team} 
                          className="text-white hover:bg-white/10 focus:bg-white/10 py-2.5 px-3 text-sm cursor-pointer"
                        >
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
    </div>
  );
};