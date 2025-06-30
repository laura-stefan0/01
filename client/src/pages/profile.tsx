
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/bottom-navigation";
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
  const { signOut } = useAuth();
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
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-dark-slate">
                  {user?.name || "Jane Doe"}
                </h2>
                <p className="text-gray-500">@{user?.username || "janedoe"}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{user?.user_location || "Milan, Italy"}</span>
              </div>
              <p className="text-sm text-gray-700 max-w-sm">
                Passionate activist for social justice and environmental causes. 
                Organizing for a better tomorrow.
              </p>
            </div>
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
                  <Badge variant="secondary">English</Badge>
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
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg -m-2"
                onClick={() => setLocation("/create-protest")}
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Create New Protest</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
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
