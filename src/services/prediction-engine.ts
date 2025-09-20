import { supabase } from '@/lib/supabase';
import type { 
  PredictionInput, 
  PredictionOutput, 
  TeamFeatures,
  TransitionMatrix,
  ModelExplanation,
  PredictionMetadata 
} from '@/types/prediction';

/**
 * WinMix Predikciós Motor
 * 
 * Integrálva a meglévő Supabase matches táblával.
 * Többrétegű modell ensemble-lel és adaptív tanulással.
 */
export class PredictionEngine {
  private models: Map<string, PredictionModel> = new Map();
  private ensembleWeights: Map<string, number> = new Map();

  constructor() {
    this.initializeModels();
  }

  /**
   * Fő predikciós API endpoint
   */
  async predict(input: PredictionInput): Promise<PredictionOutput> {
    try {
      // 1. Feature előkészítés
      const features = await this.prepareFeatures(input);
      
      // 2. Adatminőség ellenőrzés
      const qualityScore = this.assessDataQuality(features);
      
      // 3. Model predikciók futtatása
      const modelPredictions = await this.runAllModels(features);
      
      // 4. Ensemble kombinálás
      const finalPrediction = this.combineModels(modelPredictions);
      
      // 5. Eredmény összeállítás
      return {
        predictions: finalPrediction,
        model_explanations: modelPredictions,
        prediction_metadata: {
          model_version: 'v1.0',
          prediction_timestamp: new Date().toISOString(),
          data_quality_score: qualityScore,
          prediction_confidence: this.getConfidenceLevel(finalPrediction.confidence_score),
          warning_flags: this.generateWarnings(features, qualityScore)
        }
      };
      
    } catch (error) {
      console.error('Prediction error:', error);
      throw new Error('Predikciós hiba történt');
    }
  }

  /**
   * Feature-ök előkészítése a meglévő matches táblából
   */
  private async prepareFeatures(input: PredictionInput) {
    const [homeFeatures, awayFeatures, h2hFeatures] = await Promise.all([
      this.getTeamFeatures(input.home_team),
      this.getTeamFeatures(input.away_team),
      this.getHeadToHeadFeatures(input.home_team, input.away_team)
    ]);

    return {
      home_team: homeFeatures,
      away_team: awayFeatures,
      head_to_head: h2hFeatures,
      halftime_state: input.halftime_home_goals !== undefined ? {
        home_goals: input.halftime_home_goals,
        away_goals: input.halftime_away_goals || 0,
        goal_difference: input.halftime_home_goals - (input.halftime_away_goals || 0)
      } : null
    };
  }

