export { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

export type Match = Database['public']['Tables']['matches']['Row']

export type MatchFilters = {
  home_team?: string
  away_team?: string
  btts_computed?: boolean
  comeback_computed?: boolean
  result_computed?: string
  date_from?: string
  date_to?: string
}

export type MatchStats = {
  total_matches: number
  home_wins: number
  draws: number
  away_wins: number
  btts_count: number
  comeback_count: number
  avg_goals: number
  home_win_percentage: number
  draw_percentage: number
  away_win_percentage: number
  btts_percentage: number
  comeback_percentage: number
}

export type DetailedMatchStats = {
  basic: MatchStats
  goalStats: {
    home_goals_total: number
    away_goals_total: number
    home_goals_per_match: number
    away_goals_per_match: number
    home_clean_sheets: number
    away_clean_sheets: number
    home_clean_sheet_percentage: number
    away_clean_sheet_percentage: number
  }
  overUnder: {
    over_25_count: number
    under_25_count: number
    over_25_percentage: number
    under_25_percentage: number
    over_35_count: number
    over_35_percentage: number
  }
  frequentResults: {
    result: string
    count: number
    percentage: number
  }[]
  halfTimeAnalysis: {
    ht_home_leads: number
    ht_away_leads: number
    ht_draws: number
    ht_home_lead_to_win: number
    ht_home_lead_to_draw: number
    ht_home_lead_to_loss: number
    ht_away_lead_to_win: number
    ht_away_lead_to_draw: number
    ht_away_lead_to_loss: number
    home_lead_hold_percentage: number
    away_lead_hold_percentage: number
  }
}