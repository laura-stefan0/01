import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/context/auth-context";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { 
  Trophy, 
  Users, 
  Calendar, 
  MapPin, 
  Flame, 
  Star, 
  Award,
  Target,
  TrendingUp,
  Heart,
  Shield,
  Zap,
  Sparkles,
  BookOpen,
  User
} from "lucide-react";

/**
 * Profile Page - Main user profile with nested routing
 * This page shows user profile information and provides navigation to subpages
 * like Settings and More information
 */
export default function ProfilePage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  // Check if we're on a nested route
  const isNestedRoute = location.pathname !== '/profile';

  // Beginner badges data
  const beginnerBadges = [
    {
      id: 'welcome',
      name: 'Welcome',
      icon: Sparkles,
      color: 'from-pink-400 to-purple-500',
      title: 'Welcome to Corteo! 🎉',
      description: 'Congratulations on joining the community! This badge shows that you\'ve successfully created your account and are ready to start making a difference. Welcome to the movement!',
      achieved: true
    },
    {
      id: 'profile-complete',
      name: 'Profile Complete',
      icon: User,
      color: 'from-blue-400 to-cyan-500',
      title: 'Profile Completed! ✅',
      description: 'Great job! You\'ve completed your profile setup. Having a complete profile helps you connect better with the community and shows your commitment to the cause.',
      achieved: true
    },
    {
      id: 'first-browse',
      name: 'Explorer',
      icon: BookOpen,
      color: 'from-green-400 to-emerald-500',
      title: 'First Steps Explorer 🔍',
      description: 'You\'ve started exploring protests and events in your area! This shows you\'re actively looking for ways to get involved. Keep exploring to find causes that matter to you.',
      achieved: true
    },
    {
      id: 'app-learner',
      name: 'Quick Learner',
      icon: Zap,
      color: 'from-yellow-400 to-orange-500',
      title: 'Quick Learner ⚡',
      description: 'You\'re getting the hang of the app! This badge recognizes that you\'ve learned how to navigate through different sections and are becoming familiar with Corteo\'s features.',
      achieved: true
    }
  ];

  // If on nested route, render the outlet (subpage)
  if (isNestedRoute) {
    return <Outlet />;
  }

  // Main profile page content
  return (
    <div className="min-h-screen">
      <div className="px-4 py-4 space-y-6 max-w-md mx-auto animate-in fade-in duration-300 ease-out">

      {/* Hero Profile Section */}
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl"></div>

        {/* Profile content */}
        <Card className="relative bg-transparent border-0 shadow-none">
          <CardContent className="p-8 text-center text-white">
            {/* Profile picture with level ring */}
            <div className="relative mb-4 mx-auto">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-1">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white p-1">
                    <img 
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=face" 
                      alt="Profile picture"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
                {/* Level badge */}
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm border-4 border-white shadow-lg">
                  7
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-1">Jane</h1>
            <p className="text-white/80 text-sm mb-2">@janedoe</p>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Star className="w-3 h-3 mr-1" />
              Activist Level 7
            </Badge>


          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-green-100" />
            <div className="text-xl font-bold">23</div>
            <div className="text-xs text-green-100">Protests</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 border-0 text-white">
          <CardContent className="p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-100" />
            <div className="text-xl font-bold">8</div>
            <div className="text-xs text-blue-100">This Month</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-violet-600 border-0 text-white">
          <CardContent className="p-4 text-center">
            <Heart className="w-6 h-6 mx-auto mb-2 text-purple-100" />
            <div className="text-xl font-bold">156</div>
            <div className="text-xs text-purple-100">Impact Points</div>
          </CardContent>
        </Card>
      </div>



      {/* Beginner Badges */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Your Badges</h3>
            <Award className="w-5 h-5 text-gray-600" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {beginnerBadges.map((badge) => {
              const IconComponent = badge.icon;
              return (
                <div 
                  key={badge.id}
                  className="text-center cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedBadge(badge)}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${badge.color} rounded-full flex items-center justify-center mb-2 shadow-lg mx-auto`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{badge.name}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>



      {/* My Activity */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              My Activity
            </h3>
          </div>

          <div className="divide-y divide-gray-100">
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/50 transition-colors"
              onClick={() => navigate('/profile/saved')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-800">Saved Protests</span>
              </div>
              <div className="text-gray-400">→</div>
            </div>

            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/50 transition-colors"
              onClick={() => navigate('/profile/archived')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-800">Attended Protests</span>
              </div>
              <div className="text-gray-400">→</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings & More */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardContent className="p-0 divide-y divide-gray-100">
          <div 
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/50 transition-colors"
            onClick={() => navigate('/profile/settings')}
          >
            <span className="font-medium text-gray-800">Settings</span>
            <div className="text-gray-400">→</div>
          </div>
          <div 
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/50 transition-colors"
            onClick={() => navigate('/profile/more')}
          >
            <span className="font-medium text-gray-800">More</span>
            <div className="text-gray-400">→</div>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out Button */}
      <Button 
        onClick={signOut}
        variant="outline"
        className="w-full bg-white/80 border-gray-200 text-gray-700 hover:bg-white hover:text-red-600 hover:border-red-200 transition-colors"
      >
        Sign Out
      </Button>

      {/* Badge Detail Dialog */}
      <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              {selectedBadge?.title}
            </DialogTitle>
            <div className="flex justify-center my-4">
              {selectedBadge && (
                <div className={`w-16 h-16 bg-gradient-to-br ${selectedBadge.color} rounded-full flex items-center justify-center shadow-lg`}>
                  <selectedBadge.icon className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <DialogDescription className="text-center text-gray-600">
              {selectedBadge?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button 
              onClick={() => setSelectedBadge(null)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
            >
              Awesome!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}