  /**
   * Csapat feature-ök kinyerése a matches táblából
   */
  private async getTeamFeatures(teamName: string): Promise<TeamFeatures> {
    // Utolsó 10 meccs lekérése home és away-ként
    const [homeMatches, awayMatches] = await Promise.all([
      supabase
        .from('matches')
        .select('*')
        .eq('home_team', teamName)
        .order('match_time', { ascending: false })
        .limit(10),
      supabase
        .from('matches')
        .select('*')
        .eq('away_team', teamName)
        .order('match_time', { ascending: false })
        .limit(10)
    ]);

    const homeData = homeMatches.data || [];
    const awayData = awayMatches.data || [];
    
    // Form feature-ök számítása
    const homeForm = homeData.slice(0, 5).map(m => {
      if (m.result_computed === 'H') return 1;
      if (m.result_computed === 'D') return 0.5;
      return 0;
    });

    const awayForm = awayData.slice(0, 5).map(m => {
      if (m.result_computed === 'A') return 1;
      if (m.result_computed === 'D') return 0.5;
      return 0;
    });

    // Gól statisztikák
    const homeGoalsScored = homeData.reduce((sum, m) => sum + m.full_time_home_goals, 0);
    const homeGoalsConceded = homeData.reduce((sum, m) => sum + m.full_time_away_goals, 0);
    const awayGoalsScored = awayData.reduce((sum, m) => sum + m.full_time_away_goals, 0);
    const awayGoalsConceded = awayData.reduce((sum, m) => sum + m.full_time_home_goals, 0);

    return {
      team_id: teamName,
      team_name: teamName,
      last_updated: new Date().toISOString(),
      form_features: {
        recent_form_home: homeForm,
        recent_form_away: awayForm,
        recent_form_overall: [...homeForm, ...awayForm].slice(0, 5),
        current_streak: this.calculateStreak([...homeData, ...awayData], teamName),
        streak_type: this.getStreakType([...homeData, ...awayData], teamName),
        momentum_score: this.calculateMomentum([...homeData, ...awayData], teamName)
      },
      goal_features: {
        avg_goals_scored_home: homeData.length > 0 ? homeGoalsScored / homeData.length : 0,
        avg_goals_scored_away: awayData.length > 0 ? awayGoalsScored / awayData.length : 0,
        avg_goals_conceded_home: homeData.length > 0 ? homeGoalsConceded / homeData.length : 0,
        avg_goals_conceded_away: awayData.length > 0 ? awayGoalsConceded / awayData.length : 0,
        btts_percentage_home: homeData.filter(m => m.btts_computed).length / Math.max(homeData.length, 1) * 100,
        btts_percentage_away: awayData.filter(m => m.btts_computed).length / Math.max(awayData.length, 1) * 100,
        clean_sheet_percentage_home: homeData.filter(m => m.full_time_away_goals === 0).length / Math.max(homeData.length, 1) * 100,
        clean_sheet_percentage_away: awayData.filter(m => m.full_time_home_goals === 0).length / Math.max(awayData.length, 1) * 100,
        comeback_ability: [...homeData, ...awayData].filter(m => m.comeback_computed).length / Math.max([...homeData, ...awayData].length, 1) * 100,
        lead_holding: this.calculateLeadHolding([...homeData, ...awayData], teamName)
      },
      historical_features: {
        total_matches_played: homeData.length + awayData.length,
        home_win_percentage: homeData.filter(m => m.result_computed === 'H').length / Math.max(homeData.length, 1) * 100,
        away_win_percentage: awayData.filter(m => m.result_computed === 'A').length / Math.max(awayData.length, 1) * 100,
        draw_percentage: [...homeData, ...awayData].filter(m => m.result_computed === 'D').length / Math.max([...homeData, ...awayData].length, 1) * 100,
        head_to_head_record: [] // This will be filled separately
      }
    };
  }

  /**
   * Head-to-head feature-ök számítása
   */
  private async getHeadToHeadFeatures(homeTeam: string, awayTeam: string) {
    const { data: h2hMatches } = await supabase
      .from('matches')
      .select('*')
      .or(`and(home_team.eq.${homeTeam},away_team.eq.${awayTeam}),and(home_team.eq.${awayTeam},away_team.eq.${homeTeam})`)
      .order('match_time', { ascending: false })
      .limit(10);

    if (!h2hMatches || h2hMatches.length === 0) {
      return {
        matches_played: 0,
        home_advantage: 0,
        avg_goals: 0,
        btts_rate: 0,
        transition_matrix: this.getDefaultTransitionMatrix()
      };
    }

    // H2H statisztikák számítása...
    const homeWins = h2hMatches.filter(m => 
      (m.home_team === homeTeam && m.result_computed === 'H') ||
      (m.away_team === homeTeam && m.result_computed === 'A')
    ).length;

    return {
      matches_played: h2hMatches.length,
      home_advantage: homeWins / h2hMatches.length,
      avg_goals: h2hMatches.reduce((sum, m) => sum + m.full_time_home_goals + m.full_time_away_goals, 0) / h2hMatches.length,
      btts_rate: h2hMatches.filter(m => m.btts_computed).length / h2hMatches.length,
      transition_matrix: this.calculateTransitionMatrix(h2hMatches)
    };
  }

  /**
   * Model inicializálás
   */
  private initializeModels() {
    this.models.set('empirical', new EmpiricalModel());
    this.models.set('xgboost', new XGBoostModel());
    this.models.set('poisson', new PoissonModel());
    this.models.set('markov', new MarkovModel());

    // Kezdeti súlyok
    this.ensembleWeights.set('empirical', 0.3);
    this.ensembleWeights.set('xgboost', 0.35);
    this.ensembleWeights.set('poisson', 0.2);
    this.ensembleWeights.set('markov', 0.15);
  }

  // Helper methods...
  private calculateStreak(matches: any[], teamName: string): number {
    // Implementálás...
    return 0;
  }

  private getStreakType(matches: any[], teamName: string): 'WIN' | 'DRAW' | 'LOSS' | 'MIXED' {
    return 'MIXED';
  }

  private calculateMomentum(matches: any[], teamName: string): number {
    return 0;
  }

  private calculateLeadHolding(matches: any[], teamName: string): number {
    return 50; // Placeholder
  }

  private getDefaultTransitionMatrix(): TransitionMatrix {
    return {
      ht_h_to_ft_h: 0.65, ht_h_to_ft_d: 0.25, ht_h_to_ft_a: 0.10,
      ht_d_to_ft_h: 0.35, ht_d_to_ft_d: 0.30, ht_d_to_ft_a: 0.35,
      ht_a_to_ft_h: 0.10, ht_a_to_ft_d: 0.25, ht_a_to_ft_a: 0.65
    };
  }

  private calculateTransitionMatrix(matches: any[]): TransitionMatrix {
    // HT→FT átmeneti mátrix számítása a mérkőzésekből
    return this.getDefaultTransitionMatrix(); // Placeholder
  }

  private assessDataQuality(features: any): number {
    return 0.85; // Placeholder
  }

  private async runAllModels(features: any): Promise<ModelExplanation[]> {
    // Model futtatások...
    return [];
  }

  private combineModels(predictions: ModelExplanation[]) {
    // Ensemble kombinálás...
    return {
      home_win_probability: 0.5,
      draw_probability: 0.25,
      away_win_probability: 0.25,
      most_likely_outcome: 'H' as const,
      confidence_score: 0.75
    };
  }

  private getConfidenceLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (score >= 0.8) return 'HIGH';
    if (score >= 0.6) return 'MEDIUM';
    return 'LOW';
  }

  private generateWarnings(features: any, qualityScore: number): string[] {
    const warnings: string[] = [];
    if (qualityScore < 0.7) warnings.push('Limitált történeti adat');
    return warnings;
  }
}

// Abstract base class for models
abstract class PredictionModel {
  abstract predict(features: any): Promise<{
    home_win: number;
    draw: number;
    away_win: number;
    confidence: number;
    key_features: any[];
  }>;
}

// Empirical baseline model
class EmpiricalModel extends PredictionModel {
  async predict(features: any) {
    // Egyszerű statisztikai modell implementáció
    return {
      home_win: 0.45,
      draw: 0.27,
      away_win: 0.28,
      confidence: 0.6,
      key_features: []
    };
  }
}

// XGBoost model (placeholder)
class XGBoostModel extends PredictionModel {
  async predict(features: any) {
    // XGBoost implementáció (később)
    return {
      home_win: 0.52,
      draw: 0.25,
      away_win: 0.23,
      confidence: 0.8,
      key_features: []
    };
  }
}

// Poisson model (placeholder)
class PoissonModel extends PredictionModel {
  async predict(features: any) {
    return {
      home_win: 0.48,
      draw: 0.26,
      away_win: 0.26,
      confidence: 0.7,
      key_features: []
    };
  }
}

// Markov transition model
class MarkovModel extends PredictionModel {
  async predict(features: any) {
    return {
      home_win: 0.46,
      draw: 0.28,
      away_win: 0.26,
      confidence: 0.65,
      key_features: []
    };
  }
}

// Export singleton instance
export const predictionEngine = new PredictionEngine();