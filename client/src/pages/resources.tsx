import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Shield, Phone, MapPin, ExternalLink } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Resources() {
  const [, setLocation] = useLocation();

  const resources = [
    {
      title: "Know Your Rights",
      description: "Legal information for protesters and activists",
      category: "Legal",
      icon: Shield,
      link: "/know-your-rights"
    },
    {
      title: "Safety Tips",
      description: "How to stay safe during protests and demonstrations",
      category: "Safety",
      icon: Shield,
      link: "/safety-tips"
    },
    {
      title: "Emergency Contacts",
      description: "Important numbers for legal aid and support",
      category: "Emergency",
      icon: Phone,
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

      <div className="px-4 py-4 space-y-3">
        {resources.map((resource, index) => (
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
                    onClick={() => setLocation(resource.link)}
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
    </div>
  );
}