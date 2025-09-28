'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  FileText,
  Save,
  Calendar,
  Briefcase,
  Target,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Palette,
  Clock,
  Crown,
  ArrowLeft,
  Check
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SimpleTemplateGallery from './simple-template-gallery';
import { getTemplateById } from '@/lib/cv/simple-templates';
import { useProfile } from '@/hooks/use-profile';

interface CVExportOptionsProps {
  improvedCV: string;
  cvId: string;
  onExportComplete?: () => void;
  className?: string;
}

type ExportFormat = 'pdf' | 'docx';
type NamingOption = 'optimized' | 'ats' | 'date' | 'custom';
type ExportStep = 'format' | 'template' | 'naming';

export default function CVExportOptions({
  improvedCV,
  cvId,
  onExportComplete,
  className = ''
}: CVExportOptionsProps) {
  const [currentStep, setCurrentStep] = useState<ExportStep>('format');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedNaming, setSelectedNaming] = useState<NamingOption>('optimized');
  const [customName, setCustomName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { subscriptionTier } = useProfile();

  const namingOptions = [
    {
      id: 'optimized' as NamingOption,
      label: 'Optimerat CV',
      description: 'Smart namngivning baserat på förbättringar',
      icon: Sparkles,
      example: 'Optimerat CV - 2024-01-15'
    },
    {
      id: 'ats' as NamingOption,
      label: 'ATS-anpassat CV',
      description: 'Fokus på rekryteringssystem',
      icon: Target,
      example: 'ATS-anpassat CV - Senior Developer'
    },
    {
      id: 'date' as NamingOption,
      label: 'Datumbaserat',
      description: 'Inkludera dagens datum',
      icon: Calendar,
      example: 'Uppdaterat CV - 2024-01-15'
    },
    {
      id: 'custom' as NamingOption,
      label: 'Anpassat namn',
      description: 'Välj ditt eget filnamn',
      icon: FileText,
      example: 'Ditt valda namn'
    }
  ];

  const formatOptions = [
    {
      id: 'pdf' as ExportFormat,
      label: 'PDF',
      description: 'Bäst för utskrift och delning',
      icon: FileText,
      recommended: true
    },
    {
      id: 'docx' as ExportFormat,
      label: 'Word',
      description: 'Redigerbar i Microsoft Word',
      icon: FileText,
      recommended: false
    }
  ];

  const generateFilename = (): string => {
    const date = new Date().toLocaleDateString('sv-SE');

    switch (selectedNaming) {
      case 'optimized':
        return `Optimerat CV - ${date}`;
      case 'ats':
        return `ATS-anpassat CV - ${date}`;
      case 'date':
        return `Uppdaterat CV - ${date}`;
      case 'custom':
        return customName || `CV - ${date}`;
      default:
        return `CV - ${date}`;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSaving(false);
  };

  const handleExport = async () => {
    if (!selectedTemplate) {
      console.error('No template selected');
      return;
    }

    setIsExporting(true);

    try {
      const template = getTemplateById(selectedTemplate);
      if (!template) {
        throw new Error('Template not found');
      }

      // Check if user has access to premium templates
      if (template.tier === 'premium' && subscriptionTier !== 'premium') {
        throw new Error('Premium-mallar kräver en Premium-prenumeration.');
      }

      const fileName = `${generateFilename()}.${selectedFormat}`;

      // Template options for customizable templates
      const templateOptions = (selectedTemplate === 'platinum-executive' ||
                              selectedTemplate === 'nordic-professional' ||
                              selectedTemplate === 'creative-minimal') ? {
        includePhoto: true,
        includeLinkedIn: true
      } : {};

      // Call the generate-formatted API
      const response = await fetch('/api/cv/generate-formatted', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template: selectedTemplate,
          cvText: improvedCV,
          format: selectedFormat,
          templateOptions
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte generera CV');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Success celebration
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
      }, 2000);

      onExportComplete?.();
    } catch (error: any) {
      console.error('Export error:', error);
      alert(error.message || 'Ett fel uppstod vid nedladdning.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleUpgradeClick = () => {
    window.open('/priser', '_blank');
  };

  const goToNextStep = () => {
    if (currentStep === 'format') {
      setCurrentStep('template');
    } else if (currentStep === 'template' && selectedTemplate) {
      setCurrentStep('naming');
    }
  };

  const goToPreviousStep = () => {
    if (currentStep === 'naming') {
      setCurrentStep('template');
    } else if (currentStep === 'template') {
      setCurrentStep('format');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'format':
        return (
          <motion.div
            key="format"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              Välj exportformat
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {formatOptions.map((format) => {
                const Icon = format.icon;
                const isSelected = selectedFormat === format.id;

                return (
                  <motion.div
                    key={format.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      onClick={() => setSelectedFormat(format.id)}
                      className={`
                        cursor-pointer p-4 transition-all duration-200
                        ${isSelected
                          ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-300 shadow-md'
                          : 'bg-white hover:bg-gray-50 border-gray-200'}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`
                          p-2 rounded-lg
                          ${isSelected ? 'bg-white shadow-sm' : 'bg-gray-100'}
                        `}>
                          <Icon className={`h-5 w-5 ${isSelected ? 'text-pink-600' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                              {format.label}
                            </span>
                            {format.recommended && (
                              <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                                Rekommenderad
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {format.description}
                          </p>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <CheckCircle2 className="h-5 w-5 text-pink-600" />
                          </motion.div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );

      case 'template':
        return (
          <motion.div
            key="template"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Palette className="h-4 w-4 text-gray-500" />
              Välj CV-mall
            </h4>
            <p className="text-xs text-gray-600 mb-4">
              Välj en professionell mall för ditt förbättrade CV
            </p>
            <SimpleTemplateGallery
              selectedTemplate={selectedTemplate}
              onTemplateSelect={setSelectedTemplate}
              isPremium={subscriptionTier === 'premium'}
              onUpgradeClick={handleUpgradeClick}
              className="max-h-96 overflow-y-auto"
            />
          </motion.div>
        );

      case 'naming':
        return (
          <motion.div
            key="naming"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Save className="h-4 w-4 text-gray-500" />
              Namngivning
            </h4>
            <div className="space-y-2">
              {namingOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedNaming === option.id;

                return (
                  <motion.div
                    key={option.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      onClick={() => setSelectedNaming(option.id)}
                      className={`
                        cursor-pointer p-3 transition-all duration-200
                        ${isSelected
                          ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-300'
                          : 'bg-white hover:bg-gray-50 border-gray-200'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          p-1.5 rounded-lg
                          ${isSelected ? 'bg-white shadow-sm' : 'bg-gray-100'}
                        `}>
                          <Icon className={`h-4 w-4 ${isSelected ? 'text-pink-600' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className={`font-medium text-sm ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                {option.label}
                              </span>
                              <p className="text-xs text-gray-500">
                                {option.description}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="h-4 w-4 text-pink-600" />
                            )}
                          </div>
                        </div>
                      </div>

                      {isSelected && option.id === 'custom' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3"
                        >
                          <input
                            type="text"
                            placeholder="Ange filnamn..."
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                        </motion.div>
                      )}

                      {isSelected && option.id !== 'custom' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="mt-2 text-xs text-gray-500 italic"
                        >
                          Exempel: {option.example}
                        </motion.div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Filename Preview */}
            <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 p-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">
                    Filnamn förhandsvisning
                  </h5>
                  <p className="font-mono text-sm text-gray-900">
                    {generateFilename()}.{selectedFormat}
                  </p>
                </div>
                <div className="text-2xl">📄</div>
              </div>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`cv-export-options space-y-6 ${className}`}>
      {/* Step Progress Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {['format', 'template', 'naming'].map((step, index) => {
            const isCompleted = ['format', 'template', 'naming'].indexOf(currentStep) > index;
            const isCurrent = currentStep === step;

            return (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
                  ${isCompleted
                    ? 'bg-green-100 text-green-700'
                    : isCurrent
                    ? 'bg-pink-100 text-pink-700'
                    : 'bg-gray-100 text-gray-500'
                  }
                `}>
                  {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                {index < 2 && (
                  <div className={`w-8 h-0.5 mx-2 transition-all duration-200 ${
                    isCompleted ? 'bg-green-300' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="text-sm text-gray-600">
          Steg {['format', 'template', 'naming'].indexOf(currentStep) + 1} av 3
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {renderStepContent()}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        {currentStep !== 'format' && (
          <Button
            onClick={goToPreviousStep}
            variant="outline"
            className="flex items-center gap-2 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Tillbaka
          </Button>
        )}

        <div className="flex-1" />

        {currentStep === 'format' && (
          <Button
            onClick={goToNextStep}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white flex items-center gap-2"
          >
            Välj mall
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}

        {currentStep === 'template' && (
          <Button
            onClick={goToNextStep}
            disabled={!selectedTemplate}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Nästa
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}

        {currentStep === 'naming' && (
          <>
            <Button
              onClick={handleSave}
              disabled={isSaving || isExporting}
              variant="outline"
              className="bg-white hover:bg-gray-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Sparar...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Spara
                </>
              )}
            </Button>

            <Button
              onClick={handleExport}
              disabled={isSaving || isExporting || !selectedTemplate}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Laddar ner...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Ladda ned förbättrad
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {/* CSS for celebration animation */}
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
      `}} />
    </div>
  );
}