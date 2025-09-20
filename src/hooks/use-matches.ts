import { useState, useEffect } from 'react'
import { supabase, type Match, type MatchFilters, type MatchStats } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export const useMatches = (filters: MatchFilters = {}, page: number = 1, pageSize: number = 50) => {
  const [matches, setMatches] = useState<Match[]>([])
  const [stats, setStats] = useState<MatchStats | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchMatches = async () => {
    try {
      setLoading(true)
      setError(null)

      // First, get the total count for pagination
      let countQuery = supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })

      // Apply same filters to count query
      if (filters.home_team) {
        countQuery = countQuery.eq('home_team', filters.home_team)
      }
      if (filters.away_team) {
        countQuery = countQuery.eq('away_team', filters.away_team)
      }
      if (filters.btts_computed !== undefined) {
        countQuery = countQuery.eq('btts_computed', filters.btts_computed)
      }
      if (filters.comeback_computed !== undefined) {
        countQuery = countQuery.eq('comeback_computed', filters.comeback_computed)
      }
      if (filters.result_computed) {
        countQuery = countQuery.eq('result_computed', filters.result_computed)
      }

      const { count, error: countError } = await countQuery

      if (countError) {
        throw countError
      }

      const totalCount = count || 0
      const totalPages = Math.ceil(totalCount / pageSize)
      
      setTotalCount(totalCount)
      setTotalPages(totalPages)

      // Then fetch the paginated data
      let query = supabase
        .from('matches')
        .select('*')
        .order('match_time', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      // Apply filters
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

      const { data, error } = await query

      if (error) {
        throw error
      }

      setMatches(data || [])
      
      // Calculate statistics from all filtered data (not just current page)
      if (totalCount > 0) {
        // Fetch all data for statistics calculation
        let statsQuery = supabase
          .from('matches')
          .select('*')

        // Apply same filters for stats
        if (filters.home_team) {
          statsQuery = statsQuery.eq('home_team', filters.home_team)
        }
        if (filters.away_team) {
          statsQuery = statsQuery.eq('away_team', filters.away_team)
        }
        if (filters.btts_computed !== undefined) {
          statsQuery = statsQuery.eq('btts_computed', filters.btts_computed)
        }
        if (filters.comeback_computed !== undefined) {
          statsQuery = statsQuery.eq('comeback_computed', filters.comeback_computed)
        }
        if (filters.result_computed) {
          statsQuery = statsQuery.eq('result_computed', filters.result_computed)
        }

        const { data: allData, error: statsError } = await statsQuery

        if (statsError) {
          throw statsError
        }

        if (allData && allData.length > 0) {
          const totalMatches = allData.length
          const homeWins = allData.filter(m => m.result_computed === 'H').length
          const draws = allData.filter(m => m.result_computed === 'D').length
          const awayWins = allData.filter(m => m.result_computed === 'A').length
          const bttsCount = allData.filter(m => m.btts_computed === true).length
          const comebackCount = allData.filter(m => m.comeback_computed === true).length
        
          const totalGoals = allData.reduce((sum, match) => 
            sum + match.full_time_home_goals + match.full_time_away_goals, 0
          )
          const avgGoals = totalGoals / totalMatches

          const statistics: MatchStats = {
            total_matches: totalMatches,
            home_wins: homeWins,
            draws: draws,
            away_wins: awayWins,
            btts_count: bttsCount,
            comeback_count: comebackCount,
            avg_goals: Number(avgGoals.toFixed(1)),
            home_win_percentage: Number(((homeWins / totalMatches) * 100).toFixed(1)),
            draw_percentage: Number(((draws / totalMatches) * 100).toFixed(1)),
            away_win_percentage: Number(((awayWins / totalMatches) * 100).toFixed(1)),
            btts_percentage: Number(((bttsCount / totalMatches) * 100).toFixed(1)),
            comeback_percentage: Number(((comebackCount / totalMatches) * 100).toFixed(1))
          }

          setStats(statistics)
        } else {
          setStats(null)
        }
      } else {
        setStats(null)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Hiba történt az adatok betöltése során'
      setError(errorMessage)
      toast({
        title: "Hiba",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTeams = async (): Promise<string[]> => {
    try {
      const { data: homeTeams } = await supabase
        .from('matches')
        .select('home_team')
        .order('home_team')

      const { data: awayTeams } = await supabase
        .from('matches')
        .select('away_team')
        .order('away_team')

      const allTeams = new Set<string>()
      
      homeTeams?.forEach(team => allTeams.add(team.home_team))
      awayTeams?.forEach(team => allTeams.add(team.away_team))

      return Array.from(allTeams).sort()
    } catch (error) {
      console.error('Error fetching teams:', error)
      return []
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [JSON.stringify(filters), page, pageSize])

  return {
    matches,
    stats,
    totalCount,
    totalPages,
    currentPage: page,
    pageSize,
    loading,
    error,
    refetch: fetchMatches,
    fetchTeams
  }
}