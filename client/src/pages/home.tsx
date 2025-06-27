
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, Plus, Filter, BookOpen } from "lucide-react";
import { useLocation } from "wouter";
import { useWhatsNew } from "@/hooks/use-whats-new";
import BottomNavigation from "@/components/bottom-navigation";

interface Protest {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  attendees: number;
  image_url?: string;
}

interface WhatsNewItem {
  id: string;
  title: string;
  image_url?: string;
  cta_url?: string;
  country_code?: string;
  visible: boolean;
  created_at: string;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: whatsNewData = [], isLoading: whatsNewLoading } = useWhatsNew();

  const { data: protests = [], isLoading: protestsLoading } = useQuery<Protest[]>({
    queryKey: ["/api/protests"],
    queryFn: async () => {
      const response = await fetch("/api/protests");
      if (!response.ok) {
        throw new Error("Failed to fetch protests");
      }
      return response.json();
    },
  });

  const handleWhatsNewClick = (item: WhatsNewItem) => {
    if (item.cta_url) {
      if (item.cta_url.startsWith('/')) {
        setLocation(item.cta_url);
      } else {
        window.open(item.cta_url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const renderWhatsNewCard = (item: WhatsNewItem) => {
    console.log("📄 News item:", item.title);
    console.log("🖼️ Image URL:", item.image_url);
    console.log("📊 Full news object:", item);

    return (
      <Card 
        key={item.id} 
        className="cursor-pointer border-0 shadow-none bg-white"
        onClick={() => handleWhatsNewClick(item)}
      >
        <CardContent className="p-0">
          <div className="aspect-[4/3] relative overflow-hidden rounded-lg mb-3">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
                onLoad={() => console.log("✅ Image loaded successfully:", item.image_url)}
                onError={(e) => {
                  console.error("❌ Image failed to load:", item.image_url);
                  console.error("Error details:", e);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          <h3 className="font-medium text-sm text-gray-900 leading-tight">
            {item.title}
          </h3>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Corteo</h1>
            <p className="text-sm text-gray-600">Discover local protests</p>
          </div>
          <Button
            onClick={() => setLocation("/create-protest")}
            size="sm"
            className="bg-black text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-8">
        {/* What's New Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What's new</h2>
          {whatsNewLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : whatsNewData.length === 0 ? (
            <p className="text-gray-500 text-sm">No news available</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {whatsNewData.map(renderWhatsNewCard)}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border-0 shadow-sm"
              onClick={() => setLocation("/filter")}
            >
              <CardContent className="p-4 text-center">
                <Filter className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-medium text-sm">Find Events</h3>
                <p className="text-xs text-gray-600 mt-1">Search protests near you</p>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border-0 shadow-sm"
              onClick={() => setLocation("/resources")}
            >
              <CardContent className="p-4 text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-medium text-sm">Resources</h3>
                <p className="text-xs text-gray-600 mt-1">Safety tips & guides</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Featured Protests Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Featured events</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/filter")}
              className="text-blue-600 hover:text-blue-700"
            >
              View all
            </Button>
          </div>
          
          {protestsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3 w-3/4"></div>
                    <div className="flex gap-4">
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : protests.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No featured events right now</p>
                <p className="text-xs mt-1">Check back later or create your own!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {protests.slice(0, 3).map((protest) => (
                <Card 
                  key={protest.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow border-0 shadow-sm"
                  onClick={() => setLocation(`/protest/${protest.id}`)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {protest.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {protest.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{protest.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(protest.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{protest.attendees}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      <BottomNavigation />
    </div>
  );
}
