import { useState, useEffect, useRef } from "react";
import { useProtests } from "@/hooks/use-protests";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, MapPin } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import type { Protest } from "@shared/schema";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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
  const [isLocating, setIsLocating] = useState(false);
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

  // Filter protests based on search and active filter
  const filteredProtests = protests
    .filter((protest) => {
      // Filter by search query - search in title, description, category, location, and address
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          protest.title.toLowerCase().includes(query) ||
          protest.description.toLowerCase().includes(query) ||
          protest.category.toLowerCase().includes(query) ||
          protest.location.toLowerCase().includes(query) ||
          (protest.address && protest.address.toLowerCase().includes(query)) ||
          (protest.organizer && protest.organizer.toLowerCase().includes(query))
        );
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

  // Calculate map center based on filtered protests (if searching) or all protests
  const protestsForCenter = searchQuery ? filteredProtests : protests;
  const mapCenter: [number, number] = protestsForCenter.length > 0 
    ? [
        protestsForCenter
          .filter(p => p.latitude && p.longitude)
          .reduce((sum, p) => sum + parseFloat(p.latitude), 0) / protestsForCenter.filter(p => p.latitude && p.longitude).length,
        protestsForCenter
          .filter(p => p.latitude && p.longitude)
          .reduce((sum, p) => sum + parseFloat(p.longitude), 0) / protestsForCenter.filter(p => p.latitude && p.longitude).length
      ]
    : [41.9028, 12.4964]; // Default to Rome, Italy

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
              zoom={searchQuery && filteredProtests.length > 0 ? 12 : filteredProtests.length > 0 ? 10 : 6}
              className="h-full w-full"
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <MapCenterUpdater center={userLocation} />
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
            </MapContainer>

            {/* Overlay Search Controls - Airbnb Style */}
            <div className="absolute top-4 left-4 right-4 z-[1000]">
              <div className="bg-white rounded-full shadow-lg border border-gray-200 p-2">
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="Search protests by name, location, or cause..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-3 border-0 bg-transparent text-sm placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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
            </div>

            {/* Filter Tags Overlay */}
            {(searchQuery || activeFilter !== "all") && (
              <div className="absolute top-20 left-4 right-4 z-[1000]">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
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

            {/* Legend Overlay at Bottom */}
            <div className="absolute bottom-4 left-4 z-[1000]">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                <h3 className="text-xs font-semibold text-gray-700 mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { category: 'Climate', color: '#22c55e' },
                    { category: 'Pride', color: '#ec4899' },
                    { category: 'Workers', color: '#f59e0b' },
                    { category: 'Justice', color: '#ef4444' },
                    { category: 'Education', color: '#3b82f6' }
                  ].map(({ category, color }) => (
                    <div key={category} className="flex items-center space-x-1">
                      <div 
                        className="w-3 h-3 rounded-full border border-white"
                        style={{ backgroundColor: color, boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                      ></div>
                      <span className="text-gray-600 whitespace-nowrap">{category}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}