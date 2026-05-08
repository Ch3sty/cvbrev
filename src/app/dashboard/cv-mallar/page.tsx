'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCVStore } from '@/store/cv-store';
import { useProfile } from '@/hooks/use-profile';
import { useNotification } from '@/context/notificationcontext';
import { getTemplateById } from '@/lib/cv/simple-templates';

import CvMallarLayout from './components/CvMallarLayout';
import CvMallarHero from './components/CvMallarHero';
import MallarLivePreview from './components/MallarLivePreview';
import CvGenerationOverlay from './components/CvGenerationOverlay';
import CvPickerGrid from '../skapa-brev/components/CvPickerGrid';
import LetterFlowStepHeader from '../skapa-brev/components/LetterFlowStepHeader';

function CVMallarContent() {
  const searchParams = useSearchParams();
  const cvIdFromUrl = searchParams.get('cv');
  const hasSelectedFromUrl = useRef(false);
  const router = useRouter();
  const {
    cvs,
    fetchCVs,
    selectedCV,
    selectCV,
  } = useCVStore();
  const { profile, loading: profileLoading, subscriptionTier } = useProfile();
  const { successWithMascotAndActivity } = useNotification();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const isPremium = subscriptionTier === 'premium';

  useEffect(() => {
    if (profileLoading) return;
    if (!profile) {
      router.push('/login');
      return;
    }
    fetchCVs();
  }, [profile, profileLoading, router, fetchCVs]);

  // Auto-vAlj CV frán URL eller senaste
  useEffect(() => {
    if (cvs.length === 0) return;

    if (cvIdFromUrl && !hasSelectedFromUrl.current) {
      const cvFromUrl = cvs.find((cv) => cv.id === cvIdFromUrl);
      if (cvFromUrl) {
        selectCV(cvFromUrl.id);
        hasSelectedFromUrl.current = true;
        return;
      } else {
        selectCV(cvs[0].id);
        hasSelectedFromUrl.current = true;
        return;
      }
    }

    if (!selectedCV && !cvIdFromUrl) {
      selectCV(cvs[0].id);
    }
  }, [cvs, selectedCV, selectCV, cvIdFromUrl]);

  const handleUpgradeClick = () => {
    router.push('/priser');
  };

  const handleGenerateCV = async (params: {
    templateId: string;
    fontFamily: string;
    fontId: string;
    includePhoto: boolean;
    includeLinkedIn: boolean;
  }) => {
    if (!selectedCV) return;

    const template = getTemplateById(params.templateId);
    if (template?.tier === 'premium' && subscriptionTier !== 'premium') {
      handleUpgradeClick();
      return;
    }

    setGenerationError(null);
    setIsGenerating(true);

    try {
      const fileName = `cv-${template?.name.toLowerCase().replace(/\s+/g, '-')}-${selectedCV.file_name.replace(/\.[^/.]+$/, '')}.pdf`;

      // Anvand features fran mall-registret for att avgora vilka toggles som
      // ska skickas. Mallar utan stOd far inte options-falt sa generators
      // anvander default-beteende.
      const supportsPhoto = template?.features?.supportsPhoto === true;
      const supportsLinkedIn = template?.features?.supportsLinkedIn === true;

      const templateOptions: { includePhoto?: boolean; includeLinkedIn?: boolean } = {};
      if (supportsPhoto) templateOptions.includePhoto = params.includePhoto;
      if (supportsLinkedIn) templateOptions.includeLinkedIn = params.includeLinkedIn;

      const response = await fetch('/api/cv/generate-formatted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: params.templateId,
          // Skicka pre-parsed structured_data om finns (matchar preview exakt)
          structuredData: (selectedCV as any).structured_data || undefined,
          cvText: selectedCV.cv_text,
          format: 'pdf',
          templateOptions,
          fontFamily: params.fontFamily,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte generera CV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setIsGenerating(false);

      successWithMascotAndActivity(
        'Vi har gjort en PDF av ditt CV. Den är nedladdad till din enhet.',
        'cv-template-generated',
        'cv_generated',
        'skapade ett professionellt CV',
        {
          template: params.templateId,
          font: params.fontId,
          cv_id: selectedCV.id,
          file_name: fileName,
        },
        5000
      );
    } catch (error: any) {
      console.error('Fel vid CV-skapande:', error);
      setGenerationError(error?.message || 'Något gick fel. Försök igen.');
      // LAmnar isGenerating=true sa error-vyn syns; stangs av onClose
    }
  };

  if (profileLoading || !profile) {
    return null;
  }

  return (
    <CvMallarLayout>
      <CvMallarHero />

      {/* Steg 1: VAlj CV (kompakt) */}
      <motion.section
        data-flow-section="cv"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-white rounded-3xl border border-orange-200/50 p-5 sm:p-6"
        style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.15)' }}
      >
        <LetterFlowStepHeader
          stepNumber={1}
          title="Välj ditt CV"
          description="Innehållet visas i den nya designen direkt."
          isDone={!!selectedCV}
          isActive={!selectedCV}
        />
        <CvPickerGrid
          selectedCV={selectedCV?.id || null}
          onCVSelect={(cvId) => selectCV(cvId)}
        />
      </motion.section>

      {/* Steg 2: Live-preview-vyn med mall-lista, toolbar, info, CTA */}
      <motion.section
        data-flow-section="template"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
        className="bg-white rounded-3xl border border-orange-200/50 p-5 sm:p-6"
        style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.15)' }}
      >
        <LetterFlowStepHeader
          stepNumber={2}
          title="Välj design"
          description="Bläddra mallar och se din ansökan i realtid."
          isDone={false}
          isActive={!!selectedCV}
        />

        <div className="mt-4">
          <MallarLivePreview
            selectedCV={selectedCV}
            isPremium={isPremium}
            isGenerating={isGenerating}
            onGenerate={handleGenerateCV}
            onUpgrade={handleUpgradeClick}
          />
        </div>
      </motion.section>

      {/* Generation overlay */}
      <CvGenerationOverlay
        isOpen={isGenerating}
        isError={!!generationError}
        errorMessage={generationError || undefined}
        onClose={() => {
          setIsGenerating(false);
          setGenerationError(null);
        }}
      />
    </CvMallarLayout>
  );
}

export default function CVMallarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
            <p className="text-slate-600 font-medium">Laddar CV-mallar…</p>
          </div>
        </div>
      }
    >
      <CVMallarContent />
    </Suspense>
  );
}
