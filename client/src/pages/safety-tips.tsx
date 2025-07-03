import { ArrowLeft, FileText, Smartphone, Brain, CheckSquare, HelpCircle, Phone, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function SafetyTips() {
  const [, setLocation] = useLocation();

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/resources")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-dark-slate ml-3">Safety Tips</h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Write Down or Memorize Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-dark-slate mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-red-600" />
              Write Down or Memorize
            </h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-sm text-gray-700">A legal aid number</span>
              </div>
              <div className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-sm text-gray-700">Emergency contacts</span>
              </div>
              <div className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-sm text-gray-700">Your full name and health info</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Digital Safety Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-dark-slate mb-4 flex items-center">
              <Smartphone className="w-5 h-5 mr-2 text-red-600" />
              Digital Safety
            </h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-sm text-gray-700">Use Signal or another encrypted app</span>
              </div>
              <div className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-sm text-gray-700">Turn off GPS and Face ID (Enable phone lock with PIN)</span>
              </div>
              <div className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-sm text-gray-700">Don't post faces without permission</span>
              </div>
              <div className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-sm text-gray-700">Avoid livestreaming from protest zones</span>
              </div>
              <div className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-sm text-gray-700">Don't post live photos or videos</span>
              </div>
              <div className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-sm text-gray-700">Avoid sharing others' faces unless they give consent</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips & Checklists Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-dark-slate mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-red-600" />
              Quick Tips & Checklists
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Before the protest:</p>
                <div className="space-y-1">
                  <p className="text-sm text-gray-700">• Tell someone where you're going</p>
                  <p className="text-sm text-gray-700">• Bring ID, water, mask, legal hotline</p>
                  <p className="text-sm text-gray-700">• Wear neutral clothes, no jewelry</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">During:</p>
                <div className="space-y-1">
                  <p className="text-sm text-gray-700">• Stick with a buddy</p>
                  <p className="text-sm text-gray-700">• Record interactions (if safe)</p>
                  <p className="text-sm text-gray-700">• Avoid escalating tensions</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">If stopped:</p>
                <div className="space-y-1">
                  <p className="text-sm text-gray-700">• Stay calm</p>
                  <p className="text-sm text-gray-700">• Show ID (Italy: required)</p>
                  <p className="text-sm text-gray-700">• Don't argue, record everything if possible</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">If detained:</p>
                <div className="space-y-1">
                  <p className="text-sm text-gray-700">• Remain silent</p>
                  <p className="text-sm text-gray-700">• Ask for legal representation</p>
                  <p className="text-sm text-gray-700">• Say clearly: "I want to remain silent. I want a lawyer."</p>
                  <p className="text-sm text-gray-700">• Don't resist, even passively</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Safety Checklist Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-dark-slate mb-4 flex items-center">
              <CheckSquare className="w-5 h-5 mr-2 text-red-600" />
              Quick Safety Checklist
            </h2>
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">What to bring:</p>
              <div className="space-y-1">
                <p className="text-sm text-gray-700">• ID (optional in US, required in Italy)</p>
                <p className="text-sm text-gray-700">• Written legal hotline / emergency contact</p>
                <p className="text-sm text-gray-700">• Water, mask, scarf, snacks</p>
                <p className="text-sm text-gray-700">• No jewelry or identifying logos</p>
                <p className="text-sm text-gray-700">• Power bank</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQs Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-dark-slate mb-4 flex items-center">
              <HelpCircle className="w-5 h-5 mr-2 text-red-600" />
              FAQs
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Can police ask for my phone password?</p>
                <p className="text-sm text-gray-700">No, and you have the right to refuse.</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Is it legal to film the police?</p>
                <p className="text-sm text-gray-700">Yes, as long as you don't interfere with their actions.</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Do I have to show ID in Italy?</p>
                <p className="text-sm text-gray-700">Yes, if requested by police.</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Can police delete my photos?</p>
                <p className="text-sm text-gray-700">No, they cannot legally force you to delete content.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
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
          <CardContent className="p-6">
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
      </main>
    </div>
  );
}