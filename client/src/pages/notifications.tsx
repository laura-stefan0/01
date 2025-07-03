import { ArrowLeft, Bell, BellOff, CheckCircle, Clock, MapPin, Users, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";

export default function NotificationsPage() {
  const [location, setLocation] = useLocation();
  
  const handleBackClick = () => {
    // Use browser history back or navigate to home
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation("/");
    }
  };

  // Mock notification data - in real app this would come from API
  const notifications = [
    {
      id: 1,
      type: "protest_nearby",
      title: "New protest near you",
      message: "Climate action march starting in 2 hours at Piazza del Duomo",
      time: "2 hours ago",
      read: false,
      icon: MapPin,
      iconColor: "text-green-600"
    },
    {
      id: 2,
      type: "protest_update",
      title: "Event update",
      message: "Pride Milano 2025 location changed to Porta Venezia",
      time: "5 hours ago",
      read: false,
      icon: Users,
      iconColor: "text-rose-500"
    },
    {
      id: 3,
      type: "safety_alert",
      title: "Safety reminder",
      message: "Remember to bring water and stay hydrated during protests",
      time: "1 day ago",
      read: true,
      icon: AlertTriangle,
      iconColor: "text-amber-600"
    },
    {
      id: 4,
      type: "reminder",
      title: "Event reminder",
      message: "Workers' rights protest tomorrow at 3 PM",
      time: "2 days ago",
      read: true,
      icon: Clock,
      iconColor: "text-blue-600"
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-slate-50 via-gray-50 to-rose-50 min-h-screen">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3 flex items-center">
          <Button variant="ghost" size="sm" onClick={handleBackClick}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-dark-slate ml-3">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {unreadCount} new
            </Badge>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Notification Settings */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-medium mb-3">Notification Settings</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="nearby-protests" className="text-sm">Nearby protests</Label>
                <Switch id="nearby-protests" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="event-updates" className="text-sm">Event updates</Label>
                <Switch id="event-updates" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="safety-alerts" className="text-sm">Safety alerts</Label>
                <Switch id="safety-alerts" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="reminders" className="text-sm">Event reminders</Label>
                <Switch id="reminders" defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Recent</h2>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="text-sm text-gray-600">
                Mark all as read
              </Button>
            )}
          </div>

          {notifications.map((notification, index) => {
            const IconComponent = notification.icon;
            return (
              <div key={notification.id}>
                <Card className={`${notification.read ? 'opacity-60' : ''} cursor-pointer`}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className={`mt-1 ${notification.iconColor}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{notification.title}</p>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-[#EF4444] rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          </div>
                          <p className="text-xs text-gray-500 flex-shrink-0">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {index < notifications.length - 1 && <div className="h-2" />}
              </div>
            );
          })}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up! We'll notify you when something important happens.</p>
          </div>
        )}
      </main>
    </div>
  );
}