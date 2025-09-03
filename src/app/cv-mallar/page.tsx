'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, FileText, Palette, Zap, Users, BookOpen, Loader2, Upload, Check } from 'lucide-react';
import Link from 'next/link';
import { getAllCVTemplates } from '@/lib/cv/cv-templates';
import type { CVTemplateType, CVMetadata } from '@/lib/cv/cv-metadata';
import { useCVStore } from '@/store/cv-store';
import { useProfile } from '@/hooks/use-profile';
import Notification from '@/components/ui/notification';

export default function CVMallarPage() {
  // Hooks
  const router = useRouter();
  const { cvs, fetchCVs, isLoading: cvsLoading, selectedCV, selectCV } = useCVStore();
  const { profile, loading: profileLoading } = useProfile();
  
  // State
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplateType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    isVisible: false, message: '', type: 'loading' as 'loading' | 'success' | 'error' | 'info'
  });
  
  // Refs
  const initialLoadRef = useRef(false);
  const authCheckedRef = useRef(false);
  
  // Authentication check
  useEffect(() => {
    if (!authCheckedRef.current && !profileLoading) {
      authCheckedRef.current = true;
      if (!profile) {
        router.push('/login');
      }
    }
  }, [profile, profileLoading, router]);
  
  // Initial data loading
  useEffect(() => {
    if (!initialLoadRef.current && profile) {
      initialLoadRef.current = true;
      fetchCVs();
    }
  }, [profile, fetchCVs]);
  
  // Auto-select first CV
  useEffect(() => {
    if (cvs.length > 0 && !selectedCV) {
      selectCV(cvs[0].id);
    }
  }, [cvs, selectedCV, selectCV]);
  
  // Notification helpers
  const showNotification = useCallback((type: 'loading' | 'success' | 'error' | 'info', message: string, duration: number = 5000) => {
    setNotification({ isVisible: true, message, type });
    if (type !== 'loading') {
      setTimeout(() => setNotification(prev => ({ ...prev, isVisible: false })), duration);
    }
  }, []);
  
  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  }, []);

  const handleTemplateSelect = (templateId: CVTemplateType) => {
    setSelectedTemplate(templateId);
    setPreviewHtml(null); // Clear preview when template changes
  };

  const handleGenerateCV = async () => {
    if (!selectedTemplate || !selectedCV) {
      showNotification('error', 'Välj både en mall och ett CV först.', 3000);
      return;
    }
    
    setIsGenerating(true);
    showNotification('loading', 'Genererar CV-PDF...');
    
    try {
      if (!selectedCV) {
        throw new Error('Inget CV valt');
      }
      
      const response = await fetch('/api/cv/generate-formatted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate,
          cvText: selectedCV.cv_text,
          format: 'pdf'
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cv-${selectedTemplate}-${selectedCV.file_name.replace(/\.[^/.]+$/, '')}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        
        closeNotification();
        showNotification('success', 'CV-PDF har laddats ner!', 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Serverfel vid generering');
      }
    } catch (error: any) {
      console.error('Fel vid CV-generering:', error);
      closeNotification();
      showNotification('error', error.message || 'Ett fel inträffade vid CV-generering.', 5000);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handlePreviewTemplate = useCallback(async () => {
    if (!selectedTemplate || !selectedCV) return;
    
    try {
      
      const template = getAllCVTemplates().find(t => t.id === selectedTemplate);
      if (!template) return;
      
      // Generate preview HTML (simplified for preview)
      const mockCvMetadata: CVMetadata = {
        personalInfo: {
          fullName: 'Förhandsvisning',
          email: 'exempel@email.se',
          phone: '070-123 45 67',
          address: 'Stockholm, Sverige',
          linkedIn: '',
          website: '',
          github: ''
        },
        summary: 'Detta är en förhandsvisning av hur ditt CV kommer att se ut med denna mall...',
        experience: [{
          position: 'Tidigare roller',
          company: 'Ditt CV-innehåll här',
          location: 'Stockholm',
          startDate: '2020-01-01',
          description: ['Se ditt riktiga CV-innehåll i den färdiga PDF:en'],
          achievements: []
        }],
        education: [{
          degree: 'Din utbildning',
          institution: 'Visas här i den färdiga PDF:en',
          location: 'Stockholm',
          graduationYear: '2020'
        }],
        skills: [{
          category: 'Dina färdigheter',
          skills: ['Visas här i den färdiga PDF:en']
        }],
        projects: [],
        certifications: [],
        languages: [],
        interests: [],
        references: 'Referenser lämnas på begäran'
      };
      
      const html = template.generateHTML(mockCvMetadata, {
        template: selectedTemplate,
        format: 'pdf',
        colorScheme: 'blue',
        includePhoto: false
      });
      
      setPreviewHtml(html);
    } catch (error) {
      console.error('Fel vid förhandsvisning:', error);
    }
  }, [selectedTemplate, selectedCV]);
  
  // Generate preview when template or CV changes
  useEffect(() => {
    if (selectedTemplate && selectedCV) {
      handlePreviewTemplate();
    }
  }, [selectedTemplate, selectedCV, handlePreviewTemplate]);

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

  // Don't render if not authenticated
  if (profileLoading || !profile) {
    return null;
  }

  return (
    <div className="max-w-screen-xl mx-auto pt-8 pb-16 px-4">
      {/* Notification */}
      {notification.isVisible && (
        <Notification
          isVisible={notification.isVisible}
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
      
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">CV-mallar</h1>
        <p className="text-gray-300">
          Förvandla dina uppladdade CV:n till professionella, formaterade PDF-mallar.
        </p>
      </header>

      {/* Main Content Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: CV Selection & Template Selection */}
        <section className="space-y-6 lg:col-span-1">
          {/* CV Selection */}
          <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
            <h2 className="text-xl font-semibold mb-5 text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-400" />
              Välj CV
            </h2>
            <div className="min-h-[10rem]">
              {cvsLoading || profileLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                </div>
              ) : cvs.length === 0 ? (
                <div className="border border-navy-700 border-dashed rounded-lg p-6 bg-navy-900/50 text-center">
                  <FileText className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                  <p className="text-lg mb-1 text-gray-300">Inga CV:n uppladdade</p>
                  <p className="text-sm text-gray-500 mb-4">Ladda upp ditt CV först.</p>
                  <Link href="/profile?tab=cv" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-pink-600 rounded-md hover:bg-pink-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Gå till CV-hantering
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3 max-h-80 overflow-y-auto">
                  {cvs.map((cv) => (
                    <li key={cv.id}>
                      <button
                        type="button"
                        onClick={() => selectCV(cv.id)}
                        disabled={isGenerating}
                        className={`w-full text-left p-4 rounded-md border transition-all duration-200 flex items-start gap-3 ${
                          selectedCV?.id === cv.id
                            ? 'bg-navy-700 border-pink-500 ring-1 ring-pink-500 shadow-md'
                            : 'bg-navy-900/50 border-navy-700 hover:bg-navy-700 hover:border-navy-600'
                        } ${isGenerating ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                        aria-pressed={selectedCV?.id === cv.id}
                      >
                        <FileText className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          selectedCV?.id === cv.id ? 'text-pink-400' : 'text-blue-400'
                        }`} />
                        <div className="flex-grow overflow-hidden">
                          <p className={`font-medium truncate ${
                            selectedCV?.id === cv.id ? 'text-white' : 'text-gray-200'
                          }`}>
                            {cv.file_name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {cv.cv_text ? `Innehåll: ${cv.cv_text.substring(0, 60)}...` : 'Förhandsgranskning saknas'}
                          </p>
                        </div>
                        {selectedCV?.id === cv.id && (
                          <Check className="w-5 h-5 text-pink-400 flex-shrink-0" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* Generate Button */}
          {selectedTemplate && selectedCV && (
            <Button
              onClick={handleGenerateCV}
              disabled={isGenerating || !selectedTemplate || !selectedCV}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-900 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-700 transition-all duration-300"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Genererar CV...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Ladda ner CV-PDF
                </>
              )}
            </Button>
          )}
        </section>

        {/* Right Column: Template Gallery & Preview */}
        <section className="bg-navy-800 rounded-lg p-6 border border-navy-700 lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2 flex items-center">
              <Palette className="w-5 h-5 mr-2 text-green-400" />
              Välj CV-mall
            </h2>
            <p className="text-gray-300">
              Klicka på en mall för att välja och förhandsgranska den
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {getAllCVTemplates().map((template) => {
                const Icon = getTemplateIcon(template.id);
                const isSelected = selectedTemplate === template.id;

                return (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg bg-navy-700 border-navy-600 ${
                      isSelected 
                        ? 'ring-2 ring-pink-500 shadow-lg' 
                        : 'hover:shadow-md hover:border-navy-500'
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Icon className="h-5 w-5" />
                          {template.name}
                        </CardTitle>
                        {isSelected && (
                          <Badge variant="default" className="bg-pink-500">
                            Vald
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-gray-300">
                        {template.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2 text-white">Passar bra för:</h4>
                        <div className="flex flex-wrap gap-1">
                          {template.bestFor.map((item, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-navy-600 text-gray-300">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2 text-white">Funktioner:</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {template.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-navy-600">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-white">Kategori:</span>
                          <Badge variant="outline" className="border-navy-500 text-gray-300">{template.category}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* Preview Area */}
            {selectedTemplate && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-pink-400" />
                  Förhandsvisning: {getAllCVTemplates().find(t => t.id === selectedTemplate)?.name}
                </h3>
                <div className="bg-navy-900/50 rounded-lg p-4 border border-navy-600">
                  {previewHtml ? (
                    <div 
                      className="bg-white rounded border max-h-96 overflow-auto text-xs"
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                      style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%' }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-48 text-gray-400">
                      <div className="text-center">
                        <Eye className="w-12 h-12 mx-auto mb-2" />
                        <p>Förhandsvisning laddas...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Instructions */}
            <div className="mt-8 p-4 bg-navy-900/50 rounded-lg border border-navy-600">
              <h3 className="text-lg font-semibold text-white mb-4">Så här använder du CV-mallarna</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="bg-pink-100 text-pink-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">1</span>
                  <p className="text-gray-300">
                    <strong className="text-white">Välj ett uppladdad CV</strong> från listan till vänster.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-pink-100 text-pink-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">2</span>
                  <p className="text-gray-300">
                    <strong className="text-white">Välj en CV-mall</strong> som passar din bransch och stil. Du ser en förhandsvisning ovan.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-pink-100 text-pink-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">3</span>
                  <p className="text-gray-300">
                    <strong className="text-white">Klicka på "Ladda ner CV-PDF"</strong> för att generera en professionell PDF.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}