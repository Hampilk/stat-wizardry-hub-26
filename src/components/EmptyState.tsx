import { FileX, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  type?: "no-data" | "no-results" | "no-filters";
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState = ({ 
  type = "no-data", 
  title, 
  description, 
  action 
}: EmptyStateProps) => {
  const configs = {
    "no-data": {
      icon: FileX,
      defaultTitle: "Nincs adat",
      defaultDescription: "Jelenleg nincs megjeleníthető adat.",
      color: "text-muted-foreground"
    },
    "no-results": {
      icon: Search,
      defaultTitle: "Nincs találat",
      defaultDescription: "A keresési feltételeknek megfelelő eredmény nem található.",
      color: "text-muted-foreground"
    },
    "no-filters": {
      icon: Filter,
      defaultTitle: "Válassz szűrőket",
      defaultDescription: "Használd a fenti szűrőket az eredmények megtekintéséhez.",
      color: "text-primary"
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted/20 p-6 mb-4">
        <Icon className={`size-12 ${config.color}`} />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">
        {title || config.defaultTitle}
      </h3>
      
      <p className="text-muted-foreground mb-6 max-w-md">
        {description || config.defaultDescription}
      </p>
      
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;