
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function KnowYourRights() {
  const [, setLocation] = useLocation();

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/resources")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-dark-slate ml-3">Know Your Rights</h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Right to Peaceful Assembly */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-dark-slate mb-4">Right to Peaceful Assembly</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Article 17 of the Italian Constitution guarantees the right to peaceful assembly without arms. 
                Citizens may gather in public or private places, but public gatherings in public places must be notified to authorities in advance.
              </p>
              <p className="font-medium">Key provisions:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>No authorization required for private gatherings</li>
                <li>Public gatherings require advance notification to local authorities (Questura)</li>
                <li>Peaceful nature must be maintained at all times</li>
                <li>Authorities cannot ban assemblies without justified security concerns</li>
                <li>Right applies to all citizens and legal residents</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Freedom of Expression */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-dark-slate mb-4">Freedom of Expression</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Article 21 of the Italian Constitution protects freedom of thought and expression. 
                This right extends to peaceful protests and demonstrations.
              </p>
              <p className="font-medium">Key protections:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Right to express opinions through speech, writing, and other means</li>
                <li>Protection extends to protest signs, banners, and symbolic expression</li>
                <li>Content cannot be censored prior to expression</li>
                <li>Limitations only apply to expressions that incite violence or hatred</li>
                <li>Right to distribute leaflets and informational materials</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Rights When Detained */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-dark-slate mb-4">Rights When Detained</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                If detained during a protest in Italy, you have specific rights that must be respected by law enforcement.
              </p>
              <p className="font-medium">Your rights include:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Right to remain silent (you don't have to answer questions)</li>
                <li>Right to know the reason for detention</li>
                <li>Right to contact a lawyer immediately</li>
                <li>Right to have someone notified of your detention</li>
                <li>Right to medical assistance if needed</li>
                <li>Right to an interpreter if you don't speak Italian</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Notification Requirements */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-dark-slate mb-4">Notification Requirements</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Italian law requires advance notification for public assemblies in public spaces. 
                This is not an authorization request but an informational requirement.
              </p>
              <p className="font-medium">Requirements:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Notify local Questura (police headquarters) at least 3 days in advance</li>
                <li>Provide details: date, time, location, estimated participants, purpose</li>
                <li>Include organizer contact information</li>
                <li>Specify planned route for marches or processions</li>
                <li>No fee required for notification</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
