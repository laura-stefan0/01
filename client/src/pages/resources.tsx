import { Card, CardContent } from "@/components/ui/card";
import { Shield, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Resources Page - Essential resources for protesters and activists
 * This page provides access to important resources like rights information,
 * safety tips, and emergency contacts
 */
export default function ResourcesPage() {
  const navigate = useNavigate();

  const protestResources = [
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

  return (
    <div className="px-4 py-4 max-w-md mx-auto">
      <div className="grid grid-cols-3 gap-3">
        {protestResources.map((resource, index) => (
          <Card 
            key={index} 
            className="border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
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
              <h3 className="font-medium text-dark-slate text-sm">{resource.title}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}