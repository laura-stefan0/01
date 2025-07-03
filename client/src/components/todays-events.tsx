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
        <div className="bg-[#e11d48] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <CalendarDays className="w-5 h-5 text-white" />
            <h2 className="text-lg font-semibold text-white">Are you going today?</h2>
          </div>
          <Card className="border-0 bg-white">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <CalendarDays className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">No events saved for today</p>
                  <p className="text-gray-600 text-sm mt-1">When you save events happening today, you'll see them here with check-in options!</p>
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
      <div className="bg-[#e11d48] rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <CalendarDays className="w-5 h-5 text-white" />
          <h2 className="text-lg font-semibold text-white">Are you going today?</h2>
          <div className="ml-auto">
            <Badge className="bg-white text-[#e11d48] font-medium text-sm px-2 py-1">
              {todaysEvents.length} event{todaysEvents.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        <div className="space-y-3">
          {todaysEvents.map((event) => (
            <Card key={event.id} className="border-0 bg-white">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800 text-lg">{event.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getCategoryColor(event.category)} text-white text-xs font-medium px-2 py-1`}>
                        {event.category}
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1">
                        Saved
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      onClick={() => handleCheckIn(String(event.id))}
                      disabled={checkingIn === String(event.id)}
                      className="bg-[#e11d48] hover:bg-[#be185d] text-white font-medium text-sm px-4 py-2"
                      size="sm"
                    >
                      {checkingIn === String(event.id) ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Checking in...
                        </div>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          I'm going!
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 text-center">Tap when you arrive</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-md p-3 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{event.address}, {event.city}</span>
                  </div>
                </div>

                {event.description && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}