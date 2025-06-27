import { useState, useEffect, useRef } from "react";
import { useProtests } from "@/hooks/use-protests";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, MapPin, ChevronUp, List } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ProtestCard } from "@/components/protest-card";

import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import type { Protest } from "@shared/schema";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { geocodeLocation, findItalianCity, type GeocodeResult } from "@/lib/geocoding";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map centering
function MapCenterUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      console.log("Centering map on:", center);
      map.setView(center, 15);
    }
  }, [center, map]);
  
  return null;
}

// Component to track map bounds for filtering protests
function MapBoundsUpdater({ onBoundsChange }: { onBoundsChange: (bounds: L.LatLngBounds) => void }) {
  const map = useMap();
  
  useEffect(() => {
    const updateBounds = () => {
      const bounds = map.getBounds();
      onBoundsChange(bounds);
    };
    
    // Update bounds initially
    updateBounds();
    
    // Update bounds when map moves
    map.on('moveend', updateBounds);
    map.on('zoomend', updateBounds);
    
    return () => {
      map.off('moveend', updateBounds);
      map.off('zoomend', updateBounds);
    };
  }, [map, onBoundsChange]);
  
  return null;
}

// Custom marker icons based on category
const createCategoryIcon = (category: string) => {
  const colors = {
    'Climate': '#22c55e',
    'Environment': '#22c55e', 
    'Pride': '#ec4899',
    'LGBTQ+': '#ec4899',
    'Workers': '#f59e0b',
    'Justice': '#ef4444',
    'Education': '#3b82f6'
  };
  
  const color = colors[category as keyof typeof colors] || '#6b7280';
  
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

export function MapView() {
  const { data: protests = [], isLoading } = useProtests();
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchLocation, setSearchLocation] = useState<[number, number] | null>(null);
  const [searchLocationName, setSearchLocationName] = useState<string>("");
  const [isLocating, setIsLocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [, setLocation] = useLocation();

  const filters = [
    { id: "all", label: "All" },
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "popular", label: "Popular" },
  ];
  const [activeFilter, setActiveFilter] = useState("all");

  // GPS location function
  const getUserLocation = () => {
    setIsLocating(true);
    console.log("GPS button clicked - starting fresh location request");
    
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser");
      setIsLocating(false);
      alert("Location services are not supported by your browser");
      return;
    }

    // Clear any previous user location first
    setUserLocation(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const locationDate = new Date(position.timestamp);
        console.log("Fresh location found:", {
          latitude, 
          longitude, 
          accuracy: accuracy + " meters",
          timestamp: locationDate.toLocaleString(),
          age: (Date.now() - position.timestamp) / 1000 + " seconds old"
        });
        
        // Check if location seems reasonable (not clearly cached/wrong)
        if (accuracy > 1000) {
          console.warn("Location accuracy is very low:", accuracy, "meters");
          setIsLocating(false);
          const message = `Location accuracy is very low (${Math.round(accuracy/1000)}km). This might be cached data.\n\nOptions:\n- Check your device's location services\n- Try again in a few seconds\n- Make sure you're not using a VPN`;
          alert(message);
          return;
        }
        
        setUserLocation([latitude, longitude]);
        setIsLocating(false);
        
        // Show success message with accuracy
        console.log("Map centered on your location with", Math.round(accuracy), "meter accuracy");
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
        
        let errorMessage = "Unable to get your location. ";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please allow location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable. Please check your device's location services.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out. Please try again.";
            break;
          default:
            errorMessage += "An unknown error occurred.";
            break;
        }
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0 // Force fresh location, no cache
      }
    );
  };

  // Handle search input with geocoding
  const handleSearchChange = async (value: string) => {
    setSearchQuery(value);
    
    // Reset search location when query is cleared
    if (!value.trim()) {
      setSearchLocation(null);
      setSearchLocationName("");
      return;
    }
    
    // If query looks like a city/address search (no protest matches found)
    const query = value.toLowerCase().trim();
    const hasProtestMatches = protests.some(protest => {
      const searchFields = [
        protest.title?.toLowerCase() || '',
        protest.description?.toLowerCase() || '',
        protest.category?.toLowerCase() || '',
        protest.location?.toLowerCase() || '',
        protest.address?.toLowerCase() || '',
        protest.organizer?.toLowerCase() || ''
      ];
      return searchFields.some(field => field.includes(query));
    });
    
    // If no protest matches and query looks like a location, try geocoding
    if (!hasProtestMatches && query.length >= 3) {
      setIsGeocoding(true);
      
      try {
        // First try Italian cities lookup for faster response
        const italianCity = findItalianCity(query);
        if (italianCity) {
          console.log(`🏛️ Found Italian city: ${italianCity.name}`);
          setSearchLocation([italianCity.lat, italianCity.lng]);
          setSearchLocationName(italianCity.name);
          setIsGeocoding(false);
          return;
        }
        
        // If not found in Italian cities, try full geocoding
        const geocodeResult = await geocodeLocation(query);
        if (geocodeResult) {
          console.log(`🌍 Geocoded location: ${geocodeResult.displayName}`);
          setSearchLocation([geocodeResult.latitude, geocodeResult.longitude]);
          setSearchLocationName(geocodeResult.city || geocodeResult.displayName);
        } else {
          setSearchLocation(null);
          setSearchLocationName("");
        }
      } catch (error) {
        console.error('Geocoding failed:', error);
        setSearchLocation(null);
        setSearchLocationName("");
      } finally {
        setIsGeocoding(false);
      }
    }
  };

  // Filter protests based on search and active filter
  const filteredProtests = protests
    .filter((protest) => {
      // Filter by search query - search in title, description, category, location, and address
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        if (query.length === 0) return true;
        
        console.log(`🔍 Searching for: "${query}"`);
        
        const searchFields = [
          protest.title?.toLowerCase() || '',
          protest.description?.toLowerCase() || '',
          protest.category?.toLowerCase() || '',
          protest.location?.toLowerCase() || '',
          protest.address?.toLowerCase() || '',
          protest.organizer?.toLowerCase() || ''
        ];
        
        const matches = searchFields.some(field => field.includes(query));
        
        if (matches) {
          console.log(`✅ Match found: ${protest.title} in ${protest.location}`);
        }
        
        return matches;
      }
      return true;
    })
    .filter((protest) => {
      // Filter by date/time filters
      if (activeFilter === "today") {
        return protest.date === "Today";
      } else if (activeFilter === "week") {
        return ["Today", "Tomorrow"].includes(protest.date) || protest.date.startsWith("Next");
      } else if (activeFilter === "popular") {
        return protest.attendees > 500;
      }
      return true;
    });

  // Calculate map center - prioritize search location, then filtered protests, then all protests
  let mapCenter: [number, number];
  let mapZoom: number;
  
  if (searchLocation) {
    // If we found a location via geocoding, center on it
    mapCenter = searchLocation;
    mapZoom = 12;
    console.log(`🗺️ Centering map on searched location: ${searchLocationName}`);
  } else {
    // Otherwise, use protest-based centering
    const protestsForCenter = searchQuery && searchQuery.trim().length > 0 ? filteredProtests : protests;
    const validProtests = protestsForCenter.filter(p => p.latitude && p.longitude && !isNaN(parseFloat(p.latitude)) && !isNaN(parseFloat(p.longitude)));
    
    mapCenter = validProtests.length > 0 
      ? [
          validProtests.reduce((sum, p) => sum + parseFloat(p.latitude), 0) / validProtests.length,
          validProtests.reduce((sum, p) => sum + parseFloat(p.longitude), 0) / validProtests.length
        ]
      : [41.9028, 12.4964]; // Default to Rome, Italy
    
    mapZoom = searchQuery && filteredProtests.length > 0 ? 12 : filteredProtests.length > 0 ? 10 : 6;
  }
  
  // Debug logging for search results
  if (searchQuery && searchQuery.trim().length > 0) {
    console.log(`🔍 Search results: ${filteredProtests.length} protests found for "${searchQuery}"`);
  }

  // Filter protests that are visible in current map bounds
  const protestsInView = mapBounds 
    ? filteredProtests.filter(protest => {
        if (!protest.latitude || !protest.longitude) return false;
        const lat = parseFloat(protest.latitude);
        const lng = parseFloat(protest.longitude);
        return mapBounds.contains([lat, lng]);
      })
    : filteredProtests;

  return (
    <div className="relative h-full">
      {/* Map Container - Full Height */}
      <div className="h-[calc(100vh-140px)] relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        ) : (
          <>
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              className="h-full w-full"
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              key={searchLocation ? `search-${searchLocation[0]}-${searchLocation[1]}` : 'default'}
            >
              <MapCenterUpdater center={userLocation} />
              <MapBoundsUpdater onBoundsChange={setMapBounds} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredProtests
                .filter(protest => protest.latitude && protest.longitude)
                .map((protest) => (
                  <Marker
                    key={protest.id}
                    position={[parseFloat(protest.latitude), parseFloat(protest.longitude)]}
                    icon={createCategoryIcon(protest.category)}
                  >
                    <Popup>
                      <div className="p-2 max-w-xs">
                        <h3 className="font-semibold text-sm mb-1">{protest.title}</h3>
                        <p className="text-xs text-gray-600 mb-2">{protest.location}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">{protest.date} • {protest.time}</span>
                          <Badge className={`text-xs px-2 py-1 ${
                            protest.category === 'Climate' || protest.category === 'Environment' ? 'bg-green-100 text-green-800' :
                            protest.category === 'Pride' || protest.category === 'LGBTQ+' ? 'bg-pink-100 text-pink-800' :
                            protest.category === 'Workers' ? 'bg-amber-100 text-amber-800' :
                            protest.category === 'Justice' ? 'bg-red-100 text-red-800' :
                            protest.category === 'Education' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {protest.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-700 mt-2 line-clamp-2">{protest.description}</p>
                        <Button 
                          size="sm" 
                          className="w-full mt-2 bg-activist-blue hover:bg-activist-blue/90"
                          onClick={() => setLocation(`/protest/${protest.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              
              {/* User Location Marker */}
              {userLocation && (
                <Marker
                  position={userLocation}
                  icon={new L.Icon({
                    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="8" fill="#3b82f6" stroke="white" stroke-width="2"/>
                        <circle cx="10" cy="10" r="3" fill="white"/>
                      </svg>
                    `),
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                  })}
                >
                  <Popup>
                    <div className="text-center">
                      <p className="font-semibold text-sm">Your Location</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* Search Location Marker */}
              {searchLocation && (
                <Marker
                  position={searchLocation}
                  icon={new L.Icon({
                    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" fill="#f59e0b" stroke="white" stroke-width="2"/>
                        <path d="M12 6v6l4 2" stroke="white" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    `),
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                  })}
                >
                  <Popup>
                    <div className="text-center">
                      <p className="font-semibold text-sm">{searchLocationName}</p>
                      <p className="text-xs text-gray-500">Searched location</p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>

            {/* Overlay Search Controls - Airbnb Style */}
            <div className="absolute top-4 left-4 right-4 z-[1000]">
              <div className="bg-white rounded-full shadow-lg border border-gray-200 p-2">
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="Search protests, cities, or addresses..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10 pr-10 py-3 border-0 bg-transparent text-sm placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    {isGeocoding ? (
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    )}
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSearchLocation(null);
                          setSearchLocationName("");
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="h-6 w-px bg-gray-300"></div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setLocation("/filter")}
                    className="px-3 py-2 hover:bg-gray-50 rounded-full"
                  >
                    <Filter className="w-4 h-4 text-gray-600 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>
              
              {/* Search Results Dropdown */}
              {searchQuery && searchQuery.trim().length > 0 && (
                <div className="mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                  {/* Location Result */}
                  {searchLocation && searchLocationName && (
                    <div className="p-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{searchLocationName}</p>
                          <p className="text-sm text-gray-500">Location</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Protest Results */}
                  {filteredProtests.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {filteredProtests.slice(0, 5).map((protest) => (
                        <div 
                          key={protest.id}
                          className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => setLocation(`/protest/${protest.id}`)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              protest.category === 'Climate' || protest.category === 'Environment' ? 'bg-green-100' :
                              protest.category === 'Pride' || protest.category === 'LGBTQ+' ? 'bg-pink-100' :
                              protest.category === 'Workers' ? 'bg-amber-100' :
                              protest.category === 'Justice' ? 'bg-red-100' :
                              protest.category === 'Education' ? 'bg-blue-100' :
                              'bg-gray-100'
                            }`}>
                              <div className={`w-3 h-3 rounded-full ${
                                protest.category === 'Climate' || protest.category === 'Environment' ? 'bg-green-500' :
                                protest.category === 'Pride' || protest.category === 'LGBTQ+' ? 'bg-pink-500' :
                                protest.category === 'Workers' ? 'bg-amber-500' :
                                protest.category === 'Justice' ? 'bg-red-500' :
                                protest.category === 'Education' ? 'bg-blue-500' :
                                'bg-gray-500'
                              }`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{protest.title}</p>
                              <p className="text-sm text-gray-600 truncate">{protest.location}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={`text-xs ${
                                  protest.category === 'Climate' || protest.category === 'Environment' ? 'bg-green-100 text-green-800' :
                                  protest.category === 'Pride' || protest.category === 'LGBTQ+' ? 'bg-pink-100 text-pink-800' :
                                  protest.category === 'Workers' ? 'bg-amber-100 text-amber-800' :
                                  protest.category === 'Justice' ? 'bg-red-100 text-red-800' :
                                  protest.category === 'Education' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {protest.category}
                                </Badge>
                                <span className="text-xs text-gray-500">{protest.date} • {protest.time}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredProtests.length > 5 && (
                        <div className="p-3 text-center border-t border-gray-100">
                          <p className="text-sm text-gray-500">
                            {filteredProtests.length - 5} more results found
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    !searchLocation && (
                      <div className="p-4 text-center">
                        <p className="text-sm text-gray-500">No protests found for "{searchQuery}"</p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Filter Tags Overlay */}
            {(searchQuery || activeFilter !== "all") && (
              <div className="absolute top-20 left-4 right-4 z-[1000]">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                  {searchQuery && (
                    <div className="text-sm text-gray-600 mb-2">
                      {searchLocation ? (
                        <>
                          📍 Showing location: <strong>{searchLocationName}</strong>
                          {filteredProtests.length > 0 && (
                            <> · {filteredProtests.length} protest{filteredProtests.length !== 1 ? 's' : ''} found</>
                          )}
                        </>
                      ) : (
                        <>
                          {filteredProtests.length} result{filteredProtests.length !== 1 ? 's' : ''} found
                          {searchQuery && ` for "${searchQuery}"`}
                        </>
                      )}
                    </div>
                  )}
                  <div className="flex space-x-2 overflow-x-auto pb-1">
                    {filters.map((filter) => (
                      <Badge
                        key={filter.id}
                        variant={activeFilter === filter.id ? "default" : "secondary"}
                        className={`cursor-pointer whitespace-nowrap transition-colors ${
                          activeFilter === filter.id
                            ? "bg-activist-blue text-white hover:bg-activist-blue/90"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        onClick={() => setActiveFilter(filter.id)}
                      >
                        {filter.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* GPS Location Button */}
            <div className="absolute bottom-4 right-4 z-[1000]">
              <Button
                onClick={() => {
                  console.log("GPS button clicked");
                  getUserLocation();
                }}
                disabled={isLocating}
                className="w-12 h-12 p-0 bg-white text-gray-700 border border-gray-200 shadow-lg hover:bg-gray-50 rounded-full"
                variant="outline"
                title="Find my location"
              >
                {isLocating ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                ) : (
                  <MapPin className="w-5 h-5" />
                )}
              </Button>
            </div>

            {/* Help Button with Legend */}
            <div className="absolute bottom-4 left-4 z-[1000]">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 p-0 bg-white text-gray-700 border border-gray-200 shadow-lg hover:bg-gray-50 rounded-full"
                    title="Show legend"
                  >
                    ?
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-auto rounded-t-lg">
                  <SheetHeader className="pb-4">
                    <SheetTitle className="text-left">Map Legend</SheetTitle>
                  </SheetHeader>
                  <div className="pb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Protest Categories</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { category: 'Climate', color: '#22c55e' },
                        { category: 'Pride', color: '#ec4899' },
                        { category: 'Workers', color: '#f59e0b' },
                        { category: 'Justice', color: '#ef4444' },
                        { category: 'Education', color: '#3b82f6' }
                      ].map(({ category, color }) => (
                        <div key={category} className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full border-2 border-white"
                            style={{ backgroundColor: color, boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                          ></div>
                          <span className="text-gray-700 text-sm">{category}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Other Markers</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                          <span className="text-gray-700 text-sm">Your Location</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white"></div>
                          <span className="text-gray-700 text-sm">Searched Location</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        )}
      </div>

      {/* Bottom Sheet with Protest List */}
      <Sheet open={isBottomSheetOpen} onOpenChange={setIsBottomSheetOpen}>
        <SheetTrigger asChild>
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[1001] mb-2">
            <Button
              variant="default"
              className="bg-white text-gray-700 border border-gray-200 shadow-lg hover:bg-gray-50 rounded-full px-4 py-2 flex items-center space-x-2 min-w-0"
              onClick={() => setIsBottomSheetOpen(true)}
            >
              <List className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium truncate">
                {protestsInView.length} protest{protestsInView.length !== 1 ? 's' : ''} in area
              </span>
              <ChevronUp className="w-4 h-4 flex-shrink-0" />
            </Button>
          </div>
        </SheetTrigger>
        
        <SheetContent side="bottom" className="h-[70vh] rounded-t-lg">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-left">
              Protests in this area ({protestsInView.length})
            </SheetTitle>
          </SheetHeader>
          
          <div className="h-full overflow-y-auto pb-6">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : protestsInView.length > 0 ? (
              <div className="space-y-3">
                {protestsInView.map((protest, index) => (
                  <ProtestCard 
                    key={`bottom-sheet-${protest.id}-${index}`} 
                    protest={protest} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <MapPin className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-gray-500 font-medium">No protests in this area</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try zooming out or searching a different location
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}