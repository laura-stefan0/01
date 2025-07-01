import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Saved Page - User's saved protests and events
 * This page displays protests that the user has saved for later viewing
 */
export default function SavedPage() {
  const navigate = useNavigate();

  // TODO: Implement saved protests functionality
  // This will store user's saved protests and display them here

  return (
    <div className="px-4 py-4 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-medium text-dark-slate mb-2">No Saved Protests Yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Save protests you're interested in to view them here later.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/")}
          >
            Browse Protests
          </Button>
        </div>
      </div>
    </div>
  );
}