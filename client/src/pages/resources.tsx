
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Shield, Users, FileText } from "lucide-react";
import { useResourcesByCategory } from "@/hooks/use-resources";
import { useLaws } from "@/hooks/use-laws";
import { useLocation } from "wouter";

export default function Resources() {
  const [, setLocation] = useLocation();
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    return localStorage.getItem('selectedCountry') || 'it';
  });

  useEffect(() => {
    localStorage.setItem('selectedCountry', selectedCountry);
  }, [selectedCountry]);

  const { data: protesterResources = [], isLoading: protesterLoading } = useResourcesByCategory("protesters", selectedCountry);
  const { data: organizerResources = [], isLoading: organizerLoading } = useResourcesByCategory("organizers", selectedCountry);
  const { data: laws = [], isLoading: lawsLoading } = useLaws(selectedCountry);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 p-4 pb-20">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Resources</h1>
            <p className="text-gray-600">Essential information for protesters and organizers</p>
          </div>

          {/* Know Your Rights Section - Clickable Card */}
          <Card 
            className="mb-6 cursor-pointer hover:shadow-lg hover:bg-gray-50 transition-all duration-200 border-2 hover:border-red-300" 
            onClick={() => setLocation("/know-your-rights")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-red-600" />
                Know Your Rights
              </CardTitle>
              <CardDescription>
                Legal information and rights related to protests and demonstrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lawsLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : laws.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No legal information available for your selected country. Click to learn more.
                </p>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    {laws.length} legal {laws.length === 1 ? 'resource' : 'resources'} available
                  </p>
                  {laws.length > 0 && (
                    <div className="border-l-4 border-red-600 pl-4 py-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{laws[0].title}</h3>
                      <p className="text-xs text-gray-600 line-clamp-2">{laws[0].description}</p>
                    </div>
                  )}
                  <p className="text-xs text-red-600 mt-2 font-medium">Click to view all rights and legal information →</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* For Protesters Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                For Protesters
              </CardTitle>
              <CardDescription>
                Essential resources and safety information for protest participants
              </CardDescription>
            </CardHeader>
            <CardContent>
              {protesterLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : protesterResources.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No protester resources available for your selected country.
                </p>
              ) : (
                <div className="space-y-4">
                  {protesterResources.map((resource) => (
                    <div key={resource.id} className="border-l-4 border-blue-600 pl-4 py-2">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                        <Badge variant="outline" className="ml-2">
                          {resource.type?.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">{resource.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* For Organizers Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                For Organizers
              </CardTitle>
              <CardDescription>
                Guidance and tools for organizing successful and legal demonstrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {organizerLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : organizerResources.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No organizer resources available for your selected country.
                </p>
              ) : (
                <div className="space-y-4">
                  {organizerResources.map((resource) => (
                    <div key={resource.id} className="border-l-4 border-green-600 pl-4 py-2">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                        <Badge variant="outline" className="ml-2">
                          {resource.type?.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">{resource.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
