import { useState, useEffect, useRef } from "react";
import { useProtests } from "@/hooks/use-protests";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, MapPin, ChevronUp, List } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ProtestCard } from "@/components/protest-card";

import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import type { Protest } from "@shared/schema";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { geocodeLocation, findItalianCity, type GeocodeResult } from "@/lib/geocoding";
import { getCachedUserLocation } from "@/lib/geolocation";
import { formatDateTime } from "@/lib/date-utils";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map centering
function MapCenterUpdater({ center, zoom }: { center: [number, number] | null; zoom?: number }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      console.log("Updating map center to:", center, "with zoom:", zoom || 15);
      map.setView(center, zoom || 15);
    }
  }, [center, map, zoom]);

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

// Component to track map zoom for clustering
function MapZoomUpdater({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMap();

  useEffect(() => {
    const updateZoom = () => {
      const zoom = map.getZoom();
      onZoomChange(zoom);
    };

    // Update zoom initially
    updateZoom();

    // Update zoom when map zooms
    map.on('zoomend', updateZoom);

    return () => {
      map.off('zoomend', updateZoom);
    };
  }, [map, onZoomChange]);

  return null;
}

// Custom marker icons based on event type
const createEventIcon = (eventType: string) => {
  const iconMap = {
    'Protest': '📣',
    'Workshop': '🛠️', 
    'Assembly': '🧑‍🤝‍🧑',
    'Talk': '🎤',
    'Other': '🧭'
  };

  const emoji = iconMap[eventType as keyof typeof iconMap] || '📣';

  return L.divIcon({
    html: `<div style="background-color: white; width: 32px; height: 32px; border-radius: 50%; border: 2px solid #E11D48; box-shadow: 0 2px 6px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; font-size: 16px;">${emoji}</div>`,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

// Icon creation function for cluster markers
const createClusterIcon = (count: number) => {
  const size = count < 10 ? 32 : count < 100 ? 40 : 48;
  const fontSize = count < 10 ? 12 : count < 100 ? 14 : 16;

  return L.divIcon({
    html: `<div style="background-color: #E11D48; color: white; width: ${size}px; height: ${size}px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: ${fontSize}px; font-weight: bold;">${count}</div>`,
    className: 'custom-cluster-marker',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

export function MapView() {
  const { data: protests = [], isLoading } = useProtests();
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchLocation, setSearchLocation] = useState<[number, number] | null>(null);
  const [searchLocationName, setSearchLocationName] = useState<string>("");
  const [isLocating, setIsLocating] = useState(false);
  const [isGeocoding] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const navigate = useNavigate();

  // Load cached user location from Home page on mount
  useEffect(() => {
    const loadCachedLocation = async () => {
      try {
        // Check if we have manual location coordinates from localStorage (set in Home page)
        const savedManualCoords = localStorage.getItem('corteo_manual_location_coords');
        if (savedManualCoords) {
          const coords = JSON.parse(savedManualCoords);
          setUserLocation([coords.latitude, coords.longitude]);
          console.log("🗺️ Using manual location from Home page:", coords);
          return;
        }

        // Otherwise, try to get cached user location
        const locationResult = await getCachedUserLocation();
        if (locationResult.coordinates) {
          setUserLocation([locationResult.coordinates.latitude, locationResult.coordinates.longitude]);
          console.log("🗺️ Using cached user location from Home page:", locationResult.coordinates);
        }
      } catch (error) {
        console.log("ℹ️ No cached location available, will use Milan default");
      }
    };

    loadCachedLocation();
  }, []);

  // Load applied filters from localStorage
  useEffect(() => {
    const loadAppliedFilters = () => {
      try {
        const savedFilters = localStorage.getItem('corteo_map_filters');
        if (savedFilters) {
          const filterData = JSON.parse(savedFilters);
          setAppliedFilters({
            causes: filterData.causes || [],
            date: filterData.date || "all",
            organizer: filterData.organizer || "all"
          });
          console.log("🎯 Loaded applied filters:", filterData);
        }
      } catch (error) {
        console.error("Error loading applied filters:", error);
      }
    };

    loadAppliedFilters();

    // Listen for storage changes (when filters are applied)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'corteo_map_filters') {
        loadAppliedFilters();
      }
    };

    // Listen for focus events (when returning from filter page)
    const handleFocus = () => {
      loadAppliedFilters();
    };

    // Listen for custom filter events
    const handleFiltersApplied = (e: any) => {
      console.log("🎯 Received filter event:", e.detail);
      setAppliedFilters({
        causes: e.detail.causes || [],
        date: e.detail.date || "all",
        organizer: e.detail.organizer || "all"
      });
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('corteo-filters-applied', handleFiltersApplied);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('corteo-filters-applied', handleFiltersApplied);
    };
  }, []);

  const filters = [
    { id: "all", label: "All" },
    { id: "upcoming", label: "Upcoming" },
    { id: "popular", label: "Popular" },
    { id: "featured", label: "Featured" },
  ];
  const [activeFilter, setActiveFilter] = useState("all");
  const [appliedFilters, setAppliedFilters] = useState<{
    causes: string[];
    date: string;
    organizer: string;
  } | null>(null);

  // GPS location function - now syncs with Home page location storage
  const getUserLocation = async () => {
    setIsLocating(true);
    console.log("GPS button clicked - getting fresh location and syncing with Home page");

    try {
      // Use the same function as Home page for consistency
      const locationResult = await getCachedUserLocation();
      if (locationResult.coordinates) {
        setUserLocation([locationResult.coordinates.latitude, locationResult.coordinates.longitude]);
        console.log("🗺️ Fresh location obtained and synced with Home page:", locationResult.coordinates);

        // Clear any manual location override since user requested fresh GPS location
        localStorage.removeItem('corteo_manual_location');
        localStorage.removeItem('corteo_manual_location_coords');
      }
    } catch (error) {
      console.error("❌ Failed to get user location:", error);
      alert("Unable to get your location. Please check your browser's location settings.");
    } finally {
      setIsLocating(false);
    }
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
        protest.city?.toLowerCase() || '',
        protest.address?.toLowerCase() || ''
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
          protest.city?.toLowerCase() || '',
          protest.address?.toLowerCase() || ''
        ];

        const matches = searchFields.some(field => field.includes(query));

        if (matches) {
          console.log(`✅ Match found: ${protest.title} in ${protest.city}`);
        }

        return matches;
      }
      return true;
    })
    .filter((protest) => {
      // Apply saved filters from localStorage
      if (appliedFilters) {
        // Filter by causes (categories)
        if (appliedFilters.causes.length > 0) {
          const protestCategory = protest.category?.toLowerCase() || '';
          const matchesCause = appliedFilters.causes.some(cause => 
            protestCategory.includes(cause.toLowerCase()) || 
            cause.toLowerCase().includes(protestCategory)
          );
          if (!matchesCause) return false;
        }

        // Filter by date
        if (appliedFilters.date !== "all") {
          const eventDate = new Date(protest.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          switch (appliedFilters.date) {
            case "today":
              const todayEnd = new Date(today);
              todayEnd.setHours(23, 59, 59, 999);
              if (eventDate < today || eventDate > todayEnd) return false;
              break;
            case "tomorrow":
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              const tomorrowEnd = new Date(tomorrow);
              tomorrowEnd.setHours(23, 59, 59, 999);
              if (eventDate < tomorrow || eventDate > tomorrowEnd) return false;
              break;
            case "week":
              const weekEnd = new Date(today);
              weekEnd.setDate(weekEnd.getDate() + 7);
              if (eventDate < today || eventDate > weekEnd) return false;
              break;
            case "month":
              const monthEnd = new Date(today);
              monthEnd.setMonth(monthEnd.getMonth() + 1);
              if (eventDate < today || eventDate > monthEnd) return false;
              break;
          }
        }
      }
      return true;
    })
    .filter((protest) => {
      // Filter by category/type filters
      if (activeFilter === "upcoming") {
        // Check if event date is in the future
        const eventDate = new Date(protest.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return eventDate >= today;
      } else if (activeFilter === "popular") {
        return protest.attendees > 200;
      } else if (activeFilter === "featured") {
        return protest.featured === true;
      }
      return true;
    });

  // Add offset logic for markers in same location
  const getOffsetPosition = (protests: Protest[], currentIndex: number): [number, number] => {
    const currentProtest = protests[currentIndex];
    const lat = parseFloat(currentProtest.latitude!);
    const lng = parseFloat(currentProtest.longitude!);

    // Find other protests at the same location (within 0.001 degrees ~ 100m)
    const sameLocationProtests = protests
      .map((protest, index) => ({ protest, index }))
      .filter(({ protest, index }) => {
        if (index >= currentIndex) return false; // Only count previous protests
        if (!protest.latitude || !protest.longitude) return false;

        const protestLat = parseFloat(protest.latitude);
        const protestLng = parseFloat(protest.longitude);

        const latDiff = Math.abs(lat - protestLat);
        const lngDiff = Math.abs(lng - protestLng);

        return latDiff < 0.001 && lngDiff < 0.001;
      });

    // Calculate offset based on number of protests already placed at this location
    const offsetCount = sameLocationProtests.length;

    if (offsetCount === 0) {
      return [lat, lng]; // No offset needed
    }

    // Create circular offset pattern
    const angle = (offsetCount * 60) * (Math.PI / 180); // 60 degrees apart
    const offsetDistance = 0.002; // ~200m offset

    const offsetLat = lat + (offsetDistance * Math.cos(angle));
    const offsetLng = lng + (offsetDistance * Math.sin(angle));

    return [offsetLat, offsetLng];
  };

  // Calculate map center - prioritize user location (from Home page cache), then search location, then Milan default
  let mapCenter: [number, number];
  let mapZoom: number;

  if (userLocation) {
    // If user location is available (from Home page cache or fresh GPS), center on it
    mapCenter = userLocation;
    mapZoom = 15;
    console.log(`🗺️ Centering map on user location: ${userLocation}`);
  } else if (searchLocation) {
    // If we found a location via geocoding, center on it
    mapCenter = searchLocation;
    mapZoom = 12;
    console.log(`🗺️ Centering map on searched location: ${searchLocationName}`);
  } else {
    // Default to Milan, Italy
    mapCenter = [45.4642, 9.1900];
    mapZoom = 11;
    console.log(`🗺️ Centering map on default location: Milan`);
  }

  // Debug logging for search results
  if (searchQuery && searchQuery.trim().length > 0) {
    console.log(`🔍 Search results: ${filteredProtests.length} protests found for "${searchQuery}"`);
  }

  // Clustering logic based on zoom level
  const getClusterDistance = (zoom: number) => {
    // Distance threshold for clustering (in degrees)
    // Higher zoom = smaller distance = more separated clusters
    if (zoom >= 16) return 0.001;  // Very close zoom - show individual events
    if (zoom >= 14) return 0.003;  // Close zoom - small clusters
    if (zoom >= 12) return 0.008;  // Medium zoom - medium clusters  
    if (zoom >= 10) return 0.02;   // Far zoom - large clusters
    return 0.05;                   // Very far zoom - very large clusters
  };

  const clusterEvents = (events: any[], zoom: number) => {
    const clusterDistance = getClusterDistance(zoom);
    const clusters: any[] = [];
    const processed = new Set();

    events.forEach((event, index) => {
      if (processed.has(index) || !event.latitude || !event.longitude) return;

      const lat = parseFloat(event.latitude);
      const lng = parseFloat(event.longitude);

      // Find all nearby events
      const cluster = [event];
      processed.add(index);

      events.forEach((otherEvent, otherIndex) => {
        if (processed.has(otherIndex) || !otherEvent.latitude || !otherEvent.longitude) return;

        const otherLat = parseFloat(otherEvent.latitude);
        const otherLng = parseFloat(otherEvent.longitude);

        // Calculate distance between events
        const distance = Math.sqrt(
          Math.pow(lat - otherLat, 2) + Math.pow(lng - otherLng, 2)
        );

        if (distance <= clusterDistance) {
          cluster.push(otherEvent);
          processed.add(otherIndex);
        }
      });

      // Calculate cluster center
      const centerLat = cluster.reduce((sum, e) => sum + parseFloat(e.latitude), 0) / cluster.length;
      const centerLng = cluster.reduce((sum, e) => sum + parseFloat(e.longitude), 0) / cluster.length;

      clusters.push({
        id: `cluster-${clusters.length}`,
        events: cluster,
        count: cluster.length,
        latitude: centerLat,
        longitude: centerLng,
        isCluster: cluster.length > 1
      });
    });

    return clusters;
  };

  // Get current zoom level for clustering
  const [currentZoom, setCurrentZoom] = useState(mapZoom);

  // Create clusters based on current zoom level  
  const eventClusters = clusterEvents(filteredProtests, currentZoom);

  // Filter clusters that are visible in current map bounds
  const clustersInView = mapBounds 
    ? eventClusters.filter(cluster => {
        return mapBounds.contains([cluster.latitude, cluster.longitude]);
      })
    : eventClusters;

  return (
    <div className="relative h-full w-full">
      {/* Map Container - Full Height */}
      <div className="h-full w-full relative">
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
              key={userLocation ? `user-${userLocation[0]}-${userLocation[1]}` : searchLocation ? `search-${searchLocation[0]}-${searchLocation[1]}` : 'milan-default'}
            >
              <MapCenterUpdater center={userLocation} zoom={15} />
              <MapBoundsUpdater onBoundsChange={setMapBounds} />
              <MapZoomUpdater onZoomChange={setCurrentZoom} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {eventClusters.map((cluster, index) => {
                if (cluster.isCluster) {
                  // Render cluster marker
                  return (
                    <Marker
                      key={cluster.id}
                      position={[cluster.latitude, cluster.longitude]}
                      icon={createClusterIcon(cluster.count)}
                    >
                      <Popup>
                        <div className="p-2 max-w-xs">
                          <h3 className="font-semibold text-sm mb-3">{cluster.count} Events in this area</h3>
                          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                            {cluster.events.slice(0, 5).map((event: any) => (
                              <div key={event.id} className="p-2 border rounded bg-gray-50 cursor-pointer hover:bg-gray-100"
                                   onClick={() => navigate(`/protest/${event.id}`)}>
                                <p className="font-medium text-xs">{event.title}</p>
                                <p className="text-xs text-gray-600">{event.city}</p>
                                <Badge className="text-xs px-1 py-0.5 bg-[#FECDD3] text-[#E11D48] mt-1">
                                  {event.category?.toUpperCase()}
                                </Badge>
                              </div>
                            ))}
                            {cluster.events.length > 5 && (
                              <p className="text-xs text-gray-500 text-center pt-2">
                                +{cluster.events.length - 5} more events
                              </p>
                            )}
                          </div>
                          <div className="mt-3 pt-2 border-t">
                            <p className="text-xs text-gray-500 text-center">
                              Zoom in to see individual events
                            </p>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                } else {
                  // Render individual event marker
                  const event = cluster.events[0];
                  return (
                    <Marker
                      key={event.id}
                      position={[cluster.latitude, cluster.longitude]}
                      icon={createEventIcon(event.event_type || 'Protest')}
                    >
                      <Popup>
                        <div className="p-2 max-w-xs">
                          <h3 className="font-semibold text-sm mb-1">{event.title}</h3>
                          <p className="text-xs text-gray-600 mb-2">{event.city}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">{formatDateTime(event.date, event.time)}</span>
                            <Badge className="text-xs px-2 py-1 bg-[#FECDD3] text-[#E11D48]">
                              {event.category?.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-700 mt-2 line-clamp-2">{event.description}</p>
                          <Button 
                            size="sm" 
                            className="w-full mt-2 bg-[#E11D48] hover:bg-[#E11D48]/90"
                            onClick={() => navigate(`/protest/${event.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                }
              })}

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

            {/* Overlay Search Controls - Mobile Optimized */}
            <div className="absolute top-3 left-3 right-3 z-[1000]">
              <div className="bg-white rounded-full shadow-lg border border-gray-200 p-1.5">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1 min-w-0">
                    <Input
                      type="text"
                      placeholder="Search protests or locations..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-9 pr-8 py-2 border-0 bg-transparent text-sm placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 h-9"
                    />
                    {isGeocoding ? (
                      <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    )}
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSearchLocation(null);
                          setSearchLocationName("");
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="h-5 w-px bg-gray-300"></div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      console.log("🎯 Filter button clicked, navigating to /filter");
                      navigate("/filter");
                    }}
                    className="px-2.5 py-2 hover:bg-gray-50 rounded-full h-9"
                  >
                    <Filter className="w-4 h-4 text-gray-600" />
                    <span className="ml-1.5 text-sm hidden sm:inline">Filters</span>
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
                          onClick={() => navigate(`/protest/${protest.id}`)}
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
                              <p className="text-sm text-gray-600 truncate">{protest.city}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className="text-xs bg-[#FECDD3] text-[#E11D48]">
                                  {protest.category?.toUpperCase()}
                                </Badge>
                                <span className="text-xs text-gray-500">{formatDateTime(protest.date, protest.time)}</span>
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

            {/* Filter Tags Overlay - Always Visible */}
            <div className="absolute top-20 left-4 right-4 z-[1000]">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                {(searchQuery || activeFilter !== "all" || searchLocation || appliedFilters) && (
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
                        {activeFilter !== "all" && !searchQuery && ` for ${filters.find(f => f.id === activeFilter)?.label}`}
                        {appliedFilters && appliedFilters.causes.length > 0 && (
                          <> · Filtered by: {appliedFilters.causes.join(', ')}</>
                        )}
                        {appliedFilters && appliedFilters.date !== "all" && (
                          <> · Date: {appliedFilters.date}</>
                        )}
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
                          ? "bg-[#E11D48] text-white hover:bg-[#E11D48]/90"
                          : "bg-[#F8F8F6] text-[#64748B] hover:bg-[#E2E8F0]"
                      }`}
                      onClick={() => setActiveFilter(filter.id)}
                    >
                      {filter.label}
                    </Badge>
                  ))}
                  {appliedFilters && (appliedFilters.causes.length > 0 || appliedFilters.date !== "all") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAppliedFilters(null);
                        localStorage.removeItem('corteo_map_filters');
                        console.log("🧹 Cleared all applied filters");
                      }}
                      className="ml-2 text-xs px-2 py-1 h-auto bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </div>

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
            <div className="absolute bottom-4 left-4 z-[1002]">
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
                <SheetContent side="bottom" className="h-auto rounded-t-lg z-[9999]">
                  <SheetHeader className="pb-4">
                    <SheetTitle className="text-left">Map Legend</SheetTitle>
                  </SheetHeader>
                  <div className="pb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Protest Categories</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { category: 'ENVIRONMENT', color: '#059669' },
                        { category: 'LGBTQ+', color: '#f43f5e' },
                        { category: 'WOMEN\'S RIGHTS', color: '#be185d' },
                        { category: 'LABOR', color: '#d97706' },
                        { category: 'RACIAL & SOCIAL JUSTICE', color: '#7c3aed' },
                        { category: 'CIVIL & HUMAN RIGHTS', color: '#2563eb' },
                        { category: 'HEALTHCARE & EDUCATION', color: '#0891b2' },
                        { category: 'PEACE & ANTI-WAR', color: '#0ea5e9' },
                        { category: 'TRANSPARENCY & ANTI-CORRUPTION', color: '#4b5563' },
                        { category: 'OTHER', color: '#4f46e5' }
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
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1001]">
            <Button
              variant="default"
              className="bg-white text-gray-700 border border-gray-200 shadow-lg hover:bg-gray-50 rounded-full px-4 py-2 flex items-center space-x-2"
              onClick={() => setIsBottomSheetOpen(true)}
            >
              <List className="w-4 h-4" />
              <span className="text-sm font-medium">
                {eventClusters.reduce((total, cluster) => total + cluster.count, 0)} protest{eventClusters.reduce((total, cluster) => total + cluster.count, 0) !== 1 ? 's' : ''} in area
              </span>
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
        </SheetTrigger>

        <SheetContent side="bottom" className="h-[70vh] rounded-t-lg z-[9999]">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-left">
              Protests in this area ({eventClusters.reduce((total, cluster) => total + cluster.count, 0)})
            </SheetTitle>
          </SheetHeader>

          <div className="h-full overflow-y-auto pb-6 scrollbar-hide">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : eventClusters.length > 0 ? (
              <div className="space-y-3">
                {eventClusters.flatMap(cluster => cluster.events).map((protest, index) => (
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