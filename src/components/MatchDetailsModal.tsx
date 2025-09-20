import { useState } from "react";
import { 
  X, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Target, 
  TrendingUp, 
  Info,
  ExternalLink,
  Share2,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface MatchData {
  home: { team: string; color: string; logo?: string };
  away: { team: string; color: string; logo?: string };
  halftime: string;
  fulltime: string;
  btts: boolean;
  comeback: boolean;
  date?: string;
  venue?: string;
  attendance?: number;
  odds?: {
    home: number;
    draw: number;
    away: number;
  };
  stats?: {
    possession: [number, number];
    shots: [number, number];
    corners: [number, number];
  };
}

interface MatchDetailsModalProps {
  open: boolean;
  onClose: () => void;
  match: MatchData | null;
}

const MatchDetailsModal = ({ open, onClose, match }: MatchDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isFavorited, setIsFavorited] = useState(false);
  const { toast } = useToast();

  if (!match) return null;

  const handleShare = () => {
    toast({
      title: "Mérkőzés megosztva",
      description: "A mérkőzés adatai vágólapra másolva",
    });
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "Eltávolítva a kedvencek közül" : "Hozzáadva a kedvencekhez",
      description: `${match.home.team} vs ${match.away.team}`,
    });
  };

  const handlePrediction = () => {
    toast({
      title: "Predikció számítása",
      description: "AI alapú elemzés indítása...",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card border-white/10">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DialogTitle className="text-xl font-semibold">
                Mérkőzés részletek
              </DialogTitle>
              <Badge variant="secondary" className="bg-primary/15 text-primary border-primary/20">
                Befejezett
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavorite}
                className={`p-2 ${isFavorited ? 'text-yellow-500' : 'text-white/60'} hover:text-white`}
                aria-label="Kedvencekhez adás"
              >
                <Star className={`size-4 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="p-2 text-white/60 hover:text-white"
                aria-label="Megosztás"
              >
                <Share2 className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white"
                aria-label="Bezárás"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
          
          <DialogDescription>
            Részletes statisztikák és elemzések
          </DialogDescription>
        </DialogHeader>

        {/* Match Header */}
        <div className="bg-white/5 rounded-xl p-6 ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className={`size-3 rounded-full ${match.home.color}`} aria-hidden="true"></span>
                <span className="font-medium">{match.home.team}</span>
              </div>
              <div className="text-2xl font-bold tracking-tight">
                {match.fulltime}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium">{match.away.team}</span>
                <span className={`size-3 rounded-full ${match.away.color}`} aria-hidden="true"></span>
              </div>
            </div>
            <div className="text-right text-sm text-white/60">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="size-4" />
                <span>Félidő: {match.halftime}</span>
              </div>
              {match.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <span>{match.date}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Áttekintés
            </TabsTrigger>
            <TabsTrigger value="statistics" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Statisztikák
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Elemzés
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4 ring-1 ring-white/10">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Info className="size-4 text-white/70" />
                    Mérkőzés információ
                  </h4>
                  <div className="space-y-2 text-sm">
                    {match.venue && (
                      <div className="flex items-center gap-2 text-white/70">
                        <MapPin className="size-4" />
                        <span>{match.venue}</span>
                      </div>
                    )}
                    {match.attendance && (
                      <div className="flex items-center gap-2 text-white/70">
                        <Users className="size-4" />
                        <span>{match.attendance.toLocaleString()} néző</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4 ring-1 ring-white/10">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Target className="size-4 text-white/70" />
                    Piaci eredmények
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/70">BTTS</span>
                      <Badge 
                        variant={match.btts ? "default" : "secondary"}
                        className={match.btts ? "bg-sports-emerald/20 text-sports-emerald border-sports-emerald/30" : "bg-white/10 text-white/80"}
                      >
                        {match.btts ? "Igen" : "Nem"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/70">Fordítás</span>
                      <Badge 
                        variant={match.comeback ? "default" : "secondary"}
                        className={match.comeback ? "bg-primary/20 text-primary border-primary/30" : "bg-white/10 text-white/80"}
                      >
                        {match.comeback ? "Igen" : "Nem"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {match.odds && (
                <div className="bg-white/5 rounded-lg p-4 ring-1 ring-white/10">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="size-4 text-white/70" />
                    Odds (záró)
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-white/60 mb-1">1</div>
                      <div className="font-semibold">{match.odds.home.toFixed(2)}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-white/60 mb-1">X</div>
                      <div className="font-semibold">{match.odds.draw.toFixed(2)}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-white/60 mb-1">2</div>
                      <div className="font-semibold">{match.odds.away.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            {match.stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4 ring-1 ring-white/10">
                  <h4 className="font-medium mb-3 text-center">Labdabirtoklás</h4>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{match.stats.possession[0]}%</span>
                    <span>{match.stats.possession[1]}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sports-emerald" 
                      style={{ width: `${match.stats.possession[0]}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4 ring-1 ring-white/10">
                  <h4 className="font-medium mb-3 text-center">Lövések</h4>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{match.stats.shots[0]}</span>
                    <span>{match.stats.shots[1]}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${(match.stats.shots[0] / (match.stats.shots[0] + match.stats.shots[1])) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4 ring-1 ring-white/10">
                  <h4 className="font-medium mb-3 text-center">Szögletek</h4>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{match.stats.corners[0]}</span>
                    <span>{match.stats.corners[1]}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sports-amber" 
                      style={{ width: `${(match.stats.corners[0] / (match.stats.corners[0] + match.stats.corners[1])) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="bg-white/5 rounded-lg p-6 ring-1 ring-white/10 text-center">
              <h4 className="font-medium mb-4">AI Predikciós Modell</h4>
              <p className="text-sm text-white/70 mb-4">
                Gépi tanulás alapú elemzés hasonló mérkőzések alapján
              </p>
              <Button 
                onClick={handlePrediction}
                className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
              >
                <TrendingUp className="size-4 mr-2" />
                Predikció futtatása
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <Button
            variant="outline"
            onClick={onClose}
            className="glass-card glass-hover"
          >
            Bezárás
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
            onClick={() => {
              toast({
                title: "Részletes jelentés",
                description: "PDF export funkció hamarosan elérhető",
              });
            }}
          >
            <ExternalLink className="size-4 mr-2" />
            Jelentés exportálása
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchDetailsModal;