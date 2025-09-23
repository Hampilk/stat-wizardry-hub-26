import { X, Brain, Play, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useEffect } from "react";
import { useMatches } from "@/hooks/use-matches";

interface PredictionBuilderPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PredictionMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  selected: boolean;
}

const TeamDropdown = ({ 
  label, 
  value, 
  placeholder, 
  options, 
  onSelect 
}: {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  onSelect: (value: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex-1">
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg bg-muted/20 border border-border hover:border-primary/50 transition-colors ${
              isOpen ? 'border-primary/50' : ''
            }`}
          >
            <span className="text-sm text-foreground truncate">
              {value || placeholder}
            </span>
            <ChevronDown className={`size-4 text-muted-foreground transition ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-2 bg-card/95 backdrop-blur-md border-border shadow-2xl z-[60]"
          sideOffset={4}
          align="start"
        >
          <div className="max-h-48 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-muted/50 text-sm transition text-foreground"
              >
                {option}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const PredictionBuilderPanel = ({ isOpen, onClose }: PredictionBuilderPanelProps) => {
  const [teams, setTeams] = useState<string[]>([]);
  const { fetchTeams } = useMatches();
  const [matches, setMatches] = useState<PredictionMatch[]>([
    { id: "1", homeTeam: "", awayTeam: "", selected: true },
    { id: "2", homeTeam: "", awayTeam: "", selected: true },
    { id: "3", homeTeam: "", awayTeam: "", selected: true },
    { id: "4", homeTeam: "", awayTeam: "", selected: true },
    { id: "5", homeTeam: "", awayTeam: "", selected: true },
    { id: "6", homeTeam: "", awayTeam: "", selected: true },
    { id: "7", homeTeam: "", awayTeam: "", selected: true },
    { id: "8", homeTeam: "", awayTeam: "", selected: true }
  ]);

  useEffect(() => {
    const loadTeams = async () => {
      const teamList = await fetchTeams();
      setTeams(teamList);
    };
    loadTeams();
  }, []);

  const updateMatch = (matchId: string, field: 'homeTeam' | 'awayTeam', value: string) => {
    setMatches(matches.map(match => 
      match.id === matchId 
        ? { ...match, [field]: value }
        : match
    ));
  };

  const toggleMatch = (matchId: string) => {
    setMatches(matches.map(match => 
      match.id === matchId 
        ? { ...match, selected: !match.selected }
        : match
    ));
  };

  const selectedCount = matches.filter(match => match.selected && match.homeTeam && match.awayTeam).length;
  const validMatches = matches.filter(match => match.homeTeam && match.awayTeam);

  const handleGeneratePredictions = () => {
    if (selectedCount === 0) return;
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
        <div className="h-[calc(100vh-8rem)] px-5 pb-16 overflow-y-auto space-y-4">
          <div className="mb-4 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Állítsd be a mérkőzéseket predikció készítéséhez ({selectedCount}/{validMatches.length} érvényes kiválasztva)
            </p>
          </div>
          
          {matches.map((match, index) => (
            <div 
              key={match.id}
              className="group relative p-4 rounded-lg border-2 border-border bg-card/50 transition-all"
            >
              {/* Match number and selection */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  #{index + 1}. mérkőzés
                </span>
                <div 
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                    match.selected 
                      ? 'border-primary bg-primary' 
                      : 'border-muted-foreground hover:border-primary'
                  }`}
                  onClick={() => toggleMatch(match.id)}
                >
                  {match.selected && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </div>
              
              {/* Team dropdowns */}
              <div className="flex items-center gap-3">
                <TeamDropdown
                  label="HAZAI CSAPAT"
                  value={match.homeTeam}
                  placeholder="Válassz hazai csapatot"
                  options={teams}
                  onSelect={(value) => updateMatch(match.id, 'homeTeam', value)}
                />
                
                <div className="flex items-center justify-center px-3 py-2 text-muted-foreground font-bold">
                  VS
                </div>
                
                <TeamDropdown
                  label="VENDÉG CSAPAT"
                  value={match.awayTeam}
                  placeholder="Válassz vendég csapatot"
                  options={teams}
                  onSelect={(value) => updateMatch(match.id, 'awayTeam', value)}
                />
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