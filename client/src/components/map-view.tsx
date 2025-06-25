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
    <div>
      {/* Map Placeholder - Interactive map coming soon */}
      <div className="h-96 relative bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center p-8">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-activist-blue" />
          <h3 className="text-lg font-semibold text-dark-slate mb-2">Interactive Map</h3>
          <p className="text-gray-600 mb-4">View protest locations on an interactive map</p>
          <p className="text-sm text-gray-500">Coming Soon</p>
        </div>
        
        {/* Floating protest markers visualization */}
        <div className="absolute inset-0 pointer-events-none">
          {protests.slice(0, 6).map((protest, index) => (
            <div
              key={protest.id}
              className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-lg ${getCategoryColor(protest.category)}`}
              style={{
                left: `${20 + (index * 12)}%`,
                top: `${30 + (index % 3) * 15}%`,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Protest Locations List */}
      <div className="px-4 py-4">
        <h3 className="font-semibold text-dark-slate mb-3">Protest Locations</h3>
        <div className="space-y-3">
          {protests.map((protest) => (
            <Card key={protest.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={`${getCategoryColor(protest.category)} text-white text-xs`}>
                    {protest.category}
                  </Badge>
                  <span className="text-xs text-gray-500">{protest.attendees} going</span>
                </div>
                <h4 className="font-medium text-dark-slate mb-1">{protest.title}</h4>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{protest.location}</span>
                </div>
                <div className="text-sm text-gray-500">
                  <p>{protest.date} • {protest.time}</p>
                  <p className="text-xs mt-1">{protest.address}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Map Legend */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <h3 className="font-medium text-dark-slate mb-2">Legend</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-rally-red rounded-full mr-2"></div>
            <span>Pride & Justice</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-movement-green rounded-full mr-2"></div>
            <span>Climate & Environment</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-activist-blue rounded-full mr-2"></div>
            <span>Workers & Education</span>
          </div>
        </div>
      </div>
    </div>
  );
}
