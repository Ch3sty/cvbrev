'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Download, Save, Check, User, FileText,
  Briefcase, GraduationCap, Wrench, Languages, Pencil,
  Loader2, Lock, Crown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/use-profile';
import { SIMPLE_TEMPLATES, getTemplateById } from '@/lib/cv/simple-templates';
import { getTemplateGenerator } from '@/lib/cv/templates';
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

  const [cvName, setCvName] = useState(`CV - ${cvData.personalInfo.fullName || 'Nytt CV'}`);
  const [previewHTML, setPreviewHTML] = useState<string>('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

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

  // Scroll templates
  const [templateScrollIndex, setTemplateScrollIndex] = useState(0);
  const templatesPerView = 4;
  const maxScrollIndex = Math.max(0, SIMPLE_TEMPLATES.length - templatesPerView);

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
          onClick={() => onComplete('both')}
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
          onClick={() => onComplete('download')}
          disabled={!isValid || isSaving || isTemplateLocked}
          className="min-h-[48px]"
        >
          <Download className="w-4 h-4 mr-2" />
          Bara ladda ner
        </Button>

        <Button
          variant="outline"
          onClick={() => onComplete('save')}
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
