import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Phone } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Resources() {
  const [, setLocation] = useLocation();

  const resources = [
    {
      title: "Know Your Rights",
      icon: Shield,
      link: "/know-your-rights"
    },
    {
      title: "Safety Tips",
      icon: Shield,
      link: "/safety-tips"
    },
    {
      title: "Emergency Contacts",
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

      <div className="px-4 py-4">
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
      </div>
    </div>
  );
}