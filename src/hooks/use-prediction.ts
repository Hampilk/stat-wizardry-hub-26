import { useState } from 'react';
import { predictionEngine } from '@/services/prediction-engine';
import { useToast } from '@/hooks/use-toast';
import type { PredictionInput, PredictionOutput } from '@/types/prediction';

/**
 * WinMix Predikciós Hook
 * 
 * Integrálja a predikciós motort a React komponensekkel.
 * Kezeli a loading státuszokat és hibákat.
 */
export function usePrediction() {
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Egyetlen mérkőzés predikciója
   */
  const predictMatch = async (input: PredictionInput): Promise<PredictionOutput | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await predictionEngine.predict(input);
      setPrediction(result);
      
      toast({
        title: "Predikció kész",
        description: `${input.home_team} vs ${input.away_team} előrejelzés elkészült`,
      });
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Predikciós hiba történt';
      setError(errorMessage);
      
      toast({
        title: "Predikciós hiba",
        description: errorMessage,
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Több mérkőzés predikciója batch-ben
   */
  const predictBatch = async (inputs: PredictionInput[]): Promise<PredictionOutput[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const results = await Promise.all(
        inputs.map(input => predictionEngine.predict(input))
      );
      
      toast({
        title: "Batch predikció kész",
        description: `${results.length} mérkőzés előrejelzése elkészült`,
      });
      
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch predikciós hiba történt';
      setError(errorMessage);
      
      toast({
        title: "Batch predikciós hiba",
        description: errorMessage,
        variant: "destructive"
      });
      
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Valós időben frissülő predikció (halftime → fulltime)
   */
  const updatePredictionWithHalftime = async (
    input: PredictionInput,
    halftimeScore: { home: number; away: number }
  ): Promise<PredictionOutput | null> => {
    const updatedInput: PredictionInput = {
      ...input,
      halftime_home_goals: halftimeScore.home,
      halftime_away_goals: halftimeScore.away
    };
    
    return predictMatch(updatedInput);
  };

  /**
   * Predikció visszaállítása
   */
  const clearPrediction = () => {
    setPrediction(null);
    setError(null);
  };

  /**
   * Predikciós minőség értékelése
   */
  const assessPredictionQuality = (prediction: PredictionOutput) => {
    const confidence = prediction.predictions.confidence_score;
    const qualityScore = prediction.prediction_metadata.data_quality_score;
    
    if (confidence >= 0.8 && qualityScore >= 0.8) {
      return {
        level: 'EXCELLENT' as const,
        message: 'Kiváló predikciós minőség',
        color: 'success'
      };
    } else if (confidence >= 0.6 && qualityScore >= 0.6) {
      return {
        level: 'GOOD' as const,
        message: 'Jó predikciós minőség',
        color: 'info'
      };
    } else if (confidence >= 0.4 && qualityScore >= 0.4) {
      return {
        level: 'FAIR' as const,
        message: 'Elfogadható predikciós minőség',
        color: 'warning'
      };
    } else {
      return {
        level: 'POOR' as const,
        message: 'Gyenge predikciós minőség - óvatosan használd',
        color: 'error'
      };
    }
  };

  /**
   * Model magyarázatok formázása
   */
  const formatModelExplanations = (prediction: PredictionOutput) => {
    return prediction.model_explanations.map(explanation => ({
      name: explanation.model_name,
      weight: Math.round(explanation.weight * 100),
      prediction: {
        home: Math.round(explanation.prediction.home_win * 100),
        draw: Math.round(explanation.prediction.draw * 100),
        away: Math.round(explanation.prediction.away_win * 100)
      },
      topFeatures: explanation.key_features
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 3)
        .map(feature => ({
          name: feature.description,
          importance: Math.round(feature.importance * 100),
          value: feature.value
        }))
    }));
  };

  /**
   * Predikciós trend analízis
   */
  const analyzeTrends = (prediction: PredictionOutput) => {
    const { home_win_probability, draw_probability, away_win_probability } = prediction.predictions;
    
    const maxProb = Math.max(home_win_probability, draw_probability, away_win_probability);
    const minProb = Math.min(home_win_probability, draw_probability, away_win_probability);
    const spread = maxProb - minProb;
    
    return {
      dominantOutcome: prediction.predictions.most_likely_outcome,
      certaintyLevel: spread > 0.4 ? 'HIGH' : spread > 0.2 ? 'MEDIUM' : 'LOW',
      isCloseMatch: spread < 0.15,
      surpriseFactor: minProb > 0.25 ? 'LOW' : 'HIGH'
    };
  };

  return {
    // Estado
    isLoading,
    prediction,
    error,
    
    // Funciones principales
    predictMatch,
    predictBatch,
    updatePredictionWithHalftime,
    clearPrediction,
    
    // Utilidades
    assessPredictionQuality,
    formatModelExplanations,
    analyzeTrends
  };
}

/**
 * Predefined mérkőzések hook
 */
export function usePredefinedPredictions() {
  const { predictBatch } = usePrediction();
  
  const getUpcomingMatches = (): PredictionInput[] => {
    // Ez később valós adatforrásból jönne (pl. API, scraping)
    return [
      { home_team: "Real Madrid", away_team: "Barcelona" },
      { home_team: "Manchester United", away_team: "Liverpool" },
      { home_team: "Bayern Munich", away_team: "Borussia Dortmund" },
      { home_team: "Juventus", away_team: "Inter Milan" },
      { home_team: "Paris Saint-Germain", away_team: "Olympique Marseille" },
      { home_team: "Arsenal", away_team: "Chelsea" },
      { home_team: "Atletico Madrid", away_team: "Valencia" },
      { home_team: "AC Milan", away_team: "AS Roma" }
    ];
  };

  const predictUpcomingMatches = async () => {
    const upcomingMatches = getUpcomingMatches();
    return predictBatch(upcomingMatches);
  };

  return {
    getUpcomingMatches,
    predictUpcomingMatches
  };
}