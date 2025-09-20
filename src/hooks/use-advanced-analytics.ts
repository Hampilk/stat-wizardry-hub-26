import { useState, useEffect } from 'react'
import { supabase, type Match, type MatchFilters } from '@/lib/supabase'

export interface AdvancedAnalytics {
  mostCommonResults: Array<{
    result: string;
    count: number;
    percentage: number;
  }>;
  goalsTrend: {
    over25Goals: number;
    under25Goals: number;
    over25Percentage: number;
    under25Percentage: number;
  };
  bttsAnalysis: {
    bttsTrue: number;
    bttsFalse: number;
    bttsPercentage: number;
    monthlyTrend: Array<{
      month: string;
      bttsRate: number;
      matches: number;
    }>;
  };
  weeklyResults: Array<{
    day: string;
    matches: number;
    avgGoals: number;
    bttsRate: number;
  }>;
  comebackAnalysis: {
    totalComebacks: number;
    comebackPercentage: number;
    byScoreline: Array<{
      scenario: string;
      count: number;
      percentage: number;
    }>;
  };
  halftimeVsFulltime: {
    correlationRate: number;
    scenarios: Array<{
      halftime: string;
      fulltime: string;
      count: number;
      percentage: number;
    }>;
  };
  seasonalTrends: {
    monthlyGoalAverage: Array<{
      month: string;
      avgGoals: number;
      bttsRate: number;
      comebackRate: number;
    }>;
  };
}

