import type { Match, MatchStats, DetailedMatchStats } from '@/lib/supabase';

export const calculateBasicStats = (matches: Match[]): MatchStats => {
  if (matches.length === 0) {
    return {
      total_matches: 0,
      home_wins: 0,
      draws: 0,
      away_wins: 0,
      btts_count: 0,
      comeback_count: 0,
      avg_goals: 0,
      home_win_percentage: 0,
      draw_percentage: 0,
      away_win_percentage: 0,
      btts_percentage: 0,
      comeback_percentage: 0
    };
  }

  const totalMatches = matches.length;
  const homeWins = matches.filter(m => m.result_computed === 'H').length;
  const draws = matches.filter(m => m.result_computed === 'D').length;
  const awayWins = matches.filter(m => m.result_computed === 'A').length;
  const bttsCount = matches.filter(m => m.btts_computed === true).length;
  const comebackCount = matches.filter(m => m.comeback_computed === true).length;

  const totalGoals = matches.reduce((sum, match) => 
    sum + match.full_time_home_goals + match.full_time_away_goals, 0
  );
  const avgGoals = totalGoals / totalMatches;

  return {
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
  };
};

export const calculateDetailedStats = (matches: Match[]): DetailedMatchStats => {
  const basic = calculateBasicStats(matches);
  
  if (matches.length === 0) {
    return {
      basic,
      goalStats: {
        home_goals_total: 0,
        away_goals_total: 0,
        home_goals_per_match: 0,
        away_goals_per_match: 0,
        home_clean_sheets: 0,
        away_clean_sheets: 0,
        home_clean_sheet_percentage: 0,
        away_clean_sheet_percentage: 0
      },
      overUnder: {
        over_25_count: 0,
        under_25_count: 0,
        over_25_percentage: 0,
        under_25_percentage: 0,
        over_35_count: 0,
        over_35_percentage: 0
      },
      frequentResults: [],
      halfTimeAnalysis: {
        ht_home_leads: 0,
        ht_away_leads: 0,
        ht_draws: 0,
        ht_home_lead_to_win: 0,
        ht_home_lead_to_draw: 0,
        ht_home_lead_to_loss: 0,
        ht_away_lead_to_win: 0,
        ht_away_lead_to_draw: 0,
        ht_away_lead_to_loss: 0,
        home_lead_hold_percentage: 0,
        away_lead_hold_percentage: 0
      }
    };
  }

  const totalMatches = matches.length;

  // Goal Statistics
  const homeGoalsTotal = matches.reduce((sum, m) => sum + m.full_time_home_goals, 0);
  const awayGoalsTotal = matches.reduce((sum, m) => sum + m.full_time_away_goals, 0);
  const homeCleanSheets = matches.filter(m => m.full_time_away_goals === 0).length;
  const awayCleanSheets = matches.filter(m => m.full_time_home_goals === 0).length;

  // Over/Under Statistics
  const over25Count = matches.filter(m => 
    (m.full_time_home_goals + m.full_time_away_goals) > 2.5
  ).length;
  const over35Count = matches.filter(m => 
    (m.full_time_home_goals + m.full_time_away_goals) > 3.5
  ).length;

  // Frequent Results
  const resultFrequency: { [key: string]: number } = {};
  matches.forEach(match => {
    const result = `${match.full_time_home_goals}-${match.full_time_away_goals}`;
    resultFrequency[result] = (resultFrequency[result] || 0) + 1;
  });

  const frequentResults = Object.entries(resultFrequency)
    .map(([result, count]) => ({
      result,
      count,
      percentage: Number(((count / totalMatches) * 100).toFixed(1))
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Half-Time Analysis
  let htHomeLeads = 0, htAwayLeads = 0, htDraws = 0;
  let htHomeLeadToWin = 0, htHomeLeadToDraw = 0, htHomeLeadToLoss = 0;
  let htAwayLeadToWin = 0, htAwayLeadToDraw = 0, htAwayLeadToLoss = 0;

  matches.forEach(match => {
    const htHomeGoals = match.half_time_home_goals || 0;
    const htAwayGoals = match.half_time_away_goals || 0;
    const ftResult = match.result_computed;

    if (htHomeGoals > htAwayGoals) {
      htHomeLeads++;
      if (ftResult === 'H') htHomeLeadToWin++;
      else if (ftResult === 'D') htHomeLeadToDraw++;
      else htHomeLeadToLoss++;
    } else if (htAwayGoals > htHomeGoals) {
      htAwayLeads++;
      if (ftResult === 'A') htAwayLeadToWin++;
      else if (ftResult === 'D') htAwayLeadToDraw++;
      else htAwayLeadToLoss++;
    } else {
      htDraws++;
    }
  });

  return {
    basic,
    goalStats: {
      home_goals_total: homeGoalsTotal,
      away_goals_total: awayGoalsTotal,
      home_goals_per_match: Number((homeGoalsTotal / totalMatches).toFixed(2)),
      away_goals_per_match: Number((awayGoalsTotal / totalMatches).toFixed(2)),
      home_clean_sheets: homeCleanSheets,
      away_clean_sheets: awayCleanSheets,
      home_clean_sheet_percentage: Number(((homeCleanSheets / totalMatches) * 100).toFixed(1)),
      away_clean_sheet_percentage: Number(((awayCleanSheets / totalMatches) * 100).toFixed(1))
    },
    overUnder: {
      over_25_count: over25Count,
      under_25_count: totalMatches - over25Count,
      over_25_percentage: Number(((over25Count / totalMatches) * 100).toFixed(1)),
      under_25_percentage: Number((((totalMatches - over25Count) / totalMatches) * 100).toFixed(1)),
      over_35_count: over35Count,
      over_35_percentage: Number(((over35Count / totalMatches) * 100).toFixed(1))
    },
    frequentResults,
    halfTimeAnalysis: {
      ht_home_leads: htHomeLeads,
      ht_away_leads: htAwayLeads,
      ht_draws: htDraws,
      ht_home_lead_to_win: htHomeLeadToWin,
      ht_home_lead_to_draw: htHomeLeadToDraw,
      ht_home_lead_to_loss: htHomeLeadToLoss,
      ht_away_lead_to_win: htAwayLeadToWin,
      ht_away_lead_to_draw: htAwayLeadToDraw,
      ht_away_lead_to_loss: htAwayLeadToLoss,
      home_lead_hold_percentage: htHomeLeads > 0 ? Number(((htHomeLeadToWin / htHomeLeads) * 100).toFixed(1)) : 0,
      away_lead_hold_percentage: htAwayLeads > 0 ? Number(((htAwayLeadToWin / htAwayLeads) * 100).toFixed(1)) : 0
    }
  };
};