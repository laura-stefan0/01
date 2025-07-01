import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Profile More Subpage - Additional information and app details
 * This is a nested route under /profile/more that shows transparency, legal info, etc.
 */
export default function ProfileMorePage() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-4 space-y-4 max-w-md mx-auto">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/profile')}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-semibold text-dark-slate">More</h1>
      </div>

      {/* App Info */}
      <Card>
        <CardContent className="p-0 divide-y divide-gray-100">
          <div 
            className="p-4 flex items-center justify-between cursor-pointer" 
            onClick={() => navigate("/transparency")}
          >
            <span className="text-dark-slate">Transparency</span>
            <div className="w-4 h-4 text-gray-400">→</div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-dark-slate">Privacy Policy</span>
            <div className="w-4 h-4 text-gray-400">→</div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-dark-slate">Terms of Service</span>
            <div className="w-4 h-4 text-gray-400">→</div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-dark-slate">About Corteo</span>
            <span className="text-sm text-gray-500">v1.0.0</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}