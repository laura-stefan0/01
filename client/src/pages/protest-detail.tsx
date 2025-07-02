import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, MapPin, Calendar, ExternalLink, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { Protest } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { formatDate, formatTime } from "@/lib/date-utils";
import { useSavedProtests } from "@/context/saved-protests-context";

export default function ProtestDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const { isProtestSaved, saveProtest, unsaveProtest } = useSavedProtests();

  const protestId = params.id;

  const { data: protest, isLoading, error } = useQuery<Protest>({
    queryKey: ["protest", protestId],
    queryFn: async () => {
      const response = await fetch(`/api/protests/${protestId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch protest details");
      }
      return response.json();
    },
    enabled: !!protestId,
  });

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "environment":
        return "bg-green-600";
      case "lgbtq+":
        return "bg-rose-500";
      case "women's rights":
        return "bg-pink-700";
      case "labor":
        return "bg-amber-600";
      case "racial & social justice":
        return "bg-violet-700";
      case "civil & human rights":
        return "bg-blue-600";
      case "healthcare & education":
        return "bg-cyan-600";
      case "peace & anti-war":
        return "bg-sky-400";
      case "transparency & anti-corruption":
        return "bg-gray-600";
      case "other":
        return "bg-indigo-600";
      default:
        return "bg-indigo-600";
    }
  };

  const getCategoryFallbackImage = (category: string) => {
    switch (category.toLowerCase()) {
      case "environment":
        return "https://images.unsplash.com/photo-1573160813959-c9157b3f8e7c?w=500&h=300&fit=crop&auto=format";
      case "lgbtq+":
        return "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=300&fit=crop&auto=format";
      case "women's rights":
        return "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=500&h=300&fit=crop&auto=format";
      case "labor":
        return "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=500&h=300&fit=crop&auto=format";
      case "racial & social justice":
        return "https://images.unsplash.com/photo-1591608971362-f08b2a75731a?w=500&h=300&fit=crop&auto=format";
      case "civil & human rights":
        return "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop&auto=format";
      case "healthcare & education":
        return "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&h=300&fit=crop&auto=format";
      case "peace & anti-war":
        return "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=500&h=300&fit=crop&auto=format";
      case "transparency & anti-corruption":
        return "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=500&h=300&fit=crop&auto=format";
      case "other":
        return "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=500&h=300&fit=crop&auto=format";
      default:
        return "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=500&h=300&fit=crop&auto=format";
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const fallbackUrl = getCategoryFallbackImage(protest?.category || 'other');

    if (target.src !== fallbackUrl) {
      console.log(`Image failed for ${protest?.title}, using fallback for ${protest?.category}`);
      target.src = fallbackUrl;
    }
  };

  const getImageUrl = () => {
    if (protest?.image_url && protest.image_url.trim() !== '') {
      return protest.image_url;
    }
    return getCategoryFallbackImage(protest?.category || 'other');
  };

  const handleShare = () => {
    if (navigator.share && protest) {
      navigator.share({
        title: protest.title,
        text: protest.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleSaveClick = () => {
    if (!protest) return;

    if (isProtestSaved(protest.id)) {
      unsaveProtest(protest.id);
      toast({
        title: "Removed from saved",
        description: "Protest removed from your saved list.",
      });
    } else {
      saveProtest(protest);
      toast({
        title: "Saved!",
        description: "Protest added to your saved list.",
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast({
        title: "Link copied!",
        description: "The protest link has been copied to your clipboard.",
      });
    });
  };

  const handleGetDirections = () => {
    if (protest?.latitude && protest?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${protest.latitude},${protest.longitude}`;
      window.open(url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto bg-white min-h-screen">
          {/* Header skeleton */}
          <div className="sticky top-0 bg-white border-b z-10 p-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Skeleton className="h-8 w-8 rounded" />
          </div>

          {/* Image skeleton */}
          <Skeleton className="w-full h-64" />

          {/* Content skeleton */}
          <div className="p-4 space-y-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !protest) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto bg-white min-h-screen">
          <div className="sticky top-0 bg-white border-b z-10 p-4 flex items-center">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Protest Not Found</h2>
            <p className="text-gray-600">The protest you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b z-10 p-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleSaveClick}>
              <Heart 
                className={`h-4 w-4 ${protest && isProtestSaved(protest.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative">
          <img 
            src={getImageUrl()} 
            alt={protest.title}
            className="w-full h-64 object-cover"
            onError={handleImageError}
          />
          <div className="absolute top-4 left-4">
            <Badge className={`${getCategoryColor(protest.category)} text-white`}>
              {protest.category}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Title and basic info */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{protest.title}</h1>
            {protest.distance && (
              <div className="flex items-center text-gray-600 mb-4">
                <span className="text-sm">{protest.distance}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">About This Event</h3>
            <p className="text-gray-700 leading-relaxed">
              {protest.description.length > 700 
                ? `${protest.description.substring(0, 700)}...` 
                : protest.description}
            </p>
          </div>

          {/* Event Details */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{formatDate(protest.date)}</p>
                  <p className="text-sm text-gray-600">{formatTime(protest.time)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {protest.address && protest.address !== 'N/A' && protest.location && protest.location !== 'N/A' 
                      ? `${protest.address}, ${protest.location}`
                      : protest.location}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              I'm Going
            </Button>

            <Button 
              variant="outline" 
              className="w-full"
              size="lg"
              onClick={handleGetDirections}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
          </div>

          {/* Safety Notice */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Safety Reminder</h4>
              <p className="text-sm text-yellow-700">
                Please protest peacefully and follow local laws. Stay aware of your surroundings and respect others' rights.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}