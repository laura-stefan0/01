
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
  
  // Sample law data for demonstration while database is being set up
  const sampleLaws = [
    {
      id: 1,
      title: "Right to Peaceful Assembly (Article 17)",
      description: "Constitutional right to organize and participate in peaceful demonstrations",
      category: "assembly_rights",
      content: "Article 17 of the Italian Constitution guarantees the right to peaceful assembly without arms. Citizens may gather in public or private places, but public gatherings in public places must be notified to authorities in advance.\n\nKey provisions:\n• No authorization required for private gatherings\n• Public gatherings require advance notification to local authorities (Questura)\n• Peaceful nature must be maintained at all times\n• Authorities cannot ban assemblies without justified security concerns\n• Right applies to all citizens and legal residents",
      country_code: "IT",
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: "Freedom of Expression (Article 21)",
      description: "Constitutional protection for speech and expression during protests",
      category: "expression_rights",
      content: "Article 21 of the Italian Constitution protects freedom of thought and expression. This right extends to peaceful protests and demonstrations.\n\nKey protections:\n• Right to express opinions through speech, writing, and other means\n• Protection extends to protest signs, banners, and symbolic expression\n• Content cannot be censored prior to expression\n• Limitations only apply to expressions that incite violence or hatred\n• Right to distribute leaflets and informational materials",
      country_code: "IT",
      created_at: new Date().toISOString()
    }
  ];
  
  const displayLaws = laws.length > 0 ? laws : sampleLaws;

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
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-16 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {displayLaws.map((law) => (
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
