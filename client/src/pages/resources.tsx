import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Shield, 
  Lock, 
  FileText, 
  Target, 
  Printer,
  Phone,
  AlertTriangle,
  Users,
  Map
} from "lucide-react";
import { useLocation } from "wouter";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useToast } from "@/hooks/use-toast";

interface ResourceCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  hoverColor: string;
  action: () => void;
}

export default function Resources() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("resources");
  const { toast } = useToast();

  const handleCardClick = (cardTitle: string) => {
    toast({
      title: `${cardTitle} Selected`,
      description: `Opening ${cardTitle} resources...`,
    });
  };

  const handleEmergencyContacts = () => {
    toast({
      title: "Emergency Contacts",
      description: "Access to legal aid and emergency numbers",
    });
  };

  const handleSafetyChecklist = () => {
    toast({
      title: "Safety Checklist",
      description: "Essential safety guidelines for protests",
    });
  };

  const handleDigitalSecurity = () => {
    toast({
      title: "Digital Security",
      description: "Protect your privacy and communications",
    });
  };

  const handleLegalGlossary = () => {
    toast({
      title: "Legal Glossary",
      description: "Understanding legal terms and concepts",
    });
  };

  const handleOrganizing101 = () => {
    toast({
      title: "Organizing 101",
      description: "Learn the basics of event organization",
    });
  };

  const handlePrintables = () => {
    toast({
      title: "Printable Resources",
      description: "Download flyers and informational materials",
    });
  };

  const handleCommunityBuilding = () => {
    toast({
      title: "Community Building",
      description: "Tips for building lasting movements",
    });
  };

  const handleVenueMapping = () => {
    toast({
      title: "Venue & Route Planning",
      description: "Plan safe and effective protest routes",
    });
  };

  const protesterResources: ResourceCard[] = [
    {
      id: "know-your-rights",
      title: "Know Your Rights",
      description: "Legal rights during protests",
      icon: BookOpen,
      color: "text-red-600",
      hoverColor: "hover:border-red-300",
      action: () => handleCardClick("Know Your Rights")
    },
    {
      id: "emergency-contacts",
      title: "Emergency Contacts",
      description: "Legal aid and support numbers",
      icon: Phone,
      color: "text-blue-600",
      hoverColor: "hover:border-blue-300",
      action: handleEmergencyContacts
    },
    {
      id: "safety-checklist",
      title: "Safety Checklist",
      description: "Stay safe during protests",
      icon: Shield,
      color: "text-green-600",
      hoverColor: "hover:border-green-300",
      action: handleSafetyChecklist
    },
    {
      id: "digital-security",
      title: "Digital Security",
      description: "Protect your privacy",
      icon: Lock,
      color: "text-purple-600",
      hoverColor: "hover:border-purple-300",
      action: handleDigitalSecurity
    },
    {
      id: "legal-glossary",
      title: "Legal Glossary",
      description: "Understanding legal terms",
      icon: FileText,
      color: "text-orange-600",
      hoverColor: "hover:border-orange-300",
      action: handleLegalGlossary
    },
    {
      id: "first-aid",
      title: "First Aid Info",
      description: "Basic medical assistance",
      icon: AlertTriangle,
      color: "text-pink-600",
      hoverColor: "hover:border-pink-300",
      action: () => handleCardClick("First Aid Info")
    }
  ];

  const organizerResources: ResourceCard[] = [
    {
      id: "organizing-101",
      title: "Organizing 101",
      description: "Event planning basics",
      icon: Target,
      color: "text-indigo-600",
      hoverColor: "hover:border-indigo-300",
      action: handleOrganizing101
    },
    {
      id: "printables",
      title: "Printable Resources",
      description: "Flyers and materials",
      icon: Printer,
      color: "text-cyan-600",
      hoverColor: "hover:border-cyan-300",
      action: handlePrintables
    },
    {
      id: "community-building",
      title: "Community Building",
      description: "Building lasting movements",
      icon: Users,
      color: "text-emerald-600",
      hoverColor: "hover:border-emerald-300",
      action: handleCommunityBuilding
    },
    {
      id: "venue-mapping",
      title: "Venue & Routes",
      description: "Location planning tools",
      icon: Map,
      color: "text-violet-600",
      hoverColor: "hover:border-violet-300",
      action: handleVenueMapping
    }
  ];

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

  const ResourceCardComponent = ({ resource }: { resource: ResourceCard }) => (
    <Card 
      className={`cursor-pointer transition-all duration-200 border-2 ${resource.hoverColor} hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
      onClick={resource.action}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          resource.action();
        }
      }}
      aria-label={`${resource.title}: ${resource.description}`}
    >
      <CardContent className="p-4 text-center">
        <resource.icon className={`w-8 h-8 mx-auto mb-3 ${resource.color}`} />
        <h3 className="font-semibold text-gray-900 text-sm mb-1">{resource.title}</h3>
        <p className="text-xs text-gray-600">{resource.description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 p-4 pb-20">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Resources</h1>
            <p className="text-gray-600">Essential tools and information for activists</p>
          </div>

          {/* For Protesters Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">For Protesters</h2>
              <span className="text-sm text-gray-500">{protesterResources.length} resources</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {protesterResources.map((resource) => (
                <ResourceCardComponent key={resource.id} resource={resource} />
              ))}
            </div>
          </div>

          {/* For Organizers Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">For Organizers</h2>
              <span className="text-sm text-gray-500">{organizerResources.length} resources</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {organizerResources.map((resource) => (
                <ResourceCardComponent key={resource.id} resource={resource} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast({ title: "Emergency Hotline", description: "Connecting to legal aid..." })}
              >
                <Phone className="w-4 h-4 mr-2" />
                Emergency Legal Aid
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast({ title: "Report Issue", description: "Opening incident reporting..." })}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Report an Incident
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}