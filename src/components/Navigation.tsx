import { Search, Command, Bell, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Navigation = () => {
  const { toast } = useToast();

  const handleNotification = () => {
    toast({
      title: "Új értesítés",
      description: "Új statisztikai adatok érhetők el",
    });
  };

  const handleProfile = (action: string) => {
    toast({
      title: `Profil ${action}`,
      description: "Művelet végrehajtva",
    });
  };

  return (
    <nav className="winmix-nav w-full">
      <div className="flex items-center justify-between w-full">
        {/* WinMix Brand Logo */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-violet flex items-center justify-center shadow-glow-violet">
              <span className="text-white font-bold text-xl">W</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground text-lg">WinMix</span>
              <span className="text-xs text-muted-foreground">Sports Analytics</span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-1">
            <a 
              href="#" 
              className="winmix-nav-item active px-4 py-2 text-sm font-medium rounded-lg transition-all"
            >
              Mérkőzések
            </a>
            <a 
              href="#" 
              className="winmix-nav-item px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg transition-all"
            >
              Statisztikák
            </a>
            <a 
              href="#" 
              className="winmix-nav-item px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg transition-all"
            >
              Eredmények
            </a>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              placeholder="Keresés..."
              className="pl-10 w-64 glass-input winmix-focus border-0"
            />
          </div>

          {/* Command Shortcut */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex items-center gap-2 text-muted-foreground winmix-btn-glass px-3"
          >
            <Command className="size-4" />
            <span className="text-xs">⌘K</span>
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotification}
              className="winmix-btn-glass size-9 p-0 winmix-focus"
            >
              <Bell className="size-4" />
            </Button>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-winmix-violet rounded-full border-2 border-background animate-pulse" />
          </div>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 winmix-btn-glass px-3 winmix-focus"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-violet flex items-center justify-center">
                  <User className="size-4 text-white" />
                </div>
                <ChevronDown className="size-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 glass-card border-0 mt-2"
            >
              <DropdownMenuItem 
                onClick={() => handleProfile("beállítások")}
                className="winmix-focus cursor-pointer"
              >
                Profil beállítások
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleProfile("kijelentkezés")}
                className="winmix-focus cursor-pointer"
              >
                Kijelentkezés
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;