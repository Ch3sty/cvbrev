'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, MessageSquare, Layout, SlidersHorizontal, Brain, Eye, Info } from 'lucide-react';

// Store & Hooks
import { useCVStore } from '@/store/cv-store';
import { useLetters } from '@/hooks/use-letters';
import { useProfile } from '@/hooks/use-profile';
import { useCvQuota } from '@/hooks/useCvQuota';
import { useCoverLetterStore } from '@/store/cover-letter-store';
import { useNotification } from '@/context/notificationcontext';

// Wizard Components
import WizardContainer, { WizardStep } from './components/WizardContainer';
import CVSelectionStep from './components/steps/CVSelectionStep';
import JobDescriptionStep from './components/steps/JobDescriptionStep';
import TemplateStep from './components/steps/TemplateStep';
import TonalityLanguageStep from './components/steps/TonalityLanguageStep';
import GenerationStep from './components/steps/GenerationStep';
import PreviewStep from './components/steps/PreviewStep';
import { type FontId } from './components/FontSelector';

// Types
type Tonality = 'professional' | 'enthusiastic' | 'creative' | 'confident' | 'balanced' | 'auto';
type Language = 'sv' | 'en';

function CreateLetterLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-600">Förbereder brev-wizarden...</p>
      </div>
    </div>
  );
}

export default function CreateLetterPage() {
  // Vanta pa zustand-rehydration innan vi fortsatter. prefillData laddas
  // fran sessionStorage asynkront pa klienten, sa om vi mountar wizarden
  // for tidigt fastnar useState pa initial 0 (fel steg). Sa har sakerstaller
  // vi att initial state laser korrekt prefillData.
  const [hydrated, setHydrated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return useCoverLetterStore.persist.hasHydrated();
  });

  useEffect(() => {
    if (useCoverLetterStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useCoverLetterStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return unsub;
  }, []);

  if (!hydrated) {
    return <CreateLetterLoading />;
  }

  return <CreateLetterPageInner />;
}

function CreateLetterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchCVs } = useCVStore();
  const { createLetter, saveLetter, isGenerating, refreshLetters } = useLetters();
  const { profile, subscriptionTier, remainingWeeklyLetters, updateRemainingLetters } = useProfile();
  const { cvCount, loading: cvQuotaLoading } = useCvQuota();
  const { prefillData, clearPrefillData } = useCoverLetterStore();
  const { successWithMascotAndActivity } = useNotification();

  // Hård gating: utan CV → tillbaka till CV-uppladdning
  useEffect(() => {
    if (!cvQuotaLoading && cvCount === 0) {
      router.push('/dashboard/profil/cv?reason=cv-required');
    }
  }, [cvCount, cvQuotaLoading, router]);

  // Calculate initial wizard step and completed steps based on prefill data
  const getInitialWizardState = () => {
    if (!prefillData) {
      return { initialStep: 0, initialCompletedSteps: [], initialCV: null, initialDescription: '' };
    }

    const initialCV = prefillData.cvId || null;
    const initialDescription = prefillData.jobDescription || '';

    // Both CV and job description are prefilled - start at step 3 (Template selection)
    if (prefillData.cvId && prefillData.jobDescription) {
      return {
        initialStep: 2, // Step 3 (0-indexed) - Template selection
        initialCompletedSteps: [0, 1], // Mark steps 1 & 2 as completed
        initialCV,
        initialDescription
      };
    }

    // Only CV is prefilled - start at step 2 (Job Description)
    if (prefillData.cvId) {
      return {
        initialStep: 1, // Step 2 (0-indexed)
        initialCompletedSteps: [0], // Mark step 1 as completed
        initialCV,
        initialDescription
      };
    }

    // No prefill or only description (unlikely) - start at step 1
    return { initialStep: 0, initialCompletedSteps: [], initialCV, initialDescription };
  };

  const { initialStep, initialCompletedSteps, initialCV, initialDescription } = getInitialWizardState();

  // Form State
  const [selectedCV, setSelectedCV] = useState<string | null>(initialCV);
  const [jobDescription, setJobDescription] = useState(initialDescription);
  const [tonality, setTonality] = useState<Tonality>('balanced');
  const [language, setLanguage] = useState<Language>('sv');
  const [templateId, setTemplateId] = useState<string>('classic');
  const [selectedFont, setSelectedFont] = useState<FontId>('arial');
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [letterData, setLetterData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [currentWizardStep, setCurrentWizardStep] = useState(initialStep);
  const [hasTriggeredGeneration, setHasTriggeredGeneration] = useState(false);
  const [hasDownloadedOrSaved, setHasDownloadedOrSaved] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [isRegeneratingTemplate, setIsRegeneratingTemplate] = useState(false);

  const isPremium = subscriptionTier === 'premium';

  // Set default tonality to 'auto' for premium users
  useEffect(() => {
    if (isPremium && tonality === 'balanced') {
      setTonality('auto');
    }
  }, [isPremium]);

  // Template change handler - regenerates letter when template changes in preview
  const handleTemplateChange = useCallback(async (newTemplateId: string) => {
    setTemplateId(newTemplateId);

    // If we're in the preview step (step 5, 0-indexed) and have a generated letter,
    // regenerate it with the new template
    if (currentWizardStep === 5 && generatedLetter && selectedCV && jobDescription) {
      console.log('Template changed in preview - regenerating letter with new template:', newTemplateId);
      setIsRegeneratingTemplate(true);

      try {
        const result = await createLetter({
          cv_id: selectedCV,
          job_description: jobDescription,
          tonality,
          language,
          template_id: newTemplateId,
          save: false
        });

        if (result) {
          const letterContent = typeof result === 'string'
            ? result
            : (result.content || '');

          if (letterContent && typeof letterContent === 'string' && letterContent.trim() !== '') {
            console.log('✅ Letter regenerated with new template');
            setGeneratedLetter(letterContent);
            setLetterData(result);
          }
        }
      } catch (error) {
        console.error('Failed to regenerate letter with new template:', error);
        // Don't show error to user - just keep the old letter
      } finally {
        setIsRegeneratingTemplate(false);
      }
    }
  }, [currentWizardStep, generatedLetter, selectedCV, jobDescription, tonality, language, createLetter]);

  // Escape-hantering för modal
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

  // Clear prefill data efter att initial state har konsumerats av useState.
  // Vi kor det i en effekt med tomt dep-array sa det bara sker en gang efter
  // att komponenten mountats (initialCV och initialDescription redan kopierade
  // till lokala state-falt). Detta forhindrar race condition dar prefillData
  // rensas innan useState-initial-varden hinner anvandas.
  useEffect(() => {
    if (prefillData) {
      clearPrefillData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchCVs();
  }, [fetchCVs]);


  // CV upload removed - users should upload via /dashboard/profil/cv

  const handleGenerateLetter = useCallback(async () => {
    console.log('handleGenerateLetter called', { selectedCV, jobDescription, tonality, language });

    if (!selectedCV || !jobDescription) {
      console.error('Missing required data:', { selectedCV, jobDescription });
      setError('CV eller jobbbeskrivning saknas');
      return;
    }

    setError(null);

    try {
      console.log('Calling createLetter with:', {
        cv_id: selectedCV,
        job_description: jobDescription,
        tonality,
        language
      });

      const result = await createLetter({
        cv_id: selectedCV,
        job_description: jobDescription,
        tonality,
        language,
        template_id: templateId,
        save: false // Generate preview first, save later in preview step
      });

      console.log('Letter generation result:', result);

      if (result) {
        // Flexible content handling - supports both { content: string } and direct string response
        const letterContent = typeof result === 'string'
          ? result
          : (result.content || '');

        // Stricter validation with logging to prevent React error #300
        if (!letterContent ||
            typeof letterContent !== 'string' ||
            letterContent.trim() === '') {
          console.error('❌ Invalid letter content:', {
            type: typeof letterContent,
            value: letterContent,
            result: result
          });
          setError('Brevinnehållet kunde inte laddas korrekt');
          return;
        }

        console.log('✅ Valid letter content, length:', letterContent.length);
        setGeneratedLetter(letterContent);
        setLetterData(result);

        // Update remaining letters
        if (remainingWeeklyLetters !== null && result.remainingLetters !== undefined) {
          updateRemainingLetters(result.remainingLetters);
        }
      } else {
        setError('Kunde inte generera brevet');
      }
    } catch (error) {
      console.error('Letter generation error:', error);
      setError('Ett fel uppstod vid genereringen');
    }
  }, [selectedCV, jobDescription, tonality, language, createLetter, remainingWeeklyLetters, updateRemainingLetters]);

  // Generate letter when reaching the generation step
  useEffect(() => {
    // Step 4 is the generation step (0-indexed)
    if (currentWizardStep === 4 && !generatedLetter && !isGenerating && !hasTriggeredGeneration) {
      console.log('Triggering letter generation...');
      setHasTriggeredGeneration(true);
      handleGenerateLetter();
    }
  }, [currentWizardStep, generatedLetter, isGenerating, hasTriggeredGeneration, handleGenerateLetter]);

  // Auto-advance to preview as soon as letter is ready
  useEffect(() => {
    if (currentWizardStep === 4 &&
        generatedLetter &&
        typeof generatedLetter === 'string' &&
        generatedLetter.trim().length > 0 &&
        !isGenerating) {
      console.log('✅ Auto-advancing to preview');
      setCurrentWizardStep(5);

      // Show mascot notification
      successWithMascotAndActivity(
        'Ditt brev är klart! Granska och spara när du är redo.',
        '/images/maskot/success-letter-generated.svg',
        'letter_created',
        'genererade ett personligt brev',
        {
          tonality,
          language,
          job_description_length: jobDescription.length
        },
        6000
      );
    }
  }, [currentWizardStep, generatedLetter, isGenerating, successWithMascotAndActivity, tonality, language, jobDescription]);

  const handleEditLetter = (content: string) => {
    setGeneratedLetter(content);
    if (letterData) {
      setLetterData({ ...letterData, content });
    }
  };

  const handleSaveLetter = async () => {
    if (!generatedLetter || !selectedCV) return;

    try {
      setSaveError(null); // Clear any previous errors

      // Use all data from letterData to preserve title, company, and job_title
      const dataToSave = letterData ? {
        ...letterData,
        content: generatedLetter, // Ensure we use the current edited content
        cv_id: selectedCV,
        job_description: jobDescription,
        tonality,
        language
      } : {
        content: generatedLetter,
        cv_id: selectedCV,
        job_description: jobDescription,
        tonality,
        language
      };

      const savedLetter = await saveLetter(dataToSave);

      if (savedLetter) {
        setHasDownloadedOrSaved(true);

        // Wait for data to refresh in store before navigation
        // This ensures the saved letter appears immediately on mina-brev page
        await refreshLetters();

        // Small delay to ensure state is fully updated
        await new Promise(resolve => setTimeout(resolve, 200));

        // Navigate to my letters after successful save
        router.push('/dashboard/mina-brev');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMessage = error?.message || 'Kunde inte spara brevet. Försök igen.';
      setSaveError(errorMessage);
    }
  };

  const handleDownloadLetter = async (format: 'pdf' | 'docx' = 'pdf') => {
    if (!generatedLetter) return;

    try {
      // Extract only primitive values BEFORE JSON.stringify to avoid cyclic object errors
      // Create a clean object with no references to letterData
      const safeMetadata = {
        title: (letterData && typeof letterData === 'object' && letterData.title) ? String(letterData.title) : 'Ansökningsbrev',
        company: (letterData && typeof letterData === 'object' && letterData.company) ? String(letterData.company) : '',
        position: (letterData && typeof letterData === 'object' && letterData.job_title) ? String(letterData.job_title) : ''
      };

      // Send only primitive values directly in body - no nested objects
      // This avoids cyclic object errors that occur when NextJS tries to serialize nested objects
      const response = await fetch('/api/letters/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: generatedLetter,
          format,
          // Flat primitive values only - no metadata object
          title: safeMetadata.title,
          company: safeMetadata.company,
          position: safeMetadata.position,
          template: templateId,  // Använd vald template för både PDF och DOCX
          font: selectedFont  // Använd vald font
        })
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
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleWizardComplete = () => {
    // Check if user has saved or downloaded the letter
    if (!hasDownloadedOrSaved && currentWizardStep === 5 && generatedLetter) {
      setShowExitWarning(true);
      return;
    }
    router.push('/dashboard/mina-brev');
  };

  // Define wizard steps (6 steps total)
  const wizardSteps: WizardStep[] = [
    {
      id: 1,
      title: 'Välj ditt CV',
      description: 'Välj från dina sparade CV:n',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      component: (
        <CVSelectionStep
          selectedCV={selectedCV}
          onCVSelect={setSelectedCV}
        />
      ),
      canNavigateNext: () => selectedCV !== null
    },
    {
      id: 2,
      title: 'Beskriv positionen',
      description: 'Klistra in jobbannonsen eller beskriv rollen',
      icon: MessageSquare,
      color: 'from-purple-500 to-pink-500',
      component: (
        <JobDescriptionStep
          jobDescription={jobDescription}
          onJobDescriptionChange={setJobDescription}
        />
      ),
      canNavigateNext: () => jobDescription.length > 20
    },
    {
      id: 3,
      title: 'Välj brevmall',
      description: 'Alla mallar är ATS-optimerade',
      icon: Layout,
      color: 'from-green-500 to-emerald-500',
      component: (
        <TemplateStep
          templateId={templateId}
          onTemplateChange={handleTemplateChange}
          isPremium={isPremium}
        />
      ),
      canNavigateNext: () => true
    },
    {
      id: 4,
      title: 'Ton & språk',
      description: 'Välj hur brevet ska låta',
      icon: SlidersHorizontal,
      color: 'from-amber-500 to-orange-500',
      component: (
        <TonalityLanguageStep
          tonality={tonality}
          language={language}
          onTonalityChange={setTonality}
          onLanguageChange={setLanguage}
          isPremium={isPremium}
        />
      ),
      canNavigateNext: () => true
    },
    {
      id: 5,
      title: 'Vi skapar ditt brev',
      description: 'Vänta medan vi analyserar och genererar',
      icon: Brain,
      color: 'from-pink-500 to-rose-500',
      component: (
        <GenerationStep
          isGenerating={isGenerating}
          generatedLetter={generatedLetter}
          error={error}
        />
      ),
      canNavigateNext: () => generatedLetter !== null
    },
    {
      id: 6,
      title: 'Granska & ladda ner',
      description: 'Förhandsgranska, redigera och exportera',
      icon: Eye,
      color: 'from-indigo-500 to-blue-500',
      component: (
        <>
          {generatedLetter ? (
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
            />
          ) : (
            <div className="text-center py-12 text-gray-600">
              Inget brev att visa ännu
            </div>
          )}
        </>
      )
    }
  ];

  return (
    <>
      <WizardContainer
        key={`wizard-${initialStep}`}
        steps={wizardSteps}
        onComplete={handleWizardComplete}
        onStepChange={setCurrentWizardStep}
        initialStep={initialStep}
        initialCompletedSteps={initialCompletedSteps}
      />

      {/* Exit Warning Modal */}
      {showExitWarning && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowExitWarning(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 id="modal-title" className="text-lg font-semibold text-gray-900 mb-2">
                  Vill du spara eller ladda ner först?
                </h3>
                <p className="text-sm text-gray-600">
                  Ditt personliga brev är färdigt! Om du går vidare utan att spara eller ladda ner kan du inte komma åt det senare.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  setShowExitWarning(false);
                  router.push('/dashboard/mina-brev');
                }}
                className="flex-1 px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg font-medium transition-colors min-h-[44px]"
              >
                Nej, avsluta ändå
              </button>
              <button
                onClick={() => setShowExitWarning(false)}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors min-h-[44px]"
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