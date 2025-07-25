import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Sun, Moon, Check } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/context/theme-context";

interface ThemeSettings {
  theme: 'system' | 'light' | 'dark';
  background: string;
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
    theme: 'light',
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

  const handleBackgroundChange = async (newBackground: string) => {
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

  const solidColorOptions = [
    { value: 'gradient-subtle', label: 'Subtle', preview: 'bg-gradient-to-br from-slate-50 via-gray-50 to-rose-50' },
    { value: 'gradient-lavender', label: 'Lavender', preview: 'bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50' },
    { value: 'gradient-soft-mint', label: 'Mint', preview: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50' },
    { value: 'gradient-peach', label: 'Peach', preview: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50' },
    { value: 'gradient-sky', label: 'Sky', preview: 'bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50' }
  ];

  const gradientOptions: { name: string; value: string; preview: string }[] = [];

  // State for local background images
  const [localImages, setLocalImages] = useState<string[]>([]);

  // Load local images from the backgrounds folder
  useEffect(() => {
    const loadLocalImages = async () => {
      try {
        // Check for the actual .png files in the backgrounds folder
        const commonImages = ['background1.png', 'background2.png', 'background3.png'];
        const availableImages: string[] = [];

        for (const imageName of commonImages) {
          try {
            const response = await fetch(`/backgrounds/${imageName}`, { method: 'HEAD' });
            if (response.ok) {
              availableImages.push(imageName);
            }
          } catch (error) {
            // Image doesn't exist, skip
            console.log(`Image ${imageName} not found`);
          }
        }

        console.log('Available background images:', availableImages);
        setLocalImages(availableImages);
      } catch (error) {
        console.error('Error loading local images:', error);
      }
    };

    loadLocalImages();
  }, []);

  const imageOptions = localImages.map(imageName => ({
    value: `custom-image-${imageName}`,
    label: imageName.replace(/\.[^/.]+$/, ""), // Remove file extension
    preview: 'bg-gray-300'
  }));

  const allBackgroundOptions = [...solidColorOptions, ...gradientOptions, ...imageOptions];

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
                    : 'border-gray-200 dark:border-gray-700'
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

      {/* Backgrounds */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Backgrounds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-4 pb-2" style={{ minWidth: 'max-content' }}>
              {[...solidColorOptions, ...gradientOptions, ...imageOptions].map((option) => {
                const isSelected = settings.background === option.value;

                return (
                  <div
                    key={option.value}
                    className="flex-shrink-0 cursor-pointer"
                    onClick={() => handleBackgroundChange(option.value as any)}
                  >
                    <div 
                      className={`w-16 h-16 rounded-full border-2 ${
                        isSelected ? 'border-[#EF4444]' : 'border-gray-300'
                      } ${option.preview} bg-gray-200 bg-cover bg-center`}
                      style={
                        ('color' in option) 
                          ? { backgroundColor: option.color as string }
                          : option.value.startsWith('custom-image-')
                          ? { backgroundImage: `url('/backgrounds/${option.value.replace('custom-image-', '')}')` }
                          : {}
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}