import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";

interface Match {
  home: string;
  away: string;
  ht: string;
  ft: string;
  btts: string;
  comeback: string;
}

interface ResultsSectionProps {
  matchData: Match[];
}

type SortKey = keyof Match;

export const ResultsSection: React.FC<ResultsSectionProps> = ({ matchData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

  // Sort data
  const sortedData = useMemo(() => {
    let sortableItems = [...matchData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [sortConfig, matchData]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, itemsPerPage, sortedData]);

  const totalPages = Math.ceil(matchData.length / itemsPerPage);

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) {
      return (
        <svg className="w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <section id="results" className="relative py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass-effect rounded-3xl p-1 shadow-glass">
          <div className="bg-card/75 rounded-2xl p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <h2 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                Listázott eredmények
              </h2>
            </div>

            {/* Controls */}
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 glass-effect rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-200 font-medium">Oldalanként:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white/10 ring-1 ring-white/20 rounded-md px-3 py-2 text-sm text-zinc-200 border-none focus:ring-2 focus:ring-primary transition-smooth"
                >
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                </select>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={currentPage === 1}
                  className="glass-effect border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Előző
                </Button>
                <span className="px-3 py-2 text-sm text-zinc-200 glass-effect rounded-md font-medium">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage === totalPages}
                  className="glass-effect border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Következő
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl ring-1 ring-white/10 glass-effect">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-white/5 text-zinc-300">
                    <tr className="border-b border-white/10">
                      {[
                        { key: 'home' as SortKey, label: 'Hazai csapat' },
                        { key: 'away' as SortKey, label: 'Vendég csapat' },
                        { key: 'ht' as SortKey, label: 'Félidő' },
                        { key: 'ft' as SortKey, label: 'Végeredmény' },
                        { key: 'btts' as SortKey, label: 'BTTS' },
                        { key: 'comeback' as SortKey, label: 'Fordítás' }
                      ].map(({ key, label }) => (
                        <th 
                          key={key}
                          onClick={() => handleSort(key)} 
                          className="text-left font-semibold px-4 py-4 cursor-pointer select-none hover:bg-white/5 transition-smooth group"
                        >
                          <span className="inline-flex items-center gap-2">
                            {label}
                            <span className="group-hover:opacity-100 transition-opacity">
                              {getSortIcon(key)}
                            </span>
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-zinc-200">
                    {paginatedData.map((match, index) => (
                      <tr 
                        key={index} 
                        className="border-b border-white/5 hover:bg-white/5 transition-smooth group"
                      >
                        <td className="px-4 py-4 font-medium">{match.home}</td>
                        <td className="px-4 py-4 font-medium">{match.away}</td>
                        <td className="px-4 py-4 font-mono text-zinc-300">{match.ht}</td>
                        <td className="px-4 py-4 font-mono font-semibold">{match.ft}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                            match.btts === 'Igen' 
                              ? 'bg-btts-yes/20 text-btts-yes ring-1 ring-btts-yes/30' 
                              : 'bg-btts-no/20 text-btts-no ring-1 ring-btts-no/30'
                          }`}>
                            {match.btts}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                            match.comeback === 'Igen' 
                              ? 'bg-comeback-yes/20 text-comeback-yes ring-1 ring-comeback-yes/30' 
                              : 'bg-comeback-no/20 text-comeback-no ring-1 ring-comeback-no/30'
                          }`}>
                            {match.comeback}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};