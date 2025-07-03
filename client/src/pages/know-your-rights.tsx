import { ArrowLeft, Scale, Shield, AlertCircle, Phone, Users, UserCheck, AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function KnowYourRights() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen app-background">
      <div className="px-4 py-4 space-y-6 max-w-md mx-auto animate-in fade-in duration-300 ease-out">
        {/* Header */}
        <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
          <div className="px-4 py-3 flex items-center">
            <Button variant="ghost" size="sm" onClick={() => navigate("/resources")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-dark-slate ml-3">Know Your Rights</h1>
          </div>
        </header>

        {/* Content */}
        <main className="px-4 py-6 space-y-6">
          {/* Your Right to Protest Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-dark-slate mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-red-600" />
                Your Right to Protest
              </h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-sm text-gray-700">You can protest peacefully in public spaces</span>
                </div>
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-sm text-gray-700">You must notify police 3 days in advance for public demonstrations</span>
                </div>
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-sm text-gray-700">Police can restrict protests only for proven public safety reasons</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Police Powers Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-dark-slate mb-4 flex items-center">
                <UserCheck className="w-5 h-5 mr-2 text-red-600" />
                Police Powers & What They Can't Do
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">What officers are allowed to do:</p>
                  <p className="text-sm text-gray-700">Ask for your ID, restrict your movement, order you to disperse</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">What they can't do:</p>
                  <p className="text-sm text-gray-700">Use force without warning (unless you're resisting)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risks & Consequences Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-dark-slate mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                Risks & Consequences
              </h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="font-medium text-gray-900">Behavior</div>
                  <div className="font-medium text-gray-900">Risk in Italy</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm border-t pt-2">
                  <div className="text-gray-700">Protesting without notifying authorities</div>
                  <div className="text-gray-700">Arrest / fines</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-gray-700">Blocking roads / sit-ins</div>
                  <div className="text-gray-700">Up to 2 yrs prison</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-gray-700">Passive resistance (e.g. refusing orders)</div>
                  <div className="text-gray-700">Now criminalized</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-gray-700">Refusing to show ID</div>
                  <div className="text-gray-700">Legal if not driving</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* If You're Stopped or Arrested Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-dark-slate mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-red-600" />
                If You're Stopped or Arrested
              </h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-sm text-gray-700">Stay calm and polite</span>
                </div>
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-sm text-gray-700">Say clearly: "I wish to remain silent and speak to a lawyer"</span>
                </div>
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-sm text-gray-700">Don't sign anything without legal advice</span>
                </div>
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-sm text-gray-700">You don't have to unlock your phone</span>
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
    </div>
  );
}