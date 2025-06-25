import { useState } from "react";
import { useProtests } from "@/hooks/use-protests";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { Protest } from "@shared/schema";

export function MapView() {
  const { data: protests = [], isLoading } = useProtests();
  const [selectedProtest, setSelectedProtest] = useState<Protest | null>(null);

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
      <div className="h-96 bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-activist-blue mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Map View - Full height */}
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
      
      {/* Pull-up Events Tab */}
      <div className="bg-white border-t border-gray-200 max-h-80 overflow-y-auto">
        {/* Tab Handle */}
        <div className="flex justify-center py-2 border-b border-gray-100">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* Events List */}
        <div className="px-4 py-3">
          <h3 className="font-semibold text-dark-slate mb-3 flex items-center">
            <span className="mr-2">📍</span>
            Events on Map ({protests.length})
          </h3>
          <div className="space-y-3">
            {protests.map((protest, index) => (
              <div
                key={protest.id}
                className="flex items-start space-x-3 py-2 cursor-pointer hover:bg-gray-50 rounded-lg"
                onClick={() => setSelectedProtest(protest)}
              >
                <div className={`w-3 h-3 rounded-full border border-white mt-2 ${getCategoryColor(protest.category)}`}></div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-dark-slate text-sm">{protest.title}</h4>
                    <span className="text-xs text-gray-500">{protest.attendees} going</span>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">
                    <p>{protest.location}</p>
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