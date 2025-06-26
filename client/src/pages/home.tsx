import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Bell, Users, MapPin, Search } from "lucide-react";
import { ProtestCard } from "@/components/protest-card";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useFeaturedProtests, useNearbyProtests } from "@/hooks/use-protests";
import { useUser } from "@/hooks/use-user";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: featuredProtests = [], isLoading: featuredLoading } = useFeaturedProtests();
  const { data: nearbyProtests = [], isLoading: nearbyLoading } = useNearbyProtests();
  const { data: user } = useUser();
  const { signOut, isAuthenticated } = useAuth();

  const filters = [
    { id: "all", label: "All" },
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "popular", label: "Popular" },
  ];

  // Sample news data
  const newsItems = [
    {
      id: 1,
      title: "Climate Activists Rally for Green New Deal",
      summary: "Major cities see coordinated protests for environmental policy reform",
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      title: "Workers Unite for Fair Wage Legislation",
      summary: "Labor unions organize nationwide for minimum wage increases",
      timestamp: "4 hours ago"
    },
    {
      id: 3,
      title: "Student Movement Gains Momentum",
      summary: "University campuses join forces for education reform",
      timestamp: "6 hours ago"
    }
  ];

  const renderHomeContent = () => (
    <div className="px-4 py-4 max-w-md mx-auto">
      {/* News Section */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-dark-slate mb-3">What's new</h2>
        <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {newsItems.map((news) => (
            <div key={news.id} className="border border-gray-100 rounded-lg p-3 min-w-40 flex-shrink-0">
              <h3 className="font-medium text-dark-slate text-sm mb-2 line-clamp-2 leading-tight">{news.title}</h3>
              <span className="text-gray-400 text-xs">{news.timestamp}</span>
            </div>
          ))}
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
            featuredProtests.map((protest) => (
              <div key={protest.id} className="w-5/6 flex-shrink-0">
                <ProtestCard protest={protest} variant="featured" />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Nearby Protests */}
      <section className="mb-6">
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
      <section>
        <h2 className="text-lg font-semibold text-dark-slate mb-3">Support Us</h2>
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
    <div className="px-4 py-4 space-y-4 max-w-md mx-auto">
      {/* Legal Rights Section */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-dark-slate mb-3 flex items-center">
            <div className="w-5 h-5 mr-2 text-activist-blue">⚖️</div>
            Legal Rights
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-activist-blue rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>You have the right to peaceful assembly and free speech</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-activist-blue rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Police cannot search you without probable cause</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-activist-blue rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>You have the right to remain silent if arrested</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-activist-blue rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Document any violations of your rights</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Safety Tips Section */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-dark-slate mb-3 flex items-center">
            <div className="w-5 h-5 mr-2 text-movement-green">🛡️</div>
            Safety Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-movement-green rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Stay hydrated and bring water</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-movement-green rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Travel in groups when possible</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-movement-green rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Have emergency contacts readily available</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-movement-green rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Know your exit strategies</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-dark-slate mb-3 flex items-center">
            <div className="w-5 h-5 mr-2 text-rally-red">❓</div>
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-dark-slate text-sm">Do I need permits to protest?</h4>
              <p className="text-sm text-gray-600 mt-1">Check with local authorities about permit requirements for organized events.</p>
            </div>
            <div>
              <h4 className="font-medium text-dark-slate text-sm">What should I bring to a protest?</h4>
              <p className="text-sm text-gray-600 mt-1">Water, snacks, comfortable shoes, emergency contacts, and any necessary medications.</p>
            </div>
            <div>
              <h4 className="font-medium text-dark-slate text-sm">How can I stay safe during protests?</h4>
              <p className="text-sm text-gray-600 mt-1">Stay aware of your surroundings, follow organizer guidelines, and have an exit plan.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card className="bg-rally-red text-white">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">Emergency Contacts</h3>
          <div className="text-sm space-y-1">
            <p>Emergency: 911</p>
            <p>Legal Aid Hotline: 1-800-XXX-XXXX</p>
            <p>Protest Safety Line: 1-800-XXX-XXXX</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCommunityContent = () => (
    <div className="px-4 py-4 max-w-md mx-auto">
      <div className="text-center py-16">
        <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-dark-slate mb-2">Community Features</h3>
        <p className="text-gray-600 mb-4">Connect with like-minded activists and organizers in your area.</p>
        <p className="text-sm text-gray-500">Coming Soon</p>
      </div>
    </div>
  );

  const renderProfileContent = () => (
    <div className="px-4 py-4 space-y-4 max-w-md mx-auto">
      {/* Profile Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full flex-shrink-0 overflow-hidden bg-gray-200">
              {isAuthenticated ? (
                <img 
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face" 
                  alt="Profile picture"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-activist-blue flex items-center justify-center text-white font-semibold text-xl">
                  G
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-dark-slate text-lg">
                {isAuthenticated ? "Jane" : "Guest User"}
              </h3>
              <p className="text-gray-600 text-sm">
                {isAuthenticated ? "@janedoe" : "Browse anonymously"}
              </p>
              {isAuthenticated && (
                <Button variant="outline" size="sm" className="mt-3">
                  Edit profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-dark-slate">Settings</h3>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="w-5 h-5 mr-3 text-gray-400" />
                <Label htmlFor="notifications">Notifications</Label>
              </div>
              <Switch id="notifications" defaultChecked />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                <Label htmlFor="location">Location Services</Label>
              </div>
              <Switch id="location" defaultChecked />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-5 h-5 mr-3 text-gray-400">📧</div>
                <Label htmlFor="emails">Email Updates</Label>
              </div>
              <Switch id="emails" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-5 h-5 mr-3 text-gray-400">🌙</div>
                <Label htmlFor="darkmode">Dark Mode</Label>
              </div>
              <Switch id="darkmode" />
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

      {/* Sign Out Button */}
      <Button 
        onClick={signOut}
        className="w-full bg-rally-red hover:bg-rally-red/90 text-white"
      >
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
          <div className="px-4 py-4 max-w-md mx-auto">
            <section className="mb-6">
              <h2 className="text-lg font-semibold text-dark-slate mb-3">All Protests</h2>

              <div className="space-y-3">
                {nearbyLoading ? (
                  <>
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </>
                ) : [...featuredProtests, ...nearbyProtests].length > 0 ? (
                  [...featuredProtests, ...nearbyProtests]
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

            {/* View on Map Button */}
            <div className="mt-6 mb-4">
              <Button 
                className="w-full bg-activist-blue hover:bg-activist-blue/90 text-white"
                size="lg"
              >
                <MapPin className="w-5 h-5 mr-2" />
                View on Map
              </Button>
            </div>
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
        return isAuthenticated && user?.name ? `Hi, ${user.name.split(' ')[0]}!` : "Hi there!";
      case "map":
        return "Search";
      case "resources":
        return "Resources";
      case "community":
        return "Community";
      case "profile":
        return "Profile";
      default:
        return isAuthenticated && user?.name ? `Hi, ${user.name.split(' ')[0]}!` : "Hi there!";
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
          </div>

          {/* Search Bar - Show only on map tab */}
          {activeTab === "map" && (
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
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}