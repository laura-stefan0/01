import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Filter() {
  const [, setLocation] = useLocation();
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState("all");
  const [organizerFilter, setOrganizerFilter] = useState("all");

  // Load saved filters on component mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('corteo_map_filters');
    if (savedFilters) {
      try {
        const filterData = JSON.parse(savedFilters);
        setSelectedCauses(filterData.causes || []);
        setDateFilter(filterData.date || "all");
        setOrganizerFilter(filterData.organizer || "all");
      } catch (error) {
        console.error("Error loading saved filters:", error);
      }
    }
  }, []);

  const causes = [
    "Environment",
    "LGBTQ+",
    "Women's Rights",
    "Labor",
    "Racial & Social Justice",
    "Civil & Human Rights",
    "Healthcare & Education",
    "Peace & Anti-War",
    "Transparency & Anti-Corruption",
    "Other"
  ];

  const handleCauseToggle = (cause: string) => {
    setSelectedCauses(prev => 
      prev.includes(cause) 
        ? prev.filter(c => c !== cause)
        : [...prev, cause]
    );
  };

  const handleApplyFilters = () => {
    // Store filters in localStorage for the MapView to read
    const filterData = {
      causes: selectedCauses,
      date: dateFilter,
      organizer: organizerFilter,
      appliedAt: Date.now()
    };
    localStorage.setItem('corteo_map_filters', JSON.stringify(filterData));
    
    // Navigate back to map with filters applied
    setLocation("/discover");
  };

  const handleClearFilters = () => {
    setSelectedCauses([]);
    setDateFilter("all");
    setOrganizerFilter("all");
    // Clear stored filters
    localStorage.removeItem('corteo_map_filters');
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation("/discover")}
              className="text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-dark-slate">Filters</h1>
            <Button 
              variant="ghost" 
              onClick={handleClearFilters}
              className="text-activist-blue"
            >
              Clear
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 space-y-6">
        {/* Cause Filter */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-dark-slate mb-3">Cause</h3>
            <div className="space-y-3">
              {causes.map((cause) => (
                <div key={cause} className="flex items-center space-x-2">
                  <Checkbox 
                    id={cause}
                    checked={selectedCauses.includes(cause)}
                    onCheckedChange={() => handleCauseToggle(cause)}
                  />
                  <Label htmlFor={cause} className="text-sm font-normal">
                    {cause}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Date Filter */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-dark-slate mb-3">Date</h3>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Organizer Filter */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-dark-slate mb-3">Organizer</h3>
            <Select value={organizerFilter} onValueChange={setOrganizerFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All organizers</SelectItem>
                <SelectItem value="verified">Verified only</SelectItem>
                <SelectItem value="local">Local groups</SelectItem>
                <SelectItem value="national">National organizations</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </main>

      {/* Apply Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={handleApplyFilters}
            className="w-full bg-[#E11D48] hover:bg-[#E11D48]/90 text-white"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}