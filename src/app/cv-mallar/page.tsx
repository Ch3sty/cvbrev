'use client';

import { useState } from 'react';
import { Download, Eye, FileText, Palette, Zap, Users, BookOpen } from 'lucide-react';
import { getAllCVTemplates } from '@/lib/cv/cv-templates';
import type { CVTemplateType, CVMetadata } from '@/lib/cv/cv-metadata';

export default function CVMallarPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplateType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cvText, setCvText] = useState('');

  const handleTemplateSelect = (templateId: CVTemplateType) => {
    setSelectedTemplate(templateId);
  };

  const handleGenerateCV = async () => {
    if (!selectedTemplate || !cvText.trim()) return;
    
    setIsGenerating(true);
    try {
      // TODO: Implementera API-anrop för CV-generering
      const response = await fetch('/api/cv/generate-formatted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate,
          cvText: cvText,
          format: 'pdf'
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cv-${selectedTemplate}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Fel vid CV-generering:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getTemplateIcon = (templateId: CVTemplateType) => {
    const icons = {
      'klassisk': FileText,
      'modern': Palette,
      'kreativ': Zap,
      'ats-optimerad': Users,
      'akademisk': BookOpen
    };
    return icons[templateId] || FileText;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            CV-mallar
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Förvandla ditt CV-innehåll till professionella, formaterade mallar. 
            Välj en mall som passar din bransch och ladda upp ditt CV-innehåll för att få en snygg PDF.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* CV Text Input */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Ditt CV-innehåll
                </CardTitle>
                <CardDescription>
                  Klistra in texten från ditt befintliga CV här
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Klistra in ditt CV-innehåll här...&#10;&#10;Exempel:&#10;Namn: Anna Andersson&#10;Email: anna@example.com&#10;Telefon: 070-123 45 67&#10;&#10;Sammanfattning:&#10;Erfaren projektledare med 8 års erfarenhet...&#10;&#10;Arbetslivserfarenhet:&#10;Projektledare - TechCorp AB (2019-2024)&#10;• Ledde team på 12 personer&#10;• Ökade produktiviteten med 25%"
                  className="w-full h-96 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                {selectedTemplate && cvText.trim() && (
                  <Button 
                    onClick={handleGenerateCV}
                    disabled={isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>Genererar CV...</>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Ladda ner CV
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Template Gallery */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Välj en CV-mall
              </h2>
              <p className="text-gray-600">
                Klicka på en mall för att välja den
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {getAllCVTemplates().map((template) => {
                const Icon = getTemplateIcon(template.id);
                const isSelected = selectedTemplate === template.id;

                return (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      isSelected 
                        ? 'ring-2 ring-blue-500 shadow-lg' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          {template.name}
                        </CardTitle>
                        {isSelected && (
                          <Badge variant="default" className="bg-blue-500">
                            Vald
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        {template.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Passar bra för:</h4>
                        <div className="flex flex-wrap gap-1">
                          {template.bestFor.map((item, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2">Funktioner:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {template.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Kategori:</span>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                      </div>

                      {/* Preview placeholder */}
                      <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Eye className="h-8 w-8 mx-auto mb-2" />
                          <span className="text-sm">Förhandsvisning kommer snart</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Instructions */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Så här använder du CV-mallarna</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">1</span>
                  <p className="text-gray-700">
                    <strong>Klistra in ditt CV-innehåll</strong> i textområdet till vänster. Du kan kopiera från Word, Google Docs eller valfri källa.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">2</span>
                  <p className="text-gray-700">
                    <strong>Välj en CV-mall</strong> som passar din bransch och stil. Klicka på mallkortet för att välja det.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">3</span>
                  <p className="text-gray-700">
                    <strong>Klicka på "Ladda ner CV"</strong> för att generera en professionell PDF med din valda mall.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}