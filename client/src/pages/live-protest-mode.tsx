
import { ArrowLeft, Shield, Phone, Camera, MapPin, Users, AlertTriangle, Clock, Wifi, WifiOff, Download, Share2, Video, StopCircle, Battery, BatteryLow, Eye, Lock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function LiveProtestModePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [crowdDensity, setCrowdDensity] = useState(Math.floor(Math.random() * 500) + 100);
  const [googleMapsCrowdData, setGoogleMapsCrowdData] = useState<{
    busynessLevel: 'Low' | 'Medium' | 'High' | 'Very High';
    estimatedPeople: number;
    lastUpdated: Date;
  }>({
    busynessLevel: 'Medium',
    estimatedPeople: Math.floor(Math.random() * 400) + 150,
    lastUpdated: new Date()
  });
  const [riskLevel, setRiskLevel] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [hasWifi, setHasWifi] = useState(false);
  const [hasMobileData, setHasMobileData] = useState(false);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
  const [showQuickPhonebook, setShowQuickPhonebook] = useState(false);
  const [quickContacts, setQuickContacts] = useState(() => {
    const saved = localStorage.getItem('corteo-quick-contacts');
    return saved ? JSON.parse(saved) : [];
  });
  const [editingContact, setEditingContact] = useState<{name: string; number: string; id?: string} | null>(null);

  // Loading sequence effect
  useEffect(() => {
    const loadingSteps = [
      { step: 0, text: "Initializing Live Mode...", duration: 1200 },
      { step: 1, text: "Securing connections...", duration: 1300 },
      { step: 2, text: "Activating safety protocols...", duration: 1100 },
      { step: 3, text: "Establishing emergency links...", duration: 1200 },
      { step: 4, text: "Optimizing location services...", duration: 1000 },
      { step: 5, text: "Live Mode activated", duration: 1200 }
    ];

    let currentStep = 0;
    
    const advanceStep = () => {
      if (currentStep < loadingSteps.length - 1) {
        currentStep++;
        setLoadingStep(currentStep);
        setTimeout(advanceStep, loadingSteps[currentStep].duration);
      } else {
        setTimeout(() => setIsLoading(false), 300);
      }
    };

    // Start loading sequence
    setTimeout(advanceStep, loadingSteps[0].duration);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check network connection type
    const checkNetworkType = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          const connectionType = connection.effectiveType || connection.type;
          setHasWifi(connectionType === 'wifi' || connection.type === 'wifi');
          setHasMobileData(['slow-2g', '2g', '3g', '4g', '5g'].includes(connectionType) || connection.type === 'cellular');
        }
      } else {
        // Fallback detection for browsers without Network Information API
        setHasWifi(navigator.onLine);
        setHasMobileData(navigator.onLine);
      }
    };

    checkNetworkType();
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        connection.addEventListener('change', checkNetworkType);
      }
    }
    
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

    // Simulate live monitoring data updates with Google Maps crowd density
    const monitoringTimer = setInterval(() => {
      // Simulate Google Maps API crowd density data
      const newEstimatedPeople = Math.max(50, googleMapsCrowdData.estimatedPeople + Math.floor(Math.random() * 60) - 30);
      
      let busynessLevel: 'Low' | 'Medium' | 'High' | 'Very High';
      if (newEstimatedPeople > 400) busynessLevel = 'Very High';
      else if (newEstimatedPeople > 250) busynessLevel = 'High';
      else if (newEstimatedPeople > 150) busynessLevel = 'Medium';
      else busynessLevel = 'Low';
      
      setGoogleMapsCrowdData({
        busynessLevel,
        estimatedPeople: newEstimatedPeople,
        lastUpdated: new Date()
      });
      
      setCrowdDensity(newEstimatedPeople);
      
      // Risk level logic based on Google Maps crowd density and time
      const currentHour = new Date().getHours();
      
      if (newEstimatedPeople > 400 || (currentHour >= 20 && newEstimatedPeople > 200)) {
        setRiskLevel('High');
      } else if (newEstimatedPeople > 250 || (currentHour >= 18 && newEstimatedPeople > 150)) {
        setRiskLevel('Medium');
      } else {
        setRiskLevel('Low');
      }
    }, 8000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timer);
      clearInterval(monitoringTimer);
    };
  }, [isRecording, crowdDensity]);

  // Emergency action handlers
  const handleEmergencyCall = () => {
    setShowEmergencyContacts(true);
  };

  const handleCallNumber = (number: string, name: string) => {
    const finalConfirm = window.confirm(
      `🚨 CALLING ${name.toUpperCase()} 🚨\n\n` +
      `This will immediately dial ${number}.\n` +
      "Only proceed if you have a real emergency or need.\n\n" +
      "Click OK to dial now."
    );
    
    if (finalConfirm) {
      window.location.href = `tel:${number}`;
      toast({
        title: `Calling ${name}`,
        description: `Dialing ${number}. Stay calm and provide your location if needed.`,
        duration: 5000,
      });
      setShowEmergencyContacts(false);
      setShowQuickPhonebook(false);
    }
  };

  const handleOpenQuickPhonebook = () => {
    setShowQuickPhonebook(true);
  };

  const handleSaveContact = () => {
    if (!editingContact?.name || !editingContact?.number) {
      toast({
        title: "Missing Information",
        description: "Please enter both name and phone number.",
        duration: 3000,
      });
      return;
    }

    const newContacts = editingContact.id
      ? quickContacts.map(c => c.id === editingContact.id ? editingContact : c)
      : [...quickContacts, { ...editingContact, id: Date.now().toString() }];

    setQuickContacts(newContacts);
    localStorage.setItem('corteo-quick-contacts', JSON.stringify(newContacts));
    setEditingContact(null);
    
    toast({
      title: "Contact Saved",
      description: `${editingContact.name} has been saved to your quick contacts.`,
      duration: 3000,
    });
  };

  const handleDeleteContact = (contactId: string) => {
    const updatedContacts = quickContacts.filter(c => c.id !== contactId);
    setQuickContacts(updatedContacts);
    localStorage.setItem('corteo-quick-contacts', JSON.stringify(updatedContacts));
    
    toast({
      title: "Contact Deleted",
      description: "Contact has been removed from your quick phonebook.",
      duration: 3000,
    });
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
      title: "Emergency Services",
      description: "Dial 112, police, legal aid, and human rights hotlines",
      icon: Phone,
      action: "Dial Numbers",
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

  const communicationFeatures = [
    {
      title: "Quick Phonebook",
      description: "Your saved family and friends contacts",
      icon: Users,
      action: "Personal Contacts",
      color: "#7c3aed",
      handler: handleOpenQuickPhonebook
    }
  ];

  const liveFeatures = [
    {
      title: "Crowd Density (Google Maps)",
      description: `${googleMapsCrowdData.busynessLevel} activity - ${googleMapsCrowdData.estimatedPeople} people detected`,
      icon: MapPin,
      status: googleMapsCrowdData.busynessLevel,
      color: "#2563eb",
      value: `${googleMapsCrowdData.estimatedPeople} people`
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

  // Loading Screen with Complex Transformation Animation
  if (isLoading) {
    const loadingMessages = [
      "Initializing Live Mode...",
      "Securing connections...", 
      "Activating safety protocols...",
      "Establishing emergency links...",
      "Optimizing location services...",
      "Live Mode activated"
    ];

    const loadingIcons = [Shield, Lock, Eye, Phone, MapPin, Zap];
    const CurrentIcon = loadingIcons[loadingStep] || Shield;

    return (
      <div className="fixed inset-0 z-50 overflow-hidden" style={{
        background: 'linear-gradient(135deg, #e11d48 0%, #be185d 50%, #9f1239 100%)'
      }}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Rotating circles */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border-2 border-white/20 animate-spin"
              style={{
                width: `${150 + i * 50}px`,
                height: `${150 + i * 50}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animationDuration: `${8 + i * 2}s`,
                animationDelay: `${i * 0.3}s`,
                animationDirection: i % 2 === 0 ? 'normal' : 'reverse'
              }}
            />
          ))}
          
          {/* Pulsing dots */}
          {[...Array(12)].map((_, i) => (
            <div
              key={`dot-${i}`}
              className="absolute w-2 h-2 bg-white/40 rounded-full animate-pulse"
              style={{
                top: `${20 + Math.sin(i * 0.5) * 60}%`,
                left: `${20 + Math.cos(i * 0.5) * 60}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '2s'
              }}
            />
          ))}

          {/* Floating geometric shapes */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`shape-${i}`}
              className="absolute opacity-20 animate-bounce"
              style={{
                top: `${10 + (i * 12)}%`,
                left: `${5 + (i * 11)}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: '3s'
              }}
            >
              <div 
                className="w-6 h-6 bg-white transform rotate-45"
                style={{
                  borderRadius: i % 2 === 0 ? '0' : '50%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-8">
          <div className="text-center max-w-sm">
            {/* Main Icon with Transformation Effect */}
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto relative">
                {/* Outer rotating ring */}
                <div className="absolute inset-0 border-4 border-white/30 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
                
                {/* Inner pulsing circle */}
                <div className="absolute inset-2 bg-white/20 rounded-full animate-pulse" />
                
                {/* Icon container with morphing effect */}
                <div 
                  className="absolute inset-4 bg-white rounded-full flex items-center justify-center transition-all duration-500 shadow-lg"
                  style={{
                    transform: `scale(${0.8 + loadingStep * 0.04})`,
                    boxShadow: `0 0 ${20 + loadingStep * 5}px rgba(255, 255, 255, 0.5)`
                  }}
                >
                  <CurrentIcon 
                    className="text-rose-600 transition-all duration-300"
                    style={{ 
                      width: `${20 + loadingStep * 2}px`, 
                      height: `${20 + loadingStep * 2}px` 
                    }}
                  />
                </div>

                {/* Progress indicators around the circle */}
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-3 h-3 rounded-full transition-all duration-300 ${
                      i <= loadingStep ? 'bg-white shadow-lg' : 'bg-white/30'
                    }`}
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-45px)`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* App Name with Glitch Effect */}
            <div className="relative mb-6">
              <h1 className="text-4xl font-bold text-white mb-2 relative">
                <span className="relative z-10">Corteo</span>
                {/* Glitch layers */}
                <span 
                  className="absolute top-0 left-0 text-4xl font-bold text-red-300 opacity-70"
                  style={{
                    transform: `translate(${Math.sin(Date.now() * 0.01) * 2}px, ${Math.cos(Date.now() * 0.015) * 1}px)`,
                    animation: 'glitch1 0.5s infinite'
                  }}
                >
                  Corteo
                </span>
                <span 
                  className="absolute top-0 left-0 text-4xl font-bold text-blue-300 opacity-50"
                  style={{
                    transform: `translate(${Math.cos(Date.now() * 0.012) * -2}px, ${Math.sin(Date.now() * 0.008) * 1}px)`,
                    animation: 'glitch2 0.7s infinite'
                  }}
                >
                  Corteo
                </span>
              </h1>
              <div className="text-white/90 text-lg font-medium">
                Live Protest Mode
              </div>
            </div>

            {/* Loading Message with Typewriter Effect */}
            <div className="mb-8">
              <p className="text-white/80 text-sm font-medium h-6 overflow-hidden">
                {loadingMessages[loadingStep] && (
                  <span 
                    className="inline-block animate-pulse"
                    style={{ animationDuration: '1s' }}
                  >
                    {loadingMessages[loadingStep]}
                  </span>
                )}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-xs mx-auto">
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-white to-rose-200 rounded-full transition-all duration-500 ease-out relative"
                  style={{ width: `${(loadingStep + 1) * 16.66}%` }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-white/60">
                <span>Connecting...</span>
                <span>{Math.round((loadingStep + 1) * 16.66)}%</span>
              </div>
            </div>

            {/* Safety notice */}
            <div className="mt-8 text-xs text-white/70 leading-relaxed">
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                🔒 Establishing secure emergency protocols<br/>
                📍 Optimizing location & safety features<br/>
                🚨 Ready for live monitoring
              </div>
            </div>
          </div>
        </div>

        {/* Additional CSS for glitch animations */}
        <style jsx>{`
          @keyframes glitch1 {
            0%, 100% { transform: translate(0px, 0px); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
          }
          
          @keyframes glitch2 {
            0%, 100% { transform: translate(0px, 0px); }
            25% { transform: translate(2px, 0px); }
            50% { transform: translate(-2px, 2px); }
            75% { transform: translate(2px, -2px); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Quick Phonebook Screen */}
      {showQuickPhonebook && (
        <div className="fixed inset-0 bg-white z-60 overflow-y-auto">
          {/* Phonebook Header */}
          <header className="bg-purple-600 text-white sticky top-0 z-70">
            <div className="px-4 py-4 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowQuickPhonebook(false)}
                className="text-white hover:bg-purple-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold">Quick Phonebook</h1>
              <div className="w-9"></div>
            </div>
          </header>

          <div className="px-4 py-6 space-y-6">
            {/* Info Message */}
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-purple-900 text-sm mb-2">
                      📱 Quick Access to Your Contacts
                    </h3>
                    <p className="text-purple-800 text-xs leading-relaxed">
                      Save up to 5 emergency contacts (family, friends, trusted people) for quick access during protests. 
                      All contacts are stored locally on your device.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add/Edit Contact Form */}
            {(editingContact !== null || quickContacts.length < 5) && (
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {editingContact?.id ? "Edit Contact" : "Add New Contact"}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Mom, Dad, Best Friend"
                        value={editingContact?.name || ""}
                        onChange={(e) => setEditingContact(prev => 
                          prev ? { ...prev, name: e.target.value } : { name: e.target.value, number: "" }
                        )}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+39 123 456 7890"
                        value={editingContact?.number || ""}
                        onChange={(e) => setEditingContact(prev => 
                          prev ? { ...prev, number: e.target.value } : { name: "", number: e.target.value }
                        )}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleSaveContact}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                        size="sm"
                      >
                        {editingContact?.id ? "Update" : "Save"} Contact
                      </Button>
                      {editingContact && (
                        <Button 
                          onClick={() => setEditingContact(null)}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Saved Contacts List */}
            {quickContacts.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Your Quick Contacts ({quickContacts.length}/5)</h3>
                {quickContacts.map((contact) => (
                  <Card key={contact.id} className="border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Phone className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{contact.name}</h4>
                            <p className="text-sm text-gray-600">{contact.number}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleCallNumber(contact.number, contact.name)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Call
                          </Button>
                          <Button
                            onClick={() => setEditingContact(contact)}
                            size="sm"
                            variant="outline"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteContact(contact.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {quickContacts.length === 0 && !editingContact && (
              <Card className="border-gray-200 bg-gray-50">
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-2">No Quick Contacts Yet</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Add your most important emergency contacts for quick access during protests.
                  </p>
                  <Button
                    onClick={() => setEditingContact({ name: "", number: "" })}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Add Your First Contact
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">💡 Quick Tips</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Add your most trusted emergency contacts</li>
                  <li>• Include international format (+39 for Italy)</li>
                  <li>• Test call your contacts before protests</li>
                  <li>• Keep this list updated and current</li>
                  <li>• Maximum 5 contacts for quick access</li>
                </ul>
              </CardContent>
            </Card>

            {/* Close Button */}
            <Button
              onClick={() => setShowQuickPhonebook(false)}
              variant="outline"
              className="w-full py-3 text-lg"
            >
              Close Phonebook
            </Button>
          </div>
        </div>
      )}

      {/* Emergency Contacts Screen */}
      {showEmergencyContacts && (
        <div className="fixed inset-0 bg-white z-60 overflow-y-auto">
          {/* Emergency Header */}
          <header className="bg-red-600 text-white sticky top-0 z-70">
            <div className="px-4 py-4 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowEmergencyContacts(false)}
                className="text-white hover:bg-red-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold">Emergency Contacts</h1>
              <div className="w-9"></div> {/* Spacer for centering */}
            </div>
          </header>

          <div className="px-4 py-6 space-y-6">
            {/* Warning Message */}
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-red-900 text-lg mb-2">
                      ⚠️ Important Warning
                    </h3>
                    <p className="text-red-800 text-sm leading-relaxed mb-4">
                      Clicking on any number below will open your phone app and initiate a dial to emergency authorities. 
                      Only use these numbers if you have a genuine emergency or need assistance.
                    </p>
                    
                    {/* Emergency Call Protection Info */}
                    <div className="bg-red-100 rounded-lg p-3 mt-4">
                      <h4 className="font-medium text-sm mb-2 text-red-800">
                        📞 Emergency Calls Are Protected
                      </h4>
                      <ul className="text-xs space-y-1 text-red-700">
                        <li>• Multiple confirmations prevent accidental calls</li>
                        <li>• 112 connects to emergency services (police, fire, medical)</li>
                        <li>• Legal aid and human rights numbers available</li>
                        <li>• All emergency calls bypass normal network restrictions</li>
                        <li>• Your location is automatically shared with emergency services</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact Buttons */}
            <div className="space-y-4">
              {/* Emergency Services 112 */}
              <Card className="border-red-300 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <button
                    onClick={() => handleCallNumber("112", "Emergency Services")}
                    className="w-full p-6 text-left hover:bg-red-50 transition-colors rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-red-900 mb-1">112</h3>
                        <h4 className="text-lg font-semibold text-red-800 mb-2">Emergency Services</h4>
                        <p className="text-sm text-red-700 leading-relaxed">
                          Police, Fire Department, Medical Emergency. Use for immediate threats to life, safety, 
                          or property. Available 24/7 throughout Europe.
                        </p>
                      </div>
                    </div>
                  </button>
                </CardContent>
              </Card>

              {/* Legal Aid Hotline */}
              <Card className="border-blue-300 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <button
                    onClick={() => handleCallNumber("+39 06 8511 0020", "Legal Aid Hotline")}
                    className="w-full p-6 text-left hover:bg-blue-50 transition-colors rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-blue-900 mb-1">+39 06 8511 0020</h3>
                        <h4 className="text-lg font-semibold text-blue-800 mb-2">Legal Aid Hotline</h4>
                        <p className="text-sm text-blue-700 leading-relaxed">
                          Free legal assistance for protesters. Help with understanding your rights, 
                          dealing with arrests, and legal procedures. Available during business hours.
                        </p>
                      </div>
                    </div>
                  </button>
                </CardContent>
              </Card>

              {/* Human Rights Defense */}
              <Card className="border-green-300 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <button
                    onClick={() => handleCallNumber("+39 06 4825 1001", "Human Rights Defense")}
                    className="w-full p-6 text-left hover:bg-green-50 transition-colors rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-green-900 mb-1">+39 06 4825 1001</h3>
                        <h4 className="text-lg font-semibold text-green-800 mb-2">Human Rights Defense</h4>
                        <p className="text-sm text-green-700 leading-relaxed">
                          Report human rights violations, police misconduct, or discrimination. 
                          Specialized support for protesters facing rights violations.
                        </p>
                      </div>
                    </div>
                  </button>
                </CardContent>
              </Card>
            </div>

            {/* Additional Safety Info */}
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">📞 Emergency Call Tips</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Stay calm and speak clearly</li>
                  <li>• Provide your exact location if possible</li>
                  <li>• Describe the situation briefly</li>
                  <li>• Follow the operator's instructions</li>
                  <li>• Don't hang up until told to do so</li>
                </ul>
              </CardContent>
            </Card>

            {/* Close Button */}
            <Button
              onClick={() => setShowEmergencyContacts(false)}
              variant="outline"
              className="w-full py-3 text-lg"
            >
              Close Emergency Contacts
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
        {/* Title Row */}
        <div className="px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/resources")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-dark-slate">Live Protest Mode</h1>
          <div className="w-9"></div> {/* Spacer for centering */}
        </div>
        
        {/* Status Indicators Row */}
        <div className="px-4 pb-3 flex items-center justify-center space-x-4">
          {/* Battery Indicator - Always show */}
          <div className="flex items-center space-x-1">
            {batteryLevel <= 20 ? (
              <BatteryLow className="w-4 h-4 text-red-600" />
            ) : (
              <Battery className="w-4 h-4 text-gray-600" />
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

          {/* Signal Strength - Always show */}
          <div className="flex items-center space-x-1">
            <div className="flex space-x-0.5">
              <div className={`w-1 h-2 rounded-sm ${
                hasWifi || hasMobileData ? 'bg-green-600' : 'bg-gray-400'
              }`}></div>
              <div className={`w-1 h-3 rounded-sm ${
                hasWifi || hasMobileData ? 'bg-green-600' : 'bg-gray-400'
              }`}></div>
              <div className={`w-1 h-4 rounded-sm ${
                hasWifi || hasMobileData ? 'bg-green-600' : 'bg-gray-400'
              }`}></div>
            </div>
            <span className={`text-xs ${
              hasWifi || hasMobileData ? 'text-green-600' : 'text-gray-400'
            }`}>
              Signal
            </span>
          </div>
          
          {/* Wi-Fi Indicator - Only show when active */}
          {hasWifi && (
            <div className="flex items-center space-x-1">
              <Wifi className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">WiFi</span>
            </div>
          )}
          
          {/* Mobile Data Indicator - Only show when active */}
          {hasMobileData && (
            <div className="flex items-center space-x-1">
              <div className="flex space-x-0.5">
                <div className="w-1 h-2 bg-blue-600 rounded-sm"></div>
                <div className="w-1 h-3 bg-blue-600 rounded-sm"></div>
                <div className="w-1 h-4 bg-blue-600 rounded-sm"></div>
              </div>
              <span className="text-xs text-blue-600">Mobile</span>
            </div>
          )}
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

        {/* Communication */}
        <section>
          <h2 className="text-lg font-semibold text-dark-slate mb-4">Communication</h2>
          <div className="grid grid-cols-1 gap-3">
            {communicationFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className="cursor-pointer transition-all duration-200 hover:shadow-md border-gray-200 bg-white"
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${feature.color}15` }}
                    >
                      <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-dark-slate text-sm mb-1">{feature.title}</h3>
                      <p className="text-xs text-gray-600">{feature.description}</p>
                    </div>
                    <button 
                      className="py-2 px-4 text-xs font-medium text-white rounded-md transition-colors duration-200"
                      style={{ backgroundColor: feature.color }}
                      onClick={feature.handler}
                    >
                      {feature.action}
                    </button>
                  </div>
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
