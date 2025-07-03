import { Card, CardContent } from "@/components/ui/card";
import { Shield, Phone, BookOpen, Users, AlertTriangle, FileText, ChevronRight } from "lucide-react";
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
      description: "Legal protections and civil rights",
      icon: Shield,
      link: "/know-your-rights"
    },
    {
      title: "Safety Tips",
      description: "Stay safe during protests",
      icon: AlertTriangle,
      link: "/safety-tips"
    },
    {
      title: "Emergency Contacts",
      description: "Important numbers and contacts",
      icon: Phone,
      link: "#"
    }
  ];

  const additionalResources = [
    {
      title: "Legal Support",
      description: "Access to legal aid and representation",
      icon: BookOpen,
      link: "#"
    },
    {
      title: "Community Groups",
      description: "Connect with local activist networks",
      icon: Users,
      link: "#"
    },
    {
      title: "Incident Reporting",
      description: "Report violations and document incidents",
      icon: FileText,
      link: "#"
    }
  ];

  return (
    <div className="px-4 py-4 space-y-6 max-w-md mx-auto animate-in fade-in duration-300 ease-out">
      <div>
      {/* Page Header */}
      <section className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-medium text-dark-slate mb-1">Resources</h1>
          </div>
        </div>
      </section>

      {/* For You Section */}
      <section className="mb-10">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-dark-slate mb-2">For You</h2>
          <p className="text-sm text-gray-600">Personalized resources based on your location</p>
        </div>

        <div className="space-y-3">
          {forYouResources.map((resource, index) => (
            <Card 
              key={index} 
              className="cursor-pointer transition-all duration-200 hover:shadow-sm border-gray-200 bg-white"
              onClick={() => {
                console.log('Navigating to:', resource.link);
                if (resource.link !== "#") {
                  navigate(resource.link);
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e11d4810' }}>
                      <resource.icon className="w-5 h-5" style={{ color: '#e11d48' }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-dark-slate text-sm mb-1">{resource.title}</h3>
                      <p className="text-xs text-gray-600">{resource.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* More Resources Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-lg font-medium text-dark-slate mb-2">More Resources</h2>
          <p className="text-sm text-gray-600">Additional support and tools</p>
        </div>

        <div className="space-y-3">
          {additionalResources.map((resource, index) => (
            <Card 
              key={index} 
              className="cursor-pointer transition-all duration-200 hover:shadow-sm border-gray-200 bg-white"
              onClick={() => {
                console.log('Navigating to:', resource.link);
                if (resource.link !== "#") {
                  navigate(resource.link);
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
                      <resource.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-dark-slate text-sm mb-1">{resource.title}</h3>
                      <p className="text-xs text-gray-600">{resource.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Live Protest Mode Section */}
      <section className="mt-12 mb-6">
        <div className="text-center py-6 px-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-dark-slate mb-2">Real-Time Safety</h3>
          <p className="text-xs text-gray-600 mb-4">
            Access emergency features and live updates during protests
          </p>
          <button
            onClick={() => navigate("/live-protest-mode")}
            className="w-full py-3 px-4 text-sm font-medium text-white rounded-lg transition-colors duration-200"
            style={{ backgroundColor: '#e11d48' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#be185d'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#e11d48'}
          >
            Live Protest Mode
          </button>
        </div>
      </section>
      </div>
    </div>
  );
}