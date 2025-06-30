
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  Bell, 
  MapPin, 
  Mail, 
  Globe, 
  Palette,
  FileText,
  LogOut,
  ChevronRight,
  Plus
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { useUser } from "@/hooks/use-user";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { signOut, isAuthenticated } = useAuth();
  const { data: user } = useUser();
  const [activeTab, setActiveTab] = useState("profile");

  const handleSignOut = () => {
    signOut();
    setLocation("/sign-in");
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case "home":
        setLocation("/");
        break;
      case "discover":
        setLocation("/discover");
        break;
      case "resources":
        setLocation("/resources");
        break;
      case "saved":
        setLocation("/saved");
        break;
      case "profile":
        // Already on profile page
        break;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-dark-slate">Profile</h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 space-y-6 pb-24">
        {/* User Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full flex-shrink-0 overflow-hidden bg-gray-200">
                <img 
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face" 
                  alt="Profile picture"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-dark-slate text-lg">
                  {user?.name || "Jane"}
                </h3>
                <p className="text-gray-600 text-sm">
                  @{user?.username || "janedoe"}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user?.user_location || "Milan, Italy"}</span>
                </div>
                <Button variant="outline" size="sm" className="mt-3">
                  Edit profile
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-4">
              Passionate activist for social justice and environmental causes. 
              Organizing for a better tomorrow.
            </p>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-dark-slate mb-4">Settings</h3>
            
            <div className="space-y-4">
              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Notifications</span>
                </div>
                <Switch checked={user?.notifications || false} />
              </div>

              <Separator />

              {/* Location */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Location sharing</span>
                </div>
                <Switch checked={user?.location || false} />
              </div>

              <Separator />

              {/* Email */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Email updates</span>
                </div>
                <Switch checked={user?.emails || false} />
              </div>

              <Separator />

              {/* Language */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Language</span>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="en">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* App Theme */}
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg -m-2"
                onClick={() => setLocation("/theme-settings")}
              >
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">App theme</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-dark-slate mb-4">Actions</h3>
            
            <div className="space-y-4">
              {/* Create New Protest */}
              <div className="p-4">
                <Button 
                  className="w-full bg-activist-blue hover:bg-activist-blue/90 text-white"
                  onClick={() => setLocation("/create-protest")}
                  disabled={!isAuthenticated}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isAuthenticated ? "Create New Protest" : "Sign In to Create Protests"}
                </Button>
              </div>

              <Separator />

              {/* Transparency */}
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg -m-2"
                onClick={() => setLocation("/transparency")}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Transparency</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Button
          onClick={handleSignOut}
          variant="destructive"
          className="w-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
