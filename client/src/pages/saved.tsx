import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSavedProtests } from "@/context/saved-protests-context";
import { ProtestCard } from "@/components/protest-card";

/**
 * Saved Page - User's saved protests and events
 * This page displays protests that the user has saved for later viewing
 */
export default function SavedPage() {
  const navigate = useNavigate();
  const { savedProtests } = useSavedProtests();

  if (savedProtests.length === 0) {
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

  return (
    <div className="px-4 py-4 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-dark-slate">Saved Protests</h2>
          <span className="text-sm text-gray-500">{savedProtests.length} saved</span>
        </div>
        
        <div className="space-y-3">
          {savedProtests.map((protest) => (
            <ProtestCard 
              key={protest.id} 
              protest={protest} 
              variant="compact"
            />
          ))}
        </div>
        
        <div className="pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/")}
            className="w-full"
          >
            Browse More Protests
          </Button>
        </div>
      </div>
    </div>
  );
}