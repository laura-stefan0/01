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
    { value: 'white', label: 'White', color: '#ffffff', preview: 'bg-white' },
    { value: 'pink', label: 'Pink', color: '#fdf2f8', preview: 'bg-pink-50' },
    { value: 'green', label: 'Green', color: '#f0fdf4', preview: 'bg-green-50' },
    { value: 'blue', label: 'Blue', color: '#eff6ff', preview: 'bg-blue-50' },
    { value: 'purple', label: 'Purple', color: '#faf5ff', preview: 'bg-purple-50' },
    { value: 'orange', label: 'Orange', color: '#fff7ed', preview: 'bg-orange-50' }
  ];

  const gradientOptions = [
    { value: 'gradient-sunset', label: 'Sunset', preview: 'bg-gradient-to-r from-pink-300 to-purple-300' },
    { value: 'gradient-ocean', label: 'Ocean', preview: 'bg-gradient-to-r from-blue-400 to-purple-500' },
    { value: 'gradient-forest', label: 'Forest', preview: 'bg-gradient-to-r from-green-600 to-blue-600' }
  ];

  // State for local background images
  const [localImages, setLocalImages] = useState<string[]>([]);

  // Load local images from the backgrounds folder
  useEffect(() => {
    const loadLocalImages = async () => {
      try {
        // This will be populated when images are added to the public/backgrounds folder
        // For now, we'll check for common image extensions
        const commonImages = ['background1.jpg', 'background2.png', 'background3.jpeg'];
        const availableImages: string[] = [];
        
        for (const imageName of commonImages) {
          try {
            const response = await fetch(`/backgrounds/${imageName}`, { method: 'HEAD' });
            if (response.ok) {
              availableImages.push(imageName);
            }
          } catch (error) {
            // Image doesn't exist, skip
          }
        }
        
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

      {/* Colors & Gradients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Colors & Gradients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[...solidColorOptions, ...gradientOptions].map((option) => {
              const isSelected = settings.background === option.value;

              return (
                <div
                  key={option.value}
                  className="flex justify-center cursor-pointer"
                  onClick={() => handleBackgroundChange(option.value as any)}
                >
                  <div 
                    className={`w-16 h-16 rounded-full border-2 ${
                      isSelected ? 'border-[#EF4444]' : 'border-gray-300'
                    } ${option.preview}`}
                    style={option.color ? { backgroundColor: option.color } : {}}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Background Images */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Background Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {imageOptions.length > 0 ? (
            imageOptions.map((option) => {
              const isSelected = settings.background === option.value;

              return (
                <div
                  key={option.value}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                  }`}
                  onClick={() => handleBackgroundChange(option.value)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-gray-300 bg-cover bg-center"
                      style={{ 
                        backgroundImage: `url('/backgrounds/${option.value.replace('custom-image-', '')}')` 
                      }}
                    />
                    <div>
                      <p className="font-medium">{option.label}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="h-5 w-5 text-blue-500" />}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No background images available</p>
              <p className="text-sm mt-2">
                Add images to the <code className="bg-gray-100 px-2 py-1 rounded">client/public/backgrounds</code> folder
              </p>
            </div>
          )}
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
              {allBackgroundOptions.find(b => b.value === settings.background)?.label}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}