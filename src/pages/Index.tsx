import { RotateCcw, Filter, Download, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import FilterSection from "@/components/FilterSection";
import StatisticsCards from "@/components/StatisticsCards";
import ProbabilitySection from "@/components/ProbabilitySection";
import EnhancedChartSection from "@/components/EnhancedChartSection";
import ResultsTable from "@/components/ResultsTable";
import DashboardCustomizer from "@/components/DashboardCustomizer";
import PredictionModal from "@/components/PredictionModal";
import PredictionBuilderPanel from "@/components/NotificationPanel";
import { DashboardContainer, DashboardItem } from "@/components/DashboardContainer";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useMatches } from "@/hooks/use-matches";
import { useDashboardLayout } from "@/hooks/use-dashboard-layout";
import type { MatchFilters } from "@/lib/supabase";

const Index = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<MatchFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [predictionModalOpen, setPredictionModalOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const { matches, stats, totalCount, totalPages, loading, error, refetch } = useMatches(filters, currentPage, 50);
  const { visibleWidgets } = useDashboardLayout();

  const handleQuickAction = (action: string) => {
    if (action === "Visszaállítás") {
      setFilters({});
      setCurrentPage(1);
      toast({
        title: "Szűrők visszaállítva",
        description: "Összes szűrő törölve",
      });
    } else if (action === "Szűrés") {
      setCurrentPage(1); // Reset to first page when applying filters
      refetch();
      toast({
        title: "Szűrők alkalmazva",
        description: "Eredmények frissítve",
      });
    } else if (action === "CSV export") {
      // Create CSV content
      const csvContent = [
        ['Hazai csapat', 'Vendég csapat', 'Félidő', 'Végeredmény', 'BTTS', 'Fordítás', 'Idő'].join(','),
        ...matches.map(match => [
          match.home_team,
          match.away_team,
          match.half_time_home_goals !== null && match.half_time_away_goals !== null 
            ? `${match.half_time_home_goals}-${match.half_time_away_goals}` 
            : 'N/A',
          `${match.full_time_home_goals}-${match.full_time_away_goals}`,
          match.btts_computed ? 'Igen' : 'Nem',
          match.comeback_computed ? 'Igen' : 'Nem',
          match.match_time
        ].join(','))
      ].join('\n');
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'merkozesek.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "CSV export kész",
        description: `${totalCount} mérkőzés exportálva`,
      });
    } else if (action === "Predikció készítése") {
      setNotificationPanelOpen(true);
    }
  };

  const handleFiltersChange = (newFilters: MatchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  return (
    <div className="min-h-screen w-full relative bg-black text-foreground smooth-scroll">
      {/* Violet Storm Background with Top Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139, 92, 246, 0.25), transparent 70%), #000000",
        }}
      />

      {/* Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 bg-background/80 border-b border-border relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Navigation />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12 relative z-10">
        {/* Hero Section */}
        <section className="text-center space-y-4 winmix-fade-in">
          <h1 className="winmix-hero">
            Mérkőzés szűrő és statisztikák
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Szűrd a meccseket csapatokra és eseményekre, elemezd a kimeneteleket, és exportáld CSV-be a professzionális WinMix platformon.
          </p>
          
          {/* Quick Action Buttons */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => handleQuickAction("Visszaállítás")}
              className="winmix-btn-glass winmix-hover-lift winmix-focus"
              aria-label="Szűrök visszaállítása"
              disabled={loading}
            >
              <RotateCcw className="size-4 mr-2" />
              Visszaállítás
            </Button>
            <Button 
              onClick={() => handleQuickAction("Szűrés")}
              className="winmix-btn-primary winmix-hover-lift winmix-focus"
              aria-label="Szűrők alkalmazása"
              disabled={loading}
            >
              <Filter className="size-4 mr-2" />
              Szűrés
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleQuickAction("CSV export")}
              className="winmix-btn-glass winmix-hover-lift winmix-focus"
              aria-label="Adatok exportálása CSV formátumban"
              disabled={loading || totalCount === 0}
            >
              <Download className="size-4 mr-2" />
              CSV export
            </Button>
            <Button 
              onClick={() => handleQuickAction("Predikció készítése")}
              className="winmix-btn-primary winmix-hover-lift winmix-focus"
              aria-label="Predikció készítése 8 mérkőzésre"
              disabled={loading}
            >
              <Brain className="size-4 mr-2" />
              Predikció készítése
            </Button>
            <DashboardCustomizer />
          </div>
        </section>

        {/* Content Sections */}
        <div className="space-y-12">
          <FilterSection filters={filters} onFiltersChange={handleFiltersChange} />
          
          <DashboardContainer>
            {visibleWidgets.map((widget) => {
              let component = null;
              
              switch (widget.component) {
                case 'StatisticsCards':
                  component = (
                    <DashboardItem key={widget.id} id={widget.id}>
                      <StatisticsCards stats={stats} loading={loading} />
                    </DashboardItem>
                  );
                  break;
                case 'ProbabilitySection':
                  component = (
                    <DashboardItem key={widget.id} id={widget.id}>
                      <ProbabilitySection stats={stats} loading={loading} />
                    </DashboardItem>
                  );
                  break;
                case 'EnhancedChartSection':
                  component = (
                    <DashboardItem key={widget.id} id={widget.id}>
                      <EnhancedChartSection filters={filters} />
                    </DashboardItem>
                  );
                  break;
                case 'ResultsTable':
                  component = (
                    <DashboardItem key={widget.id} id={widget.id}>
                      <ResultsTable 
                        matches={matches} 
                        loading={loading} 
                        totalCount={totalCount}
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                      />
                    </DashboardItem>
                  );
                  break;
                default:
                  return null;
              }
              
              return component;
            })}
          </DashboardContainer>
        </div>
        
        {error && (
          <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-lg shadow-lg">
            <p className="font-medium">Hiba történt</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Prediction Modal */}
        <PredictionModal 
          open={predictionModalOpen} 
          onOpenChange={setPredictionModalOpen} 
        />

        {/* Prediction Builder Panel */}
        <PredictionBuilderPanel 
          isOpen={notificationPanelOpen}
          onClose={() => setNotificationPanelOpen(false)}
        />
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-border bg-background/50 backdrop-blur-sm relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-violet flex items-center justify-center">
                <span className="text-white font-bold">W</span>
              </div>
              <span className="text-sm text-muted-foreground">
                © 2024 WinMix. Minden jog fenntartva.
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              Magyar sports analytics platform
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;