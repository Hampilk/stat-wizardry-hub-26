// Predikciós rendszer típusok - WinMix integrációhoz

export interface PredictionInput {
  home_team: string;
  away_team: string;
  halftime_home_goals?: number;
  halftime_away_goals?: number;
  match_context?: MatchContext;
}

export interface MatchContext {
  season?: string;
  date?: string;
  fixture_order?: number;
  home_venue?: string;
  competition?: string;
}

export interface PredictionOutput {
  match_id?: string;
  predictions: {
    home_win_probability: number;
    draw_probability: number;
    away_win_probability: number;
    most_likely_outcome: 'H' | 'D' | 'A';
    confidence_score: number;
  };
  scoreline_predictions?: {
    most_likely_score: string;
    score_probabilities: ScoreProbability[];
  };
  model_explanations: ModelExplanation[];
  prediction_metadata: PredictionMetadata;
}

export interface ScoreProbability {
  home_goals: number;
  away_goals: number;
  probability: number;
}

export interface ModelExplanation {
  model_name: string;
  weight: number;
  prediction: {
    home_win: number;
    draw: number;
    away_win: number;
  };
  key_features: FeatureImportance[];
}

export interface FeatureImportance {
  feature_name: string;
  importance: number;
  value: number;
  description: string;
}

export interface PredictionMetadata {
  model_version: string;
  prediction_timestamp: string;
  data_quality_score: number;
  prediction_confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  warning_flags: string[];
}

// Feature Store típusok
export interface TeamFeatures {
  team_id: string;
  team_name: string;
  last_updated: string;
  form_features: FormFeatures;
  goal_features: GoalFeatures;
  historical_features: HistoricalFeatures;
}

export interface FormFeatures {
  recent_form_home: number[];  // Last 5 games as home (1=win, 0.5=draw, 0=loss)
  recent_form_away: number[];  // Last 5 games as away
  recent_form_overall: number[];
  current_streak: number;       // Positive for win streak, negative for loss streak
  streak_type: 'WIN' | 'DRAW' | 'LOSS' | 'MIXED';
  momentum_score: number;       // -1 to 1 based on recent trajectory
}

export interface GoalFeatures {
  avg_goals_scored_home: number;
  avg_goals_scored_away: number;
  avg_goals_conceded_home: number;
  avg_goals_conceded_away: number;
  btts_percentage_home: number;
  btts_percentage_away: number;
  clean_sheet_percentage_home: number;
  clean_sheet_percentage_away: number;
  comeback_ability: number;     // How often they come back from behind
  lead_holding: number;         // How often they hold leads
}

export interface HistoricalFeatures {
  total_matches_played: number;
  home_win_percentage: number;
  away_win_percentage: number;
  draw_percentage: number;
  avg_season_position?: number;
  head_to_head_record: HeadToHeadRecord[];
}

export interface HeadToHeadRecord {
  opponent_id: string;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  last_result: 'W' | 'D' | 'L';
  avg_goals_for: number;
  avg_goals_against: number;
  halftime_to_fulltime_pattern: TransitionMatrix;
}

export interface TransitionMatrix {
  ht_h_to_ft_h: number;  // HT home lead → FT home win
  ht_h_to_ft_d: number;  // HT home lead → FT draw  
  ht_h_to_ft_a: number;  // HT home lead → FT away win
  ht_d_to_ft_h: number;  // HT draw → FT home win
  ht_d_to_ft_d: number;  // HT draw → FT draw
  ht_d_to_ft_a: number;  // HT draw → FT away win
  ht_a_to_ft_h: number;  // HT away lead → FT home win
  ht_a_to_ft_d: number;  // HT away lead → FT draw
  ht_a_to_ft_a: number;  // HT away lead → FT away win
}

// Feedback és tanulás típusok
export interface PredictionFeedback {
  prediction_id: string;
  actual_result: 'H' | 'D' | 'A';
  actual_score: {
    home_goals: number;
    away_goals: number;
  };
  prediction_accuracy: {
    outcome_correct: boolean;
    score_correct: boolean;
    probability_error: number;
    brier_score: number;
    log_loss: number;
  };
  model_performance: ModelPerformance[];
}

export interface ModelPerformance {
  model_name: string;
  individual_accuracy: boolean;
  contribution_score: number;
  feature_reliability: number;
}

// Model konfigurációk
export interface ModelConfig {
  model_name: string;
  model_type: 'EMPIRICAL' | 'XGBOOST' | 'POISSON' | 'MARKOV' | 'ENSEMBLE';
  version: string;
  parameters: Record<string, any>;
  is_active: boolean;
  weight_in_ensemble: number;
  performance_metrics: PerformanceMetrics;
}

export interface PerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  log_loss: number;
  brier_score: number;
  calibration_error: number;
  last_evaluated: string;
  matches_evaluated: number;
}

// Ensemble és adaptív tanulás
export interface EnsembleWeights {
  model_weights: Record<string, number>;
  confidence_thresholds: {
    high_confidence: number;
    medium_confidence: number;
  };
  last_updated: string;
  performance_window: number; // Last N matches for weight calculation
}

export interface PredictionQuality {
  data_completeness: number;    // 0-1 scale
  feature_reliability: number;  // Based on recent accuracy
  sample_size_adequacy: number; // For head-to-head data
  model_consensus: number;      // Agreement between models
  overall_quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
}