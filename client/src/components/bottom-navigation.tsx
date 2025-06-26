import { Heart, Search, BookOpen, Users, User } from "lucide-react";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: "home", label: "For you", icon: Heart },
    { id: "map", label: "Search", icon: Search },
    { id: "resources", label: "Resources", icon: BookOpen },
    { id: "community", label: "Community", icon: Users },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 z-50" style={{ height: '58px' }}>
      <div className="flex items-center h-full px-3">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isFirst = index === 0;
          const isLast = index === tabs.length - 1;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center h-full ${
                isActive ? "text-activist-blue" : "text-gray-500"
              }`}
              style={{
                width: '74px',
                marginLeft: isFirst ? '12px' : '0',
                marginRight: isLast ? '12px' : '0'
              }}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}