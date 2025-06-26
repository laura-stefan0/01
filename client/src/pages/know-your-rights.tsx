import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Scale, Shield, AlertCircle, Phone } from "lucide-react";
import { useLocation } from "wouter";

export default function KnowYourRights() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation("/resources");
  };

  const rightsCategories = [
    {
      title: "Before the Protest",
      icon: Shield,
      items: [
        "You have the right to peaceful assembly",
        "Check local permit requirements",
        "Plan your transportation and exit routes",
        "Inform someone of your plans"
      ]
    },
    {
      title: "During the Protest",
      icon: Scale,
      items: [
        "Stay in designated public areas",
        "Follow lawful police orders",
        "You have the right to remain silent",
        "Document any incidents safely"
      ]
    },
    {
      title: "If Detained",
      icon: AlertCircle,
      items: [
        "Ask if you are free to leave",
        "Exercise your right to remain silent",
        "Request a lawyer immediately",
        "Do not sign anything without legal counsel"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 pb-20">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mr-3"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Know Your Rights</h1>
              <p className="text-sm text-gray-600">Legal rights during protests</p>
            </div>
          </div>

          {/* Rights Categories */}
          <div className="space-y-4">
            {rightsCategories.map((category, index) => (
              <Card key={index} className="border-l-4 border-l-red-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <category.icon className="w-5 h-5 mr-2 text-red-600" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Emergency Contact */}
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <Phone className="w-5 h-5 text-red-600 mr-2" />
                <h3 className="font-semibold text-red-900">Emergency Legal Aid</h3>
              </div>
              <p className="text-sm text-red-800 mb-3">
                If you need immediate legal assistance during or after a protest:
              </p>
              <Button variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-100">
                Call Legal Hotline
              </Button>
            </CardContent>
          </Card>

          {/* Important Notice */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Important Notice</h3>
                  <p className="text-sm text-blue-800">
                    This information is for educational purposes only and does not constitute legal advice. 
                    Laws vary by location. Consult with a qualified attorney for specific legal guidance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}