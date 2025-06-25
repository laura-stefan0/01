import { useState } from "react";
import { useProtests } from "@/hooks/use-protests";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronUp } from "lucide-react";
import type { Protest } from "@shared/schema";

export function MapView() {
  const { data: protests = [], isLoading } = useProtests();
  const [selectedProtest, setSelectedProtest] = useState<Protest | null>(null);
  const [isTabExpanded, setIsTabExpanded] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "climate":
      case "environment":
        return "bg-movement-green";
      case "pride":
      case "justice":
        return "bg-rally-red";
      case "workers":
      case "education":
        return "bg-activist-blue";
      default:
        return "bg-activist-blue";
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        {/* White Header */}
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-dark-slate">Search</h1>
            <Button variant="outline" size="sm" className="bg-activist-blue text-white hover:bg-activist-blue/90">
              List View
            </Button>
          </div>
        </div>
        
        {/* Loading Map */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-activist-blue mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* White Header */}
      <div className="bg-white p-4 border-b border-gray-200 relative z-30">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-dark-slate">Search</h1>
          <Button variant="outline" size="sm" className="bg-activist-blue text-white hover:bg-activist-blue/90">
            List View
          </Button>
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1 relative bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-activist-blue" />
            <h3 className="text-lg font-semibold text-dark-slate mb-2">Interactive Map</h3>
            <p className="text-gray-600 mb-4">View protest locations on an interactive map</p>
            <p className="text-sm text-gray-500">Coming Soon</p>
          </div>
        </div>
        
        {/* Floating protest markers visualization */}
        <div className="absolute inset-0 pointer-events-none">
          {protests.slice(0, 6).map((protest, index) => (
            <div
              key={protest.id}
              className={`absolute w-4 h-4 rounded-full border-2 border-white ${getCategoryColor(protest.category)}`}
              style={{
                left: `${20 + (index * 12)}%`,
                top: `${30 + (index % 3) * 15}%`,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Pull-up Events Tab - Google Maps Style */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg transition-all duration-300 z-20 ${
          isTabExpanded ? 'h-3/5' : 'h-32'
        }`}
      >
        {/* Tab Handle */}
        <div 
          className="flex justify-center py-3 border-b border-gray-100 cursor-pointer"
          onClick={() => setIsTabExpanded(!isTabExpanded)}
        >
          <div className="flex flex-col items-center">
            <div className="w-12 h-1 bg-gray-300 rounded-full mb-2"></div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-dark-slate">
                {protests.length} Events Nearby
              </span>
              <ChevronUp 
                className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                  isTabExpanded ? 'rotate-180' : ''
                }`} 
              />
            </div>
          </div>
        </div>
        
        {/* Events List */}
        <div className="px-4 py-3 overflow-y-auto h-full">
          <div className="space-y-3 pb-20">
            {protests.map((protest, index) => (
              <div
                key={protest.id}
                className="flex items-start space-x-3 py-3 cursor-pointer hover:bg-gray-50 rounded-lg border-b border-gray-50 last:border-b-0"
                onClick={() => setSelectedProtest(protest)}
              >
                <div className={`w-3 h-3 rounded-full border border-white mt-2 flex-shrink-0 ${getCategoryColor(protest.category)}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-dark-slate text-sm truncate pr-2">{protest.title}</h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{protest.attendees} going</span>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    <p className="truncate">{protest.location}</p>
                    <p>{protest.date} • {protest.time}</p>
                  </div>
                  <Badge className={`${getCategoryColor(protest.category)} text-white text-xs`}>
                    {protest.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}