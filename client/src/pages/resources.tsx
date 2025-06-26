import { useState } from "react";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useLocation } from "wouter";

export default function Resources() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("resources");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case "home":
        setLocation("/");
        break;
      case "search":
        setLocation("/filter");
        break;
      case "map":
        setLocation("/?tab=map");
        break;
      case "resources":
        setLocation("/resources");
        break;
      case "profile":
        setLocation("/?tab=profile");
        break;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 p-4 pb-20">
        {/* Empty content */}
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}