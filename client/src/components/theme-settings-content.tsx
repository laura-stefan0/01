import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Sun, Moon, Check } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/context/theme-context";

interface ThemeSettings {
  theme: 'system' | 'light' | 'dark';
  background: 'white' | 'pink' | 'green';
}

/**
 * Theme Settings Content Component
 * Reusable component for theme configuration without header
 * Can be used both in standalone theme page and nested routes
 */
export function ThemeSettingsContent() {
  const { data: user } = useUser();
  const { toast } = useToast();
  const { theme, background, setTheme: setGlobalTheme, setBackground: setGlobalBackground } = useTheme();
  const [settings, setSettings] = useState<ThemeSettings>({
    theme: 'system',
    background: 'white'
  });

  // Sync local settings with theme context
  useEffect(() => {
    setSettings({ theme, background });
  }, [theme, background]);

  const handleThemeChange = async (newTheme: 'system' | 'light' | 'dark') => {
    setSettings(prev => ({ ...prev, theme: newTheme }));
    setGlobalTheme(newTheme);
    await saveToDatabase({ theme: newTheme, background: settings.background });
  };

  const handleBackgroundChange = async (newBackground: 'white' | 'pink' | 'green') => {
    setSettings(prev => ({ ...prev, background: newBackground }));
    setGlobalBackground(newBackground);
    await saveToDatabase({ theme: settings.theme, background: newBackground });
  };

  const saveToDatabase = async (newSettings: ThemeSettings) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/user/${user.id}/theme`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to save theme settings');
      }

      toast({
        title: "Theme updated",
        description: "Your theme settings have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving theme settings:', error);
      toast({
        title: "Error",
        description: "Failed to save theme settings. Please try again.",
        variant: "destructive",
      });
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
    <div className="space-y-6">
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
    </div>
  );
}