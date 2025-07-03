
import { ArrowLeft, Shield, Phone, Camera, MapPin, Users, AlertTriangle, Clock, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function LiveProtestModePage() {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timer);
    };
  }, []);

  const emergencyFeatures = [
    {
      title: "Emergency Contacts",
      description: "Quick access to legal aid and emergency numbers",
      icon: Phone,
      action: "Call Now",
      color: "#dc2626"
    },
    {
      title: "Document Incident",
      description: "Record videos and photos with metadata",
      icon: Camera,
      action: "Start Recording",
      color: "#e11d48"
    },
    {
      title: "Share Location",
      description: "Send your location to emergency contacts",
      icon: MapPin,
      action: "Share GPS",
      color: "#ea580c"
    },
    {
      title: "Find Safe Zone",
      description: "Locate nearest safe areas and exits",
      icon: Shield,
      action: "Find Routes",
      color: "#059669"
    }
  ];

  const liveFeatures = [
    {
      title: "Crowd Density",
      description: "Real-time crowd size and movement data",
      icon: Users,
      status: "Live",
      color: "#2563eb"
    },
    {
      title: "Risk Assessment",
      description: "AI-powered safety level monitoring",
      icon: AlertTriangle,
      status: "Monitoring",
      color: "#d97706"
    }
  ];

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/resources")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-dark-slate">Live Protest Mode</h1>
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-600" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-600" />
            )}
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Status Bar */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium text-dark-slate">Live Mode Active</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>
          </div>
          <p className="text-xs text-gray-600">
            Enhanced safety features are now active. Your location and activity may be monitored for security purposes.
          </p>
        </div>

        {/* Emergency Actions */}
        <section>
          <h2 className="text-lg font-semibold text-dark-slate mb-4">Emergency Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {emergencyFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className="cursor-pointer transition-all duration-200 hover:shadow-md border-gray-200 bg-white"
              >
                <CardContent className="p-4 text-center">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="font-medium text-dark-slate text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-gray-600 mb-3">{feature.description}</p>
                  <button 
                    className="w-full py-2 px-3 text-xs font-medium text-white rounded-md transition-colors duration-200"
                    style={{ backgroundColor: feature.color }}
                  >
                    {feature.action}
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Live Monitoring */}
        <section>
          <h2 className="text-lg font-semibold text-dark-slate mb-4">Live Monitoring</h2>
          <div className="space-y-3">
            {liveFeatures.map((feature, index) => (
              <Card key={index} className="border-gray-200 bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${feature.color}15` }}
                      >
                        <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-dark-slate text-sm mb-1">{feature.title}</h3>
                        <p className="text-xs text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs font-medium text-green-600">{feature.status}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Safety Tips */}
        <section>
          <h2 className="text-lg font-semibold text-dark-slate mb-4">Live Safety Tips</h2>
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800 text-sm mb-2">Stay Alert</h3>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• Keep your phone charged and accessible</li>
                    <li>• Stay near designated protest organizers</li>
                    <li>• Avoid confrontational situations</li>
                    <li>• Know your exit routes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Deactivate Mode */}
        <section className="pt-4">
          <button
            onClick={() => navigate("/resources")}
            className="w-full py-3 px-4 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg transition-colors duration-200 hover:bg-gray-200"
          >
            Deactivate Live Mode
          </button>
        </section>
      </div>
    </div>
  );
}
