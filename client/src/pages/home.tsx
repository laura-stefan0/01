import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Bell, Users, MapPin, Search, Shield, CheckSquare, Lock, BookOpen, Target, Printer, Phone, Heart, ChevronDown, RefreshCw } from "lucide-react";
import { getCachedUserLocation } from "@/lib/geolocation";
import { ProtestCard } from "@/components/protest-card";
import { BottomNavigation } from "@/components/bottom-navigation";
import { MapView } from "@/components/map-view";
import { useFeaturedProtests, useNearbyProtests } from "@/hooks/use-protests";
import { useUser } from "@/hooks/use-user";
import { useWhatsNew } from "@/hooks/use-whats-new";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { useLocation } from "wouter";
import { LocationSelector } from "@/components/location-selector";

export default function Home() {
  const [activeTab, setActiveTab] = useState(() => {
    // Check URL parameters for tab
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tab') || "home";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoadingProtests, setIsLoadingProtests] = useState(true);
  const [allProtests, setAllProtests] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    return localStorage.getItem('corteo_selected_country') || 'it';
  });
  const [userRealLocation, setUserRealLocation] = useState<string | null>(null);
  const [manualLocation, setManualLocation] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [, setLocation] = useLocation();

  const { data: featuredProtests = [], isLoading: featuredLoading } = useFeaturedProtests(selectedCountry);
  const { data: nearbyProtests = [], isLoading: nearbyLoading } = useNearbyProtests(selectedCountry);
  const { data: user } = useUser();

  // Map selected country to country code for What's new filtering
  const countryCodeMapping = {
    'it': 'IT',
    'us': 'US',
    'uk': 'UK'
  };
  const whatsNewCountryCode = countryCodeMapping[selectedCountry as keyof typeof countryCodeMapping] || selectedCountry.toUpperCase();

  const { data: whatsNewData = [], isLoading: whatsNewLoading } = useWhatsNew(whatsNewCountryCode);
  const { signOut, isAuthenticated } = useAuth();

  // Handle country selection change
  const handleCountryChange = (newCountry: string) => {
    setSelectedCountry(newCountry);
    localStorage.setItem('corteo_selected_country', newCountry);
  };

  // Handle manual location selection
  const handleLocationSelect = (location: string) => {
    if (location === "") {
      // Reset to automatic location detection
      setManualLocation(null);
      localStorage.removeItem('corteo_manual_location');
    } else {
      setManualLocation(location);
      localStorage.setItem('corteo_manual_location', location);
    }
  };

  // Get user's real location using geolocation API
  const fetchUserRealLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const locationResult = await getCachedUserLocation();
      setUserRealLocation(locationResult.formatted);
    } catch (error) {
      console.error('Failed to get user location:', error);
      setUserRealLocation(null);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Initialize country and manual location from localStorage
  useEffect(() => {
    const savedCountry = localStorage.getItem('corteo_selected_country');
    if (savedCountry) {
      setSelectedCountry(savedCountry);
    }

    const savedManualLocation = localStorage.getItem('corteo_manual_location');
    if (savedManualLocation) {
      setManualLocation(savedManualLocation);
    }
  }, []);

  // Fetch user's real location on component mount
  useEffect(() => {
    fetchUserRealLocation();
  }, []);

  // Get location name from selected country in city, state format
  const getLocationName = () => {
    switch(selectedCountry) {
      case 'it': return 'Milan, IT';
      case 'us': return 'Los Angeles, CA';
      case 'uk': return 'London, UK';
      default: return 'Unknown Location';
    }
  };

  // Handle tab change and update URL
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "home") {
      // Clear URL parameter for home tab
      window.history.pushState({}, '', '/');
    } else {
      // Update URL with tab parameter
      window.history.pushState({}, '', `/?tab=${tab}`);
    }
  };

  // Combine protests data for map view
  useEffect(() => {
    if (featuredProtests.length > 0 || nearbyProtests.length > 0) {
      const combinedProtests = [...featuredProtests, ...nearbyProtests];
      const uniqueProtests = combinedProtests.filter((protest, index, self) =>
        index === self.findIndex((p) => p.id === protest.id)
      );
      setAllProtests(uniqueProtests);
    }
    setIsLoadingProtests(featuredLoading || nearbyLoading);
  }, [featuredProtests.length, nearbyProtests.length, featuredLoading, nearbyLoading]);

  const filters = [
    { id: "all", label: "All" },
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "popular", label: "Popular" },
  ];

  // Format timestamp for display
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  const renderHomeContent = () => (
    <div className="px-4 py-4 max-w-md mx-auto">
      {/* News Section */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-dark-slate mb-3">What's new</h2>
        <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {whatsNewLoading ? (
            <>
              <Skeleton className="w-48 h-32 flex-shrink-0" />
              <Skeleton className="w-48 h-32 flex-shrink-0" />
              <Skeleton className="w-48 h-32 flex-shrink-0" />
            </>
          ) : whatsNewData.length > 0 ? (
            whatsNewData.map((news) => {
                console.log('📄 News item:', news.title);
                console.log('🖼️ Image URL:', news.image_url);
                console.log('📊 Full news object:', news);

                const handleCardClick = () => {
                  // Check if there's a CTA URL to navigate to
                  if (news.cta_url) {
                    if (news.cta_url.startsWith('http://') || news.cta_url.startsWith('https://')) {
                      // External URL - open in new tab
                      window.open(news.cta_url, '_blank');
                    } else if (news.cta_url.startsWith('/')) {
                      // Internal route - navigate within app
                      setLocation(news.cta_url);
                    } else {
                      // Relative URL - treat as internal route
                      setLocation(`/${news.cta_url}`);
                    }
                  }
                };

                return (
                  <div 
                    key={news.id} 
                    className={`relative w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 ${
                      news.cta_url ? 'cursor-pointer' : ''
                    }`}
                    onClick={handleCardClick}
                    role={news.cta_url ? 'button' : undefined}
                    tabIndex={news.cta_url ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (news.cta_url && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleCardClick();
                      }
                    }}
                  >
                    {news.image_url ? (
                      <img 
                        src={news.image_url} 
                        alt={news.title}
                        className="w-full h-full object-cover"
                        onLoad={() => console.log('✅ Image loaded successfully:', news.image_url)}
                        onError={(e) => {
                          console.error('❌ Image failed to load:', news.image_url);
                          // Show text-based card instead of hiding
                          const imgElement = e.currentTarget as HTMLImageElement;
                          const parentDiv = imgElement.parentElement;
                          if (parentDiv) {
                            parentDiv.innerHTML = `
                              <div class="w-full h-full bg-gradient-to-br from-activist-blue to-activist-blue/80 flex flex-col justify-center items-center p-3 text-white">
                                <h3 class="text-sm font-semibold text-center leading-tight mb-1">${news.title}</h3>
                                ${news.cta_text ? `<p class="text-xs opacity-90 text-center">${news.cta_text}</p>` : ''}
                              </div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      // Show text-based card for items without images
                      <div className="w-full h-full bg-gradient-to-br from-activist-blue to-activist-blue/80 flex flex-col justify-center items-center p-3 text-white">
                        <h3 className="text-sm font-semibold text-center leading-tight mb-1">{news.title}</h3>
                        {news.cta_text && (
                          <p className="text-xs opacity-90 text-center">{news.cta_text}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
          ) : (
            <div className="w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"></div>
          )}
        </div>
      </section>

      {/* Featured Section */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-dark-slate">Featured</h2>
        </div>

        {/* Horizontal Scrolling Featured Cards - Wider */}
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {featuredLoading ? (
            <>
              <Skeleton className="w-5/6 h-56 flex-shrink-0" />
              <Skeleton className="w-5/6 h-56 flex-shrink-0" />
              <Skeleton className="w-5/6 h-56 flex-shrink-0" />
            </>
          ) : (
            featuredProtests.map((protest, index) => (
              <div key={`featured-${protest.id}-${index}`} className="w-5/6 flex-shrink-0">
                <ProtestCard protest={protest} variant="featured" />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Nearby */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-dark-slate mb-3">Nearby</h2>

        {/* Vertical List of Protest Cards */}
        <div className="space-y-3">
          {nearbyLoading ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : nearbyProtests.length > 0 ? (
            nearbyProtests.slice(0, 10).map((protest, index) => (
              <ProtestCard key={`nearby-${protest.id}-${index}`} protest={protest} />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No protests found</p>
            </div>
          )}
        </div>
      </section>

      {/* Donations Section */}
      <section>
        <h2 className="text-lg font-semibold text-dark-slate mb-3">Support Us</h2>
        <Card className="bg-activist-blue">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 text-white">Make a Difference</h3>
            <p className="text-sm mb-3 text-white">Your donation helps support activists and organizations fighting for change.</p>
            <Button className="w-full bg-white text-activist-blue hover:bg-gray-100">
              Donate Now
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );

  const renderCommunityContent = () => (
    <div className="px-4 py-4 max-w-md mx-auto">
      <div className="text-center py-16">
        <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-dark-slate mb-2">Community Features</h3>
        <p className="text-gray-600 mb-4">Connect with like-minded activists and organizers in your area.</p>
        <p className="text-sm text-gray-500">Coming Soon</p>
      </div>
    </div>
  );

  const renderProfileContent = () => (
    <div className="px-4 py-4 space-y-4 max-w-md mx-auto">
      {/* Profile Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full flex-shrink-0 overflow-hidden bg-gray-200">
              <img 
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face" 
                alt="Profile picture"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-dark-slate text-lg">
                Jane
              </h3>
              <p className="text-gray-600 text-sm">
                @janedoe
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                Edit profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-dark-slate">Settings</h3>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="w-5 h-5 mr-3 text-gray-400" />
                <Label htmlFor="notifications">Notifications</Label>
              </div>
              <Switch id="notifications" defaultChecked />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                <Label htmlFor="location">Location Services</Label>
              </div>
              <Switch id="location" defaultChecked />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-5 h-5 mr-3 text-gray-400">📧</div>
                <Label htmlFor="emails">Email Updates</Label>
              </div>
              <Switch id="emails" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-5 h-5 mr-3 text-gray-400">🌙</div>
                <Label htmlFor="darkmode">Dark Mode</Label>
              </div>
              <Switch id="darkmode" />
            </div>
            <div className="p-4">
              <Button 
                className="w-full bg-activist-blue hover:bg-activist-blue/90 text-white"
                onClick={() => setLocation("/create-protest")}
                disabled={!isAuthenticated}
              >
                {isAuthenticated ? "Create New Protest" : "Sign In to Create Protests"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Country Selection */}
      <Card data-country-selector>
        <CardContent className="p-4">
          <h3 className="font-semibold text-dark-slate mb-3">Country</h3>
          <Select value={selectedCountry} onValueChange={handleCountryChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="bottom" align="start">
              <SelectItem value="it">Italy</SelectItem>
              <SelectItem value="us">United States</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Language Selection */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-dark-slate mb-3">Language</h3>
          <Select defaultValue="en">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top" align="start">
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="p-0 divide-y divide-gray-100">
          <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50" onClick={() => setLocation("/transparency")}>
            <span className="text-dark-slate">Transparency</span>
            <div className="w-4 h-4 text-gray-400">→</div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-dark-slate">Privacy Policy</span>
            <div className="w-4 h-4 text-gray-400">→</div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-dark-slate">Terms of Service</span>
            <div className="w-4 h-4 text-gray-400">→</div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-dark-slate">About Corteo</span>
            <span className="text-sm text-gray-500">v1.0.0</span>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out Button */}
      <Button 
        onClick={signOut}
        className="w-full bg-rally-red hover:bg-rally-red/90 text-white"
      >
        Sign Out
      </Button>
    </div>
  );

  const renderMapContent = () => {

    return (
      <div className="px-4 py-4 max-w-md mx-auto">
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-dark-slate mb-3">All Protests</h2>

          <div className="space-y-3">
            {isLoadingProtests ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : allProtests.length > 0 ? (
              allProtests
                .filter((protest) => {
                  if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    return (
                      protest.title.toLowerCase().includes(query) ||
                      protest.description.toLowerCase().includes(query) ||
                      protest.category.toLowerCase().includes(query) ||
                      protest.location.toLowerCase().includes(query)
                    );
                  }
                  return true;
                })
                .filter((protest) => {
                  if (activeFilter === "today") {
                    return protest.date === "Today";
                  } else if (activeFilter === "week") {
                    return ["Today", "Tomorrow"].includes(protest.date) || protest.date.startsWith("Next");
                  } else if (activeFilter === "popular") {
                    return protest.attendees > 500;
                  }
                  return true;
                })
                .map((protest, index) => (
                  <ProtestCard key={`map-${protest.id}-${index}`} protest={protest} />
                ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No protests found</p>
              </div>
            )}
          </div>
        </section>

        {/* View on Map Button */}
        <div className="mt-6 mb-4">
          <Button
            className="w-full bg-activist-blue hover:bg-activist-blue/90 text-white"
            size="lg"
            onClick={() => {
              setActiveTab("map");
              // Add a small delay to ensure the tab change happens first
              setTimeout(() => {
                // Trigger map view in the MapView component
                const event = new CustomEvent('showMapView');
                window.dispatchEvent(event);
              }, 100);
            }}
          >
            <MapPin className="w-5 h-5 mr-2" />
            View on Map
          </Button>
        </div>
      </div>
    );
  };



  const renderResourcesContent = () => {
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
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3">
          {protestResources.map((resource, index) => (
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
    );
  };

  const SavedProtestsSection = () => {
    // TODO: Implement saved protests functionality
    // This will store user's saved protests and display them here

    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-medium text-dark-slate mb-2">No Saved Protests Yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Save protests you're interested in to view them here later.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleTabChange("home")}
          >
            Browse Protests
          </Button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    return (
      <div key={activeTab} className="animate-in fade-in duration-300">
        {activeTab === "home" && renderHomeContent()}
        {activeTab === "map" && <MapView />}
        {activeTab === "resources" && renderResourcesContent()}
        {activeTab === "saved" && <SavedProtestsSection />}
        {activeTab === "profile" && renderProfileContent()}
        {!["home", "map", "resources", "saved", "profile"].includes(activeTab) && renderHomeContent()}
      </div>
    );
  };

  const getHeaderContent = () => {
    if (activeTab === "home") {
      // Use manual location if available, otherwise use real user location, otherwise fallback
      const displayLocation = manualLocation || userRealLocation || user?.user_location || getLocationName();
      // Parse location to get city only (remove region/state)
      const [city] = displayLocation.split(', ');

      return (
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Your location</span>
            </div>
            <LocationSelector
              currentLocation={displayLocation}
              selectedCountry={selectedCountry}
              onLocationSelect={handleLocationSelect}
            >
              <button className="flex items-center gap-1 hover:text-gray-800 transition-colors font-medium text-left mt-1">
                {isLoadingLocation ? (
                  <span className="text-gray-500">Getting location...</span>
                ) : (
                  <span>{city}</span>
                )}
                <ChevronDown className="w-3 h-3" />
              </button>
            </LocationSelector>
          </div>

          {/* Refresh location button */}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={fetchUserRealLocation}
            disabled={isLoadingLocation}
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingLocation ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      );
    }

    switch (activeTab) {
      case "map":
        return "Search";
      case "resources":
        return "Resources";
      case "saved":
        return "Saved";
      case "profile":
        return "Profile";
      default:
        return "Home";
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative flex flex-col">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100 flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              {typeof getHeaderContent() === 'string' ? (
                <h1 className="text-xl font-bold text-dark-slate">{getHeaderContent()}</h1>
              ) : (
                <div className="text-xl font-bold text-dark-slate">{getHeaderContent()}</div>
              )}
            </div>
            {activeTab === "home" && (
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5 text-gray-600" />
              </Button>
            )}
          </div>


        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}