import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Monitor, Sun, Moon, Check } from "lucide-react";
import { useLocation } from "wouter";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";

interface ThemeSettings {
  theme: 'system' | 'light' | 'dark';
  background: 'white' | 'pink' | 'green';
}

export default function ThemeSettings() {
  const [, setLocation] = useLocation();
  const { data: user } = useUser();
  const { toast } = useToast();
  const [settings, setSettings] = useState<ThemeSettings>({
    theme: 'system',
    background: 'white'
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load current settings from user data
  useEffect(() => {
    if (user) {
      setSettings({
        theme: (user.theme as 'system' | 'light' | 'dark') || 'system',
        background: (user.background as 'white' | 'pink' | 'green') || 'white'
      });
    }
  }, [user]);

  // Apply theme and background to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Apply background
    const backgroundColors = {
      white: '#ffffff',
      pink: '#fdf2f8',
      green: '#f0fdf4'
    };
    
    document.body.style.backgroundColor = backgroundColors[settings.background];
  }, [settings]);

  const handleThemeChange = (theme: 'system' | 'light' | 'dark') => {
    setSettings(prev => ({ ...prev, theme }));
  };

  const handleBackgroundChange = (background: 'white' | 'pink' | 'green') => {
    setSettings(prev => ({ ...prev, background }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/user/${user.id}/theme`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      toast({
        title: "Settings saved",
        description: "Your theme preferences have been updated."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save theme settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const themeOptions = [
    { value: 'system', label: 'System default', icon: Monitor, description: 'Follow your device settings' },
    { value: 'light', label: 'Light', icon: Sun, description: 'Light theme' },
    { value: 'dark', label: 'Dark', icon: Moon, description: 'Dark theme' }
  ];

  const backgroundOptions = [
    { value: 'white', label: 'White', color: '#ffffff', preview: 'bg-white' },
    { value: 'pink', label: 'Pink', color: '#fdf2f8', preview: 'bg-pink-50' },
    { value: 'green', label: 'Green', color: '#f0fdf4', preview: 'bg-green-50' }
  ];

  return (
    <div className="app-background">
      <div className="w-full max-w-md mx-auto space-y-6 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/profile')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold">App Theme</h2>
          </div>
        </div>

        {/* Theme Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = settings.theme === option.value;
              
              return (
                <div
                  key={option.value}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                  }`}
                  onClick={() => handleThemeChange(option.value as 'system' | 'light' | 'dark')}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="h-5 w-5 text-blue-500" />}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Background Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Background</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {backgroundOptions.map((option) => {
              const isSelected = settings.background === option.value;
              
              return (
                <div
                  key={option.value}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                  }`}
                  onClick={() => handleBackgroundChange(option.value as 'white' | 'pink' | 'green')}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-6 h-6 rounded-full border-2 border-gray-300 ${option.preview}`}
                      style={{ backgroundColor: option.color }}
                    />
                    <div>
                      <p className="font-medium">{option.label}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="h-5 w-5 text-blue-500" />}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Current Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Current selection:</span>
              <Badge variant="secondary">
                {themeOptions.find(t => t.value === settings.theme)?.label}
              </Badge>
              <Badge variant="secondary">
                {backgroundOptions.find(b => b.value === settings.background)?.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={isLoading} 
          className="w-full"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}