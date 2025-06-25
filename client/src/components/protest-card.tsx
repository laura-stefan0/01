import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Protest } from "@shared/schema";
import { MapPin } from "lucide-react";
import { useLocation } from "wouter";

interface ProtestCardProps {
  protest: Protest;
  variant?: "featured" | "compact";
}

export function ProtestCard({ protest, variant = "compact" }: ProtestCardProps) {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    setLocation(`/protest/${protest.id}`);
  };

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
      <Card className="min-w-0 w-full flex-shrink-0 overflow-hidden h-64 cursor-pointer hover:shadow-lg transition-shadow" onClick={handleClick}>
        <img 
          src={protest.imageUrl} 
          alt={protest.title}
          className="w-full h-32 object-cover"
        />
        <CardContent className="p-4 h-32 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Badge className={`${getCategoryColor(protest.category)} text-white text-xs`}>
                {protest.category}
              </Badge>
              <span className="text-sm text-gray-500">{protest.distance}</span>
            </div>
            <h3 className="font-semibold text-dark-slate mb-1 line-clamp-2">{protest.title}</h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{protest.description}</p>
          </div>
          <div className="text-sm text-gray-500">
            <p className="font-medium">{protest.date}, {protest.time}</p>
            <p className="truncate">{protest.location}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden h-20 cursor-pointer hover:shadow-lg transition-shadow" onClick={handleClick}>
      <div className="flex h-full">
        <img 
          src={protest.imageUrl}
          alt={protest.title}
          className="w-20 h-full object-cover flex-shrink-0"
        />
        <CardContent className="p-3 flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <Badge className={`${getCategoryColor(protest.category)} text-white text-xs`}>
              {protest.category}
            </Badge>
            <span className="text-xs text-gray-500">{protest.attendees} going</span>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-dark-slate text-sm mb-1 line-clamp-1">{protest.title}</h3>
            <p className="text-xs text-gray-500 mb-1">{protest.location} • {protest.distance}</p>
            <p className="text-xs text-gray-600 font-medium">{protest.date}, {protest.time}</p>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}