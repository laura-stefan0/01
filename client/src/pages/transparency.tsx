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
        {/* Why Corteo Exists Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-dark-slate mb-4">Why Corteo exists</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Corteo exists to make it safer and easier for people to mobilize, organize, and show up for what they believe in.
              </p>
              <p>
                Corteo was born from a simple belief: peaceful protest is a powerful tool for social change, 
                and everyone should be able to take part safely.
              </p>
              <p>
                But organizing isn't easy. Social media wasn't made for activism. It's messy, insecure, and often puts people at risk. People deserve better.
              </p>
              <p>
                Corteo is built to support activists by prioritizing privacy, safety, and genuine 
                community building over engagement metrics and data harvesting.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Our Values Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-dark-slate mb-4">Our core values</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-dark-slate mb-2">Privacy first</h3>
                <p className="text-gray-700 text-sm">
                  We believe in your right to organize without surveillance. Your data belongs to you, 
                  and we collect only what's necessary to run the app.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-dark-slate mb-2">Safety matters</h3>
                <p className="text-gray-700 text-sm">
                  We offer tools and tips to help everyone stay safe at protests, from experienced organizers to first-time participants.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-dark-slate mb-2">Everyone's welcome</h3>
                <p className="text-gray-700 text-sm">
                  Every voice matters. We're committed to creating an inclusive space for all 
                  peaceful movements, regardless of the cause.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-dark-slate mb-2">We're transparent</h3>
                <p className="text-gray-700 text-sm">
                  You should know how the platforms you use are built. We're open about how we work, where our funding comes from, and who's behind it.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What Makes Us Different Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-dark-slate mb-4">What makes us different</h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-activist-blue mt-2 flex-shrink-0"></div>
                <p className="text-sm">No ads. No data selling.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-activist-blue mt-2 flex-shrink-0"></div>
                <p className="text-sm">Funded openly, run with care.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-activist-blue mt-2 flex-shrink-0"></div>
                <p className="text-sm">Community-driven development with input from real organizers.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-dark-slate mb-4">Got questions?</h2>
            <p className="text-gray-700 text-sm mb-4">
              We're here to listen. Reach out if you have feedback, concerns, or suggestions.
            </p>
            <Button className="w-full bg-activist-blue hover:bg-activist-blue/90 text-white">
              Contact the Corteo team
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}