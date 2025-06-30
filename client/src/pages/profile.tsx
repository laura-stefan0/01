import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Settings, Bell, Shield, FileText, Globe } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useUser } from "@/hooks/use-user";

export default function Profile() {
  const { signOut } = useAuth();
  const { data: user } = useUser();
  const [backgroundTheme, setBackgroundTheme] = useState('default');

  // Load saved background theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('corteo_background_theme');
    if (savedTheme) {
      setBackgroundTheme(savedTheme);
    }
  }, []);

  // Apply background theme to root element
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;

    const themes = {
      default: 'linear-gradient(to bottom, oklch(97% 0 0), oklch(87% 0 0)) fixed',
      blue: 'linear-gradient(to bottom, oklch(95% 0.1 220), oklch(85% 0.15 220)) fixed',
      green: 'linear-gradient(to bottom, oklch(95% 0.1 140), oklch(85% 0.15 140)) fixed',
      purple: 'linear-gradient(to bottom, oklch(95% 0.1 280), oklch(85% 0.15 280)) fixed',
      dots: 'linear-gradient(to bottom, oklch(97% 0 0), oklch(87% 0 0)) fixed, radial-gradient(circle, oklch(80% 0 0) 1px, transparent 1px)',
      lines: 'linear-gradient(to bottom, oklch(97% 0 0), oklch(87% 0 0)) fixed, linear-gradient(90deg, oklch(85% 0 0) 1px, transparent 1px)'
    };

    const backgroundSizes = {
      dots: '100%, 20px 20px',
      lines: '100%, 30px 30px'
    };

    root.style.background = themes[backgroundTheme as keyof typeof themes] || themes.default;

    if (backgroundTheme === 'dots' || backgroundTheme === 'lines') {
      root.style.backgroundSize = backgroundSizes[backgroundTheme as keyof typeof backgroundSizes];
    } else {
      root.style.backgroundSize = '';
    }

    // Save to localStorage
    localStorage.setItem('corteo_background_theme', backgroundTheme);
  }, [backgroundTheme]);

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-xl font-semibold">Profile</h2>
        <Badge variant="secondary">
          <Globe className="mr-2 h-4 w-4" />
          <span>Pro</span>
        </Badge>
      </div>

      <Card>
        <CardContent className="flex aspect-square items-center justify-center p-4">
          <User className="h-16 w-16" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2.5 p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              {user?.email}
            </p>
          </div>
          <Button variant="outline" className="w-full">
            <Settings className="mr-2 h-4 w-4" />
            Update profile
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Shield className="h-4 w-4" />
            <div>
              <h3 className="text-sm font-medium leading-none">
                Privacy
              </h3>
              <p className="text-sm text-muted-foreground">
                Manage your privacy settings and review your active sessions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Bell className="h-4 w-4" />
            <div>
              <h3 className="text-sm font-medium leading-none">
                Notifications
              </h3>
              <p className="text-sm text-muted-foreground">
                Configure your notification preferences and choose when to be
                notified.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <FileText className="h-4 w-4" />
            <div>
              <h3 className="text-sm font-medium leading-none">
                Terms & conditions
              </h3>
              <p className="text-sm text-muted-foreground">
                Read our terms and conditions and learn about our policies.
              </p>
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
            <SelectContent side="top" align="start">
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Background Theme Selection */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-dark-slate mb-3">Background Theme</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Default Gradient */}
              <div 
                className="h-16 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
                style={{
                  background: 'linear-gradient(to bottom, oklch(97% 0 0), oklch(87% 0 0))'
                }}
                onClick={() => setBackgroundTheme('default')}
              >
                <div className="h-full flex items-end p-2">
                  <span className="text-xs font-medium text-gray-700">Default</span>
                </div>
              </div>

              {/* Blue Gradient */}
              <div 
                className="h-16 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
                style={{
                  background: 'linear-gradient(to bottom, oklch(95% 0.1 220), oklch(85% 0.15 220))'
                }}
                onClick={() => setBackgroundTheme('blue')}
              >
                <div className="h-full flex items-end p-2">
                  <span className="text-xs font-medium text-white">Blue</span>
                </div>
              </div>

              {/* Green Gradient */}
              <div 
                className="h-16 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
                style={{
                  background: 'linear-gradient(to bottom, oklch(95% 0.1 140), oklch(85% 0.15 140))'
                }}
                onClick={() => setBackgroundTheme('green')}
              >
                <div className="h-full flex items-end p-2">
                  <span className="text-xs font-medium text-white">Green</span>
                </div>
              </div>

              {/* Purple Gradient */}
              <div 
                className="h-16 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
                style={{
                  background: 'linear-gradient(to bottom, oklch(95% 0.1 280), oklch(85% 0.15 280))'
                }}
                onClick={() => setBackgroundTheme('purple')}
              >
                <div className="h-full flex items-end p-2">
                  <span className="text-xs font-medium text-white">Purple</span>
                </div>
              </div>
            </div>

            {/* Pattern Options */}
            <div className="pt-2 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Patterns</h4>
              <div className="grid grid-cols-2 gap-3">
                {/* Dots Pattern */}
                <div 
                  className="h-16 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(to bottom, oklch(97% 0 0), oklch(87% 0 0))',
                    backgroundImage: 'radial-gradient(circle, oklch(80% 0 0) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                  onClick={() => setBackgroundTheme('dots')}
                >
                  <div className="h-full flex items-end p-2">
                    <span className="text-xs font-medium text-gray-700">Dots</span>
                  </div>
                </div>

                {/* Lines Pattern */}
                <div 
                  className="h-16 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(to bottom, oklch(97% 0 0), oklch(87% 0 0))',
                    backgroundImage: 'linear-gradient(90deg, oklch(85% 0 0) 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                  }}
                  onClick={() => setBackgroundTheme('lines')}
                >
                  <div className="h-full flex items-end p-2">
                    <span className="text-xs font-medium text-gray-700">Lines</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button variant="destructive" className="w-full" onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}