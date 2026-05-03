'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Download, Save, Check, User, FileText,
  Briefcase, GraduationCap, Wrench, Languages, Pencil,
  Loader2, Lock, Crown, ChevronLeft, ChevronRight,
  Sparkles, FolderOpen, ArrowRight, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/use-profile';
import { SIMPLE_TEMPLATES, getTemplateById } from '@/lib/cv/simple-templates';
import { getTemplateGenerator } from '@/lib/cv/templates';
import QuotaExceededBanner from '@/components/cv/QuotaExceededBanner';
import type { CVDraft } from '../CVCreatorWizard';
import type { CVMetadata, CVTemplateType } from '@/lib/cv/cv-metadata';

interface Step7ReviewProps {
  cvData: CVDraft;
  updateCVData: (updates: Partial<CVDraft>) => void;
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
  onComplete: (action: 'save' | 'download' | 'both') => Promise<void>;
  isSaving: boolean;
  buildCVMetadata: () => CVMetadata;
}

// Section icons
const SECTION_ICONS = {
  personalInfo: User,
  summary: FileText,
  experience: Briefcase,
  education: GraduationCap,
  skills: Wrench,
  languages: Languages,
};

// Bekräftelsevy efter spara/nedladdning
interface ConfirmationViewProps {
  cvName: string;
  templateName: string;
  wasDownloaded: boolean;
  wasSaved: boolean;
  onGoToATS: () => void;
  onGoToLibrary: () => void;
  onCreateNew: () => void;
}

