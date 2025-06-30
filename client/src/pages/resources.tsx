
import { useState } from "react";
import { Shield, Phone, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useLocation } from "wouter";

export default function Resources() {
  const [activeTab, setActiveTab] = useState("resources");
  const [, setLocation] = useLocation();

  const resources = [
    {
      title: "Know Your Rights",
      icon: Shield,
      link: "/know-your-rights"
    },
    {
      title: "Safety Tips",
      icon: Phone,
      link: "/safety-tips"
    },
    {
      title: "Emergency Contacts",
      icon: Phone,
      link: "#"
    }
  ];

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
        // Already on resources page
        break;
      case "saved":
        setLocation("/saved");
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
          <h1 className="text-xl font-bold text-dark-slate">Resources</h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4 pb-24">
        <div className="grid grid-cols-3 gap-3">
          {resources.map((resource, index) => (
            <Card 
              key={index} 
              className="border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => {
                console.log('Navigating to:', resource.link);
                if (resource.link !== "#") {
                  setLocation(resource.link);
                }
              }}
            >
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-activist-blue/10 flex items-center justify-center mb-3">
                  <resource.icon className="w-6 h-6 text-activist-blue" />
                </div>
                <h3 className="font-medium text-dark-slate text-sm">{resource.title}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
