import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function Transparency() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen app-background">
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
                Corteo was built to make it safer and easier to organize and show up for what you believe in. 
                Peaceful protest is a powerful force for change, but most platforms aren't designed to support it. 
                They're disorganized, insecure, and can put people at risk. Corteo puts activists first, 
                with a focus on privacy, safety, and real community-building.
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
                <div className="w-2 h-2 rounded-full bg-[#E11D48] mt-2 flex-shrink-0"></div>
                <p className="text-sm">No ads. No data selling.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#E11D48] mt-2 flex-shrink-0"></div>
                <p className="text-sm">Funded openly, run with care.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#E11D48] mt-2 flex-shrink-0"></div>
                <p className="text-sm">Community-driven development with input from real organizers.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Moderation Policies Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-dark-slate mb-4">Moderation policies</h2>
            <div className="space-y-3 text-gray-700">
              <p className="text-sm">
                User-submitted content is reviewed for abuse, hate, or spam.
              </p>
              <p className="text-sm">
                Offensive content can be reported and removed.
              </p>
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
            <Button className="w-full bg-[#E11D48] hover:bg-[#E11D48]/90 text-white">
              Contact the Corteo team
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}