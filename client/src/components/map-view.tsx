import { useState } from "react";
import { useProtests } from "@/hooks/use-protests";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { ProtestCard } from "@/components/protest-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import type { Protest } from "@shared/schema";

export function MapView() {
  const { data: protests = [], isLoading } = useProtests();
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const filters = [
    { id: "all", label: "All" },
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "popular", label: "Popular" },
  ];
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative flex flex-col">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100 flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-dark-slate">Search</h1>
          </div>

          {/* Search Bar */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search protests by name or cause..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-activist-blue focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setLocation("/filter")}
              className="flex-shrink-0 bg-gray-50 border-gray-200 hover:bg-gray-100"
            >
              <Filter className="w-4 h-4 text-gray-600" />
            </Button>
          </div>

          {/* Filter Tags */}
          <div className="flex space-x-2 mt-3 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <Badge
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "secondary"}
                className={`cursor-pointer whitespace-nowrap ${
                  activeFilter === filter.id
                    ? "bg-activist-blue text-white hover:bg-activist-blue/90"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </Badge>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        {/* Protests List */}
        <section className="px-4 py-4">
          <h2 className="text-lg font-semibold text-dark-slate mb-3">All Protests</h2>

          {/* Vertical List of Protest Cards */}
          <div className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : protests.length > 0 ? (
              protests
                .filter((protest) => {
                  // Filter by search query
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
                  // Filter by date/time filters
                  if (activeFilter === "today") {
                    return protest.date === "Today";
                  } else if (activeFilter === "week") {
                    return ["Today", "Tomorrow"].includes(protest.date) || protest.date.startsWith("Next");
                  } else if (activeFilter === "popular") {
                    return protest.attendees > 500;
                  }
                  return true;
                })
                .map((protest) => (
                  <ProtestCard key={protest.id} protest={protest} />
                ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No protests found</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}