'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Upload, Check, Crown, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCVStore } from '@/store/cv-store';
import { useProfile } from '@/hooks/use-profile';
import Notification from '@/components/ui/notification';
import SimpleTemplateGallery from '@/components/cv/simple-template-gallery';
import { getTemplateById } from '@/lib/cv/simple-templates';
import { motion } from 'framer-motion';
import CVGenerationModal from '@/components/cv/CVGenerationModal';
import UnifiedCVSelector from '@/components/cv/unified-cv-selector';

export default function CVMallarPage() {
  const router = useRouter();
  const { 
    cvs, 
    fetchCVs, 
    isLoading: cvsLoading, 
    selectedCV, 
    selectCV
  } = useCVStore();
  const { profile, loading: profileLoading, subscriptionTier } = useProfile();
  
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'loading' as 'loading' | 'success' | 'error'
  });
  const [showGenerationModal, setShowGenerationModal] = useState(false);

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

  const handleUpgradeClick = () => {
    router.push('/priser');
  };

  const handleGenerateCV = async (options: any = {}) => {
    if (!selectedTemplate || !selectedCV) {
      showNotification('error', 'Välj både ett CV och en mall först.');
      return;
    }

    const template = getTemplateById(selectedTemplate);
    if (template?.tier === 'premium' && subscriptionTier !== 'premium') {
      showNotification('error', 'Premium-mallar kräver en Premium-prenumeration.');
      handleUpgradeClick();
      return;
    }

    setIsGenerating(true);
    showNotification('loading', 'Skapar ditt CV...');

    try {
      const fileName = `cv-${template?.name.toLowerCase().replace(/\s+/g, '-')}-${selectedCV.file_name.replace(/\.[^/.]+$/, '')}.pdf`;

      // Use options from modal
      const templateOptions = (selectedTemplate === 'platinum-executive' || selectedTemplate === 'nordic-professional' || selectedTemplate === 'creative-minimal') ? {
        includePhoto: options.includePhoto !== undefined ? options.includePhoto : true,
        includeLinkedIn: options.includeLinkedIn !== undefined ? options.includeLinkedIn : true
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

      // Success celebration animation
      const celebration = document.createElement('div');
      celebration.innerHTML = '🎉';
      celebration.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 3rem;
        z-index: 9999;
        pointer-events: none;
        animation: celebration 2s ease-out forwards;
      `;
      document.body.appendChild(celebration);
      setTimeout(() => {
        celebration.remove();
        setShowGenerationModal(false); // Close modal after success
      }, 2000);
      
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
    <div className="relative min-h-screen overflow-hidden">
      {/* Premium Dynamic Background - Enhanced like dashboard page */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.9 }}
      >
        {/* Primary gradient foundation */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-slate-50/50" />

        {/* Secondary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-50/20 to-pink-50/30" />

        {/* Animated morphing gradient orbs */}
        <motion.div
          className="absolute top-[10%] left-[5%] w-[500px] h-[500px]"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, rgba(147, 51, 234, 0.05) 40%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, 150, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute top-[30%] right-[10%] w-[600px] h-[600px]"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, rgba(139, 92, 246, 0.04) 40%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, -200, 0],
            y: [0, 150, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute bottom-[20%] left-[15%] w-[400px] h-[400px]"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.03) 40%, transparent 70%)',
            filter: 'blur(70px)',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: "easeInOut"
          }}
        />

        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.015,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z\'/%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '40px 40px',
          }}
        />
      </motion.div>
      {/* Notification */}
      {notification.isVisible && (
        <Notification
          isVisible={notification.isVisible}
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.header 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              CV-mallar
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Välj en professionell CV-mall och skapa ditt CV på mindre än en minut.
            </p>
          </div>
          
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center text-green-600">
              <Check className="w-4 h-4 mr-2" />
              ATS-kompatibel
            </div>
            <div className="flex items-center text-blue-600">
              <Check className="w-4 h-4 mr-2" />
              Snabb nedladdning
            </div>
            <div className="flex items-center text-purple-600">
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
            <Card className="bg-white/95 backdrop-blur-xl shadow-xl border border-gray-200/80">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                  <FileText className="w-5 h-5 text-pink-600" />
                  Ditt CV
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Välj det CV du vill använda som grund
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <UnifiedCVSelector
                  selectedCV={selectedCV?.id || null}
                  onCVSelect={selectCV}
                  variant="compact"
                  showEmptyState={true}
                />
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
                <Card className="bg-gradient-to-r from-pink-600 to-purple-600 text-white border-0 shadow-xl">
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

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() => setShowGenerationModal(true)}
                        disabled={isGenerating}
                        className="w-full bg-white text-gray-900 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                      >
                        {!isGenerating && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                          />
                        )}
                        <div className="relative z-10 flex items-center justify-center">
                          {isGenerating ? (
                            <>
                              <motion.div
                                className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full mr-2"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              Skapar CV...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Skapa CV-PDF
                              <ArrowRight className="w-3 h-3 ml-2 opacity-60" />
                            </>
                          )}
                        </div>
                      </Button>
                    </motion.div>
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
            <Card className="bg-white/95 backdrop-blur-xl shadow-xl border border-gray-200/80">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Välj din design</CardTitle>
                <CardDescription className="text-gray-600">
                  Alla mallar fungerar för alla yrken - välj den design som passar dig bäst.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <SimpleTemplateGallery
                  selectedTemplate={selectedTemplate}
                  onTemplateSelect={setSelectedTemplate}
                  isPremium={subscriptionTier === 'premium'}
                  onUpgradeClick={handleUpgradeClick}
                />
              </CardContent>
            </Card>
          </motion.main>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none z-5">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* CV Generation Modal */}
      <CVGenerationModal
        isOpen={showGenerationModal}
        onClose={() => setShowGenerationModal(false)}
        selectedCV={selectedCV}
        selectedTemplate={selectedTemplateData}
        onGenerate={handleGenerateCV}
        isGenerating={isGenerating}
      />

      {/* CSS Styles for animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes celebration {
          0% {
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(0.5) rotate(360deg);
            opacity: 0;
          }
        }
        .glow-pink {
          box-shadow: 0 0 20px rgba(236, 72, 153, 0.3), 0 10px 40px rgba(236, 72, 153, 0.1);
        }
      `}} />
    </div>
  );
}