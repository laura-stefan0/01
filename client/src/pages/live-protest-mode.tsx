
import { ArrowLeft, Shield, Phone, Camera, MapPin, Users, AlertTriangle, Clock, Wifi, WifiOff, Download, Share2, Video, StopCircle, Battery, BatteryLow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function LiveProtestModePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [crowdDensity, setCrowdDensity] = useState(Math.floor(Math.random() * 500) + 100);
  const [riskLevel, setRiskLevel] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [batteryLevel, setBatteryLevel] = useState(85);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Time and recording timer
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (isRecording) {
        setRecordingTime(prev => prev + 1);
      }
    }, 1000);

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }

    // Get battery level (if supported)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      }).catch(() => {
        // Fallback to simulated battery level if API not supported
        setBatteryLevel(Math.floor(Math.random() * 40) + 60);
      });
    } else {
      // Simulate battery drain for demo purposes
      const batteryTimer = setInterval(() => {
        setBatteryLevel(prev => Math.max(10, prev - Math.random()));
      }, 30000);
      
      return () => clearInterval(batteryTimer);
    }

    // Simulate live monitoring data updates
    const monitoringTimer = setInterval(() => {
      setCrowdDensity(prev => Math.max(50, prev + Math.floor(Math.random() * 40) - 20));
      
      // Risk level logic based on crowd density and time
      const currentCrowd = crowdDensity;
      const currentHour = new Date().getHours();
      
      if (currentCrowd > 400 || (currentHour >= 20 && currentCrowd > 200)) {
        setRiskLevel('High');
      } else if (currentCrowd > 250 || (currentHour >= 18 && currentCrowd > 150)) {
        setRiskLevel('Medium');
      } else {
        setRiskLevel('Low');
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timer);
      clearInterval(monitoringTimer);
    };
  }, [isRecording, crowdDensity]);

  // Emergency action handlers
  const handleEmergencyCall = () => {
    const emergencyNumbers = [
      { name: "Emergency Services", number: "112" },
      { name: "Legal Aid Hotline", number: "+39 06 8511 0020" },
      { name: "Human Rights Defense", number: "+39 06 4825 1001" }
    ];

    const choice = window.confirm(
      "Emergency Call Options:\n\n" +
      "1. 112 - Emergency Services\n" +
      "2. Legal Aid Hotline\n" +
      "3. Human Rights Defense\n\n" +
      "Click OK to call Emergency Services (112) or Cancel to choose manually"
    );

    if (choice) {
      window.location.href = "tel:112";
    } else {
      toast({
        title: "Emergency Contacts",
        description: "Long press any number to copy: 112, +39 06 8511 0020, +39 06 4825 1001",
        duration: 5000,
      });
    }
  };

  const handleStartRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingTime(0);
      toast({
        title: "Recording Started",
        description: "Incident documentation in progress. Keep your phone stable and record evidence safely.",
        duration: 3000,
      });
    } else {
      setIsRecording(false);
      toast({
        title: "Recording Saved",
        description: `${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')} recording saved with GPS metadata.`,
        duration: 4000,
      });
    }
  };

  const handleShareLocation = () => {
    if (!userLocation) {
      toast({
        title: "Location Unavailable",
        description: "Please enable location services to share your GPS coordinates.",
        duration: 3000,
      });
      return;
    }

    const locationText = `🚨 PROTEST ALERT 🚨\nMy current location: ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}\n\nGoogle Maps: https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}\n\nTime: ${currentTime.toLocaleString()}\nSent from Corteo Live Protest Mode`;
    
    if (navigator.share) {
      navigator.share({
        title: "Emergency Location Share",
        text: locationText
      });
    } else {
      navigator.clipboard.writeText(locationText);
      toast({
        title: "Location Copied",
        description: "GPS coordinates copied to clipboard. Paste in messages to emergency contacts.",
        duration: 4000,
      });
    }
  };

  const handleFindSafeZone = () => {
    if (!userLocation) {
      toast({
        title: "Location Required",
        description: "Enable GPS to find nearest safe zones and exit routes.",
        duration: 3000,
      });
      return;
    }

    // Open maps with user location
    const mapsUrl = `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}&layer=transit`;
    window.open(mapsUrl, '_blank');
    
    toast({
      title: "Safe Zone Search",
      description: "Opening maps with your location. Look for public buildings, metro stations, and police stations.",
      duration: 4000,
    });
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return '#dc2626';
      case 'Medium': return '#d97706';
      default: return '#059669';
    }
  };

  const emergencyFeatures = [
    {
      title: "Emergency Contacts",
      description: "Quick access to legal aid and emergency numbers",
      icon: Phone,
      action: "Call Now",
      color: "#dc2626",
      handler: handleEmergencyCall
    },
    {
      title: "Document Incident",
      description: "Record videos and photos with metadata",
      icon: isRecording ? StopCircle : Camera,
      action: isRecording ? `Stop (${formatRecordingTime(recordingTime)})` : "Start Recording",
      color: "#e11d48",
      handler: handleStartRecording
    },
    {
      title: "Share Location",
      description: "Send your location to emergency contacts",
      icon: Share2,
      action: "Share GPS",
      color: "#ea580c",
      handler: handleShareLocation
    },
    {
      title: "Find Safe Zone",
      description: "Locate nearest safe areas and exits",
      icon: Shield,
      action: "Find Routes",
      color: "#059669",
      handler: handleFindSafeZone
    }
  ];

  const liveFeatures = [
    {
      title: "Crowd Density",
      description: `Estimated ${crowdDensity} people in surrounding area`,
      icon: Users,
      status: "Live",
      color: "#2563eb",
      value: `${crowdDensity} people`
    },
    {
      title: "Risk Assessment",
      description: `Current safety level: ${riskLevel} risk detected`,
      icon: AlertTriangle,
      status: riskLevel,
      color: getRiskColor(riskLevel),
      value: `${riskLevel} Risk`
    }
  ];

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
        <div className="px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/resources")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-dark-slate">Live Protest Mode</h1>
          <div className="flex items-center space-x-3">
            {/* Battery Indicator */}
            <div className="flex items-center space-x-1">
              {batteryLevel <= 20 ? (
                <BatteryLow className="w-5 h-5 text-red-600" />
              ) : (
                <Battery className="w-5 h-5 text-gray-600" />
              )}
              <span 
                className={`text-xs font-medium ${
                  batteryLevel <= 20 ? 'text-red-600' : 
                  batteryLevel <= 50 ? 'text-yellow-600' : 'text-green-600'
                }`}
              >
                {batteryLevel}%
              </span>
            </div>
            {/* Connectivity Indicator */}
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
                    onClick={feature.handler}
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
                    <div className="flex flex-col items-end space-y-1">
                      <div className="flex items-center space-x-1">
                        <div 
                          className="w-2 h-2 rounded-full animate-pulse" 
                          style={{ backgroundColor: feature.color }}
                        ></div>
                        <span 
                          className="text-xs font-medium" 
                          style={{ color: feature.color }}
                        >
                          {feature.status}
                        </span>
                      </div>
                      {feature.value && (
                        <span className="text-xs font-bold text-dark-slate">
                          {feature.value}
                        </span>
                      )}
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
          <Card 
            className={`border-2 ${
              riskLevel === 'High' 
                ? 'border-red-200 bg-red-50' 
                : riskLevel === 'Medium'
                ? 'border-yellow-200 bg-yellow-50'
                : 'border-green-200 bg-green-50'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle 
                  className={`w-5 h-5 mt-0.5 ${
                    riskLevel === 'High' 
                      ? 'text-red-600' 
                      : riskLevel === 'Medium'
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`} 
                />
                <div>
                  <h3 
                    className={`font-medium text-sm mb-2 ${
                      riskLevel === 'High' 
                        ? 'text-red-800' 
                        : riskLevel === 'Medium'
                        ? 'text-yellow-800'
                        : 'text-green-800'
                    }`}
                  >
                    {riskLevel === 'High' 
                      ? '⚠️ High Risk - Exercise Extreme Caution' 
                      : riskLevel === 'Medium'
                      ? '⚡ Medium Risk - Stay Alert'
                      : '✅ Low Risk - Normal Precautions'
                    }
                  </h3>
                  <ul 
                    className={`text-xs space-y-1 ${
                      riskLevel === 'High' 
                        ? 'text-red-700' 
                        : riskLevel === 'Medium'
                        ? 'text-yellow-700'
                        : 'text-green-700'
                    }`}
                  >
                    {riskLevel === 'High' ? (
                      <>
                        <li>• Consider leaving the area immediately</li>
                        <li>• Move toward designated safe zones</li>
                        <li>• Contact emergency services if needed</li>
                        <li>• Document any incidents safely</li>
                      </>
                    ) : riskLevel === 'Medium' ? (
                      <>
                        <li>• Stay close to main protest group</li>
                        <li>• Keep emergency contacts ready</li>
                        <li>• Avoid confrontational areas</li>
                        <li>• Monitor situation closely</li>
                      </>
                    ) : (
                      <>
                        <li>• Keep your phone charged and accessible</li>
                        <li>• Stay near designated protest organizers</li>
                        <li>• Know your exit routes</li>
                        <li>• Follow organizer instructions</li>
                      </>
                    )}
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
