import { Home, Compass, BookOpen, Users, User } from "lucide-react";
import { useLocation } from "wouter";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const [, setLocation] = useLocation();

  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "map", label: "Discover", icon: Compass },
    { id: "resources", label: "Resources", icon: BookOpen },
    { id: "saved", label: "Saved", icon: Users },
    { id: "profile", label: "Profile", icon: User },
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId === "profile") {
      setLocation("/profile");
    } else {
      onTabChange(tabId);
    }
  };

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center p-2 flex-1 transition-colors duration-200 ${
                isActive ? "text-[#e40000]" : "text-gray-500"
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}