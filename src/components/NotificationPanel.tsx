import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Notification {
  id: string;
  user: string;
  action: string;
  target: string;
  timeAgo: string;
  avatar: string;
}

const NotificationPanel = ({ isOpen, onClose }: NotificationPanelProps) => {
  const notifications: Notification[] = [
    {
      id: "1",
      user: "@prediction_expert",
      action: "készített predikciót",
      target: "Real Madrid vs Barcelona",
      timeAgo: "1 órája",
      avatar: "PE"
    },
    {
      id: "2", 
      user: "@analytics_pro",
      action: "lájkolta",
      target: "Bayern Munich predikció",
      timeAgo: "3 órája",
      avatar: "AP"
    },
    {
      id: "3",
      user: "@sports_analyst",
      action: "kommentelt",
      target: "Manchester United elemzés",
      timeAgo: "5 órája", 
      avatar: "SA"
    },
    {
      id: "4",
      user: "@football_fan",
      action: "exportált CSV-t",
      target: "Premier League adatok",
      timeAgo: "7 órája",
      avatar: "FF"
    },
    {
      id: "5",
      user: "@stats_lover",
      action: "megtekintette",
      target: "Probability Section",
      timeAgo: "12 órája",
      avatar: "SL"
    },
    {
      id: "6",
      user: "@winmix_user",
      action: "szűrést alkalmazott",
      target: "BTTS meccsek",
      timeAgo: "15 órája",
      avatar: "WU"
    },
    {
      id: "7",
      user: "@data_scientist",
      action: "új predikciót követett",
      target: "Serie A elemzések",
      timeAgo: "18 órája",
      avatar: "DS"
    },
    {
      id: "8",
      user: "@football_expert",
      action: "visszajelzést küldött",
      target: "Predikciós motor",
      timeAgo: "20 órája",
      avatar: "FE"
    },
    {
      id: "9",
      user: "@analytics_guru",
      action: "kommentelt",
      target: "Chart Section",
      timeAgo: "22 órája",
      avatar: "AG"
    },
    {
      id: "10",
      user: "@prediction_master",
      action: "készített predikciót",
      target: "Champions League",
      timeAgo: "1 napja",
      avatar: "PM"
    },
    {
      id: "11",
      user: "@sports_data",
      action: "lájkolta",
      target: "Statistics Cards",
      timeAgo: "1 napja",
      avatar: "SD"
    },
    {
      id: "12",
      user: "@winmix_analyst",
      action: "kommentelt",
      target: "Results Table",
      timeAgo: "1 napja",
      avatar: "WA"
    }
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-114 bg-card/95 backdrop-blur-md border-l border-border z-50 transform transition-transform duration-300 ease-out max-md:w-full ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-6 pt-5 pb-3 border-b border-border">
          <h2 className="text-xl font-semibold">Értesítések</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-muted rounded-full"
          >
            <X className="size-6" />
          </Button>
        </div>

        {/* Notifications List */}
        <div className="h-[calc(100vh-5rem)] px-5 pb-5 overflow-y-auto space-y-2">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              className="group relative flex items-center p-5 rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer"
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-violet-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Avatar */}
              <div className="relative z-10 shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-semibold text-sm">
                {notification.avatar}
              </div>
              
              {/* Content */}
              <div className="relative z-10 flex-1 ml-4">
                <div className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">
                    {notification.user}
                  </span>
                  {' '}
                  {notification.action}
                  {' '}
                  <span className="text-foreground font-medium">
                    {notification.target}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {notification.timeAgo}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Button */}
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-10">
          <Button 
            className="winmix-btn-primary"
            onClick={() => {
              // Handle view all notifications
            }}
          >
            Összes értesítés
          </Button>
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;