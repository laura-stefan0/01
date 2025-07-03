import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeSettingsContent } from "@/components/theme-settings-content";

/**
 * Profile Theme Settings Subpage - App theme and appearance customization
 * This is a nested route under /profile/settings/theme that handles theme configuration
 */
export default function ProfileThemeSettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <div className="px-4 py-4 space-y-4 max-w-md mx-auto animate-in fade-in duration-300 ease-out">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/profile/settings')}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-semibold text-dark-slate">App Theme</h1>
      </div>

      {/* Use the theme settings content component without header */}
      <ThemeSettingsContent />
      </div>
    </div>
  );
}