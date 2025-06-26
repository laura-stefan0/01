import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Shield, Lock, FileText, Target, Printer } from "lucide-react";
import { useLocation } from "wouter";

export default function Resources() {
  const [, setLocation] = useLocation();
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    return localStorage.getItem('selectedCountry') || 'it';
  });

  useEffect(() => {
    localStorage.setItem('selectedCountry', selectedCountry);
  }, [selectedCountry]);

  const handleKnowYourRights = () => {
    setLocation("/know-your-rights");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 p-4 pb-20">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Resources</h1>
            <p className="text-gray-600">Essential information for protesters and organizers</p>
          </div>

          {/* For Protesters Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">For Protesters</h2>
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className="cursor-pointer hover:shadow-lg hover:bg-gray-50 transition-all duration-200 border-2 hover:border-red-300"
                onClick={handleKnowYourRights}
              >
                <CardContent className="p-4 text-center">
                  <BookOpen className="w-8 h-8 mx-auto mb-3 text-red-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">Know Your Rights</h3>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg hover:bg-gray-50 transition-all duration-200 border-2 hover:border-blue-300">
                <CardContent className="p-4 text-center">
                  <Shield className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">Safety Checklist</h3>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg hover:bg-gray-50 transition-all duration-200 border-2 hover:border-green-300">
                <CardContent className="p-4 text-center">
                  <Lock className="w-8 h-8 mx-auto mb-3 text-green-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">Digital Security</h3>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg hover:bg-gray-50 transition-all duration-200 border-2 hover:border-purple-300">
                <CardContent className="p-4 text-center">
                  <FileText className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">Glossary</h3>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* For Organizers Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">For Organizers</h2>
            <div className="grid grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:shadow-lg hover:bg-gray-50 transition-all duration-200 border-2 hover:border-orange-300">
                <CardContent className="p-4 text-center">
                  <Target className="w-8 h-8 mx-auto mb-3 text-orange-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">Organizing 101</h3>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg hover:bg-gray-50 transition-all duration-200 border-2 hover:border-indigo-300">
                <CardContent className="p-4 text-center">
                  <Printer className="w-8 h-8 mx-auto mb-3 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">Printables</h3>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}