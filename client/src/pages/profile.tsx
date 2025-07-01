import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

/**
 * Profile Page - Main user profile with nested routing
 * This page shows user profile information and provides navigation to subpages
 * like Settings and More information
 */
export default function ProfilePage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on a nested route
  const isNestedRoute = location.pathname !== '/profile';

  // If on nested route, render the outlet (subpage)
  if (isNestedRoute) {
    return <Outlet />;
  }

  // Main profile page content
  return (
    <div className="px-4 py-4 space-y-4 max-w-md mx-auto">
      {/* Profile Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full flex-shrink-0 overflow-hidden bg-gray-200">
              <img 
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face" 
                alt="Profile picture"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-dark-slate text-lg">
                Jane
              </h3>
              <p className="text-gray-600 text-sm">
                @janedoe
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                Edit profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-4">
          <Button 
            className="w-full bg-activist-blue hover:bg-activist-blue/90 text-white"
            onClick={() => navigate("/create-protest")}
          >
            Create New Protest
          </Button>
        </CardContent>
      </Card>

      {/* Navigation Options */}
      <Card>
        <CardContent className="p-0 divide-y divide-gray-100">
          <div 
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2A2A2A]"
            onClick={() => navigate('/profile/settings')}
          >
            <span className="text-dark-slate">Settings</span>
            <div className="w-4 h-4 text-gray-400">→</div>
          </div>
          <div 
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2A2A2A]"
            onClick={() => navigate('/profile/more')}
          >
            <span className="text-dark-slate">More</span>
            <div className="w-4 h-4 text-gray-400">→</div>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out Button */}
      <Button 
        onClick={signOut}
        className="w-full bg-rally-red hover:bg-rally-red/90 text-white"
      >
        Sign Out
      </Button>
    </div>
  );
}