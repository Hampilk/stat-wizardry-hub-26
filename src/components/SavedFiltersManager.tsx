import { useState } from 'react';
import { Save, Star, Trash2, Edit, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSavedFilters } from '@/hooks/use-saved-filters';
import { useToast } from '@/hooks/use-toast';
import type { MatchFilters } from '@/lib/supabase';

interface SavedFiltersManagerProps {
  currentFilters: MatchFilters;
  onApplyFilters: (filters: MatchFilters) => void;
}

const SavedFiltersManager = ({ currentFilters, onApplyFilters }: SavedFiltersManagerProps) => {
  const { savedFilters, saveFilter, deleteFilter, updateFilter } = useSavedFilters();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [editingFilter, setEditingFilter] = useState<string | null>(null);

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      toast({
        title: "Név szükséges",
        description: "Add meg a szűrő nevét",
        variant: "destructive",
      });
      return;
    }

    const success = saveFilter(filterName, currentFilters);
    if (success) {
      toast({
        title: "Szűrő mentve",
        description: `"${filterName}" szűrő sikeresen elmentve`,
      });
      setFilterName('');
      setSaveDialogOpen(false);
    }
  };

  const handleApplyFilter = (filters: MatchFilters) => {
    onApplyFilters(filters);
    setIsOpen(false);
    toast({
      title: "Szűrő alkalmazva",
      description: "Mentett szűrő beállítások alkalmazva",
    });
  };

  const handleDeleteFilter = (id: string, name: string) => {
    deleteFilter(id);
    toast({
      title: "Szűrő törölve",
      description: `"${name}" szűrő törölve`,
    });
  };

  const getFilterSummary = (filters: MatchFilters) => {
    const activeFilters = Object.entries(filters)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .length;
    return `${activeFilters} aktív szűrő`;
  };

  const hasActiveFilters = Object.values(currentFilters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  return (
    <div className="flex items-center gap-2">
      {/* Save Current Filters */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasActiveFilters}
            className="glass-card glass-hover hover-lift"
            aria-label="Jelenlegi szűrők mentése"
          >
            <Save className="size-4 mr-2" />
            <span className="hidden sm:inline">Mentés</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="glass-card border-white/20">
          <DialogHeader>
            <DialogTitle className="text-foreground">Szűrő mentése</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Szűrő neve
              </label>
              <Input
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Pl. Hazai csapat szűrő"
                className="glass-input"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveFilter()}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {getFilterSummary(currentFilters)}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSaveDialogOpen(false)}
                className="glass-card"
              >
                Mégse
              </Button>
              <Button onClick={handleSaveFilter} className="winmix-btn-primary">
                Mentés
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Saved Filters Menu */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="glass-card glass-hover hover-lift"
            aria-label="Mentett szűrők"
          >
            <Star className="size-4 mr-2" />
            <span className="hidden sm:inline">Mentett</span>
            {savedFilters.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                {savedFilters.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-0 glass-card backdrop-blur-md border-white/20 shadow-2xl"
          sideOffset={4}
          align="start"
        >
          <div className="p-4">
            <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Star className="size-4" />
              Mentett szűrők
            </h3>
            
            {savedFilters.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Star className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nincs mentett szűrő</p>
                <p className="text-xs mt-1">Ments el gyakran használt szűrőket</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto winmix-scroll">
                {savedFilters.map((filter) => (
                  <div
                    key={filter.id}
                    className="group p-3 rounded-lg glass-card glass-hover transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => handleApplyFilter(filter.filters)}
                          className="text-left w-full"
                        >
                          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {filter.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getFilterSummary(filter.filters)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(filter.createdAt).toLocaleDateString('hu-HU')}
                          </p>
                        </button>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 hover:bg-destructive/20 hover:text-destructive"
                          onClick={() => handleDeleteFilter(filter.id, filter.name)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SavedFiltersManager;