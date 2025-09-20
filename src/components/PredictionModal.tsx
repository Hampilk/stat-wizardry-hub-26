import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/LoadingSpinner";
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Brain,
  Activity,
  BarChart3,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { usePredefinedPredictions, usePrediction } from "@/hooks/use-prediction";
import type { PredictionOutput } from "@/types/prediction";

interface PredictionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PredictionModal = ({ open, onOpenChange }: PredictionModalProps) => {
  const [predictions, setPredictions] = useState<PredictionOutput[]>([]);
  const { predictUpcomingMatches } = usePredefinedPredictions();
  const { isLoading, assessPredictionQuality, formatModelExplanations } = usePrediction();

  useEffect(() => {
    if (open && predictions.length === 0) {
      loadPredictions();
    }
  }, [open]);

  const loadPredictions = async () => {
    try {
      const results = await predictUpcomingMatches();
      setPredictions(results);
    } catch (error) {
      console.error('Failed to load predictions:', error);
    }
  };

  const getHighestProbability = (prediction: PredictionOutput) => {
    const { home_win_probability, draw_probability, away_win_probability } = prediction.predictions;
    const max = Math.max(home_win_probability, draw_probability, away_win_probability);
    
    if (max === home_win_probability) return { type: "Hazai", value: Math.round(max * 100), color: "text-primary" };
    if (max === draw_probability) return { type: "Döntetlen", value: Math.round(max * 100), color: "text-yellow-400" };
    return { type: "Vendég", value: Math.round(max * 100), color: "text-red-400" };
  };

  const getConfidenceLevel = (prediction: PredictionOutput) => {
    const confidence = prediction.predictions.confidence_score;
    if (confidence >= 0.75) return { level: "Magas", color: "bg-green-500", icon: CheckCircle };
    if (confidence >= 0.55) return { level: "Közepes", color: "bg-yellow-500", icon: AlertTriangle };
    return { level: "Alacsony", color: "bg-red-500", icon: AlertTriangle };
  };

  const getConfidenceStats = () => {
    const high = predictions.filter(p => p.predictions.confidence_score >= 0.75).length;
    const medium = predictions.filter(p => p.predictions.confidence_score >= 0.55 && p.predictions.confidence_score < 0.75).length;
    const low = predictions.filter(p => p.predictions.confidence_score < 0.55).length;
    return { high, medium, low };
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md glass-card border-0">
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <LoadingSpinner size="lg" />
              <div className="text-lg font-medium">WinMix AI dolgozik...</div>
              <div className="text-sm text-muted-foreground">
                Predikciók generálása és elemzése folyamatban
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const stats = getConfidenceStats();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card border-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="size-6 text-primary" />
            WinMix AI Predikció - {predictions.length} Mérkőzés
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass-card border-0">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{predictions.length}</div>
                <div className="text-sm text-muted-foreground">Mérkőzés</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-0">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{stats.high}</div>
                <div className="text-sm text-muted-foreground">Magas bizalom</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-0">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.medium}</div>
                <div className="text-sm text-muted-foreground">Közepes bizalom</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-0">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{stats.low}</div>
                <div className="text-sm text-muted-foreground">Alacsony bizalom</div>
              </CardContent>
            </Card>
          </div>

          <Separator className="bg-border/50" />

          {/* Predictions List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="size-5 text-primary" />
              AI Predikciók
            </h3>
            
            <div className="grid gap-4">
              {predictions.map((prediction, index) => {
                const highest = getHighestProbability(prediction);
                const confidence = getConfidenceLevel(prediction);
                const quality = assessPredictionQuality(prediction);
                const ConfidenceIcon = confidence.icon;
                
                return (
                  <Card key={index} className="glass-card border-0 winmix-hover-lift">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge 
                              variant="outline" 
                              className={`${confidence.color} text-white border-0 flex items-center gap-1`}
                            >
                              <ConfidenceIcon className="size-3" />
                              {confidence.level} bizalom
                            </Badge>
                            <Badge variant="outline" className={`
                              ${quality.color === 'success' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                              ${quality.color === 'info' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : ''}
                              ${quality.color === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : ''}
                              ${quality.color === 'error' ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''}
                            `}>
                              {quality.message}
                            </Badge>
                          </div>
                          
                          <div className="text-lg font-semibold mb-2">
                            Mérkőzés #{index + 1}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="text-center">
                              <div className="font-medium">Hazai</div>
                              <div className="text-primary font-bold">
                                {Math.round(prediction.predictions.home_win_probability * 100)}%
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">Döntetlen</div>
                              <div className="text-yellow-400 font-bold">
                                {Math.round(prediction.predictions.draw_probability * 100)}%
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">Vendég</div>
                              <div className="text-red-400 font-bold">
                                {Math.round(prediction.predictions.away_win_probability * 100)}%
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4 text-right">
                          <div className="text-sm text-muted-foreground mb-1">
                            Legesélyesebb
                          </div>
                          <div className={`text-lg font-bold ${highest.color}`}>
                            {highest.type}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {highest.value}%
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress bars */}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-12 text-xs">Hazai</div>
                          <div className="flex-1 winmix-progress h-2">
                            <div 
                              className="winmix-progress-fill" 
                              style={{ width: `${Math.round(prediction.predictions.home_win_probability * 100)}%` }}
                            />
                          </div>
                          <div className="w-8 text-xs text-right">
                            {Math.round(prediction.predictions.home_win_probability * 100)}%
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-12 text-xs">Dönt.</div>
                          <div className="flex-1 winmix-progress h-2">
                            <div 
                              className="winmix-progress-fill bg-yellow-400" 
                              style={{ width: `${Math.round(prediction.predictions.draw_probability * 100)}%` }}
                            />
                          </div>
                          <div className="w-8 text-xs text-right">
                            {Math.round(prediction.predictions.draw_probability * 100)}%
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-12 text-xs">Vendég</div>
                          <div className="flex-1 winmix-progress h-2">
                            <div 
                              className="winmix-progress-fill bg-red-400" 
                              style={{ width: `${Math.round(prediction.predictions.away_win_probability * 100)}%` }}
                            />
                          </div>
                          <div className="w-8 text-xs text-right">
                            {Math.round(prediction.predictions.away_win_probability * 100)}%
                          </div>
                        </div>
                      </div>

                      {/* Model Info */}
                      <div className="mt-3 text-xs text-muted-foreground">
                        Model: {prediction.prediction_metadata.model_version} • 
                        Confidence: {Math.round(prediction.predictions.confidence_score * 100)}% •
                        Quality: {Math.round(prediction.prediction_metadata.data_quality_score * 100)}%
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Bezárás
            </Button>
            <Button className="winmix-btn-primary" onClick={loadPredictions}>
              <Brain className="size-4 mr-2" />
              Újra generálás
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PredictionModal;