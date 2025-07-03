import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Protest } from "@shared/schema";
import { MapPin, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "@/lib/date-utils";
import { getCategoryColor, getImageUrl } from "@/lib/image-utils";
import { useSavedProtests } from "@/context/saved-protests-context";

interface ProtestCardProps {
  protest: Protest;
  variant?: "featured" | "compact";
}

export function ProtestCard({ protest, variant = "compact" }: ProtestCardProps) {
  const navigate = useNavigate();
  const { isProtestSaved, saveProtest, unsaveProtest } = useSavedProtests();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Protest card clicked, navigating to:', `/protest/${protest.id}`);
    navigate(`/protest/${protest.id}`);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProtestSaved(protest.id)) {
      unsaveProtest(protest.id);
    } else {
      saveProtest(protest);
    }
  };



  if (variant === "featured") {
    return (
      <Card className="min-w-0 w-full flex-shrink-0 overflow-hidden h-64 cursor-pointer border border-gray-200 fade-in relative" onClick={handleClick}>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 z-10 w-8 h-8 p-0 bg-white/80 hover:bg-white"
          onClick={handleSaveClick}
        >
          <Heart 
            className={`h-4 w-4 ${isProtestSaved(protest.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </Button>
        <div 
          className="w-full h-32 bg-cover bg-center bg-gray-200"
          style={{
            backgroundImage: `url(${getImageUrl(protest.image_url, protest.category)})`
          }}
          role="img"
          aria-label={protest.title}
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
            <p className="font-medium">{formatDateTime(protest.date, protest.time)}</p>
            <p className="truncate">{protest.location}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden h-20 cursor-pointer border border-gray-200 fade-in relative" onClick={handleClick}>
      <div className="flex h-full">
        <div 
          className="w-20 h-full bg-cover bg-center bg-gray-200 flex-shrink-0"
          style={{
            backgroundImage: `url(${getImageUrl(protest.image_url, protest.category)})`
          }}
          role="img"
          aria-label={protest.title}
        />
        <CardContent className="p-3 flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <Badge className={`${getCategoryColor(protest.category)} text-white text-xs`}>
              {protest.category.toUpperCase()}
            </Badge>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-6 h-6 p-0 hover:bg-gray-100"
                onClick={handleSaveClick}
              >
                <Heart 
                  className={`h-3 w-3 ${isProtestSaved(protest.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                />
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-dark-slate text-sm mb-1 line-clamp-1">{protest.title}</h3>
            <p className="text-xs text-gray-500 mb-1">{protest.location}</p>
            <p className="text-xs text-gray-600 font-medium">{formatDateTime(protest.date, protest.time)}</p>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}