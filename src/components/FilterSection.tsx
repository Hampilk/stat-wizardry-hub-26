import { ChevronDown, Filter, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMatches } from "@/hooks/use-matches";
import SavedFiltersManager from "./SavedFiltersManager";
import type { MatchFilters } from "@/lib/supabase";

interface FilterDropdownProps {
  label: string;
  sublabel: string;
  color: string;
  options: string[];
  placeholder: string;
  value: string;
  onSelect: (value: string) => void;
}

const FilterDropdown = ({ label, sublabel, color, options, placeholder, value, onSelect }: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg glass-card glass-hover transition ${
            isOpen ? 'ring-primary/30' : 'hover:ring-white/20'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`inline-flex size-2 rounded-full ${color}`}></span>
            <div className="flex flex-col text-left">
              <span className="text-[11px] uppercase tracking-wider text-white/50">{label}</span>
              <span className="text-sm text-white/90">{value || placeholder}</span>
            </div>
          </div>
          <ChevronDown className={`size-4 text-white/50 transition ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-2 glass-card backdrop-blur-md border-white/20 shadow-2xl"
        sideOffset={4}
        align="start"
      >
        <div className="max-h-56 overflow-y-auto scrollbar-modern">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10 text-sm transition text-white/90 hover:text-white"
            >
              {option}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface FilterSectionProps {
  filters: MatchFilters;
  onFiltersChange: (filters: MatchFilters) => void;
}

const FilterSection = ({ filters, onFiltersChange }: FilterSectionProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [teams, setTeams] = useState<string[]>([]);
  const { fetchTeams } = useMatches();
  
  useEffect(() => {
    const loadTeams = async () => {
      const teamList = await fetchTeams();
      setTeams(teamList);
    };
    loadTeams();
  }, []);

  const filteredTeams = teams.filter(team => 
    team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const yesNo = ["Igen", "Nem"];

  const handleApplyFilters = () => {
    const filterCount = Object.values(filters).filter(Boolean).length;
    toast({
      title: "Szűrők alkalmazva",
      description: `${filterCount} aktív szűrő alapján frissítve az eredmények`,
    });
  };

  const handleResetFilters = () => {
    onFiltersChange({});
    setSearchTerm("");
    toast({
      title: "Szűrők visszaállítva",
      description: "Összes szűrő törölve",
    });
  };


  const handleFilterChange = (key: keyof MatchFilters, value: string) => {
    let filterValue: any = value;
    
    // Convert string values to appropriate types
    if (key === 'btts_computed' || key === 'comeback_computed') {
      filterValue = value === 'Igen' ? true : value === 'Nem' ? false : undefined;
    } else if (key === 'result_computed') {
      filterValue = value === 'Hazai győzelem' ? 'H' : 
                   value === 'Döntetlen' ? 'D' : 
                   value === 'Vendég győzelem' ? 'A' : undefined;
    }
    
    onFiltersChange({
      ...filters,
      [key]: filterValue || undefined
    });
  };

  const getDisplayValue = (key: keyof MatchFilters) => {
    const value = filters[key];
    if (key === 'btts_computed' || key === 'comeback_computed') {
      return value === true ? 'Igen' : value === false ? 'Nem' : '';
    }
    if (key === 'result_computed') {
      return value === 'H' ? 'Hazai győzelem' : 
             value === 'D' ? 'Döntetlen' : 
             value === 'A' ? 'Vendég győzelem' : '';
    }
    return value as string || '';
  };

  return (
    <section className="mb-8" role="region" aria-label="Mérkőzés szűrők">
      <div className="rounded-2xl glass-card">
        <div className="p-4 sm:p-6">
          {/* Search and Quick Actions */}
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/60" />
              <Input
                type="text"
                placeholder="Csapat neve szerinti keresés..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 placeholder:text-white/40 focus-visible:ring-primary/50"
                aria-label="Csapat keresése"
              />
            </div>
            <SavedFiltersManager 
              currentFilters={filters}
              onApplyFilters={onFiltersChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <FilterDropdown
              label="Hazai csapat"
              sublabel=""
              color="bg-sports-emerald/80"
              options={filteredTeams}
              placeholder="Válassz hazai csapatot"
              value={getDisplayValue('home_team')}
              onSelect={(value) => handleFilterChange('home_team', value)}
            />
            <FilterDropdown
              label="Vendég csapat"
              sublabel=""
              color="bg-sports-cyan/80"
              options={filteredTeams}
              placeholder="Válassz vendég csapatot"
              value={getDisplayValue('away_team')}
              onSelect={(value) => handleFilterChange('away_team', value)}
            />
            <FilterDropdown
              label="Mindkét csapat gólt szerzett"
              sublabel=""
              color="bg-primary/80"
              options={yesNo}
              placeholder="Válassz: Igen / Nem"
              value={getDisplayValue('btts_computed')}
              onSelect={(value) => handleFilterChange('btts_computed', value)}
            />
            <FilterDropdown
              label="Fordítás történet"
              sublabel=""
              color="bg-sports-amber/80"
              options={yesNo}
              placeholder="Válassz: Igen / Nem"
              value={getDisplayValue('comeback_computed')}
              onSelect={(value) => handleFilterChange('comeback_computed', value)}
            />
          </div>

          {/* Quick actions for small screens */}
          <div className="mt-4 flex sm:hidden items-center gap-2">
            <Button 
              onClick={handleApplyFilters}
              className="flex-1 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
              aria-label="Szűrők alkalmazása"
            >
              <Filter className="size-4 mr-2" />
              Szűrés
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleResetFilters}
              className="glass-card glass-hover"
              aria-label="Szűrők visszaállítása"
            >
              <RotateCcw className="size-4" />
            </Button>
          </div>

          {/* Active Filters Display */}
          {Object.values(filters).some(Boolean) && (
            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/70">Aktív szűrők:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-xs text-white/60 hover:text-white p-1 h-auto"
                >
                  Összes törlése
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => 
                  value !== undefined && value !== null && value !== '' && (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary text-xs rounded-full border border-primary/30"
                    >
                      {getDisplayValue(key as keyof MatchFilters)}
                      <button
                        onClick={() => handleFilterChange(key as keyof MatchFilters, '')}
                        className="hover:text-white transition-colors"
                        aria-label={`${getDisplayValue(key as keyof MatchFilters)} szűrő eltávolítása`}
                      >
                        ×
                      </button>
                    </span>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FilterSection;