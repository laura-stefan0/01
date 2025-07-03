import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, BookmarkMinus, Calendar, MapPin, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SavedProtest {
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
}

export default function SavedProtestsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [checkInNotes, setCheckInNotes] = useState("");
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [selectedProtestId, setSelectedProtestId] = useState<string | null>(null);

  const { data: savedProtests = [], refetch, isLoading } = useQuery<SavedProtest[]>({
    queryKey: ["/api/user/protests/saved"],
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async ({ protestId, notes }: { protestId: string; notes: string }) => {
      const response = await fetch('/api/user/protests/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ protestId, notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to check in to protest');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/protests/archived"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/protests/saved"] });
      setIsCheckInDialogOpen(false);
      setCheckInNotes("");
      setSelectedProtestId(null);
      toast({
        title: "Checked in!",
        description: "You've successfully checked in to this protest. It has been added to your attendance history.",
      });
      refetch();
    },
    onError: (error) => {
      console.error("Check-in error:", error);
      toast({
        title: "Error",
        description: "Failed to check in. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUnsaveProtest = async (protestId: string) => {
    try {
      setRemovingId(protestId);

      const response = await fetch(`/api/user/protests/save/${protestId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to unsave protest');
      }

      toast({
        title: "Removed from saved",
        description: "The protest has been removed from your saved list.",
      });

      refetch();
    } catch (error) {
      console.error('Error unsaving protest:', error);
      toast({
        title: "Error",
        description: "Failed to remove protest from saved list.",
        variant: "destructive",
      });
    } finally {
      setRemovingId(null);
    }
  };

  const handleCheckIn = (protestId: string) => {
    setSelectedProtestId(protestId);
    setIsCheckInDialogOpen(true);
  };

  const confirmCheckIn = () => {
    if (!selectedProtestId) return;

    checkInMutation.mutate({
      protestId: selectedProtestId,
      notes: checkInNotes,
    });
  };

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
    <div className="px-4 py-4 space-y-4 max-w-md mx-auto bg-gradient-to-br from-slate-50 via-gray-50 to-rose-50 animate-in fade-in duration-300 ease-out">
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
          <h1 className="text-lg font-semibold text-dark-slate">Saved Protests</h1>
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
      ) : savedProtests.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <BookmarkMinus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-dark-slate mb-2">No saved protests</h3>
          <p className="text-gray-600 mb-6">
            Save protests you're interested in to view them here
          </p>
          <Button 
            onClick={() => setLocation('/discover')}
            className="bg-activist-blue hover:bg-activist-blue/90 text-white"
          >
            Discover Protests
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {savedProtests.map((protest) => (
            <Card key={protest.id} className="p-4 cursor-pointer hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div 
                  className="flex-1 pr-3"
                  onClick={() => setLocation(`/protest/${protest.id}`)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full text-white ${getCategoryColor(protest.category)}`}>
                      {protest.category}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      {protest.event_type}
                    </span>
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
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCheckIn(protest.id)}
                    className="px-3 py-1 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Check In
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnsaveProtest(protest.id)}
                    disabled={removingId === protest.id}
                    className="p-2 hover:bg-red-50 hover:text-red-600"
                  >
                    <BookmarkMinus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Check-in Dialog */}
      <Dialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Check In to Protest</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Checking in will add this protest to your attendance history and remove it from your saved list.
            </p>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Share your experience, thoughts, or observations about this protest..."
                value={checkInNotes}
                onChange={(e) => setCheckInNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCheckInDialogOpen(false);
                  setCheckInNotes("");
                  setSelectedProtestId(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmCheckIn}
                disabled={checkInMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {checkInMutation.isPending ? "Checking in..." : "Check In"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}