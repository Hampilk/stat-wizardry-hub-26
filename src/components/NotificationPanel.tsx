import { X, Brain, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PredictionBuilderPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  selected: boolean;
}

const PredictionBuilderPanel = ({ isOpen, onClose }: PredictionBuilderPanelProps) => {
  const [matches, setMatches] = useState<Match[]>([
    { id: "1", homeTeam: "Real Madrid", awayTeam: "Barcelona", selected: true },
    { id: "2", homeTeam: "Manchester United", awayTeam: "Liverpool", selected: true },
    { id: "3", homeTeam: "Bayern Munich", awayTeam: "Borussia Dortmund", selected: true },
    { id: "4", homeTeam: "Juventus", awayTeam: "Inter Milan", selected: true },
    { id: "5", homeTeam: "Paris Saint-Germain", awayTeam: "Olympique Marseille", selected: true },
    { id: "6", homeTeam: "Arsenal", awayTeam: "Chelsea", selected: true },
    { id: "7", homeTeam: "Atletico Madrid", awayTeam: "Valencia", selected: true },
    { id: "8", homeTeam: "AC Milan", awayTeam: "AS Roma", selected: true }
  ]);

  const toggleMatch = (matchId: string) => {
    setMatches(matches.map(match => 
      match.id === matchId 
        ? { ...match, selected: !match.selected }
        : match
    ));
  };

  const selectedCount = matches.filter(match => match.selected).length;

  const handleGeneratePredictions = () => {
    // Generate predictions for selected matches
    onClose();
  };

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
        className={`fixed right-0 top-0 h-full w-114 bg-card/95 backdrop-blur-md border-l border-border z-50 transform transition-transform duration-300 ease-out max-md:w-full ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-6 pt-5 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <Brain className="size-6 text-primary" />
            <h2 className="text-xl font-semibold">Predikció készítő</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-muted rounded-full"
          >
            <X className="size-6" />
          </Button>
        </div>

        {/* Match Selection */}
        <div className="h-[calc(100vh-8rem)] px-5 pb-5 overflow-y-auto space-y-3">
          <div className="mb-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Válassz mérkőzéseket predikció készítéséhez ({selectedCount}/8 kiválasztva)
            </p>
          </div>
          
          {matches.map((match) => (
            <div 
              key={match.id}
              className={`group relative flex items-center p-4 rounded-lg border-2 transition-all cursor-pointer ${
                match.selected 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/30'
              }`}
              onClick={() => toggleMatch(match.id)}
            >
              {/* Selection indicator */}
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                match.selected 
                  ? 'border-primary bg-primary' 
                  : 'border-muted-foreground'
              }`}>
                {match.selected && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              
              {/* Match details */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    {match.homeTeam}
                  </span>
                  <span className="text-muted-foreground font-bold mx-3">VS</span>
                  <span className="font-medium text-foreground">
                    {match.awayTeam}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Button */}
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-10">
          <Button 
            className="winmix-btn-primary flex items-center gap-2"
            onClick={handleGeneratePredictions}
            disabled={selectedCount === 0}
          >
            <Play className="size-4" />
            Predikció indítása ({selectedCount})
          </Button>
        </div>
      </div>
    </>
  );
};

export default PredictionBuilderPanel;