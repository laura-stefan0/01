import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Users, MapPin, Search, Shield, CheckSquare, Lock, BookOpen, Target, Printer, Phone, MessageCircle, Sparkles, Star, Zap, ChevronDown, RefreshCw, Calendar, Check } from "lucide-react";
import { getCachedUserLocation, getUserLocation } from "@/lib/geolocation";
import { calculateDistance } from "@/lib/distance-utils";
import { findCityCoordinates } from "@/lib/geocoding";
import { ProtestCard } from "@/components/protest-card";
import { useFeaturedProtests, useNearbyProtests } from "@/hooks/use-protests";
import { useUser } from "@/hooks/use-user";
import { useWhatsNew } from "@/hooks/use-whats-new";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";
import { LocationSelector } from "@/components/location-selector";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface CreateProtestData {
  title: string;
  description: string;
  category: string;
  event_type: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  date: string;
  time: string;
  image_url?: string;
  url?: string;
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoadingProtests, setIsLoadingProtests] = useState(true);
  const [allProtests, setAllProtests] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    return localStorage.getItem('corteo_selected_country') || 'it';
  });
  const [userRealLocation, setUserRealLocation] = useState<string | null>(null);
  const [manualLocation, setManualLocation] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState<{latitude: number, longitude: number} | null>(null);
  const [manualLocationCoordinates, setManualLocationCoordinates] = useState<{latitude: number, longitude: number} | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateProtestData>({
    title: "",
    description: "",
    category: "",
    event_type: "",
    location: "",
    address: "",
    latitude: 37.7749,
    longitude: -122.4194,
    date: "",
    time: "",
    image_url: "",
    url: ""
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Determine which coordinates to use for distance calculation
  const referenceCoordinates = manualLocationCoordinates || userCoordinates;

  const { data: featuredProtests = [], isLoading: featuredLoading } = useFeaturedProtests(selectedCountry);
  const { data: nearbyProtests = [], isLoading: nearbyLoading } = useNearbyProtests(
    selectedCountry, 
    referenceCoordinates?.latitude, 
    referenceCoordinates?.longitude
  );
  const { data: user } = useUser();

  // Map selected country to country code for What's new filtering
  const countryCodeMapping = {
    'it': 'IT',
    'us': 'US',
    'uk': 'UK'
  };
  const whatsNewCountryCode = countryCodeMapping[selectedCountry as keyof typeof countryCodeMapping] || selectedCountry.toUpperCase();

  const { data: whatsNewData = [], isLoading: whatsNewLoading } = useWhatsNew(whatsNewCountryCode);
  const { signOut, isAuthenticated } = useAuth();

  const createProtestMutation = useMutation({
    mutationFn: async (data: CreateProtestData & { image_url?: string }) => {
      const response = await fetch("/api/protests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          image_url: data.image_url,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "🎉 Event submitted successfully!",
        description: "Thank you for your contribution. Your event will be reviewed and published shortly.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/protests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/protests/featured"] });
      queryClient.invalidateQueries({ queryKey: ["/api/protests/nearby"] });
      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        category: "",
        event_type: "",
        location: "",
        address: "",
        latitude: 37.7749,
        longitude: -122.4194,
        date: "",
        time: "",
        image_url: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit event. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating protest:", error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.event_type || !formData.location || !formData.date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createProtestMutation.mutate(formData);
  };

  const categories = [
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

  const eventTypes = [
    "Protest",
    "Workshop",
    "Assembly",
    "Talk",
    "Other"
  ];

  // Handle country selection change
  const handleCountryChange = (newCountry: string) => {
    setSelectedCountry(newCountry);
    localStorage.setItem('corteo_selected_country', newCountry);
  };

  // Handle manual location selection
  const handleLocationSelect = (location: string) => {
    if (location === "") {
      // Reset to automatic location detection
      setManualLocation(null);
      setManualLocationCoordinates(null);
      localStorage.removeItem('corteo_manual_location');
      localStorage.removeItem('corteo_manual_location_coords');
    } else {
      setManualLocation(location);
      localStorage.setItem('corteo_manual_location', location);

      // Get coordinates for the manually selected location
      const [city] = location.split(', ');
      const cityData = findCityCoordinates(city, selectedCountry);

      if (cityData) {
        const coords = { latitude: cityData.lat, longitude: cityData.lng };
        setManualLocationCoordinates(coords);
        localStorage.setItem('corteo_manual_location_coords', JSON.stringify(coords));
        console.log(`📍 Manual location coordinates for ${city} (${selectedCountry.toUpperCase()}):`, coords);
      } else {
        console.warn(`❌ No coordinates found for ${city} in ${selectedCountry.toUpperCase()}`);
        setManualLocationCoordinates(null);
        localStorage.removeItem('corteo_manual_location_coords');
      }
    }
  };

  // Get user's real location using geolocation API
  const fetchUserRealLocation = async (forceRefresh = false) => {
    setIsLoadingLocation(true);
    try {
      console.log('📍 Getting user coordinates...');
      // Clear cache if force refresh is requested
      if (forceRefresh) {
        localStorage.removeItem('corteo_cached_location');
        localStorage.removeItem('corteo_location_timestamp');
        localStorage.removeItem('corteo_user_location_cache');
        console.log('🔄 Cleared location cache for fresh fetch');
      }
      // Use direct getUserLocation if force refresh, otherwise use cached version
      if (forceRefresh) {
        console.log('🔄 Force refresh: calling getUserLocation with fresh coordinates');
        const locationResult = await getUserLocation(true);
        setUserRealLocation(locationResult.formatted);
        setUserCoordinates(locationResult.coordinates);
        console.log('✅ Force refresh complete:', locationResult.formatted, locationResult.coordinates);
      } else {
        const locationResult = await getCachedUserLocation();
        setUserRealLocation(locationResult.formatted);
        setUserCoordinates(locationResult.coordinates);
        console.log('✅ Cached location updated:', locationResult.formatted, locationResult.coordinates);
      }
    } catch (error) {
      console.error('Failed to get user location:', error);
      setUserRealLocation(null);
      setUserCoordinates(null);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Enhanced refresh function with spin-to-checkmark animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setShowSuccess(false);
    
    try {
      // Clear manual location override to use fresh GPS location
      setManualLocation(null);
      setManualLocationCoordinates(null);
      localStorage.removeItem('corteo_manual_location');
      localStorage.removeItem('corteo_manual_location_coords');
      
      // Clear location cache and fetch fresh location
      await fetchUserRealLocation(true);
      
      // Add a small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Invalidate all queries to refresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/protests"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/protests/featured"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/protests/nearby"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/whats-new"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] })
      ]);

      // Show success checkmark
      setIsRefreshing(false);
      setShowSuccess(true);
      
      // Hide checkmark after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error('Refresh failed:', error);
      setIsRefreshing(false);
      setShowSuccess(false);
      toast({
        title: "Refresh failed", 
        description: "Unable to update content. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Initialize country and manual location from localStorage
  useEffect(() => {
    const savedCountry = localStorage.getItem('corteo_selected_country');
    if (savedCountry) {
      setSelectedCountry(savedCountry);
    }

    const savedManualLocation = localStorage.getItem('corteo_manual_location');
    if (savedManualLocation) {
      setManualLocation(savedManualLocation);
    }

    // Load manual location coordinates from localStorage
    const savedManualCoords = localStorage.getItem('corteo_manual_location_coords');
    if (savedManualCoords) {
      try {
        const coords = JSON.parse(savedManualCoords);
        setManualLocationCoordinates(coords);
      } catch (error) {
        console.error('Error parsing saved manual location coordinates:', error);
      }
    }
  }, []);

  // Fetch user's real location on component mount
  useEffect(() => {
    fetchUserRealLocation();
  }, []);

  // Sort protests by distance from user location
  const sortProtestsByDistance = (protests: any[]) => {
    if (!protests.length) return protests;

    // Use manual location coordinates if available, otherwise use real user coordinates
    const referenceCoords = manualLocationCoordinates || userCoordinates;
    if (!referenceCoords) return protests;

    return [...protests].sort((a, b) => {
      // Check if protests have valid coordinates
      const aLat = parseFloat(a.latitude);
      const aLng = parseFloat(a.longitude);
      const bLat = parseFloat(b.latitude);
      const bLng = parseFloat(b.longitude);

      if (isNaN(aLat) || isNaN(aLng)) return 1; // Move invalid coordinates to end
      if (isNaN(bLat) || isNaN(bLng)) return -1;

      const distanceA = calculateDistance(
        referenceCoords.latitude,
        referenceCoords.longitude,
        aLat,
        aLng
      );

      const distanceB = calculateDistance(
        referenceCoords.latitude,
        referenceCoords.longitude,
        bLat,
        bLng
      );

      return distanceA - distanceB; // Sort by distance, closest first
    });
  };

  // Get location name from selected country in city, state format
  const getLocationName = () => {
    switch(selectedCountry) {
      case 'it': return 'Milan, IT';
      case 'us': return 'Los Angeles, CA';
      case 'uk': return 'London, UK';
      default: return 'Unknown Location';
    }
  };

  // Combine protests data for map view
  useEffect(() => {
    if (featuredProtests.length > 0 || nearbyProtests.length > 0) {
      const combinedProtests = [...featuredProtests, ...nearbyProtests];
      const uniqueProtests = combinedProtests.filter((protest, index, self) =>
        index === self.findIndex((p) => p.id === protest.id)
      );
      setAllProtests(uniqueProtests);
    }
    setIsLoadingProtests(featuredLoading || nearbyLoading);
  }, [featuredProtests.length, nearbyProtests.length, featuredLoading, nearbyLoading]);

  const filters = [
    { id: "all", label: "All" },
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "popular", label: "Popular" },
  ];

  // Format timestamp for display
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  // Use manual location if available, otherwise use real user location, otherwise fallback
  const displayLocation = manualLocation || userRealLocation || user?.user_location || getLocationName();
  // Parse location to get city only (remove region/state)
  const [city] = displayLocation.split(', ');

  return (
    <div className="px-4 py-4 max-w-md mx-auto animate-in fade-in duration-300 ease-out">
      {/* Location Section with Notification Bell */}
      <section className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Your location</span>
            </div>
            <LocationSelector
              currentLocation={displayLocation}
              selectedCountry={selectedCountry}
              onLocationSelect={handleLocationSelect}
              onCountryChange={handleCountryChange}
            >
              <button className="flex items-center gap-1 hover:text-gray-800 transition-colors font-medium text-left mt-1">
                {isLoadingLocation ? (
                  <span className="text-gray-500">Getting location...</span>
                ) : (
                  <span>{city}</span>
                )}
                <ChevronDown className="w-3 h-3" />
              </button>
            </LocationSelector>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh location button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoadingLocation || showSuccess}
              className="transition-all duration-200 hover:bg-gray-100"
            >
              {showSuccess ? (
                <Check className="w-5 h-5 animate-in fade-in duration-300" />
              ) : (
                <RefreshCw className={`w-4 h-4 transition-transform duration-500 ${
                  (isRefreshing || isLoadingLocation) ? 'animate-spin' : ''
                }`} />
              )}
            </Button>

            {/* Notification bell */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-dark-slate mb-3">What's new</h2>
        <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {whatsNewLoading ? (
            <>
              <Skeleton className="w-48 h-32 flex-shrink-0" />
              <Skeleton className="w-48 h-32 flex-shrink-0" />
              <Skeleton className="w-48 h-32 flex-shrink-0" />
            </>
          ) : whatsNewData.length > 0 ? (
            whatsNewData.map((news) => {
                console.log('📄 News item:', news.title);
                console.log('🖼️ Image URL:', news.image_url);
                console.log('📊 Full news object:', news);

                const handleCardClick = () => {
                  // Check if there's a CTA URL to navigate to
                  if (news.cta_url) {
                    if (news.cta_url.startsWith('http://') || news.cta_url.startsWith('https://')) {
                      // External URL - open in new tab
                      window.open(news.cta_url, '_blank');
                    } else if (news.cta_url.startsWith('/')) {
                      // Internal route - navigate within app
                      navigate(news.cta_url);
                    } else {
                      // Relative URL - treat as internal route
                      navigate(`/${news.cta_url}`);
                    }
                  }
                };

                return (
                  <div 
                    key={news.id} 
                    className={`relative w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 ${
                      news.cta_url ? 'cursor-pointer' : ''
                    }`}
                    onClick={handleCardClick}
                    role={news.cta_url ? 'button' : undefined}
                    tabIndex={news.cta_url ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (news.cta_url && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleCardClick();
                      }
                    }}
                  >
                    {news.image_url ? (
                      <img 
                        src={news.image_url} 
                        alt={news.title}
                        className="w-full h-full object-cover"
                        onLoad={() => console.log('✅ Image loaded successfully:', news.image_url)}
                        onError={(e) => {
                          console.error('❌ Image failed to load:', news.image_url);
                          // Show text-based card instead of hiding
                          const imgElement = e.currentTarget as HTMLImageElement;
                          const parentDiv = imgElement.parentElement;
                          if (parentDiv) {
                            parentDiv.innerHTML = `
                              <div class="w-full h-full bg-gradient-to-br from-activist-blue to-activist-blue/80 flex flex-col justify-center items-center p-3 text-white">
                                <h3 class="text-sm font-semibold text-center leading-tight mb-1">${news.title}</h3>
                                ${news.cta_text ? `<p class="text-xs opacity-90 text-center">${news.cta_text}</p>` : ''}
                              </div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      // Show text-based card for items without images
                      <div className="w-full h-full bg-gradient-to-br from-activist-blue to-activist-blue/80 flex flex-col justify-center items-center p-3 text-white">
                        <h3 className="text-sm font-semibold text-center leading-tight mb-1">{news.title}</h3>
                        {news.cta_text && (
                          <p className="text-xs opacity-90 text-center">{news.cta_text}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
          ) : (
            <div className="w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"></div>
          )}
        </div>
      </section>

      {/* Featured Section */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-dark-slate">Featured</h2>
        </div>

        {/* Horizontal Scrolling Featured Cards - Wider */}
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {featuredLoading ? (
            <>
              <Skeleton className="w-5/6 h-56 flex-shrink-0" />
              <Skeleton className="w-5/6 h-56 flex-shrink-0" />
              <Skeleton className="w-5/6 h-56 flex-shrink-0" />
            </>
          ) : (
            featuredProtests.map((protest, index) => (
              <div key={`featured-${protest.id}-${index}`} className="w-5/6 flex-shrink-0">
                <ProtestCard protest={protest} variant="featured" />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Nearby */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-dark-slate mb-3">Nearby</h2>

        {/* Vertical List of Protest Cards */}
        <div className="space-y-4">
          {nearbyLoading ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : nearbyProtests.length > 0 ? (
            sortProtestsByDistance(nearbyProtests).slice(0, 5).map((protest, index) => (
              <ProtestCard key={`nearby-${protest.id}-${index}`} protest={protest} />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No protests found</p>
            </div>
          )}
        </div>
      </section>

      {/* Create Protest Section */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-dark-slate mb-3">Did we miss one?</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full bg-activist-blue hover:bg-activist-blue/90 text-white py-4 text-base font-medium"
            >
              Add an event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg">Add Event</DialogTitle>
              <div className="text-sm text-gray-600 mt-2 p-3 bg-gray-50 rounded-lg">
                We appreciate any details you can provide about this event to help others discover and participate in meaningful activism.
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Event Name */}
              <div className="space-y-2">
                <Label htmlFor="title">Event name *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="March for Climate Action"
                  required
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="event_type">Type *</Label>
                <Select value={formData.event_type} onValueChange={(value) => setFormData({ ...formData, event_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cause */}
              <div className="space-y-2">
                <Label htmlFor="category">Cause *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a cause" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Any other info */}
              <div className="space-y-2">
                <Label htmlFor="description">Any other info</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about the event, meeting point, what to bring, etc..."
                  rows={3}
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="City Hall, 1 Dr Carlton B Goodlett Pl"
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="location">City *</Label>
                <div className="relative">
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="San Francisco, CA"
                    className="pl-10"
                    required
                  />
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <div className="relative">
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="pl-10"
                    required
                  />
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Time */}
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              {/* URL */}
              <div className="space-y-2">
                <Label htmlFor="url">Event URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com/event-details"
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-activist-blue hover:bg-activist-blue/90 text-white"
                disabled={createProtestMutation.isPending}
              >
                {createProtestMutation.isPending ? "Submitting..." : "Submit Event"}
              </Button>

              <div className="text-xs text-gray-500 text-center mt-2">
                Your event will be reviewed before being published.
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      {/* Feedback Section */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-dark-slate mb-3">Help us improve</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Card className="cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-activist-blue transition-colors bg-white dark:bg-gray-800">
              <CardContent className="p-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-activist-blue/10 dark:bg-activist-blue/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-activist-blue" />
                  </div>
                  <h3 className="font-medium text-dark-slate dark:text-white">Share your feedback</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Help us improve Corteo</p>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Share Your Feedback</DialogTitle>
              <div className="text-sm text-gray-600 mt-2">
                Your suggestions help us build a better platform for activists and organizers.
              </div>
            </DialogHeader>

            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const feedbackType = formData.get('feedbackType') as string;
              const message = formData.get('message') as string;
              
              // Here you would typically send this to your backend
              console.log('Feedback submitted:', { feedbackType, message });
              
              toast({
                title: "Thank you for your feedback!",
                description: "We appreciate your input and will review it carefully.",
                variant: "success",
              });
              
              // Reset form
              (e.target as HTMLFormElement).reset();
            }}>
              {/* Feedback Type */}
              <div className="space-y-2">
                <Label htmlFor="feedbackType">What would you like to share?</Label>
                <Select name="feedbackType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suggestion">Feature suggestion</SelectItem>
                    <SelectItem value="bug">Report a bug</SelectItem>
                    <SelectItem value="improvement">App improvement</SelectItem>
                    <SelectItem value="content">Content feedback</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Your message</Label>
                <Textarea
                  name="message"
                  placeholder="Tell us what you think, what could be improved, or any ideas you have..."
                  rows={4}
                  required
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full bg-activist-blue hover:bg-activist-blue/90 text-white">
                Send Feedback
              </Button>

              <div className="text-xs text-gray-500 text-center">
                We read every piece of feedback and use it to improve Corteo.
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      {/* Donations Section */}
      <section>
        <h2 className="text-lg font-semibold text-dark-slate mb-3">Support Us</h2>
        <Card className="bg-activist-blue">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 text-white">Make a Difference</h3>
            <p className="text-sm mb-3 text-white">Your donation helps support activists and organizations fighting for change.</p>
            <Button className="w-full bg-white text-activist-blue hover:bg-clean-white">
              Donate Now
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}