
import { useState, useEffect, useMemo, useRef } from "react";
import { useProtests, useProtestsByCategory, useSearchProtests } from "@/hooks/use-protests";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Navigation, Plus, Minus, ChevronUp, ChevronDown } from "lucide-react";
import { ProtestCard } from "@/components/protest-card";
import type { Protest } from "@shared/schema";

export function MapView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [activeTimeFilter, setActiveTimeFilter] = useState("");
  const [listExpanded, setListExpanded] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number}>({ lat: 45.4642, lng: 9.1900 }); // Milan
  const [mapZoom, setMapZoom] = useState(12);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMoreFilters(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { data: protests = [], isLoading } = useProtests();
  const { data: filteredProtests = [], isLoading: filterLoading } = useProtestsByCategory(activeFilter);
  const { data: searchResults = [], isLoading: searchLoading } = useSearchProtests(debouncedSearch);

  // Determine which protests to show
  const displayedProtests = useMemo(() => {
    if (debouncedSearch && searchResults.length > 0) {
      return searchResults;
    }
    if (activeFilter !== "all") {
      return filteredProtests;
    }
    return protests;
  }, [debouncedSearch, searchResults, activeFilter, filteredProtests, protests]);

  const mainFilters = [
    { id: "all", label: "All", color: "" },
    { id: "environment", label: "Environment", color: "#4CAF50" },
    { id: "lgbtq", label: "LGBTQ+", color: "#E91E63" },
    { id: "womens-rights", label: "Women's Rights", color: "#D81B60" },
    { id: "labor", label: "Labor", color: "#FF9800" },
    { id: "racial-social-justice", label: "Racial & Social Justice", color: "#9C27B0" },
  ];

  const additionalFilters = [
    { id: "civil-human-rights", label: "Civil & Human Rights", color: "#2196F3" },
    { id: "healthcare-education", label: "Healthcare & Education", color: "#009688" },
    { id: "peace-anti-war", label: "Peace & Anti-War", color: "#03A9F4" },
    { id: "transparency-anti-corruption", label: "Transparency & Anti-Corruption", color: "#607D8B" },
  ];

  const timeFilters = [
    { id: "today", label: "Today" },
    { id: "tomorrow", label: "Tomorrow" },
    { id: "this-week", label: "This week" },
    { id: "this-month", label: "This month" },
  ];

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "environment":
        return "bg-green-500";
      case "lgbtq+":
      case "lgbt+ & equality":
        return "bg-pink-500";
      case "women's rights":
        return "bg-pink-600";
      case "labor":
        return "bg-orange-500";
      case "racial & social justice":
        return "bg-purple-600";
      case "civil & human rights":
        return "bg-blue-500";
      case "healthcare & education":
        return "bg-teal-600";
      case "peace & anti-war":
        return "bg-blue-400";
      case "transparency & anti-corruption":
        return "bg-gray-500";
      default:
        return "bg-activist-blue";
    }
  };

  const handleGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);
          setMapCenter(newLocation);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please enable location services.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="relative h-screen bg-gray-100">
      {/* Map Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-blue-100">
        {/* Map placeholder with interactive elements */}
        <div className="w-full h-full relative overflow-hidden">
          {/* Simulated map tiles */}
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-6 gap-px">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="bg-blue-50 border border-blue-100" />
            ))}
          </div>
          
          {/* Protest markers */}
          {displayedProtests.slice(0, 8).map((protest, index) => (
            <div
              key={protest.id}
              className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform ${getCategoryColor(protest.category)}`}
              style={{
                left: `${15 + (index * 10) + (index % 3) * 5}%`,
                top: `${20 + (index % 4) * 15}%`,
                zIndex: 10
              }}
              title={protest.title}
            />
          ))}
          
          {/* User location marker */}
          {userLocation && (
            <div
              className="absolute w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 15
              }}
            />
          )}
          
          {/* Milan location marker (default) */}
          {!userLocation && (
            <div
              className="absolute w-3 h-3 bg-gray-600 rounded-full border-2 border-white shadow-md"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 15
              }}
              title="Milan, Italy"
            />
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search protests by name or cause..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/95 backdrop-blur-sm border-gray-200 focus:ring-2 focus:ring-activist-blue focus:border-transparent shadow-lg"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Filter Tags */}
      <div className="absolute top-16 left-4 right-4 z-20">
        <div className="flex space-x-2 overflow-x-auto pb-1">
          {mainFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "secondary"}
              className={`cursor-pointer whitespace-nowrap ${
                activeFilter === filter.id
                  ? filter.id === "all" 
                    ? "bg-activist-blue text-white hover:bg-activist-blue/90"
                    : `text-white hover:opacity-90`
                  : "bg-white/90 text-gray-700 hover:bg-white"
              } shadow-sm`}
              style={activeFilter === filter.id && filter.id !== "all" ? { backgroundColor: filter.color } : {}}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </Badge>
          ))}
          
          {/* More Filters Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="outline"
              size="sm"
              className="whitespace-nowrap bg-white/90 text-gray-700 hover:bg-white border-gray-200 shadow-sm"
              onClick={() => setShowMoreFilters(!showMoreFilters)}
            >
              More filters
            </Button>
            
            {showMoreFilters && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
                <div className="p-3">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Categories</h4>
                  <div className="space-y-2">
                    {additionalFilters.map((filter) => (
                      <button
                        key={filter.id}
                        className={`w-full text-left px-2 py-1 rounded text-sm ${
                          activeFilter === filter.id
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          setActiveFilter(filter.id);
                          setShowMoreFilters(false);
                        }}
                      >
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: filter.color }}
                          ></div>
                          {filter.label}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <hr className="my-3" />
                  
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Time</h4>
                  <div className="space-y-2">
                    {timeFilters.map((filter) => (
                      <button
                        key={filter.id}
                        className={`w-full text-left px-2 py-1 rounded text-sm ${
                          activeTimeFilter === filter.id
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          setActiveTimeFilter(activeTimeFilter === filter.id ? "" : filter.id);
                          setShowMoreFilters(false);
                        }}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute right-4 top-32 z-20 flex flex-col space-y-2">
        {/* GPS Button */}
        <Button
          size="sm"
          variant="outline"
          className="w-10 h-10 p-0 bg-white/95 backdrop-blur-sm shadow-lg hover:bg-white"
          onClick={handleGPS}
        >
          <Navigation className="w-4 h-4" />
        </Button>
        
        {/* Zoom Controls */}
        <div className="flex flex-col bg-white/95 backdrop-blur-sm rounded-md shadow-lg">
          <Button
            size="sm"
            variant="ghost"
            className="w-10 h-8 p-0 rounded-b-none border-b border-gray-200"
            onClick={() => setMapZoom(Math.min(mapZoom + 1, 18))}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-10 h-8 p-0 rounded-t-none"
            onClick={() => setMapZoom(Math.max(mapZoom - 1, 1))}
          >
            <Minus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Pullable Event List */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-2xl transition-transform duration-300 ease-out z-30 ${
          listExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-120px)]'
        }`}
        style={{ maxHeight: '70vh' }}
      >
        {/* Handle */}
        <div 
          className="flex items-center justify-center py-3 cursor-pointer"
          onClick={() => setListExpanded(!listExpanded)}
        >
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="px-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-dark-slate">
              {displayedProtests.length} Events Found
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setListExpanded(!listExpanded)}
            >
              {listExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {/* Event List */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 100px)' }}>
          <div className="px-4 py-3 space-y-3">
            {isLoading || filterLoading || searchLoading ? (
              <>
                <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              </>
            ) : displayedProtests.length > 0 ? (
              displayedProtests.map((protest) => (
                <ProtestCard key={protest.id} protest={protest} />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No protests found</p>
                {debouncedSearch && (
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your search terms</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
