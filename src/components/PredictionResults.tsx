import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, TrendingUp, Target, BarChart3 } from "lucide-react";
import type { MatchStats } from "@/lib/supabase";

// Add the extended type definition for prediction quality
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

interface PredictedMatch {
  id: number;
  home_team: string;
  away_team: string;
}

interface PredictionResultsProps {
  predictions: { match: PredictedMatch; stats: ExtendedMatchStats | null }[];
}

export const PredictionResults = ({ predictions }: PredictionResultsProps) => {
  if (predictions.length === 0) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with criteria info */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-3">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg sm:text-xl font-semibold text-white">Optimalizált predikciós eredmények</h3>
        </div>
        
        <div className="inline-flex flex-wrap items-center gap-2 text-xs bg-white/5 px-3 py-2 rounded-full border border-white/10">
          <span className="text-white/80">Kritériumok:</span>
          <span className="text-success">≥65% győzelem</span>
          <span className="text-warning">&gt;30% döntetlen</span>
          <span className="text-primary">≥55% BTTS</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {predictions.map(({ match, stats }, index) => (
          <Card key={index} className="glass-card border-white/10 hover:border-white/20 transition-all duration-300 group">
            <CardContent className="p-4 sm:p-6">
              {/* Match header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-white text-base sm:text-lg truncate">
                    {match.home_team}
                  </h4>
                  <div className="text-white/60 text-sm font-medium">VS</div>
                  <h4 className="font-semibold text-white text-base sm:text-lg truncate">
                    {match.away_team}
                  </h4>
                </div>
                
                {stats?.prediction_quality && (
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {stats.prediction_quality.confidence_level >= 65 ? (
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    ) : stats.prediction_quality.confidence_level >= 50 ? (
                      <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium text-white/90">
                      {Math.round(stats.prediction_quality.confidence_level)}%
                    </span>
                  </div>
                )}
              </div>
              
              {stats ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Recommendation */}
                  {stats.prediction_quality && (
                    <div className={`p-3 sm:p-4 rounded-lg border ${
                      stats.prediction_quality.confidence === 'high' 
                        ? 'bg-success/10 border-success/20' 
                        : stats.prediction_quality.confidence === 'medium'
                        ? 'bg-warning/10 border-warning/20'
                        : 'bg-white/5 border-white/10'
                    }`}>
                      <div className="flex items-start gap-3">
                        <Target className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          stats.prediction_quality.confidence === 'high' 
                            ? 'text-success' 
                            : stats.prediction_quality.confidence === 'medium'
                            ? 'text-warning'
                            : 'text-white/60'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-white mb-1">
                            Ajánlás
                          </div>
                          <div className="text-sm text-white/90 break-words">
                            {stats.prediction_quality.recommendation}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Basic Statistics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">Összes mérkőzés:</span>
                        <span className="text-sm font-semibold text-white">{stats.total_matches}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">Átlagos gólok:</span>
                        <span className="text-sm font-semibold text-white">{stats.avg_goals}</span>
                      </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">Hazai átlag:</span>
                        <span className="text-sm font-semibold text-white">{stats.home_avg_goals || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">Vendég átlag:</span>
                        <span className="text-sm font-semibold text-white">{stats.away_avg_goals || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Qualified Statistics */}
                  <div className="space-y-2">
                    {stats.prediction_quality?.home_qualified && (
                      <div className="flex justify-between items-center bg-success/10 p-2 sm:p-3 rounded border border-success/20">
                        <span className="text-success font-medium text-sm">Hazai győzelem:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-success font-bold text-sm">{stats.home_win_percentage}%</span>
                          <CheckCircle className="w-3 h-3 text-success" />
                        </div>
                      </div>
                    )}
                    
                    {stats.prediction_quality?.away_qualified && (
                      <div className="flex justify-between items-center bg-success/10 p-2 sm:p-3 rounded border border-success/20">
                        <span className="text-success font-medium text-sm">Vendég győzelem:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-success font-bold text-sm">{stats.away_win_percentage}%</span>
                          <CheckCircle className="w-3 h-3 text-success" />
                        </div>
                      </div>
                    )}
                    
                    {stats.prediction_quality?.draw_highlighted && (
                      <div className="flex justify-between items-center bg-warning/10 p-2 sm:p-3 rounded border border-warning/20">
                        <span className="text-warning font-medium text-sm">Döntetlen (magas):</span>
                        <div className="flex items-center gap-1">
                          <span className="text-warning font-bold text-sm">{stats.draw_percentage}%</span>
                          <AlertTriangle className="w-3 h-3 text-warning" />
                        </div>
                      </div>
                    )}
                    
                    {stats.prediction_quality?.btts_qualified && (
                      <div className="flex justify-between items-center bg-primary/10 p-2 sm:p-3 rounded border border-primary/20">
                        <span className="text-primary font-medium text-sm">Mindkét csapat gólja:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-primary font-bold text-sm">{stats.btts_percentage}%</span>
                          <CheckCircle className="w-3 h-3 text-primary" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Most Frequent Results */}
                  {stats.most_frequent_results && stats.most_frequent_results.length > 0 && (
                    <div className="space-y-2 sm:space-y-3">
                      <h5 className="text-sm font-medium text-white/90 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Leggyakoribb eredmények
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {stats.most_frequent_results.slice(0, 6).map((result, idx) => (
                          <div
                            key={idx}
                            className="bg-white/5 p-2 rounded text-center border border-white/10"
                          >
                            <div className="text-sm font-semibold text-white">
                              {result.score}
                            </div>
                            <div className="text-xs text-white/70">
                              {result.percentage}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Halftime Transformations */}
                  {stats.halftime_transformations && stats.halftime_transformations > 0 && (
                    <div className="bg-white/5 p-3 sm:p-4 rounded border border-white/10">
                      <div className="text-sm text-white/80">
                        <span className="font-medium">Félidő átalakulások:</span> {stats.halftime_transformations} mérkőzés
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-3" />
                  <p className="text-white/70 text-sm">
                    Nincs elegendő adat az elemzéshez
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};