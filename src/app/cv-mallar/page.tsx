'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, FileText, Upload, Check, Crown, User, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { useCVStore } from '@/store/cv-store';
import { useProfile } from '@/hooks/use-profile';
import Notification from '@/components/ui/notification';
import SimpleTemplateGallery from '@/components/cv/simple-template-gallery';
import { getTemplateById } from '@/lib/cv/simple-templates';
import { motion } from 'framer-motion';

export default function CVMallarPage() {
  const router = useRouter();
  const { 
    cvs, 
    fetchCVs, 
    isLoading: cvsLoading, 
    selectedCV, 
    selectCV
  } = useCVStore();
  const { profile, loading: profileLoading } = useProfile();
  
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [includePhoto, setIncludePhoto] = useState(true);
  const [includeLinkedIn, setIncludeLinkedIn] = useState(true);
  const [notification, setNotification] = useState({
    isVisible: false, 
    message: '', 
    type: 'loading' as 'loading' | 'success' | 'error'
  });

  // Initialize data
  useEffect(() => {
    if (profileLoading) return;
    
    if (!profile) {
      router.push('/login');
      return;
    }
    
    fetchCVs();
  }, [profile, profileLoading, router, fetchCVs]);

  // Auto-select first CV and template
  useEffect(() => {
    if (cvs.length > 0 && !selectedCV) {
      selectCV(cvs[0].id);
    }
    if (!selectedTemplate && cvs.length > 0) {
      setSelectedTemplate('modern-minimal');
    }
  }, [cvs, selectedCV, selectCV, selectedTemplate]);

  const showNotification = (type: 'loading' | 'success' | 'error', message: string) => {
    setNotification({ isVisible: true, message, type });
    if (type !== 'loading') {
      setTimeout(() => setNotification(prev => ({ ...prev, isVisible: false })), 4000);
    }
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const handleGenerateCV = async () => {
    if (!selectedTemplate || !selectedCV) {
      showNotification('error', 'Välj både ett CV och en mall först.');
      return;
    }

    setIsGenerating(true);
    showNotification('loading', 'Skapar ditt CV...');

    try {
      const template = getTemplateById(selectedTemplate);
      const fileName = `cv-${template?.name.toLowerCase().replace(/\s+/g, '-')}-${selectedCV.file_name.replace(/\.[^/.]+$/, '')}.pdf`;
      
      // Prepare options for Platinum Executive template
      const templateOptions = selectedTemplate === 'platinum-executive' ? {
        includePhoto,
        includeLinkedIn
      } : {};

      // Anropa generate-formatted API med AI-parsad CV-data
      const response = await fetch('/api/cv/generate-formatted', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template: selectedTemplate,
          cvText: selectedCV.cv_text,
          format: 'pdf',
          templateOptions
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte generera CV');
      }

      // Ladda ner PDF:en
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      closeNotification();
      showNotification('success', `CV skapat! Nedladdning startar automatiskt.`);
      
    } catch (error: any) {
      console.error('Fel vid CV-skapande:', error);
      closeNotification();
      showNotification('error', error.message || 'Ett fel uppstod vid CV-skapande.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (profileLoading || !profile) {
    return null;
  }

  const selectedTemplateData = selectedTemplate ? getTemplateById(selectedTemplate) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800">
      {/* Notification */}
      {notification.isVisible && (
        <Notification
          isVisible={notification.isVisible}
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.header 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-3">
              CV-mallar
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Välj en professionell CV-mall och skapa ditt CV på mindre än en minut.
            </p>
          </div>
          
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center text-green-400">
              <Check className="w-4 h-4 mr-2" />
              ATS-kompatibel
            </div>
            <div className="flex items-center text-blue-400">
              <Check className="w-4 h-4 mr-2" />
              Snabb nedladdning
            </div>
            <div className="flex items-center text-purple-400">
              <Check className="w-4 h-4 mr-2" />
              Alla branscher
            </div>
          </div>
        </motion.header>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - CV Selection */}
          <motion.aside 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-navy-800 shadow-lg border border-navy-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Ditt CV
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Välj det CV du vill använda som grund
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {cvsLoading || profileLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-400 border-t-transparent"></div>
                  </div>
                ) : cvs.length === 0 ? (
                  <div className="text-center py-6">
                    <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-300 mb-4">Inga CV uppladdade</p>
                    <Link href="/profile?tab=cv">
                      <Button size="sm" className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
                        Ladda upp CV
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cvs.map((cv) => (
                      <button
                        key={cv.id}
                        type="button"
                        onClick={() => selectCV(cv.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          selectedCV?.id === cv.id
                            ? 'bg-navy-700 border-pink-500 ring-1 ring-pink-400'
                            : 'bg-navy-900/60 border-navy-600 hover:bg-navy-700/50 hover:border-navy-500'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <FileText className={`w-4 h-4 mt-0.5 ${
                            selectedCV?.id === cv.id ? 'text-pink-400' : 'text-gray-400'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium truncate ${
                              selectedCV?.id === cv.id ? 'text-white' : 'text-gray-200'
                            }`}>
                              {cv.file_name}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {cv.cv_text ? cv.cv_text.substring(0, 80) + '...' : 'Ingen förhandsgranskning'}
                            </p>
                          </div>
                          {selectedCV?.id === cv.id && (
                            <Check className="w-4 h-4 text-pink-400 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generate Button */}
            {selectedTemplate && selectedCV && (
              <motion.div 
                className="mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="bg-gradient-to-r from-pink-600 to-purple-600 text-white border-0">
                  <CardContent className="p-4">
                    <div className="text-center mb-3">
                      <h3 className="font-semibold">
                        {selectedTemplateData?.name}
                      </h3>
                      {selectedTemplateData?.tier === 'premium' && (
                        <Badge className="bg-amber-100 text-amber-800 mt-1">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>

                    {/* Toggle options for Platinum Executive template */}
                    {selectedTemplate === 'platinum-executive' && (
                      <div className="space-y-4 mb-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                        <h4 className="text-sm font-medium text-white/90">Anpassningsalternativ</h4>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <Label htmlFor="include-photo" className="text-sm text-white/90 cursor-pointer">
                              Inkludera profilbild
                            </Label>
                          </div>
                          <Switch
                            id="include-photo"
                            checked={includePhoto}
                            onCheckedChange={setIncludePhoto}
                            className="data-[state=checked]:bg-amber-500"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Linkedin className="w-4 h-4" />
                            <Label htmlFor="include-linkedin" className="text-sm text-white/90 cursor-pointer">
                              Inkludera LinkedIn-länk
                            </Label>
                          </div>
                          <Switch
                            id="include-linkedin"
                            checked={includeLinkedIn}
                            onCheckedChange={setIncludeLinkedIn}
                            className="data-[state=checked]:bg-blue-500"
                          />
                        </div>

                        <div className="text-xs text-white/70 mt-2">
                          {includePhoto && includeLinkedIn ? '💼 Executive Layout med foto & LinkedIn' :
                           includePhoto && !includeLinkedIn ? '📸 Professional Layout med foto' :
                           !includePhoto && includeLinkedIn ? '💼 Business Layout med LinkedIn' :
                           '✨ Clean Layout utan extra element'}
                        </div>
                      </div>
                    )}
                    
                    <Button
                      onClick={handleGenerateCV}
                      disabled={isGenerating}
                      className="w-full bg-white text-gray-900 hover:bg-gray-100"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent mr-2" />
                          Skapar CV...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Skapa CV-PDF
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.aside>

          {/* Main Content - Template Gallery */}
          <motion.main 
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-navy-800 shadow-lg border border-navy-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">Välj din design</CardTitle>
                <CardDescription className="text-gray-300">
                  Alla mallar fungerar för alla yrken - välj den design som passar dig bäst.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <SimpleTemplateGallery
                  selectedTemplate={selectedTemplate}
                  onTemplateSelect={setSelectedTemplate}
                />
              </CardContent>
            </Card>
          </motion.main>
        </div>
      </div>
    </div>
  );
}