
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function TestPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/resources")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-dark-slate ml-3">123 Test Page</h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Test Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-dark-slate mb-4">This is the 123 test page</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                This page was created by duplicating the Transparency page. 
                It serves as a test to demonstrate that the "Know Your Rights" button 
                can successfully navigate to a new page.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Test Values Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-dark-slate mb-4">Test content</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-dark-slate mb-2">Test feature 1</h3>
                <p className="text-gray-700 text-sm">
                  This demonstrates that the navigation is working correctly.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-dark-slate mb-2">Test feature 2</h3>
                <p className="text-gray-700 text-sm">
                  The button click successfully opened this page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-dark-slate mb-4">Success!</h2>
            <p className="text-gray-700 text-sm mb-4">
              The "Know Your Rights" button is now working and navigating to this test page.
            </p>
            <Button className="w-full bg-activist-blue hover:bg-activist-blue/90 text-white">
              Test Button
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
