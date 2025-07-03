import { Card, CardContent } from "@/components/ui/card";
import { Shield, Phone, BookOpen, Users, AlertTriangle, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Resources Page - Essential resources for protesters and activists
 * This page provides access to important resources like rights information,
 * safety tips, and emergency contacts
 */
export default function ResourcesPage() {
  const navigate = useNavigate();

  const forYouResources = [
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

  const additionalResources = [
    {
      title: "Legal Support",
      icon: BookOpen,
      link: "#"
    },
    {
      title: "Community Groups",
      icon: Users,
      link: "#"
    },
    {
      title: "Incident Reporting",
      icon: AlertTriangle,
      link: "#"
    }
  ];

  return (
    <div className="px-4 py-4 max-w-md mx-auto animate-in fade-in duration-300 ease-out">
      {/* Page Header */}
      <section className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-dark-slate">Resources</h1>
          </div>
        </div>
      </section>

      {/* For You Section */}
      <section className="space-y-4">
        <div className="bg-activist-blue rounded-lg p-4">
          <h2 className="text-lg font-semibold text-white mb-4">For You</h2>
          <div className="grid grid-cols-3 gap-3">
            {forYouResources.map((resource, index) => (
              <Card 
                key={index} 
                className="cursor-pointer transition-all duration-200 bg-white"
                onClick={() => {
                  console.log('Navigating to:', resource.link);
                  if (resource.link !== "#") {
                    navigate(resource.link);
                  }
                }}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-lg bg-activist-blue/10 flex items-center justify-center mb-3">
                    <resource.icon className="w-6 h-6 text-activist-blue" />
                  </div>
                  <h3 className="font-medium text-foreground text-sm">{resource.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {additionalResources.map((resource, index) => (
            <Card 
              key={index} 
              className="cursor-pointer transition-all duration-200"
              onClick={() => {
                console.log('Navigating to:', resource.link);
                if (resource.link !== "#") {
                  navigate(resource.link);
                }
              }}
            >
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-activist-blue/10 flex items-center justify-center mb-3">
                  <resource.icon className="w-6 h-6 text-activist-blue" />
                </div>
                <h3 className="font-medium text-foreground text-sm">{resource.title}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}