import { useState } from "react";
import { Bell, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const { data: featuredProtests = [], isLoading: featuredLoading } = useFeaturedProtests();
  const { data: nearbyProtests = [], isLoading: nearbyLoading } = useNearbyProtests();

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
              <Skeleton className="min-w-64 h-56 flex-shrink-0" />
              <Skeleton className="min-w-64 h-56 flex-shrink-0" />
              <Skeleton className="min-w-64 h-56 flex-shrink-0" />
            </>
          ) : (
            featuredProtests.map((protest) => (
              <ProtestCard key={protest.id} protest={protest} variant="featured" />
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
    </div>
  );

  const renderResourcesContent = () => (
    <div className="px-4 py-4 space-y-4">
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
    <div className="px-4 py-4">
      <div className="text-center py-16">
        <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-dark-slate mb-2">Community Features</h3>
        <p className="text-gray-600 mb-4">Connect with like-minded activists and organizers in your area.</p>
        <p className="text-sm text-gray-500">Coming Soon</p>
      </div>
    </div>
  );

  const renderProfileContent = () => (
    <div className="px-4 py-4 space-y-4">
      {/* Profile Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-activist-blue rounded-full flex items-center justify-center text-white font-semibold text-xl">
              A
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-dark-slate">Alex Rodriguez</h3>
              <p className="text-sm text-gray-600">alex@example.com</p>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            Edit Profile
          </Button>
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
        return <MapView />;
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
        return "For you";
      case "map":
        return "Search";
      case "resources":
        return "Resources";
      case "community":
        return "Community";
      case "profile":
        return "Profile";
      default:
        return "For you";
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-dark-slate">{getHeaderTitle()}</h1>
            {activeTab === "home" && (
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5 text-gray-600" />
              </Button>
            )}
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
