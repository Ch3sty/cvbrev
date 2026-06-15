'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Info } from 'lucide-react';

import { useCVStore } from '@/store/cv-store';
import { useLetters } from '@/hooks/use-letters';
import { useProfile } from '@/hooks/use-profile';
import WeeklyLimitReached from '@/components/subscription/WeeklyLimitReached';
import { coverLetterPrefill, type CoverLetterPrefillData } from '@/store/cover-letter-store';
import { useNotification } from '@/context/notificationcontext';

import LetterFlowLayout from './components/LetterFlowLayout';
import LetterFlowHero from './components/LetterFlowHero';
import LetterFlowProgress, { type FlowSection } from './components/LetterFlowProgress';
import LetterFlowSummary from './components/LetterFlowSummary';
import PrefillBadgeCard from './components/PrefillBadgeCard';
import CVSelectionStep from './components/steps/CVSelectionStep';
import JobDescriptionStep from './components/steps/JobDescriptionStep';
import TemplateStep from './components/steps/TemplateStep';
import TonalityLanguageStep from './components/steps/TonalityLanguageStep';
import PreviewStep from './components/steps/PreviewStep';
import LetterPipelineLoader from './components/illustrations/LetterPipelineLoader';
import { type FontId } from './components/FontSelector';
import OnboardingNextStep from '@/components/dashboard/OnboardingNextStep';

type Tonality = 'professional' | 'enthusiastic' | 'creative' | 'confident' | 'balanced' | 'auto';
type Language = 'sv' | 'en';

