import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, MapPin, ChevronDown, RefreshCw } from "lucide-react";
import { getCachedUserLocation } from "@/lib/geolocation";
import { calculateDistance } from "@/lib/distance-utils";
import { findCityCoordinates } from "@/lib/geocoding";
import { ProtestCard } from "@/components/protest-card";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useFeaturedProtests, useNearbyProtests } from "@/hooks/use-protests";
import { useUser } from "@/hooks/use-user";
import { useWhatsNew } from "@/hooks/use-whats-new";
import { useLocation } from "wouter";
import { LocationSelector } from "@/components/location-selector";

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    return localStorage.getItem('corteo_selected_country') || 'it';
  });
  const [userRealLocation, setUserRealLocation] = useState<string | null>(null);
  const [manualLocation, setManualLocation] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState<{latitude: number, longitude: number} | null>(null);
  const [manualLocationCoordinates, setManualLocationCoordinates] = useState<{latitude: number, longitude: number} | null>(null);
  const [, setLocation] = useLocation();

  // Determine which coordinates to use for distance calculation
  const referenceCoordinates = manualLocationCoordinates || userCoordinates;

  const { data: featuredProtests = [], isLoading: featuredLoading } = useFeaturedProtests(selectedCountry);
  const { data: nearbyProtests = [], isLoading: nearbyLoading } = useNearbyProtests(
    selectedCountry, 
    referenceCoordinates?.latitude, 
    referenceCoordinates?.longitude
  );
  const { data: user } = useUser();

  // Map selected country to country code for What's new filtering
  const countryCodeMapping = {
    'it': 'IT',
    'us': 'US',
    'uk': 'UK'
  };
  const whatsNewCountryCode = countryCodeMapping[selectedCountry as keyof typeof countryCodeMapping] || selectedCountry.toUpperCase();

  const { data: whatsNewData = [], isLoading: whatsNewLoading } = useWhatsNew(whatsNewCountryCode);

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
      setManualLocationCoordinates(null);
      localStorage.removeItem('corteo_manual_location');
      localStorage.removeItem('corteo_manual_location_coords');
    } else {
      setManualLocation(location);
      localStorage.setItem('corteo_manual_location', location);

      // Get coordinates for the manually selected location
      const [city] = location.split(', ');
      const cityData = findCityCoordinates(city, selectedCountry);

      if (cityData) {
        const coords = { latitude: cityData.lat, longitude: cityData.lng };
        setManualLocationCoordinates(coords);
        localStorage.setItem('corteo_manual_location_coords', JSON.stringify(coords));
        console.log(`📍 Manual location coordinates for ${city} (${selectedCountry.toUpperCase()}):`, coords);
      } else {
        console.warn(`❌ No coordinates found for ${city} in ${selectedCountry.toUpperCase()}`);
        setManualLocationCoordinates(null);
        localStorage.removeItem('corteo_manual_location_coords');
      }
    }
  };

  // Get user's real location using geolocation API
  const fetchUserRealLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const locationResult = await getCachedUserLocation();
      setUserRealLocation(locationResult.formatted);
      setUserCoordinates(locationResult.coordinates);
    } catch (error) {
      console.error('Failed to get user location:', error);
      setUserRealLocation(null);
      setUserCoordinates(null);
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

    // Load manual location coordinates from localStorage
    const savedManualCoords = localStorage.getItem('corteo_manual_location_coords');
    if (savedManualCoords) {
      try {
        const coords = JSON.parse(savedManualCoords);
        setManualLocationCoordinates(coords);
      } catch (error) {
        console.error('Error parsing saved manual location coordinates:', error);
      }
    }
  }, []);

  // Fetch user's real location on component mount
  useEffect(() => {
    fetchUserRealLocation();
  }, []);

  // Sort protests by distance from user location
  const sortProtestsByDistance = (protests: any[]) => {
    if (!protests.length) return protests;

    // Use manual location coordinates if available, otherwise use real user coordinates
    const referenceCoords = manualLocationCoordinates || userCoordinates;
    if (!referenceCoords) return protests;

    return [...protests].sort((a, b) => {
      // Check if protests have valid coordinates
      const aLat = parseFloat(a.latitude);
      const aLng = parseFloat(a.longitude);
      const bLat = parseFloat(b.latitude);
      const bLng = parseFloat(b.longitude);

      if (isNaN(aLat) || isNaN(aLng)) return 1; // Move invalid coordinates to end
      if (isNaN(bLat) || isNaN(bLng)) return -1;

      const distanceA = calculateDistance(
        referenceCoords.latitude,
        referenceCoords.longitude,
        aLat,
        aLng
      );

      const distanceB = calculateDistance(
        referenceCoords.latitude,
        referenceCoords.longitude,
        bLat,
        bLng
      );

      return distanceA - distanceB; // Sort by distance, closest first
    });
  };

  // Get location name from selected country in city, state format
  const getLocationName = () => {
    switch(selectedCountry) {
      case 'it': return 'Milan, IT';
      case 'us': return 'Los Angeles, CA';
      case 'uk': return 'London, UK';
      default: return 'Unknown Location';
    }
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case "home":
        // Already on home page
        break;
      case "discover":
        setLocation("/discover");
        break;
      case "resources":
        setLocation("/resources");
        break;
      case "saved":
        setLocation("/saved");
        break;
      case "profile":
        setLocation("/profile");
        break;
    }
  };

  // Use manual location if available, otherwise use real user location, otherwise fallback
  const displayLocation = manualLocation || userRealLocation || user?.user_location || getLocationName();
  // Parse location to get city only (remove region/state)
  const [city] = displayLocation.split(', ');

  return (
    <div className="max-w-md mx-auto min-h-screen content-transparent">
      {/* Main Content */}
      <main className="flex-1 pb-20">
        <div className="px-4 py-4 max-w-md mx-auto">
          {/* Location Section with Notification Bell */}
          <section className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Your location</span>
                </div>
                <LocationSelector
                  currentLocation={displayLocation}
                  selectedCountry={selectedCountry}
                  onLocationSelect={handleLocationSelect}
                  onCountryChange={handleCountryChange}
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

              <div className="flex items-center gap-2">
                {/* Refresh location button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchUserRealLocation}
                  disabled={isLoadingLocation}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingLocation ? 'animate-spin' : ''}`} />
                </Button>

                {/* Notification bell */}
                <Button variant="ghost" size="sm">
                  <Bell className="w-5 h-5 text-gray-600" />
                </Button>
              </div>
            </div>
          </section>

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
                          onError={(e) => {
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
                sortProtestsByDistance(nearbyProtests).slice(0, 10).map((protest, index) => (
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
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}