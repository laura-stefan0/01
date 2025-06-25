import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Protest } from "@shared/schema";
import { MapPin } from "lucide-react";

interface ProtestCardProps {
  protest: Protest;
  variant?: "featured" | "compact";
}

export function ProtestCard({ protest, variant = "compact" }: ProtestCardProps) {
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

  if (variant === "featured") {
    return (
      <Card className="min-w-64 flex-shrink-0 hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-md">
        <CardContent className="p-0">
          <div className="relative h-28 bg-gradient-to-r from-activist-blue to-rally-red rounded-t-lg overflow-hidden">
            <img 
              src={protest.imageUrl}
              alt={protest.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black/20 rounded-t-lg" />
            <div className="absolute top-2 left-2">
              <Badge className={`${getCategoryColor(protest.category)} text-white text-xs`}>
                {protest.category}
              </Badge>
            </div>
            <div className="absolute top-2 right-2 text-white text-xs font-medium">
              {protest.attendees} going
            </div>
          </div>
          <div className="p-3">
            <h3 className="font-semibold text-dark-slate mb-2 line-clamp-2 text-sm">{protest.title}</h3>
            <div className="flex items-center text-xs text-gray-600 mb-2">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{protest.location}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">{protest.date}</span>
              <span className="text-gray-500">{protest.time}</span>
            </div>
            <p className="text-xs text-gray-600 mt-2 line-clamp-2">{protest.description}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={protest.imageUrl}
            alt={protest.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-activist-blue to-rally-red flex items-center justify-center text-white text-xs font-bold">' + protest.category.charAt(0) + '</div>';
            }}
          />
        </div>
        <CardContent className="p-3 flex-1">
          <div className="flex items-center justify-between mb-1">
            <Badge className={`${getCategoryColor(protest.category)} text-white text-xs`}>
              {protest.category}
            </Badge>
            <span className="text-xs text-gray-500">{protest.attendees} going</span>
          </div>
          <h3 className="font-medium text-dark-slate text-sm mb-1">{protest.title}</h3>
          <p className="text-xs text-gray-500 mb-1">{protest.location} • {protest.distance}</p>
          <p className="text-xs text-gray-600">{protest.time}</p>
        </CardContent>
      </div>
    </Card>
  );
}