export const useAdvancedAnalytics = (filters?: MatchFilters) => {
  const [analytics, setAnalytics] = useState<AdvancedAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAdvancedAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query with filters
      let query = supabase
        .from('matches')
        .select('*')
        .order('match_time', { ascending: false })
        .limit(1000) // Limit for performance

      // Apply filters if provided
      if (filters) {
        if (filters.home_team) {
          query = query.eq('home_team', filters.home_team)
        }
        if (filters.away_team) {
          query = query.eq('away_team', filters.away_team)
        }
        if (filters.btts_computed !== undefined) {
          query = query.eq('btts_computed', filters.btts_computed)
        }
        if (filters.comeback_computed !== undefined) {
          query = query.eq('comeback_computed', filters.comeback_computed)
        }
        if (filters.result_computed) {
          query = query.eq('result_computed', filters.result_computed)
        }
        if (filters.date_from) {
          query = query.gte('match_time', filters.date_from)
        }
        if (filters.date_to) {
          query = query.lte('match_time', filters.date_to)
        }
      }

      const { data: matches, error: matchError } = await query

      if (matchError) {
        throw matchError
      }

      if (!matches || matches.length === 0) {
        setAnalytics(null)
        return
      }

      // 1. Most Common Results Analysis
      const resultCounts: { [key: string]: number } = {}
      matches.forEach(match => {
        const result = `${match.full_time_home_goals}-${match.full_time_away_goals}`
        resultCounts[result] = (resultCounts[result] || 0) + 1
      })

      const mostCommonResults = Object.entries(resultCounts)
        .map(([result, count]) => ({
          result,
          count,
          percentage: Number(((count / matches.length) * 100).toFixed(1))
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // Top 10 most common results

      // 2. Goals Trend Analysis (Over/Under 2.5)
      const over25Goals = matches.filter(match => 
        (match.full_time_home_goals + match.full_time_away_goals) > 2.5
      ).length
      const under25Goals = matches.length - over25Goals

      const goalsTrend = {
        over25Goals,
        under25Goals,
        over25Percentage: Number(((over25Goals / matches.length) * 100).toFixed(1)),
        under25Percentage: Number(((under25Goals / matches.length) * 100).toFixed(1))
      }

      // 3. BTTS Professional Analysis
      const bttsTrue = matches.filter(match => match.btts_computed === true).length
      const bttsFalse = matches.length - bttsTrue

      // Monthly BTTS trend
      const monthlyData: { [key: string]: { btts: number; total: number } } = {}
      matches.forEach(match => {
        const month = new Date(match.match_time).toLocaleDateString('hu-HU', { 
          year: 'numeric', 
          month: 'short' 
        })
        if (!monthlyData[month]) {
          monthlyData[month] = { btts: 0, total: 0 }
        }
        monthlyData[month].total++
        if (match.btts_computed) {
          monthlyData[month].btts++
        }
      })

      const monthlyTrend = Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          bttsRate: Number(((data.btts / data.total) * 100).toFixed(1)),
          matches: data.total
        }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
        .slice(-6) // Last 6 months

      const bttsAnalysis = {
        bttsTrue,
        bttsFalse,
        bttsPercentage: Number(((bttsTrue / matches.length) * 100).toFixed(1)),
        monthlyTrend
      }

      // 4. Weekly Results Analysis
      const weeklyData: { [key: string]: { matches: Match[]; count: number } } = {
        'Hétfő': { matches: [], count: 0 },
        'Kedd': { matches: [], count: 0 },
        'Szerda': { matches: [], count: 0 },
        'Csütörtök': { matches: [], count: 0 },
        'Péntek': { matches: [], count: 0 },
        'Szombat': { matches: [], count: 0 },
        'Vasárnap': { matches: [], count: 0 }
      }

      const dayNames = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat']

      matches.forEach(match => {
        const dayIndex = new Date(match.match_time).getDay()
        const dayName = dayNames[dayIndex]
        
        // Ensure the dayName exists in weeklyData before accessing it
        if (weeklyData[dayName]) {
          weeklyData[dayName].matches.push(match)
          weeklyData[dayName].count++
        }
      })

      const weeklyResults = Object.entries(weeklyData).map(([day, data]) => {
        // Ensure data exists and has the expected structure
        if (!data || !data.matches || !Array.isArray(data.matches)) {
          return {
            day,
            matches: 0,
            avgGoals: 0,
            bttsRate: 0
          }
        }

        return {
          day,
          matches: data.count || 0,
          avgGoals: data.count > 0 && data.matches.length > 0
            ? Number((data.matches.reduce((sum, match) => 
                sum + (match.full_time_home_goals || 0) + (match.full_time_away_goals || 0), 0
              ) / data.count).toFixed(1))
            : 0,
          bttsRate: data.count > 0 && data.matches.length > 0
            ? Number(((data.matches.filter(m => m?.btts_computed).length / data.count) * 100).toFixed(1))
            : 0
        }
      })

      // 5. Comeback Analysis
      const totalComebacks = matches.filter(match => match.comeback_computed === true).length
      const comebackScenarios: { [key: string]: number } = {}
      
      matches.forEach(match => {
        if (match.comeback_computed && match.half_time_home_goals !== null && match.half_time_away_goals !== null) {
          const htResult = match.half_time_home_goals > match.half_time_away_goals ? 'H' : 
                          match.half_time_home_goals < match.half_time_away_goals ? 'A' : 'D'
          const ftResult = match.result_computed || 'D'
          const scenario = `${htResult} → ${ftResult}`
          comebackScenarios[scenario] = (comebackScenarios[scenario] || 0) + 1
        }
      })

      const comebackAnalysis = {
        totalComebacks,
        comebackPercentage: Number(((totalComebacks / matches.length) * 100).toFixed(1)),
        byScoreline: Object.entries(comebackScenarios)
          .map(([scenario, count]) => ({
            scenario,
            count,
            percentage: Number(((count / totalComebacks) * 100).toFixed(1))
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      }

      // 6. Halftime vs Fulltime Correlation
      const htftScenarios: { [key: string]: number } = {}
      let correlationMatches = 0

      matches.forEach(match => {
        if (match.half_time_home_goals !== null && match.half_time_away_goals !== null) {
          const htResult = `${match.half_time_home_goals}-${match.half_time_away_goals}`
          const ftResult = `${match.full_time_home_goals}-${match.full_time_away_goals}`
          const scenario = `${htResult} → ${ftResult}`
          htftScenarios[scenario] = (htftScenarios[scenario] || 0) + 1
          
          // Check for exact correlation (same result maintained)
          const htWinner = match.half_time_home_goals > match.half_time_away_goals ? 'H' : 
                          match.half_time_home_goals < match.half_time_away_goals ? 'A' : 'D'
          const ftWinner = match.result_computed || 'D'
          if (htWinner === ftWinner) correlationMatches++
        }
      })

      const halftimeVsFulltime = {
        correlationRate: Number(((correlationMatches / matches.length) * 100).toFixed(1)),
        scenarios: Object.entries(htftScenarios)
          .map(([scenario, count]) => {
            const [halftime, fulltime] = scenario.split(' → ')
            return {
              halftime,
              fulltime,
              count,
              percentage: Number(((count / matches.length) * 100).toFixed(1))
            }
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      }

      // 7. Seasonal Trends
      const monthlyTrendsData: { [key: string]: { goals: number; btts: number; comebacks: number; total: number } } = {}
      
      matches.forEach(match => {
        const month = new Date(match.match_time).toLocaleDateString('hu-HU', { 
          month: 'short',
          year: 'numeric'
        })
        if (!monthlyTrendsData[month]) {
          monthlyTrendsData[month] = { goals: 0, btts: 0, comebacks: 0, total: 0 }
        }
        monthlyTrendsData[month].total++
        monthlyTrendsData[month].goals += match.full_time_home_goals + match.full_time_away_goals
        if (match.btts_computed) monthlyTrendsData[month].btts++
        if (match.comeback_computed) monthlyTrendsData[month].comebacks++
      })

      const seasonalTrends = {
        monthlyGoalAverage: Object.entries(monthlyTrendsData)
          .map(([month, data]) => ({
            month,
            avgGoals: Number((data.goals / data.total).toFixed(1)),
            bttsRate: Number(((data.btts / data.total) * 100).toFixed(1)),
            comebackRate: Number(((data.comebacks / data.total) * 100).toFixed(1))
          }))
          .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
          .slice(-12) // Last 12 months
      }

      setAnalytics({
        mostCommonResults,
        goalsTrend,
        bttsAnalysis,
        weeklyResults,
        comebackAnalysis,
        halftimeVsFulltime,
        seasonalTrends
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Hiba az analitika betöltése során'
      setError(errorMessage)
      console.error('Advanced analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdvancedAnalytics()
  }, [filters]) // Re-fetch when filters change

  return {
    analytics,
    loading,
    error,
    refetch: fetchAdvancedAnalytics
  }
}