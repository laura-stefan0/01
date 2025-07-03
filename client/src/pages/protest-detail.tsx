import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, MapPin, Calendar, ExternalLink, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
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

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!protest) return;

      if (isProtestSaved(protest.id.toString())) {
        await unsaveProtest(protest.id.toString());
        toast({
          title: "Removed from saved",
          description: "This protest has been removed from your saved list.",
        });
      } else {
        await saveProtest(protest);
        toast({
          title: "Saved!",
          description: "This protest has been added to your saved list.",
        });
      }
    },
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
        return "https://images.unsplash.com/photo-1569163139394-de44cb164e3b?w=400&h=200&fit=crop";
      case "lgbtq+":
        return "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=200&fit=crop";
      case "women's rights":
        return "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=200&fit=crop";
      case "labor":
        return "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=200&fit=crop";
      case "racial & social justice":
        return "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=200&fit=crop";
      case "civil & human rights":
        return "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=200&fit=crop";
      case "healthcare & education":
        return "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=200&fit=crop";
      case "peace & anti-war":
        return "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop";
      case "transparency & anti-corruption":
        return "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=200&fit=crop";
      default:
        return "https://images.unsplash.com/photo-1573152143286-0c422b4d2175?w=400&h=200&fit=crop";
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
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
    saveMutation.mutate();
  };

  const handleGetDirections = () => {
    if (protest?.latitude && protest?.longitude) {
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${protest.latitude},${protest.longitude}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8" />
            <Skeleton className="w-8 h-8" />
          </div>
        </div>
        <div className="flex-1 px-4 py-6 space-y-6">
          <Skeleton className="w-full h-48 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !protest) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Protest not found</h2>
            <p className="text-gray-600 mb-4">
              The protest you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/")}>Go back home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background animate-in fade-in duration-300 ease-out max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleSaveClick}>
            <Heart 
              className={`h-4 w-4 ${protest && isProtestSaved(protest.id.toString()) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
          {/* Title and Badge */}
          <div className="space-y-3">
            <Badge className={`${getCategoryColor(protest.category)} text-white w-fit`}>
              {protest.category}
            </Badge>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {protest.title}
            </h1>
          </div>

          {/* Description */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">About this protest</h3>
              <p className="text-gray-700 leading-relaxed">
                {protest.description}
              </p>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">
                    {formatDate(protest.date)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatTime(protest.time)}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">
                    {protest.address && protest.city 
                      ? `${protest.address}, ${protest.city}`
                      : protest.address || protest.city || 'Location not specified'
                    }
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
              onClick={handleSaveClick}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                "Saving..."
              ) : protest && isProtestSaved(protest.id.toString()) ? (
                <>
                  <Heart className="h-4 w-4 mr-2 fill-current" />
                  Saved
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 mr-2" />
                  I'm Going
                </>
              )}
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