
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Bell, Mail, Globe, Palette, Settings } from 'lucide-react';

interface BackgroundOption {
  id: string;
  name: string;
  preview: string;
  gradient?: string;
  pattern?: string;
}

const backgroundOptions: BackgroundOption[] = [
  {
    id: 'default',
    name: 'Default Gradient',
    preview: 'linear-gradient(to bottom, oklch(97% 0 0), oklch(87% 0 0))',
    gradient: 'linear-gradient(to bottom, oklch(97% 0 0), oklch(87% 0 0))'
  },
  {
    id: 'blue-gradient',
    name: 'Blue Ocean',
    preview: 'linear-gradient(to bottom, oklch(95% 0.05 240), oklch(85% 0.08 220))',
    gradient: 'linear-gradient(to bottom, oklch(95% 0.05 240), oklch(85% 0.08 220))'
  },
  {
    id: 'green-gradient',
    name: 'Forest Green',
    preview: 'linear-gradient(to bottom, oklch(95% 0.05 140), oklch(85% 0.08 120))',
    gradient: 'linear-gradient(to bottom, oklch(95% 0.05 140), oklch(85% 0.08 120))'
  },
  {
    id: 'purple-gradient',
    name: 'Purple Haze',
    preview: 'linear-gradient(to bottom, oklch(95% 0.05 300), oklch(85% 0.08 280))',
    gradient: 'linear-gradient(to bottom, oklch(95% 0.05 300), oklch(85% 0.08 280))'
  },
  {
    id: 'warm-gradient',
    name: 'Warm Sunset',
    preview: 'linear-gradient(to bottom, oklch(95% 0.05 60), oklch(85% 0.08 40))',
    gradient: 'linear-gradient(to bottom, oklch(95% 0.05 60), oklch(85% 0.08 40))'
  },
  {
    id: 'dots-pattern',
    name: 'Dotted Pattern',
    preview: 'oklch(92% 0 0)',
    pattern: 'radial-gradient(circle at 2px 2px, oklch(70% 0 0) 1px, transparent 0)',
    gradient: 'oklch(92% 0 0)'
  },
  {
    id: 'lines-pattern',
    name: 'Subtle Lines',
    preview: 'oklch(92% 0 0)',
    pattern: 'repeating-linear-gradient(45deg, transparent, transparent 10px, oklch(88% 0 0) 10px, oklch(88% 0 0) 11px)',
    gradient: 'oklch(92% 0 0)'
  },
  {
    id: 'grid-pattern',
    name: 'Grid Pattern',
    preview: 'oklch(92% 0 0)',
    pattern: 'linear-gradient(oklch(88% 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(88% 0 0) 1px, transparent 1px)',
    gradient: 'oklch(92% 0 0)'
  }
];

export default function Profile() {
  const [notifications, setNotifications] = useState(true);
  const [locationAccess, setLocationAccess] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState('default');
  const [language, setLanguage] = useState('en');

  const handleBackgroundChange = (backgroundId: string) => {
    setSelectedBackground(backgroundId);
    const selectedOption = backgroundOptions.find(option => option.id === backgroundId);
    
    if (selectedOption) {
      const rootElement = document.getElementById('root');
      if (rootElement) {
        if (selectedOption.pattern) {
          // Apply pattern background
          rootElement.style.background = selectedOption.gradient || 'oklch(92% 0 0)';
          rootElement.style.backgroundImage = selectedOption.pattern;
          rootElement.style.backgroundSize = selectedOption.id === 'grid-pattern' ? '20px 20px' : '20px 20px';
        } else {
          // Apply gradient background
          rootElement.style.background = selectedOption.gradient || selectedOption.preview;
          rootElement.style.backgroundImage = 'none';
        }
      }
    }
    
    // Save to localStorage
    localStorage.setItem('corteo_background_setting', backgroundId);
  };

  // Load background setting on component mount
  React.useEffect(() => {
    const savedBackground = localStorage.getItem('corteo_background_setting') || 'default';
    setSelectedBackground(savedBackground);
    handleBackgroundChange(savedBackground);
  }, []);

  return (
    <div className="px-4 py-4 max-w-md mx-auto space-y-4">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-dark-slate">Jane Doe</h2>
              <p className="text-sm text-gray-600">jane@example.com</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Background Settings */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-dark-slate mb-4 flex items-center">
            <Palette className="w-5 h-5 mr-2 text-gray-600" />
            Background Style
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {backgroundOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleBackgroundChange(option.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedBackground === option.id 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div 
                    className="w-full h-12 rounded mb-2"
                    style={{ 
                      background: option.preview,
                      backgroundImage: option.pattern || 'none',
                      backgroundSize: option.pattern ? '20px 20px' : 'auto'
                    }}
                  />
                  <span className="text-xs font-medium text-gray-700">{option.name}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Selection */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-dark-slate mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-gray-600" />
            Language
          </h3>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="it">Italiano</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-dark-slate mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-gray-600" />
            Privacy & Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Push Notifications</span>
              </div>
              <Switch 
                checked={notifications} 
                onCheckedChange={setNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Email Notifications</span>
              </div>
              <Switch 
                checked={emailNotifications} 
                onCheckedChange={setEmailNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Location Access</span>
              </div>
              <Switch 
                checked={locationAccess} 
                onCheckedChange={setLocationAccess}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <div className="space-y-3">
        <Button variant="outline" className="w-full">
          Edit Profile
        </Button>
        <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
          Sign Out
        </Button>
      </div>
    </div>
  );
}
