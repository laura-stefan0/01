import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, Users, CheckCircle, CalendarDays } from "lucide-react";
import { useTodaysEvents } from "@/hooks/use-protests";
import { useUser } from "@/hooks/use-user";
import { Skeleton } from "@/components/ui/skeleton";
// Note: getCachedUserLocation returns a Promise, so we'll handle this differently

interface TodaysEventsProps {
  userCoordinates?: { latitude: number; longitude: number } | null;
}

export function TodaysEvents({ userCoordinates }: TodaysEventsProps) {
  const { data: user } = useUser();
  const { data: todaysEvents = [], isLoading } = useTodaysEvents(user?.id || 1, userCoordinates?.latitude, userCoordinates?.longitude);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const checkInMutation = useMutation({
    mutationFn: async ({ protestId, userLat, userLng }: { protestId: string; userLat?: number; userLng?: number }) => {
      const response = await fetch("/api/saved-protests/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          protestId,
          userLat,
          userLng,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to check in");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "✅ Checked in successfully!",
        description: "You've been checked in to the event. Thanks for participating!",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-protests/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-protests"] });
      setCheckingIn(null);
    },
    onError: (error: any) => {
      toast({
        title: "Check-in Failed",
        description: error.message || "Failed to check in. Please try again.",
        variant: "destructive",
      });
      setCheckingIn(null);
    },
  });

  const handleCheckIn = async (protestId: string) => {
    setCheckingIn(protestId);
    
    try {
      // Get current location for check-in validation
      let currentLocation = userCoordinates;
      
      // Skip cached location for now - we'll use passed coordinates or fresh location

      if (!currentLocation) {
        // Try to get fresh location
        if (navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000,
            });
          });
          currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        }
      }

      checkInMutation.mutate({
        protestId,
        userLat: currentLocation?.latitude,
        userLng: currentLocation?.longitude,
      });
    } catch (locationError) {
      console.warn("Could not get location for check-in:", locationError);
      // Still allow check-in without location validation
      checkInMutation.mutate({ protestId });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Environment": "bg-green-600",
      "LGBTQ+": "bg-rose-500",
      "Women's Rights": "bg-pink-700",
      "Labor": "bg-amber-600",
      "Racial & Social Justice": "bg-violet-700",
      "Civil & Human Rights": "bg-blue-600",
      "Healthcare & Education": "bg-cyan-600",
      "Peace & Anti-War": "bg-sky-400",
      "Transparency & Anti-Corruption": "bg-gray-600",
      "Other": "bg-indigo-600"
    };
    return colors[category as keyof typeof colors] || "bg-gray-600";
  };

  if (isLoading) {
    return (
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-dark-slate mb-3">Today's Events</h2>
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </section>
    );
  }

  if (!todaysEvents || todaysEvents.length === 0) {
    return (
      <section className="mb-6">
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <CalendarDays className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Today's Events</h2>
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          </div>
          <Card className="border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-purple-100 flex items-center justify-center">
                  <CalendarDays className="w-10 h-10 text-rose-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-lg">No saved events for today</p>
                  <p className="text-gray-600 mt-2">Save events you're interested in to see them here on event day!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6">
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <CalendarDays className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white">Today's Events</h2>
          <div className="ml-auto">
            <Badge className="bg-white text-rose-600 font-bold text-lg px-3 py-1 animate-bounce">
              {todaysEvents.length}
            </Badge>
          </div>
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {todaysEvents.map((event) => (
            <Card key={event.id} className="border-0 bg-white/95 backdrop-blur-sm transition-all duration-500 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-4 h-4 bg-gradient-to-r from-rose-500 to-purple-500 rounded-full animate-pulse"></div>
                      <h3 className="font-bold text-gray-800 text-xl">{event.title}</h3>
                    </div>
                    <Badge className={`${getCategoryColor(event.category)} text-white text-sm font-bold px-3 py-1`}>
                      {event.category}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => handleCheckIn(String(event.id))}
                    disabled={checkingIn === String(event.id)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white ml-4 transition-all duration-300 transform hover:scale-110 font-bold text-base px-6 py-3"
                    size="lg"
                  >
                    {checkingIn === String(event.id) ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Checking in...
                      </div>
                    ) : (
                      <>
                        <CheckCircle className="w-6 h-6 mr-2" />
                        Check-in Now!
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{event.address}, {event.city}</span>
                  </div>
                </div>
                
                {event.description && (
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                    {event.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}