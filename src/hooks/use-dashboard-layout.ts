import { useLocalStorage } from './use-local-storage';
import { useCallback } from 'react';

export interface DashboardWidget {
  id: string;
  component: string;
  position: number;
  visible: boolean;
  size?: 'small' | 'medium' | 'large';
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'statistics', component: 'StatisticsCards', position: 0, visible: true, size: 'large' },
  { id: 'probability', component: 'ProbabilitySection', position: 1, visible: true, size: 'medium' },
  { id: 'charts', component: 'EnhancedChartSection', position: 2, visible: true, size: 'large' },
  { id: 'results', component: 'ResultsTable', position: 3, visible: true, size: 'large' },
];

export const useDashboardLayout = () => {
  const [widgets, setWidgets] = useLocalStorage<DashboardWidget[]>('winmix-dashboard-layout', DEFAULT_WIDGETS);

  const updateWidgetPosition = useCallback((draggedId: string, targetPosition: number) => {
    setWidgets(prev => {
      const newWidgets = [...prev];
      const draggedIndex = newWidgets.findIndex(w => w.id === draggedId);
      const draggedWidget = newWidgets[draggedIndex];
      
      // Remove dragged widget
      newWidgets.splice(draggedIndex, 1);
      
      // Insert at new position
      newWidgets.splice(targetPosition, 0, draggedWidget);
      
      // Update positions
      return newWidgets.map((widget, index) => ({
        ...widget,
        position: index
      }));
    });
  }, [setWidgets]);

  const toggleWidgetVisibility = useCallback((id: string) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === id 
          ? { ...widget, visible: !widget.visible }
          : widget
      )
    );
  }, [setWidgets]);

  const resetLayout = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS);
  }, [setWidgets]);

  const visibleWidgets = widgets
    .filter(widget => widget.visible)
    .sort((a, b) => a.position - b.position);

  return {
    widgets,
    visibleWidgets,
    updateWidgetPosition,
    toggleWidgetVisibility,
    resetLayout,
  };
};