export default function CreateLetterPage() {
  const router = useRouter();
  // CV-listan hämtas en gång via cv-store. cvCount/loading härleds härifrån i
  // stället för ett separat useCvQuota-anrop (som dubblerade samma DB-queries).
  const { fetchCVs, cvs, isLoading: cvLoading } = useCVStore();
  const { createLetter, saveLetter, isGenerating, refreshLetters } = useLetters();
  const { subscriptionTier, remainingWeeklyLetters, updateRemainingLetters } = useProfile();
  const { successWithMascotAndActivity } = useNotification();

  // Har vi hämtat CV-listan minst en gång? (skiljer "laddar" från "tom lista").
  // State, inte ref, så gating-effekten kör om när första fetch är klar.
  const [hasFetchedCvs, setHasFetchedCvs] = useState(false);
  const cvCount = cvs.length;
  // Betrakta som laddande tills första fetch är klar, så gating nedan inte
  // triggar en felaktig redirect innan datan finns.
  const cvQuotaLoading = cvLoading || !hasFetchedCvs;

  // Synkron prefill-läsning – module-level cache klarar dubbel-mount.
  const [prefillData] = useState<CoverLetterPrefillData | null>(() =>
    coverLetterPrefill.consume()
  );

  // Hård gating: utan CV → tillbaka till CV-uppladdning
  useEffect(() => {
    if (!cvQuotaLoading && cvCount === 0) {
      router.push('/dashboard/profil/cv?reason=cv-required');
    }
  }, [cvCount, cvQuotaLoading, router]);

  const isPremium = subscriptionTier === 'premium';

  // Form state — bevarat från originalet
  const [selectedCV, setSelectedCV] = useState<string | null>(prefillData?.cvId || null);
  const [jobDescription, setJobDescription] = useState(prefillData?.jobDescription || '');
  const [tonality, setTonality] = useState<Tonality>('balanced');
  const [language, setLanguage] = useState<Language>('sv');
  const [templateId, setTemplateId] = useState<string>('classic');
  const [selectedFont, setSelectedFont] = useState<FontId>('arial');
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [letterData, setLetterData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasDownloadedOrSaved, setHasDownloadedOrSaved] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [isRegeneratingTemplate, setIsRegeneratingTemplate] = useState(false);

  // Flow state — vilka sektioner är klara, vilken är aktiv
  const [activeSection, setActiveSection] = useState<FlowSection>('cv');
  const [showPipeline, setShowPipeline] = useState(false);

  // Section refs för scroll
  const cvRef = useRef<HTMLElement | null>(null);
  const jobRef = useRef<HTMLElement | null>(null);
  const templateRef = useRef<HTMLElement | null>(null);
  const toneRef = useRef<HTMLElement | null>(null);
  const summaryRef = useRef<HTMLElement | null>(null);
  const pipelineRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLElement | null>(null);

  const completedSections: Record<FlowSection, boolean> = {
    cv: !!selectedCV,
    job: jobDescription.length > 20,
    template: !!templateId,
    tone: !!tonality,
    generate: !!generatedLetter,
  };

  // Set default tonality to 'auto' for premium users
  useEffect(() => {
    if (isPremium && tonality === 'balanced') {
      setTonality('auto');
    }
  }, [isPremium]);

  useEffect(() => {
    fetchCVs().finally(() => {
      setHasFetchedCvs(true);
    });
  }, [fetchCVs]);

  // Auto-scroll till rätt sektion vid prefill
  const didInitialScroll = useRef(false);
  useEffect(() => {
    if (didInitialScroll.current || !prefillData) return;
    if (cvCount === 0) return; // vänta tills CV-listan finns

    didInitialScroll.current = true;

    // Vänta in nästa frame så refs är satta
    requestAnimationFrame(() => {
      if (prefillData.cvId && prefillData.jobDescription) {
        templateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveSection('template');
      } else if (prefillData.cvId) {
        jobRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveSection('job');
      }
    });
  }, [prefillData, cvCount]);

  const scrollToSection = useCallback((section: FlowSection) => {
    setActiveSection(section);
    const refMap: Record<FlowSection, React.RefObject<HTMLElement | null>> = {
      cv: cvRef,
      job: jobRef,
      template: templateRef,
      tone: toneRef,
      generate: summaryRef,
    };
    refMap[section].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleGenerateLetter = useCallback(async () => {
    if (!selectedCV || !jobDescription) {
      setError('CV eller jobbeskrivning saknas');
      return;
    }

    setError(null);
    setShowPipeline(true);

    // Scroll till pipeline
    requestAnimationFrame(() => {
      pipelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    try {
      const result = await createLetter({
        cv_id: selectedCV,
        job_description: jobDescription,
        tonality,
        language,
        template_id: templateId,
        save: false,
      });

      if (result) {
        const letterContent = typeof result === 'string' ? result : (result.content || '');
        if (!letterContent || typeof letterContent !== 'string' || letterContent.trim() === '') {
          setError('Brevinnehållet kunde inte laddas korrekt');
          return;
        }
        setGeneratedLetter(letterContent);
        setLetterData(result);
        setActiveSection('generate');

        if (remainingWeeklyLetters !== null && result.remainingLetters !== undefined) {
          updateRemainingLetters(result.remainingLetters);
        }
      } else {
        setError('Kunde inte generera brevet');
      }
    } catch (err) {
      console.error('Letter generation error:', err);
      setError('Ett fel uppstod vid genereringen');
    }
  }, [selectedCV, jobDescription, tonality, language, templateId, createLetter, remainingWeeklyLetters, updateRemainingLetters]);

  // När brevet är klart: scrolla till preview + visa toast
  const didShowToast = useRef(false);
  useEffect(() => {
    if (
      generatedLetter &&
      typeof generatedLetter === 'string' &&
      generatedLetter.trim().length > 0 &&
      !isGenerating &&
      !didShowToast.current
    ) {
      didShowToast.current = true;
      // Vänta in render
      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);

      successWithMascotAndActivity(
        'Ditt brev är skrivet. Granska gärna och spara om du vill behålla det.',
        'letter-created',
        'letter_created',
        'genererade ett personligt brev',
        {
          tonality,
          language,
          job_description_length: jobDescription.length,
        },
        6000
      );
    }
  }, [generatedLetter, isGenerating, successWithMascotAndActivity, tonality, language, jobDescription]);

  // Template change i preview - regenerera
  const handleTemplateChange = useCallback(
    async (newTemplateId: string) => {
      setTemplateId(newTemplateId);

      if (generatedLetter && selectedCV && jobDescription) {
        setIsRegeneratingTemplate(true);
        try {
          const result = await createLetter({
            cv_id: selectedCV,
            job_description: jobDescription,
            tonality,
            language,
            template_id: newTemplateId,
            save: false,
          });

          if (result) {
            const letterContent =
              typeof result === 'string' ? result : (result.content || '');
            if (letterContent && typeof letterContent === 'string' && letterContent.trim() !== '') {
              setGeneratedLetter(letterContent);
              setLetterData(result);
            }
          }
        } catch (err) {
          console.error('Failed to regenerate letter with new template:', err);
        } finally {
          setIsRegeneratingTemplate(false);
        }
      }
    },
    [generatedLetter, selectedCV, jobDescription, tonality, language, createLetter]
  );

  const handleEditLetter = (content: string) => {
    setGeneratedLetter(content);
    if (letterData) {
      setLetterData({ ...letterData, content });
    }
  };

  const handleSaveLetter = async () => {
    if (!generatedLetter || !selectedCV) return;
    try {
      setSaveError(null);
      const dataToSave = letterData
        ? {
            ...letterData,
            content: generatedLetter,
            cv_id: selectedCV,
            job_description: jobDescription,
            tonality,
            language,
          }
        : {
            content: generatedLetter,
            cv_id: selectedCV,
            job_description: jobDescription,
            tonality,
            language,
          };

      const savedLetter = await saveLetter(dataToSave);

      if (savedLetter) {
        setHasDownloadedOrSaved(true);
        await refreshLetters();
        await new Promise((resolve) => setTimeout(resolve, 200));
        router.push('/dashboard/mina-brev');
      }
    } catch (err: any) {
      console.error('Save error:', err);
      const errorMessage = err?.message || 'Kunde inte spara brevet. Försök igen.';
      setSaveError(errorMessage);
    }
  };

  const handleDownloadLetter = async (format: 'pdf' | 'docx' = 'pdf') => {
    if (!generatedLetter) return;
    try {
      const safeMetadata = {
        title:
          letterData && typeof letterData === 'object' && letterData.title
            ? String(letterData.title)
            : 'Ansökningsbrev',
        company:
          letterData && typeof letterData === 'object' && letterData.company
            ? String(letterData.company)
            : '',
        position:
          letterData && typeof letterData === 'object' && letterData.job_title
            ? String(letterData.job_title)
            : '',
      };

      const response = await fetch('/api/letters/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: generatedLetter,
          format,
          title: safeMetadata.title,
          company: safeMetadata.company,
          position: safeMetadata.position,
          template: templateId,
          font: selectedFont,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `personligt-brev.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        setHasDownloadedOrSaved(true);
      } else {
        console.error('Download failed:', await response.text());
      }
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Escape för exit warning modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showExitWarning) {
        setShowExitWarning(false);
      }
    };
    if (showExitWarning) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [showExitWarning]);

  const cvName =
    cvs.find((c) => c.id === selectedCV)?.file_name?.replace(/\.[^.]+$/, '') || null;
  const jobPreview = prefillData?.jobTitle && prefillData?.company
    ? `${prefillData.jobTitle} – ${prefillData.company}`
    : jobDescription.slice(0, 80).trim() + (jobDescription.length > 80 ? '…' : '');

  const canGenerate =
    !!selectedCV && jobDescription.length > 20 && !!templateId && !!tonality;

  // Free-användare som använt sin veckokvot ser tom-state istället för flödet
  const isFreeTier = subscriptionTier === 'free';
  const hasReachedWeeklyLimit =
    isFreeTier &&
    remainingWeeklyLetters !== null &&
    remainingWeeklyLetters !== undefined &&
    remainingWeeklyLetters <= 0;

  if (hasReachedWeeklyLimit) {
    return (
      <WeeklyLimitReached
        title="Veckogräns nådd"
        description="Du har använt alla dina personliga brev denna vecka."
        resetHint="Din kvot återställs automatiskt nästa måndag."
      />
    );
  }

  return (
    <>
      <LetterFlowLayout>
        <LetterFlowProgress
          activeSection={activeSection}
          completedSections={completedSections}
          onSectionClick={scrollToSection}
        />

        <LetterFlowHero />

        {/* Onboarding-prompt: pekar mot nasta steg om brev nyss skapats */}
        <OnboardingNextStep stepCompleted="create_letter" />

        {prefillData && (prefillData.cvId || prefillData.jobDescription) && (
          <PrefillBadgeCard
            company={prefillData.company}
            jobTitle={prefillData.jobTitle}
            hasCv={!!prefillData.cvId}
            hasJobDescription={!!prefillData.jobDescription}
            onJumpToTemplate={() => scrollToSection('template')}
          />
        )}

        <CVSelectionStep
          selectedCV={selectedCV}
          onCVSelect={(id) => {
            setSelectedCV(id);
            if (activeSection === 'cv') {
              setActiveSection('job');
              setTimeout(() => jobRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
            }
          }}
          isActive={activeSection === 'cv'}
          startCollapsed={!!prefillData?.cvId}
          onComplete={() => {
            if (activeSection === 'cv') setActiveSection('job');
          }}
          registerRef={(el) => {
            cvRef.current = el;
          }}
        />

        <JobDescriptionStep
          jobDescription={jobDescription}
          onJobDescriptionChange={setJobDescription}
          isActive={activeSection === 'job'}
          startCollapsed={!!prefillData?.jobDescription}
          onComplete={() => {
            if (activeSection === 'job') setActiveSection('template');
          }}
          registerRef={(el) => {
            jobRef.current = el;
          }}
          prefillCompany={prefillData?.company}
          prefillJobTitle={prefillData?.jobTitle}
        />

        <TemplateStep
          templateId={templateId}
          onTemplateChange={handleTemplateChange}
          isPremium={isPremium}
          isActive={activeSection === 'template'}
          registerRef={(el) => {
            templateRef.current = el;
          }}
        />

        <TonalityLanguageStep
          tonality={tonality}
          language={language}
          onTonalityChange={setTonality}
          onLanguageChange={setLanguage}
          isPremium={isPremium}
          isActive={activeSection === 'tone'}
          registerRef={(el) => {
            toneRef.current = el;
          }}
        />

        <div ref={(el) => { summaryRef.current = el; }}>
          <LetterFlowSummary
            cvName={cvName}
            jobDescriptionPreview={jobPreview}
            templateId={templateId}
            tonality={tonality}
            language={language}
            canGenerate={canGenerate}
            isGenerating={isGenerating}
            onGenerate={handleGenerateLetter}
            remainingWeeklyLetters={remainingWeeklyLetters}
          />
        </div>

        {(showPipeline || generatedLetter) && (
          <div ref={pipelineRef}>
            <LetterPipelineLoader
              isGenerating={isGenerating}
              isDone={!!generatedLetter && !isGenerating}
              error={error}
            />
          </div>
        )}

        {generatedLetter && (
          <PreviewStep
            letterContent={generatedLetter}
            templateId={templateId}
            onEdit={handleEditLetter}
            onDownload={handleDownloadLetter}
            onSave={handleSaveLetter}
            selectedFont={selectedFont}
            onFontChange={setSelectedFont}
            saveError={saveError}
            isPremium={isPremium}
            isRegeneratingTemplate={isRegeneratingTemplate}
            registerRef={(el) => {
              previewRef.current = el;
            }}
          />
        )}
      </LetterFlowLayout>

      {/* Exit Warning Modal */}
      {showExitWarning && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowExitWarning(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 id="modal-title" className="text-lg font-bold text-slate-900 mb-2">
                  Vill du spara eller ladda ner först?
                </h3>
                <p className="text-sm text-slate-600">
                  Brevet är klart. Om du går vidare utan att spara eller ladda ner kan du inte komma åt det senare.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  setShowExitWarning(false);
                  router.push('/dashboard/mina-brev');
                }}
                className="flex-1 px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl font-semibold transition-colors min-h-[44px]"
              >
                Nej, avsluta ändå
              </button>
              <button
                onClick={() => setShowExitWarning(false)}
                className="flex-1 px-4 py-3 text-white rounded-xl font-bold transition-colors min-h-[44px] shadow-lg"
                style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
              >
                Ja, gå tillbaka
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

