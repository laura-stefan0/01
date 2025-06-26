
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft } from "lucide-react";
import { useLaws } from "@/hooks/use-laws";
import { useLocation } from "wouter";

export default function KnowYourRights() {
  const [, setLocation] = useLocation();
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    return localStorage.getItem('selectedCountry') || 'it';
  });

  useEffect(() => {
    localStorage.setItem('selectedCountry', selectedCountry);
  }, [selectedCountry]);

  const { data: laws = [], isLoading: lawsLoading } = useLaws(selectedCountry);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/resources")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-dark-slate ml-3">Know Your Rights</h1>
        </div>
      </header>

      <div className="flex-1 p-4 pb-20">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="h-8 w-8 text-red-600" />
              <h1 className="text-3xl font-bold text-gray-900">Know Your Rights</h1>
            </div>
            <p className="text-gray-600">Legal information and rights related to protests and demonstrations</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Legal Information</CardTitle>
              <CardDescription>
                Understanding your rights and legal protections during protests and demonstrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lawsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-16 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : laws.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    No legal information available for your selected country.
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Check back later or switch countries to see available rights information.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {laws.map((law) => (
                    <div key={law.id} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">{law.title}</h3>
                        <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
                          {law.category.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      {law.description && (
                        <p className="text-gray-600 mb-4 font-medium">{law.description}</p>
                      )}
                      <div className="prose prose-sm max-w-none text-gray-700">
                        <p className="whitespace-pre-wrap">{law.content}</p>
                      </div>
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
