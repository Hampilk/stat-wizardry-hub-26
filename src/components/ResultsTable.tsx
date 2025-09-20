import { Check, Eye, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import MatchDetailsModal from "./MatchDetailsModal";
import { useToast } from "@/hooks/use-toast";
import { Match } from "@/lib/supabase";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ResultsTableProps {
  matches: Match[];
  loading: boolean;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const ResultsTable = ({ matches, loading, totalCount, totalPages, currentPage, onPageChange }: ResultsTableProps) => {
  const { toast } = useToast();
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (match: Match) => {
    const enhancedMatch = {
      home: { 
        team: match.home_team, 
        color: "bg-sports-emerald" 
      },
      away: { 
        team: match.away_team, 
        color: "bg-sports-cyan" 
      },
      halftime: match.half_time_home_goals !== null && match.half_time_away_goals !== null 
        ? `${match.half_time_home_goals}-${match.half_time_away_goals}` 
        : "N/A",
      fulltime: `${match.full_time_home_goals}-${match.full_time_away_goals}`,
      btts: match.btts_computed || false,
      comeback: match.comeback_computed || false,
      date: new Date().toISOString().split('T')[0], // Using current date as placeholder
      venue: "Stadion", // Placeholder
      attendance: 50000, // Placeholder
      odds: {
        home: 1.85,
        draw: 3.40,
        away: 4.20
      },
      stats: {
        possession: [65, 35],
        shots: [14, 8],
        corners: [7, 3]
      }
    };
    setSelectedMatch(enhancedMatch);
    setIsModalOpen(true);
    
    toast({
      title: "Mérkőzés betöltése",
      description: `${match.home_team} vs ${match.away_team} részletek`,
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
      // Scroll to top of table
      document.querySelector('[data-table-container]')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // Generate colors for teams
  const teamColors = useMemo(() => {
    const colors = [
      "bg-sports-emerald", "bg-sports-cyan", "bg-primary", "bg-sports-amber",
      "bg-sports-pink", "bg-yellow-400", "bg-blue-500", "bg-green-500",
      "bg-red-500", "bg-purple-500", "bg-orange-500", "bg-indigo-500"
    ];
    const colorMap: Record<string, string> = {};
    let colorIndex = 0;
    
    matches.forEach(match => {
      if (!colorMap[match.home_team]) {
        colorMap[match.home_team] = colors[colorIndex % colors.length];
        colorIndex++;
      }
      if (!colorMap[match.away_team]) {
        colorMap[match.away_team] = colors[colorIndex % colors.length];
        colorIndex++;
      }
    });
    
    return colorMap;
  }, [matches]);

  if (loading) {
    return (
      <section className="mb-16">
        <div className="rounded-2xl glass-card overflow-hidden">
          <div className="px-5 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold tracking-tight">Listázott eredmények</h3>
              <LoadingSpinner size="sm" />
            </div>
          </div>
          
          <div className="p-8 text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Mérkőzések betöltése...</p>
          </div>
        </div>
      </section>
    );
  }

  if (totalCount === 0) {
    return (
      <section className="mb-16">
        <div className="rounded-2xl glass-card overflow-hidden">
          <div className="px-5 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold tracking-tight">Listázott eredmények</h3>
              <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/70">
                0 mérkőzés
              </span>
            </div>
          </div>
          
          <EmptyState 
            type="no-results"
            title="Nincs találat"
            description="A jelenlegi szűrők alapján nem található mérkőzés."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="mb-16" data-table-container>
      <div className="rounded-2xl glass-card overflow-hidden">
        <div className="px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight">Listázott eredmények</h3>
            <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/70">
              {totalCount} mérkőzés
            </span>
            {totalPages > 1 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary border border-primary/30">
                {currentPage}. oldal / {totalPages}
              </span>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <Button variant="outline" size="sm" className="glass-card glass-hover">
              Kiválasztás
            </Button>
            <Button variant="outline" size="sm" className="glass-card glass-hover">
              Szűrők mentése
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-white/60 border-b border-white/5">
                <th className="px-5 sm:px-6 py-3 font-medium">Hazai csapat</th>
                <th className="px-5 sm:px-6 py-3 font-medium">Vendég csapat</th>
                <th className="px-5 sm:px-6 py-3 font-medium">Félidő</th>
                <th className="px-5 sm:px-6 py-3 font-medium">Végeredmény</th>
                <th className="px-5 sm:px-6 py-3 font-medium">BTTS</th>
                <th className="px-5 sm:px-6 py-3 font-medium">Fordítás</th>
                <th className="px-5 sm:px-6 py-3 font-medium">Idő</th>
                <th className="px-5 sm:px-6 py-3 font-medium">
                  <span className="sr-only">Műveletek</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {matches.map((match, index) => (
                <tr key={index} className="hover:bg-white/5 transition-colors group">
                  <td className="px-5 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`size-2 rounded-full ${teamColors[match.home_team] || 'bg-gray-500'}`}></span>
                      <span>{match.home_team}</span>
                    </div>
                  </td>
                  <td className="px-5 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`size-2 rounded-full ${teamColors[match.away_team] || 'bg-gray-500'}`}></span>
                      <span>{match.away_team}</span>
                    </div>
                  </td>
                  <td className="px-5 sm:px-6 py-4">
                    {match.half_time_home_goals !== null && match.half_time_away_goals !== null 
                      ? `${match.half_time_home_goals}-${match.half_time_away_goals}` 
                      : "N/A"}
                  </td>
                  <td className="px-5 sm:px-6 py-4">
                    {match.full_time_home_goals}-{match.full_time_away_goals}
                  </td>
                  <td className="px-5 sm:px-6 py-4">
                    {match.btts_computed ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs bg-sports-emerald/15 text-sports-emerald ring-1 ring-sports-emerald/20">
                        <Check className="size-3.5" /> Igen
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs bg-white/10 text-white/80 ring-1 ring-white/15">
                        Nem
                      </span>
                    )}
                  </td>
                  <td className="px-5 sm:px-6 py-4">
                    {match.comeback_computed ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs bg-primary/15 text-primary ring-1 ring-primary/20">
                        Igen
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs bg-white/10 text-white/80 ring-1 ring-white/15">
                        Nem
                      </span>
                    )}
                  </td>
                  <td className="px-5 sm:px-6 py-4 text-sm text-white/70">
                    {match.match_time}
                  </td>
                  <td className="px-5 sm:px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(match)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-white/70 hover:text-white hover:bg-white/5"
                        aria-label={`${match.home_team} vs ${match.away_team} részletek megtekintése`}
                      >
                        <Eye className="size-4 mr-2" />
                        Részletek
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-white/70 hover:text-white hover:bg-white/5 p-2"
                            aria-label="További műveletek"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-white/10">
                          <DropdownMenuItem
                            onClick={() => {
                              toast({
                                title: "Hozzáadva a kedvencekhez",
                                description: `${match.home_team} vs ${match.away_team}`,
                              });
                            }}
                          >
                            Kedvencekhez adás
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              toast({
                                title: "Mérkőzés megosztva",
                                description: "Link vágólapra másolva",
                              });
                            }}
                          >
                            Megosztás
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="px-5 sm:px-6 py-4 border-t border-white/5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-white/60">
                {((currentPage - 1) * 50) + 1}–{Math.min(currentPage * 50, totalCount)} / {totalCount} eredmény
              </div>
              
              <div className="flex items-center gap-2">
                {/* Previous button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="glass-card glass-hover"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Előző oldal"
                >
                  <ChevronLeft className="size-4 mr-1" />
                  Előző
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {currentPage > 3 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 text-white/60 hover:text-white hover:bg-white/5"
                        onClick={() => handlePageChange(1)}
                      >
                        1
                      </Button>
                      {currentPage > 4 && (
                        <span className="text-white/40 px-1">...</span>
                      )}
                    </>
                  )}
                  
                  {getPageNumbers().map(page => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "ghost"}
                      size="sm"
                      className={`w-8 h-8 p-0 ${
                        page === currentPage 
                          ? "bg-primary text-primary-foreground" 
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <span className="text-white/40 px-1">...</span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 text-white/60 hover:text-white hover:bg-white/5"
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                
                {/* Next button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="glass-card glass-hover"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Következő oldal"
                >
                  Következő
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <MatchDetailsModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        match={selectedMatch}
      />
    </section>
  );
};

export default ResultsTable;