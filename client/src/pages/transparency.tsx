import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function Transparency() {
  const [, setLocation] = useLocation();

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-dark-slate ml-3">Transparency</h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Our Why Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-dark-slate mb-4">Why Corteo Exists</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Corteo was born from a simple belief: that peaceful protest is one of the most powerful tools for social change, 
                and everyone should have access to organize and participate safely.
              </p>
              <p>
                We recognized that activists and organizers faced significant barriers - from finding reliable ways to coordinate 
                events to ensuring participant safety. Traditional social media platforms weren't designed with activism in mind, 
                often lacking the specific tools and security measures that movements require.
              </p>
              <p>
                Our mission is to democratize activism by providing a platform that prioritizes privacy, safety, and genuine 
                community building over engagement metrics and data harvesting.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Our Values Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-dark-slate mb-4">Our Core Values</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-dark-slate mb-2">Privacy First</h3>
                <p className="text-gray-700 text-sm">
                  We believe in your right to organize without surveillance. Your data belongs to you, 
                  and we use only what's necessary to provide our services.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-dark-slate mb-2">Safety & Security</h3>
                <p className="text-gray-700 text-sm">
                  Activist safety is paramount. We provide tools and resources to help organizers 
                  and participants stay safe during events.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-dark-slate mb-2">Inclusivity</h3>
                <p className="text-gray-700 text-sm">
                  Every voice matters. We're committed to creating an inclusive space for all 
                  peaceful movements, regardless of the cause.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-dark-slate mb-2">Transparency</h3>
                <p className="text-gray-700 text-sm">
                  We operate openly about our practices, funding, and decision-making processes. 
                  You deserve to know how the tools you use are built and maintained.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We're Different Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-dark-slate mb-4">How We're Different</h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-activist-blue mt-2 flex-shrink-0"></div>
                <p className="text-sm">No advertising or data mining - we're not selling your information</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-activist-blue mt-2 flex-shrink-0"></div>
                <p className="text-sm">Built specifically for activists, with features that matter to organizers</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-activist-blue mt-2 flex-shrink-0"></div>
                <p className="text-sm">Open about our funding sources and governance structure</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-activist-blue mt-2 flex-shrink-0"></div>
                <p className="text-sm">Community-driven development with input from real organizers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-dark-slate mb-4">Questions or Concerns?</h2>
            <p className="text-gray-700 text-sm mb-4">
              We believe in accountability. If you have questions about our practices, 
              suggestions for improvement, or concerns about the platform, we want to hear from you.
            </p>
            <Button className="w-full bg-activist-blue hover:bg-activist-blue/90 text-white">
              Contact Our Team
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}