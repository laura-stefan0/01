import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Archive, Calendar, MapPin, Clock, CheckCircle } from "lucide-react";

interface ArchivedProtest {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  address: string;
  date: string;
  time: string;
  image_url?: string;
  event_type: string;
  checked_in_at: string;
  notes?: string;
}

export default function ArchivedProtestsPage() {
  const [, setLocation] = useLocation();

  const { data: archivedProtests = [], isLoading } = useQuery<ArchivedProtest[]>({
    queryKey: ["/api/user/protests/archived"],
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5); // Format as HH:MM
  };

  const formatCheckedInDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Environment': 'bg-green-600',
      'LGBTQ+': 'bg-rose-500',
      'Women\'s Rights': 'bg-pink-700',
      'Labor': 'bg-amber-600',
      'Racial & Social Justice': 'bg-violet-700',
      'Civil & Human Rights': 'bg-blue-600',
      'Healthcare & Education': 'bg-cyan-600',
      'Peace & Anti-War': 'bg-sky-400',
      'Transparency & Anti-Corruption': 'bg-gray-600',
      'Other': 'bg-indigo-600'
    };
    return colors[category] || 'bg-gray-600';
  };

  return (
    <div className="px-4 py-4 space-y-4 max-w-md mx-auto animate-in fade-in duration-300 ease-out">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/profile')}
            className="p-2 hover:bg-transparent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-dark-slate">Attended Protests</h1>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : archivedProtests.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Archive className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-dark-slate mb-2">No attended protests</h3>
          <p className="text-gray-600 mb-6">
            Protests you check into will appear here as a record of your activism
          </p>
          <Button 
            onClick={() => setLocation('/discover')}
            className="bg-activist-blue hover:bg-activist-blue/90 text-white"
          >
            Find Protests to Attend
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {archivedProtests.map((protest) => (
            <Card key={protest.id} className="p-4 cursor-pointer hover:shadow-sm transition-shadow"
                  onClick={() => setLocation(`/protest/${protest.id}`)}>
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full text-white ${getCategoryColor(protest.category)}`}>
                    {protest.category}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {protest.event_type}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-green-600 ml-auto">
                    <CheckCircle className="h-3 w-3" />
                    <span>Attended</span>
                  </div>
                </div>
                
                <h3 className="font-semibold text-dark-slate text-sm leading-tight mb-2">
                  {protest.title}
                </h3>
                
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(protest.date)}</span>
                    <Clock className="h-3 w-3 ml-2" />
                    <span>{formatTime(protest.time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{protest.address}, {protest.city}</span>
                  </div>
                </div>

                {/* Check-in info */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      Checked in on {formatCheckedInDate(protest.checked_in_at)}
                    </span>
                  </div>
                  {protest.notes && (
                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
                      <span className="font-medium">Your notes: </span>
                      {protest.notes}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}