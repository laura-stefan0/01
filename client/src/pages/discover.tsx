
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin } from "lucide-react";
import { ProtestCard } from "@/components/protest-card";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useFeaturedProtests, useNearbyProtests } from "@/hooks/use-protests";
import { useLocation } from "wouter";

export default function Discover() {
  const [activeTab, setActiveTab] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedCountry] = useState(() => {
    return localStorage.getItem('corteo_selected_country') || 'it';
  });
  const [, setLocation] = useLocation();

  const { data: featuredProtests = [], isLoading: featuredLoading } = useFeaturedProtests(selectedCountry);
  const { data: nearbyProtests = [], isLoading: nearbyLoading } = useNearbyProtests(selectedCountry);

  const allProtests = [...featuredProtests, ...nearbyProtests];
  const uniqueProtests = allProtests.filter((protest, index, self) =>
    index === self.findIndex((p) => p.id === protest.id)
  );

  const filters = [
    { id: "all", label: "All" },
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "popular", label: "Popular" },
  ];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case "home":
        setLocation("/");
        break;
      case "discover":
        // Already on discover page
        break;
      case "resources":
        setLocation("/resources");
        break;
      case "saved":
        setLocation("/saved");
        break;
      case "profile":
        setLocation("/profile");
        break;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-dark-slate mb-3">Discover</h1>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search protests, causes, locations..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {filters.map((filter) => (
              <Badge
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </Badge>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4 pb-24">
        <div className="space-y-3">
          {featuredLoading || nearbyLoading ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : uniqueProtests.length > 0 ? (
            uniqueProtests
              .filter((protest) => {
                if (searchQuery) {
                  const query = searchQuery.toLowerCase();
                  return (
                    protest.title.toLowerCase().includes(query) ||
                    protest.description.toLowerCase().includes(query) ||
                    protest.category.toLowerCase().includes(query) ||
                    protest.location.toLowerCase().includes(query)
                  );
                }
                return true;
              })
              .filter((protest) => {
                if (activeFilter === "today") {
                  return protest.date === "Today";
                } else if (activeFilter === "week") {
                  return ["Today", "Tomorrow"].includes(protest.date) || protest.date.startsWith("Next");
                } else if (activeFilter === "popular") {
                  return protest.attendees > 500;
                }
                return true;
              })
              .map((protest, index) => (
                <ProtestCard key={`discover-${protest.id}-${index}`} protest={protest} />
              ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No protests found</p>
            </div>
          )}
        </div>

        {/* View on Map Button */}
        <div className="mt-6 mb-4">
          <Button
            className="w-full bg-activist-blue hover:bg-activist-blue/90 text-white"
            size="lg"
            onClick={() => setLocation("/?tab=map")}
          >
            <MapPin className="w-5 h-5 mr-2" />
            View on Map
          </Button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
