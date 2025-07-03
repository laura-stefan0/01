import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CreateProtestData {
  title: string;
  description: string;
  category: string;
  event_type: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  date: string;
  time: string;
  image_url?: string;
  url?: string;
}

export default function CreateProtest() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState<CreateProtestData>({
    title: "",
    description: "",
    category: "",
    event_type: "",
    location: "",
    address: "",
    latitude: 37.7749, // Default to San Francisco
    longitude: -122.4194,
    date: "",
    time: "",
    image_url: "",
    url: ""
  });





  const createProtestMutation = useMutation({
    mutationFn: async (data: CreateProtestData & { image_url?: string }) => {
      const response = await fetch("/api/protests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          image_url: data.image_url,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "🎉 Event submitted successfully!",
        description: "Thank you for your contribution! Your event will be reviewed.",
        variant: "success",
        className: "border-green-200 bg-green-50 text-green-800 success-bounce",
      });
      // Invalidate protests queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/protests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/protests/featured"] });
      queryClient.invalidateQueries({ queryKey: ["/api/protests/nearby"] });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit event. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating protest:", error);
    },
  });



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.event_type || !formData.location || !formData.date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createProtestMutation.mutate(formData);
  };

  const categories = [
    "Environment",
    "LGBTQ+",
    "Women's Rights",
    "Labor",
    "Racial & Social Justice",
    "Civil & Human Rights",
    "Healthcare & Education",
    "Peace & Anti-War",
    "Transparency & Anti-Corruption",
    "Other"
  ];

  const eventTypes = [
    "Protest",
    "Workshop",
    "Assembly",
    "Talk",
    "Other"
  ];

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-slate-50 via-gray-50 to-rose-50 min-h-screen">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation("/")}
              className="text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-dark-slate">Add Event</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 pb-20">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Submit Event Details</CardTitle>
            <div className="text-sm text-gray-600 mt-2 p-3 bg-gray-50 rounded-lg">
              We appreciate any details you can provide about this event to help others discover and participate in meaningful activism.
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Event Name */}
              <div className="space-y-2">
                <Label htmlFor="title">Event name *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="March for Climate Action"
                  required
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="event_type">Type *</Label>
                <Select value={formData.event_type} onValueChange={(value) => setFormData({ ...formData, event_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cause */}
              <div className="space-y-2">
                <Label htmlFor="category">Cause *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a cause" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Any other info */}
              <div className="space-y-2">
                <Label htmlFor="description">Any other info</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about the event, meeting point, what to bring, etc..."
                  rows={3}
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="City Hall, 1 Dr Carlton B Goodlett Pl"
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="location">City *</Label>
                <div className="relative">
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="San Francisco, CA"
                    className="pl-10"
                    required
                  />
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <div className="relative">
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="pl-10"
                    required
                  />
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Time */}
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              {/* URL */}
              <div className="space-y-2">
                <Label htmlFor="url">Event URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com/event-details"
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-activist-blue hover:bg-activist-blue/90 text-white"
                disabled={createProtestMutation.isPending}
              >
                {createProtestMutation.isPending ? "Submitting..." : "Submit Event"}
              </Button>

              <div className="text-xs text-gray-500 text-center mt-2">
                Your event will be reviewed before being published.
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}