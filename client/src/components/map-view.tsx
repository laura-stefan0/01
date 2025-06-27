import { useState, useEffect } from "react";
import { useProtests } from "@/hooks/use-protests";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Map, List } from "lucide-react";
import { ProtestCard } from "@/components/protest-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import type { Protest } from "@shared/schema";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Listen for custom event to show map view
  useEffect(() => {
    const handleShowMapView = () => {
      setViewMode("map");
    };

    window.addEventListener('showMapView', handleShowMapView);
    
    return () => {
      window.removeEventListener('showMapView', handleShowMapView);
    };
  }, []);

  const filters = [
    { id: "all", label: "All" },
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "popular", label: "Popular" },
  ];
  const [activeFilter, setActiveFilter] = useState("all");

  // Filter protests based on search and active filter
  const filteredProtests = protests
    .filter((protest) => {
      // Filter by search query
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

  // Calculate map center based on protests
  const mapCenter: [number, number] = filteredProtests.length > 0 
    ? [
        filteredProtests
          .filter(p => p.latitude && p.longitude)
          .reduce((sum, p) => sum + parseFloat(p.latitude), 0) / filteredProtests.filter(p => p.latitude && p.longitude).length,
        filteredProtests
          .filter(p => p.latitude && p.longitude)
          .reduce((sum, p) => sum + parseFloat(p.longitude), 0) / filteredProtests.filter(p => p.latitude && p.longitude).length
      ]
    : [41.9028, 12.4964]; // Default to Rome, Italy

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative flex flex-col">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100 flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-dark-slate">Search</h1>
            <div className="flex space-x-2">
              <Button 
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-activist-blue text-white" : ""}
              >
                <List className="w-4 h-4 mr-1" />
                List
              </Button>
              <Button 
                variant={viewMode === "map" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("map")}
                className={viewMode === "map" ? "bg-activist-blue text-white" : ""}
              >
                <Map className="w-4 h-4 mr-1" />
                Map
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search protests by name or cause..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-activist-blue focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setLocation("/filter")}
              className="flex-shrink-0 bg-gray-50 border-gray-200 hover:bg-gray-100"
            >
              <Filter className="w-4 h-4 text-gray-600" />
            </Button>
          </div>

          {/* Filter Tags */}
          <div className="flex space-x-2 mt-3 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <Badge
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "secondary"}
                className={`cursor-pointer whitespace-nowrap ${
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
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        {viewMode === "list" ? (
          /* List View */
          <section className="px-4 py-4">
            <h2 className="text-lg font-semibold text-dark-slate mb-3">All Protests</h2>

            {/* Vertical List of Protest Cards */}
            <div className="space-y-3">
              {isLoading ? (
                <>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </>
              ) : filteredProtests.length > 0 ? (
                filteredProtests.map((protest) => (
                  <ProtestCard key={protest.id} protest={protest} />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No protests found</p>
                </div>
              )}
            </div>
          </section>
        ) : (
          /* Map View */
          <section className="h-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading map...</p>
                </div>
              </div>
            ) : (
              <div className="h-96 relative">
                <MapContainer
                  center={mapCenter}
                  zoom={filteredProtests.length > 0 ? 10 : 6}
                  className="h-full w-full"
                  style={{ height: '100%', width: '100%' }}
                >
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
                </MapContainer>
              </div>
            )}
            
            {/* Map Legend */}
            <div className="px-4 py-3 bg-gray-50 border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Legend</h3>
              <div className="flex flex-wrap gap-3 text-xs">
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
                    <span className="text-gray-600">{category}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}