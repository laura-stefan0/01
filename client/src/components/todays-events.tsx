import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Clock, MapPin, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string | number;
  title: string;
  description?: string;
  category: string;
  city: string;
  address: string;
  date: string;
  time: string;
  latitude: number;
  longitude: number;
}

interface TodaysEventsProps {
  userCoordinates: { latitude: number; longitude: number } | null;
}

export const TodaysEvents: React.FC<TodaysEventsProps> = ({ userCoordinates }) => {
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [checkedInEvents, setCheckedInEvents] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const { data: todaysEvents = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/protests/nearby', userCoordinates?.latitude, userCoordinates?.longitude],
    enabled: !!userCoordinates,
  });

  // Filter events for today's date
  const todaysFilteredEvents = todaysEvents.filter(event => 
    event.date === today
  );

  const handleCheckIn = async (eventId: string) => {
    setCheckingIn(eventId);
    
    // Simulate check-in process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCheckedInEvents(prev => new Set([...prev, eventId]));
    setCheckingIn(null);
    
    toast({
      title: "✅ Checked in successfully!",
      description: "Have a great time at the event. Stay safe!",
    });
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
      <div className="border-t border-white/20 pt-6 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Today's events</h3>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl bg-white/10" />
          <Skeleton className="h-20 w-full rounded-xl bg-white/10" />
        </div>
      </div>
    );
  }

  if (!todaysFilteredEvents || todaysFilteredEvents.length === 0) {
    return (
      <div className="border-t border-white/20 pt-6 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Today's events</h3>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <p className="font-medium text-white text-sm mb-1">No events for today</p>
            <p className="text-white/70 text-xs">When you save events happening today, you'll see them here!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-white/20 pt-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Today's events</h3>
        </div>
        <Badge className="bg-white/20 backdrop-blur-sm text-white font-medium text-sm px-3 py-1 border border-white/30 rounded-full">
          {todaysFilteredEvents.length}
        </Badge>
      </div>
      
      <div className="space-y-3">
        {todaysFilteredEvents.map((event) => (
          <div key={event.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-white text-sm">{event.title}</h4>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${getCategoryColor(event.category)} text-white text-xs font-medium px-2 py-1 rounded-full`}>
                    {event.category}
                  </Badge>
                  <Badge className="bg-white/20 text-white text-xs font-medium px-2 py-1 rounded-full border border-white/30">
                    Saved
                  </Badge>
                </div>
              </div>
              <div className="ml-4">
                <Button
                  onClick={() => handleCheckIn(String(event.id))}
                  disabled={checkingIn === String(event.id) || checkedInEvents.has(String(event.id))}
                  className="bg-white/20 hover:bg-white/30 text-white font-medium text-xs px-3 py-2 rounded-lg border border-white/30 backdrop-blur-sm"
                  size="sm"
                >
                  {checkingIn === String(event.id) ? (
                    "Checking in..."
                  ) : checkedInEvents.has(String(event.id)) ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Checked in
                    </>
                  ) : (
                    "Check in"
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-1 text-xs text-white/80">
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-2" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-3 h-3 mr-2" />
                <span>{event.address}, {event.city}</span>
              </div>
            </div>

            {event.description && (
              <div className="mt-3 p-3 bg-white/10 rounded-lg border border-white/20">
                <p className="text-xs text-white/70 line-clamp-2">
                  {event.description}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaysEvents;