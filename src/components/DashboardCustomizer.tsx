import { Settings, Eye, EyeOff, RotateCcw, Grip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useDashboardLayout } from '@/hooks/use-dashboard-layout';
import { useToast } from '@/hooks/use-toast';

const WIDGET_LABELS = {
  statistics: 'Statisztikai áttekintő',
  probability: 'Valószínűségek',
  charts: 'Grafikonok',
  results: 'Eredmények táblázat',
};

const DashboardCustomizer = () => {
  const { widgets, toggleWidgetVisibility, resetLayout } = useDashboardLayout();
  const { toast } = useToast();

  const handleResetLayout = () => {
    resetLayout();
    toast({
      title: "Layout visszaállítva",
      description: "Dashboard alapértelmezett elrendezése visszaállítva",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="glass-card glass-hover hover-lift"
          aria-label="Dashboard testreszabás"
        >
          <Settings className="size-4 mr-2" />
          <span className="hidden sm:inline">Testreszabás</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-white/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Settings className="size-5" />
            Dashboard testreszabás
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Widget Visibility */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Eye className="size-4" />
              Komponensek láthatósága
            </h3>
            
            <div className="space-y-3">
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  className="flex items-center justify-between p-3 rounded-lg glass-card"
                >
                  <div className="flex items-center gap-3">
                    <Grip className="size-4 text-muted-foreground opacity-50" />
                    <span className="text-sm text-foreground">
                      {WIDGET_LABELS[widget.id as keyof typeof WIDGET_LABELS]}
                    </span>
                  </div>
                  <Switch
                    checked={widget.visible}
                    onCheckedChange={() => toggleWidgetVisibility(widget.id)}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10">
            <Button
              variant="outline"
              onClick={handleResetLayout}
              className="w-full glass-card glass-hover"
            >
              <RotateCcw className="size-4 mr-2" />
              Alapértelmezett visszaállítása
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
            <p className="mb-1 font-medium">Tipp:</p>
            <p>A komponensek sorrendjét drag & drop funkcióval később módosíthatod.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardCustomizer;