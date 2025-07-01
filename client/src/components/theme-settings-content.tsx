import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Sun, Moon, Check } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/context/theme-context";

interface ThemeSettings {
  theme: 'system' | 'light' | 'dark';
  background: 'white' | 'pink' | 'green' | 'blue' | 'purple' | 'orange' | 'gradient-sunset' | 'gradient-ocean' | 'gradient-forest' | 'custom-image';
  custom_background_url?: string | null;
}

/**
 * Theme Settings Content Component
 * Reusable component for theme configuration without header
 * Can be used both in standalone theme page and nested routes
 */
export function ThemeSettingsContent() {
  const { data: user } = useUser();
  const { toast } = useToast();
  const { theme, background, customImageUrl, setTheme: setGlobalTheme, setBackground: setGlobalBackground, setCustomImageUrl } = useTheme();
  const [settings, setSettings] = useState<ThemeSettings>({
    theme: 'system',
    background: 'white',
    custom_background_url: null
  });
  const [isUploading, setIsUploading] = useState(false);

  // Sync local settings with theme context
  useEffect(() => {
    setSettings({ theme, background, custom_background_url: customImageUrl });
  }, [theme, background, customImageUrl]);

  const handleThemeChange = async (newTheme: 'system' | 'light' | 'dark') => {
    setSettings(prev => ({ ...prev, theme: newTheme }));
    setGlobalTheme(newTheme);
    await saveToDatabase({ theme: newTheme, background: settings.background });
  };

  const handleBackgroundChange = async (newBackground: 'white' | 'pink' | 'green' | 'blue' | 'purple' | 'orange' | 'gradient-sunset' | 'gradient-ocean' | 'gradient-forest' | 'custom-image') => {
    setSettings(prev => ({ ...prev, background: newBackground }));
    setGlobalBackground(newBackground);
    await saveToDatabase({ theme: settings.theme, background: newBackground, custom_background_url: settings.custom_background_url });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/background', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      const imageUrl = result.image_url;

      // Update settings
      const newSettings = {
        theme: settings.theme,
        background: 'custom-image' as const,
        custom_background_url: imageUrl
      };

      setSettings(newSettings);
      setGlobalBackground('custom-image');
      setCustomImageUrl(imageUrl);
      await saveToDatabase(newSettings);

      toast({
        title: "Background uploaded",
        description: "Your custom background has been set successfully.",
      });
    } catch (error) {
      console.error('Error uploading background:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload background image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
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

  const customImageOptions = [
    { value: 'custom-image', label: 'Custom Image', preview: customImageUrl ? `url(${customImageUrl})` : 'bg-gray-300' }
  ];

  const allBackgroundOptions = [...solidColorOptions, ...gradientOptions, ...customImageOptions];

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

      {/* Solid Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Solid Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {solidColorOptions.map((option) => {
            const isSelected = settings.background === option.value;

            return (
              <div
                key={option.value}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                }`}
                onClick={() => handleBackgroundChange(option.value as any)}
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

      {/* Gradients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gradients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {gradientOptions.map((option) => {
            const isSelected = settings.background === option.value;

            return (
              <div
                key={option.value}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                }`}
                onClick={() => handleBackgroundChange(option.value as any)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 border-gray-300 ${option.preview}`} />
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

      {/* Custom Background Image */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Custom Background Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label
              htmlFor="background-upload"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                isUploading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  {isUploading ? 'Uploading...' : 'Click to upload background image'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 5MB</p>
              </div>
              <input
                id="background-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>

            {/* Current custom image preview */}
            {customImageUrl && (
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-8 rounded border-2 border-gray-300 bg-cover bg-center"
                    style={{ backgroundImage: `url(${customImageUrl})` }}
                  />
                  <div>
                    <p className="font-medium">Custom Background</p>
                    <p className="text-sm text-gray-500">Currently uploaded</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBackgroundChange('custom-image')}
                    className={`px-3 py-1 text-sm rounded ${
                      settings.background === 'custom-image'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {settings.background === 'custom-image' ? 'Active' : 'Use'}
                  </button>
                </div>
              </div>
            )}
          </div>
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