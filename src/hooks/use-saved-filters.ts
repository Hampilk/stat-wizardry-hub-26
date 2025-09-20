import { useState, useCallback } from 'react';
import { useLocalStorage } from './use-local-storage';
import type { MatchFilters } from '@/lib/supabase';

export interface SavedFilter {
  id: string;
  name: string;
  filters: MatchFilters;
  createdAt: string;
}

export const useSavedFilters = () => {
  const [savedFilters, setSavedFilters] = useLocalStorage<SavedFilter[]>('winmix-saved-filters', []);
  const [loading, setLoading] = useState(false);

  const saveFilter = useCallback((name: string, filters: MatchFilters) => {
    if (!name.trim()) return false;
    
    setLoading(true);
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: name.trim(),
      filters,
      createdAt: new Date().toISOString(),
    };

    setSavedFilters(prev => [...prev, newFilter]);
    setLoading(false);
    return true;
  }, [setSavedFilters]);

  const deleteFilter = useCallback((id: string) => {
    setSavedFilters(prev => prev.filter(filter => filter.id !== id));
  }, [setSavedFilters]);

  const updateFilter = useCallback((id: string, name: string, filters: MatchFilters) => {
    setSavedFilters(prev => 
      prev.map(filter => 
        filter.id === id 
          ? { ...filter, name: name.trim(), filters }
          : filter
      )
    );
  }, [setSavedFilters]);

  const clearAllFilters = useCallback(() => {
    setSavedFilters([]);
  }, [setSavedFilters]);

  return {
    savedFilters,
    loading,
    saveFilter,
    deleteFilter,
    updateFilter,
    clearAllFilters,
  };
};