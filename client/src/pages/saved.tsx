
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useLocation } from "wouter";

export default function Saved() {
  const [activeTab, setActiveTab] = useState("saved");
  const [, setLocation] = useLocation();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case "home":
        setLocation("/");
        break;
      case "discover":
        setLocation("/discover");
        break;
      case "resources":
        setLocation("/resources");
        break;
      case "saved":
        // Already on saved page
        break;
      case "profile":
        setLocation("/profile");
        break;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-dark-slate">Saved</h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4 pb-24">
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-medium text-dark-slate mb-2">No Saved Protests Yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Save protests you're interested in to view them here later.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLocation("/discover")}
          >
            Browse Protests
          </Button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
