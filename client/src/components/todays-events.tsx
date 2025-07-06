import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, Users, CheckCircle, CalendarDays } from "lucide-react";
import { useSavedProtests } from "@/context/saved-protests-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

interface TodaysEventsProps {
  userCoordinates?: { latitude: number; longitude: number } | null;
}

export function TodaysEvents({ userCoordinates }: TodaysEventsProps) {
  const { savedProtests } = useSavedProtests();
  
  // Filter saved protests to only show today's events
  const todaysEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return savedProtests.filter(protest => protest.date === today);
  }, [savedProtests]);
  
  const isLoading = false; // No API loading since we're using local storage
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const checkInMutation = useMutation({
    mutationFn: async ({ protestId }: { protestId: string }) => {
      // Store check-in locally
      const checkInsKey = 'corteo_checked_in_protests';
      const existingCheckIns = JSON.parse(localStorage.getItem(checkInsKey) || '[]');
      
      const checkIn = {
        protestId,
        checkedInAt: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      };
      
      const updatedCheckIns = [...existingCheckIns, checkIn];
      localStorage.setItem(checkInsKey, JSON.stringify(updatedCheckIns));
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "✅ Checked in successfully!",
        description: "You've been checked in to the event. Thanks for participating!",
      });
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
    
    // Check if already checked in today
    const checkInsKey = 'corteo_checked_in_protests';
    const existingCheckIns = JSON.parse(localStorage.getItem(checkInsKey) || '[]');
    const today = new Date().toISOString().split('T')[0];
    
    const alreadyCheckedIn = existingCheckIns.some((checkIn: any) => 
      checkIn.protestId === protestId && checkIn.date === today
    );
    
    if (alreadyCheckedIn) {
      toast({
        title: "Already checked in",
        description: "You've already checked in to this event today!",
        variant: "default",
      });
      setCheckingIn(null);
      return;
    }

    checkInMutation.mutate({ protestId });
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
      <div className="border-t border-gray-100 pt-4 mt-4">
        <div className="flex items-center gap-3 mb-4">
          <CalendarDays className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Are you going today?</h3>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!todaysEvents || todaysEvents.length === 0) {
    return (
      <div className="border-t border-gray-100 pt-4 mt-4">
        <div className="flex items-center gap-3 mb-4">
          <CalendarDays className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Are you going today?</h3>
        </div>
        <Card className="border border-gray-200 bg-gray-50">
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">No events saved for today</p>
                <p className="text-gray-600 text-xs mt-1">When you save events happening today, you'll see them here with check-in options!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100 pt-4 mt-4">
      <div className="flex items-center gap-3 mb-4">
        <CalendarDays className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Are you going today?</h3>
        <div className="ml-auto">
          <Badge className="bg-[#e11d48] text-white font-medium text-sm px-2 py-1">
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
                          I'm here!
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
  );
}