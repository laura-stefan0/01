import { useState } from "react";
import { Bell, Users, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProtestCard } from "@/components/protest-card";
import { MapView } from "@/components/map-view";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useFeaturedProtests, useNearbyProtests } from "@/hooks/use-protests";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: featuredProtests = [], isLoading: featuredLoading } = useFeaturedProtests();
  const { data: nearbyProtests = [], isLoading: nearbyLoading } = useNearbyProtests();

  // Filter options
  const filters = [
    { id: "all", label: "All" },
    { id: "climate", label: "Climate" },
    { id: "pride", label: "Pride" },
    { id: "workers", label: "Workers" },
    { id: "justice", label: "Justice" },
    { id: "environment", label: "Environment" },
    { id: "education", label: "Education" }
  ];

  const renderHomeContent = () => (
    <div>
      {/* Featured Section */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-dark-slate">Featured Protests</h2>
        </div>
        
        {/* Horizontal Scrolling Featured Cards - Narrower */}
        <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {featuredLoading ? (
            <>
              <Skeleton className="w-3/4 h-56 flex-shrink-0" />
              <Skeleton className="w-3/4 h-56 flex-shrink-0" />
              <Skeleton className="w-3/4 h-56 flex-shrink-0" />
            </>
          ) : (
            featuredProtests.map((protest) => (
              <div key={protest.id} className="w-3/4 flex-shrink-0">
                <ProtestCard protest={protest} variant="featured" />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Nearby Protests */}
      <section className="px-4 py-4">
        <h2 className="text-lg font-semibold text-dark-slate mb-3">Nearby Protests</h2>
        
        {/* Vertical List of Protest Cards */}
        <div className="space-y-3">
          {nearbyLoading ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : nearbyProtests.length > 0 ? (
            nearbyProtests.map((protest) => (
              <ProtestCard key={protest.id} protest={protest} />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No protests found</p>
            </div>
          )}
        </div>
      </section>

      {/* Donations Section */}
      <section className="px-4 py-4">
        <h2 className="text-lg font-semibold text-dark-slate mb-3">Support the Movement</h2>
        <Card className="bg-gradient-to-r from-activist-blue to-rally-red">
          <CardContent className="p-4 text-white">
            <h3 className="font-semibold mb-2">Make a Difference</h3>
            <p className="text-sm mb-3 opacity-90">Your donation helps support activists and organizations fighting for change.</p>
            <Button className="w-full bg-white text-activist-blue hover:bg-gray-100">
              Donate Now
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );

  const renderResourcesContent = () => (
    <div className="px-4 py-4">
      <h2 className="text-lg font-semibold text-dark-slate mb-3">Resources</h2>
      <p className="text-gray-600">Resources content coming soon...</p>
    </div>
  );

  const renderCommunityContent = () => (
    <div className="px-4 py-4">
      <h2 className="text-lg font-semibold text-dark-slate mb-3">Community</h2>
      <p className="text-gray-600">Community content coming soon...</p>
    </div>
  );

  const renderProfileContent = () => (
    <div className="space-y-4">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-4 text-center">
          <div className="w-20 h-20 bg-activist-blue rounded-full mx-auto mb-3 flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-dark-slate">Activist Name</h2>
          <p className="text-gray-600">Member since 2024</p>
        </CardContent>
      </Card>

      {/* Activity Stats */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-dark-slate mb-3">Your Activity</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-activist-blue">12</div>
              <div className="text-sm text-gray-600">Protests Attended</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-rally-red">5</div>
              <div className="text-sm text-gray-600">Events Organized</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-dark-slate mb-3">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Push Notifications</Label>
              <Switch id="notifications" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="location">Share Location</Label>
              <Switch id="location" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="emails">Email Updates</Label>
              <Switch id="emails" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Selection */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-dark-slate mb-3">Language</h3>
          <Select defaultValue="en">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="p-0 divide-y divide-gray-100">
          <div className="p-4 flex items-center justify-between">
            <span className="text-dark-slate">Privacy Policy</span>
            <div className="w-4 h-4 text-gray-400">→</div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-dark-slate">Terms of Service</span>
            <div className="w-4 h-4 text-gray-400">→</div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-dark-slate">About Corteo</span>
            <span className="text-sm text-gray-500">v1.0.0</span>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Button className="w-full bg-rally-red hover:bg-rally-red/90 text-white">
        Sign Out
      </Button>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return renderHomeContent();
      case "map":
        return (
          <div className="h-full">
            <MapView />
          </div>
        );
      case "resources":
        return renderResourcesContent();
      case "community":
        return renderCommunityContent();
      case "profile":
        return renderProfileContent();
      default:
        return renderHomeContent();
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case "home":
        return "Corteo";
      case "map":
        return "Search";
      case "resources":
        return "Resources";
      case "community":
        return "Community";
      case "profile":
        return "Profile";
      default:
        return "Corteo";
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative flex flex-col">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100 flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-dark-slate">{getHeaderTitle()}</h1>
            {activeTab === "home" && (
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5 text-gray-600" />
              </Button>
            )}
            {activeTab === "map" && (
              <Button variant="outline" size="sm" className="bg-activist-blue text-white hover:bg-activist-blue/90">
                List View
              </Button>
            )}
          </div>
          
          {/* Search Bar - Only show on home tab */}
          {activeTab === "home" && (
            <>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search protests by name or cause..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-activist-blue focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
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
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 ${activeTab === "map" ? "" : "pb-20"} ${activeTab === "map" ? "overflow-hidden" : ""}`}>
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      {activeTab !== "map" && <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />}
      {activeTab === "map" && (
        <div className="absolute bottom-0 left-0 right-0 z-50">
          <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      )}
    </div>
  );
}