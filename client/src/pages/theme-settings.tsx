import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { ThemeSettingsContent } from "@/components/theme-settings-content";

export default function ThemeSettings() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen max-w-md mx-auto">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/profile")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-dark-slate ml-3">App Theme</h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6">
        <ThemeSettingsContent />
      </main>
    </div>
  );
}