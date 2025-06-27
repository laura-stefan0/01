import { useParams, useLocation } from "wouter";
import { ArrowLeft, Share2, MapPin, Calendar, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { Protest } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { formatDate, formatTime } from "@/lib/date-utils";

export default function ProtestDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  
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
        return "bg-green-500";
      case "lgbtq+":
      case "lgbt+":
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

  const handleShare = async () => {
    const shareData = {
      title: protest?.title,
      text: `Join the ${protest?.title} protest on ${protest?.date}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled sharing or error occurred
        copyToClipboard();
      }
    } else {
      copyToClipboard();
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
            <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
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
            <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
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
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Hero Image */}
        <div className="relative">
          <img 
            src={protest.image_url ?? `https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=500&h=300&fit=crop&auto=format`} 
            alt={protest.title}
            className="w-full h-64 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=500&h=300&fit=crop&auto=format`;
            }}
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
            <div className="flex items-center text-gray-600 mb-4">
              <Users className="h-4 w-4 mr-1" />
              <span className="text-sm">{protest.attendees} people going</span>
              {protest.distance && (
                <>
                  <span className="mx-2">•</span>
                  <span className="text-sm">{protest.distance}</span>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">About This Event</h3>
            <p className="text-gray-700 leading-relaxed">{protest.description}</p>
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
                  <p className="font-medium text-gray-900">{protest.location}</p>
                  <p className="text-sm text-gray-600">{protest.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              className="w-full bg-activist-blue hover:bg-activist-blue/90"
              size="lg"
            >
              <Users className="h-4 w-4 mr-2" />
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

            {protest.event_url && (
              <Button 
                variant="outline" 
                className="w-full"
                size="lg"
                onClick={() => window.open(protest.event_url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Event Page
              </Button>
            )}
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