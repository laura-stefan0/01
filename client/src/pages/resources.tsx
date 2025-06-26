import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Shield, Phone, MapPin, ExternalLink } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Resources() {
  const [, setLocation] = useLocation();

  const protestResources = [
    {
      title: "Know Your Rights",
      description: "Legal information for protesters and activists",
      category: "Legal",
      icon: Shield,
      link: "/know-your-rights"
    },
    {
      title: "Safety Guidelines",
      description: "How to stay safe during protests and demonstrations",
      category: "Safety",
      icon: Shield,
      link: "#"
    },
    {
      title: "Emergency Contacts",
      description: "Important numbers for legal aid and support",
      category: "Emergency",
      icon: Phone,
      link: "#"
    }
  ];

  const organizerResources = [
    {
      title: "Event Planning Guide",
      description: "Step-by-step guide to organizing successful protests",
      category: "Planning",
      icon: MapPin,
      link: "#"
    },
    {
      title: "Legal Requirements",
      description: "Permits, regulations, and compliance information",
      category: "Legal",
      icon: BookOpen,
      link: "#"
    },
    {
      title: "Community Building",
      description: "Tools and strategies for growing your movement",
      category: "Community",
      icon: Users,
      link: "#"
    }
  ];

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-dark-slate ml-3">Resources</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-6">
        {/* For Protesters Section */}
        <section>
          <h2 className="text-lg font-semibold text-dark-slate mb-3">For Protesters</h2>
          <div className="space-y-3">
            {protestResources.map((resource, index) => (
              <Card key={index} className="border border-gray-100">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-activist-blue/10 flex items-center justify-center flex-shrink-0">
                      <resource.icon className="w-5 h-5 text-activist-blue" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-dark-slate">{resource.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {resource.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-activist-blue border-activist-blue hover:bg-activist-blue hover:text-white"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Learn More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* For Organizers Section */}
        <section>
          <h2 className="text-lg font-semibold text-dark-slate mb-3">For Organizers</h2>
          <div className="space-y-3">
            {organizerResources.map((resource, index) => (
              <Card key={index} className="border border-gray-100">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-rally-red/10 flex items-center justify-center flex-shrink-0">
                      <resource.icon className="w-5 h-5 text-rally-red" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-dark-slate">{resource.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {resource.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-rally-red border-rally-red hover:bg-rally-red hover:text-white"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Learn More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}