function ConfirmationView({
  cvName,
  templateName,
  wasDownloaded,
  wasSaved,
  onGoToATS,
  onGoToLibrary,
  onCreateNew,
}: ConfirmationViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center text-center py-6 md:py-10"
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
        className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30 mb-6"
      >
        <Check className="w-10 h-10 md:w-12 md:h-12 text-white stroke-[3]" />
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
      >
        Ditt CV är klart
      </motion.h1>

      {/* Subheading based on action */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-base md:text-lg text-gray-600 mb-6 max-w-md"
      >
        {wasDownloaded && wasSaved
          ? 'Du har laddat ner och sparat ditt CV. Nu kan du skicka det direkt eller se till att det faktiskt når fram förbi ATS-systemen.'
          : wasDownloaded
          ? 'Du har laddat ner ditt CV. Nu kan du skicka det direkt eller se till att det faktiskt når fram förbi ATS-systemen.'
          : 'Ditt CV är sparat under Mina CV. Nu kan du ladda ner det eller se till att det faktiskt når fram förbi ATS-systemen.'}
      </motion.p>

      {/* Status indicators */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="flex flex-wrap justify-center gap-3 mb-8"
      >
        {wasSaved && (
          <div className="flex items-center gap-1.5 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
            <Check className="w-4 h-4" />
            <span>CV:t sparades</span>
          </div>
        )}
        {wasDownloaded && (
          <div className="flex items-center gap-1.5 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
            <Check className="w-4 h-4" />
            <span>CV:t laddades ner</span>
          </div>
        )}
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-md space-y-3"
      >
        {/* Primary CTA: ATS-optimering */}
        <Button
          onClick={onGoToATS}
          className="w-full min-h-[56px] md:min-h-[52px] bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-base font-semibold shadow-lg shadow-pink-500/25"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Optimera för ATS-system
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <p className="text-sm text-gray-500 px-4">
          De flesta företag använder ATS-system som sorterar bort CV innan en människa läser dem. Vi visar vad du ska fixa.
        </p>

        {/* Secondary CTA: Gå till Mina CV */}
        <Button
          variant="outline"
          onClick={onGoToLibrary}
          className="w-full min-h-[56px] md:min-h-[52px] border-2 border-gray-300 text-base font-medium hover:bg-gray-50 mt-4"
        >
          <FolderOpen className="w-5 h-5 mr-2" />
          Gå till Mina CV
        </Button>
        <p className="text-sm text-gray-500 px-4">
          Redigera, ladda ner eller skapa fler versioner av ditt CV
        </p>
      </motion.div>

      {/* Tertiary: Create new */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={onCreateNew}
        className="mt-8 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Skapa ett nytt CV
      </motion.button>
    </motion.div>
  );
}

export default function Step7Review({
  cvData,
  updateCVData,
  selectedTemplate,
  setSelectedTemplate,
  onComplete,
  isSaving,
  buildCVMetadata,
}: Step7ReviewProps) {
  const router = useRouter();
  const { subscriptionTier } = useProfile();
  const isPremium = subscriptionTier === 'premium';

  // State för bekräftelsevy
  const [viewMode, setViewMode] = useState<'review' | 'confirmation'>('review');
  const [completionStatus, setCompletionStatus] = useState<{
    wasDownloaded: boolean;
    wasSaved: boolean;
  }>({ wasDownloaded: false, wasSaved: false });

  const [cvName, setCvName] = useState(`CV - ${cvData.personalInfo.fullName || 'Nytt CV'}`);
  const [previewHTML, setPreviewHTML] = useState<string>('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [quotaError, setQuotaError] = useState<string | null>(null);

  // Generate HTML preview when template or data changes
  useEffect(() => {
    const generatePreview = async () => {
      setIsGeneratingPreview(true);
      try {
        const metadata = buildCVMetadata();
        const generator = getTemplateGenerator(selectedTemplate as CVTemplateType);

        if (generator) {
          const html = generator.generate(metadata, {});
          setPreviewHTML(html);
        }
      } catch (error) {
        console.error('Error generating preview:', error);
      } finally {
        setIsGeneratingPreview(false);
      }
    };

    generatePreview();
  }, [selectedTemplate, buildCVMetadata]);

  // Build summary of each section
  const sections = useMemo(() => {
    return [
      {
        id: 'personalInfo',
        title: 'Kontaktuppgifter',
        count: null,
        summary: cvData.personalInfo.fullName || 'Ej ifyllt',
        isComplete: !!(cvData.personalInfo.fullName && cvData.personalInfo.email && cvData.personalInfo.phone),
      },
      {
        id: 'summary',
        title: 'Om dig',
        count: null,
        summary: cvData.summary ? `${cvData.summary.slice(0, 50)}...` : 'Ej ifyllt',
        isComplete: !!cvData.summary,
      },
      {
        id: 'experience',
        title: 'Erfarenhet',
        count: cvData.experience.filter(e => e.position && e.company).length,
        summary: cvData.experience.length > 0
          ? cvData.experience.filter(e => e.position).map(e => e.position).join(', ')
          : 'Ingen erfarenhet',
        isComplete: cvData.experience.some(e => e.position && e.company),
      },
      {
        id: 'education',
        title: 'Utbildning',
        count: cvData.education.filter(e => e.degree && e.institution).length,
        summary: cvData.education.length > 0
          ? cvData.education.filter(e => e.degree).map(e => e.degree).join(', ')
          : 'Ingen utbildning',
        isComplete: cvData.education.some(e => e.degree && e.institution),
      },
      {
        id: 'skills',
        title: 'Kompetenser',
        count: cvData.skills.flatMap(s => s.skills).length,
        summary: cvData.skills.flatMap(s => s.skills).slice(0, 3).join(', ') || 'Inga kompetenser',
        isComplete: cvData.skills.some(s => s.skills.length > 0),
      },
      {
        id: 'languages',
        title: 'Språk',
        count: cvData.languages.filter(l => l.language).length,
        summary: cvData.languages.filter(l => l.language).map(l => l.language).join(', ') || 'Inga språk',
        isComplete: cvData.languages.some(l => l.language),
      },
    ];
  }, [cvData]);

  // Check if CV is valid for saving
  const isValid = useMemo(() => {
    const hasBasicInfo = !!(cvData.personalInfo.fullName && cvData.personalInfo.email && cvData.personalInfo.phone);
    const hasContent = cvData.experience.some(e => e.position && e.company) ||
                      cvData.education.some(e => e.degree && e.institution);
    return hasBasicInfo && hasContent;
  }, [cvData]);

  // Check if selected template is locked
  const selectedTemplateData = getTemplateById(selectedTemplate);
  const isTemplateLocked = selectedTemplateData?.tier === 'premium' && !isPremium;

  // Handle template selection with premium check
  const handleTemplateSelect = (templateId: string) => {
    const template = getTemplateById(templateId);
    if (template?.tier === 'premium' && !isPremium) {
      // Still allow selection to show the preview, but block download
      setSelectedTemplate(templateId);
    } else {
      setSelectedTemplate(templateId);
    }
  };

  // Handle action completion with confirmation view
  const handleAction = async (action: 'save' | 'download' | 'both') => {
    setQuotaError(null);
    try {
      await onComplete(action);

      // Visa bekräftelsevyn efter framgångsrik operation
      setCompletionStatus({
        wasDownloaded: action === 'download' || action === 'both',
        wasSaved: action === 'save' || action === 'both',
      });
      setViewMode('confirmation');
    } catch (error) {
      console.error('Error completing action:', error);
      const isQuota =
        error instanceof Error &&
        (error as Error & { quotaExceeded?: boolean }).quotaExceeded === true;
      if (isQuota) {
        setQuotaError(error.message);
        // Scrolla upp så banner syns
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  };

  // Handle navigation from confirmation view
  const handleGoToATS = () => {
    router.push('/dashboard/cv-analys');
  };

  const handleGoToLibrary = () => {
    router.push('/dashboard/profil/cv');
  };

  const handleCreateNew = () => {
    // Ladda om sidan för att starta en ny CV-skapning
    window.location.href = '/dashboard/skapa-cv';
  };

  // Scroll templates
  const [templateScrollIndex, setTemplateScrollIndex] = useState(0);
  const templatesPerView = 4;
  const maxScrollIndex = Math.max(0, SIMPLE_TEMPLATES.length - templatesPerView);

  // Om vi är i bekräftelseläge, visa ConfirmationView
  if (viewMode === 'confirmation') {
    return (
      <ConfirmationView
        cvName={cvName}
        templateName={selectedTemplateData?.name || 'Modern Minimal'}
        wasDownloaded={completionStatus.wasDownloaded}
        wasSaved={completionStatus.wasSaved}
        onGoToATS={handleGoToATS}
        onGoToLibrary={handleGoToLibrary}
        onCreateNew={handleCreateNew}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Granska ditt CV
        </h1>
        <p className="text-gray-600">
          Välj en mall och se hur ditt CV ser ut innan du laddar ner.
        </p>
      </div>

      {/* Kvotgräns nådd */}
      {quotaError && (
        <QuotaExceededBanner message={quotaError} />
      )}

      {/* Template Selection - Horizontal Carousel */}
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Välj CV-mall
        </h2>

        <div className="relative">
          {/* Navigation arrows */}
          {templateScrollIndex > 0 && (
            <button
              onClick={() => setTemplateScrollIndex(Math.max(0, templateScrollIndex - 1))}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {templateScrollIndex < maxScrollIndex && (
            <button
              onClick={() => setTemplateScrollIndex(Math.min(maxScrollIndex, templateScrollIndex + 1))}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Templates grid */}
          <div className="overflow-hidden px-4">
            <motion.div
              className="flex gap-3"
              animate={{ x: -templateScrollIndex * (140 + 12) }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {SIMPLE_TEMPLATES.map((template) => {
                const isLocked = template.tier === 'premium' && !isPremium;
                const isSelected = selectedTemplate === template.id;

                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`relative flex-shrink-0 w-[140px] rounded-xl border-2 overflow-hidden transition-all ${
                      isSelected
                        ? 'border-pink-500 ring-2 ring-pink-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Template preview image */}
                    <div className="aspect-[3/4] bg-gray-100 relative">
                      <img
                        src={template.imagePath}
                        alt={template.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />

                      {/* Lock overlay for premium */}
                      {isLocked && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
                          <Lock className="w-6 h-6 text-gray-400 mb-1" />
                          <span className="text-xs text-gray-500">Premium</span>
                        </div>
                      )}

                      {/* Selected checkmark */}
                      {isSelected && !isLocked && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}

                      {/* Premium badge */}
                      {template.tier === 'premium' && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center gap-1">
                          <Crown className="w-3 h-3 text-white" />
                          <span className="text-[10px] font-medium text-white">PRO</span>
                        </div>
                      )}
                    </div>

                    {/* Template name */}
                    <div className="p-2 bg-white">
                      <p className="text-xs font-medium text-gray-900 truncate">{template.name}</p>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Upgrade prompt if premium template selected */}
        {isTemplateLocked && (
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-600" />
              <span className="text-sm text-amber-800">
                Denna mall kräver Premium
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => router.push('/priser')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              Uppgradera
            </Button>
          </div>
        )}
      </div>

      {/* Main content: Sections + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Sections Overview (narrower) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Pencil className="w-4 h-4" />
            Innehåll
          </h2>

          <div className="space-y-2">
            {sections.map((section) => {
              const Icon = SECTION_ICONS[section.id as keyof typeof SECTION_ICONS];
              return (
                <div
                  key={section.id}
                  className={`p-3 rounded-lg border transition-all ${
                    section.isComplete
                      ? 'bg-white border-gray-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      section.isComplete ? 'bg-green-100' : 'bg-amber-100'
                    }`}>
                      {section.isComplete ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Icon className="w-3.5 h-3.5 text-amber-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {section.title}
                        {section.count !== null && section.count > 0 && (
                          <span className="text-gray-500 font-normal"> ({section.count})</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {section.summary}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CV Name */}
          <div className="mt-4 space-y-2">
            <Label htmlFor="cvName" className="text-sm">CV-namn</Label>
            <Input
              id="cvName"
              value={cvName}
              onChange={(e) => setCvName(e.target.value)}
              placeholder="Namnge ditt CV"
              className="h-10"
            />
          </div>
        </div>

        {/* Right: Live Preview (wider) */}
        <div className="lg:col-span-3 space-y-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Förhandsvisning
          </h2>

          <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {/* Preview header */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {selectedTemplateData?.name || 'Modern Minimal'}
              </span>
              <span className="text-xs text-gray-500">
                A4-format
              </span>
            </div>

            {/* Preview content */}
            <div
              className="relative"
              style={{ minHeight: '500px', maxHeight: '600px', overflowY: 'auto' }}
            >
              {isGeneratingPreview ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
                    <span className="text-sm text-gray-500">Genererar förhandsvisning...</span>
                  </div>
                </div>
              ) : previewHTML ? (
                <div
                  className="cv-preview-container"
                  style={{
                    transform: 'scale(0.5)',
                    transformOrigin: 'top left',
                    width: '200%',
                  }}
                  dangerouslySetInnerHTML={{ __html: previewHTML }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Fyll i dina uppgifter för att se förhandsvisning
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            PDF:en kommer att exporteras i full A4-kvalitet
          </p>
        </div>
      </div>

      {/* Validation Warning */}
      {!isValid && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-amber-800 font-medium">Ditt CV är inte komplett</p>
          <p className="text-sm text-amber-700 mt-1">
            Du behöver minst: kontaktuppgifter (namn, e-post, telefon) och antingen arbetslivserfarenhet eller utbildning.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <Button
          onClick={() => handleAction('both')}
          disabled={!isValid || isSaving || isTemplateLocked}
          className="min-h-[48px] px-8 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sparar...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Spara & Ladda ner PDF
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={() => handleAction('download')}
          disabled={!isValid || isSaving || isTemplateLocked}
          className="min-h-[48px]"
        >
          <Download className="w-4 h-4 mr-2" />
          Bara ladda ner
        </Button>

        <Button
          variant="outline"
          onClick={() => handleAction('save')}
          disabled={!isValid || isSaving}
          className="min-h-[48px]"
        >
          <Save className="w-4 h-4 mr-2" />
          Bara spara
        </Button>
      </div>

      <p className="text-center text-sm text-gray-500">
        Ditt CV sparas i "Mina CV" där du kan redigera och ladda ner det igen
      </p>
    </div>
  );
}
