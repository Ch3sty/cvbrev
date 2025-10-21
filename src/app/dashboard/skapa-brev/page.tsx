'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, MessageSquare, SlidersHorizontal, Brain, Eye } from 'lucide-react';

// Store & Hooks
import { useCVStore } from '@/store/cv-store';
import { useLetters } from '@/hooks/use-letters';
import { useProfile } from '@/hooks/use-profile';
import { useCoverLetterStore } from '@/store/cover-letter-store';

// Wizard Components
import WizardContainer, { WizardStep } from './components/WizardContainer';
import CVSelectionStep from './components/steps/CVSelectionStep';
import JobDescriptionStep from './components/steps/JobDescriptionStep';
import SettingsStep from './components/steps/SettingsStep';
import GenerationStep from './components/steps/GenerationStep';
import PreviewStep from './components/steps/PreviewStep';

// Types
type Tonality = 'professional' | 'enthusiastic' | 'creative' | 'confident' | 'balanced' | 'auto';
type Language = 'sv' | 'en';

export default function CreateLetterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchCVs } = useCVStore();
  const { createLetter, saveLetter, isGenerating } = useLetters();
  const { profile, subscriptionTier, remainingWeeklyLetters, updateRemainingLetters } = useProfile();
  const { prefillData, clearPrefillData } = useCoverLetterStore();

  // Calculate initial wizard step and completed steps based on prefill data
  const getInitialWizardState = () => {
    if (!prefillData) {
      return { initialStep: 0, initialCompletedSteps: [], initialCV: null, initialDescription: '' };
    }

    const initialCV = prefillData.cvId || null;
    const initialDescription = prefillData.jobDescription || '';

    // Both CV and job description are prefilled - start at step 3 (Settings)
    if (prefillData.cvId && prefillData.jobDescription) {
      return {
        initialStep: 2, // Step 3 (0-indexed)
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
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [letterData, setLetterData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentWizardStep, setCurrentWizardStep] = useState(initialStep);
  const [hasTriggeredGeneration, setHasTriggeredGeneration] = useState(false);

  const isPremium = subscriptionTier === 'premium';

  // Clear prefill data after initial mount
  useEffect(() => {
    if (prefillData) {
      clearPrefillData();
    }
  }, []); // Only run once on mount

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
        save: false // Generate preview first, save later in preview step
      });

      console.log('Letter generation result:', result);

      if (result) {
        setGeneratedLetter(result.content || result);
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
    // Step 3 is the generation step (0-indexed)
    if (currentWizardStep === 3 && !generatedLetter && !isGenerating && !hasTriggeredGeneration) {
      console.log('Triggering letter generation...');
      setHasTriggeredGeneration(true);
      handleGenerateLetter();
    }
  }, [currentWizardStep, generatedLetter, isGenerating, hasTriggeredGeneration, handleGenerateLetter]);

  const handleEditLetter = (content: string) => {
    setGeneratedLetter(content);
    if (letterData) {
      setLetterData({ ...letterData, content });
    }
  };

  const handleSaveLetter = async () => {
    if (!generatedLetter || !selectedCV) return;

    try {
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
        // Navigate to my letters after successful save
        router.push('/dashboard/mina-brev');
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleDownloadLetter = async (format: 'pdf' | 'docx' = 'pdf') => {
    if (!generatedLetter) return;

    try {
      const response = await fetch('/api/letters/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: generatedLetter,
          format,
          metadata: {
            name: profile?.full_name || 'Användare',
            email: profile?.email || '',
            phone: profile?.phone || '',
            date: new Date().toISOString()
          }
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
      } else {
        console.error('Download failed:', await response.text());
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleWizardComplete = () => {
    router.push('/dashboard/my-letters');
  };

  // Define wizard steps
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
      title: 'Anpassa inställningar',
      description: 'Välj tonalitet, språk och personliga preferenser',
      icon: SlidersHorizontal,
      color: 'from-green-500 to-emerald-500',
      component: (
        <SettingsStep
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
      id: 4,
      title: 'Vi skapar ditt brev',
      description: 'Vänta medan vi analyserar och genererar',
      icon: Brain,
      color: 'from-orange-500 to-red-500',
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
      id: 5,
      title: 'Granska & ladda ner',
      description: 'Förhandsgranska, redigera och exportera',
      icon: Eye,
      color: 'from-indigo-500 to-blue-500',
      component: generatedLetter ? (
        <PreviewStep
          letterContent={generatedLetter}
          onEdit={handleEditLetter}
          onDownload={handleDownloadLetter}
          onSave={handleSaveLetter}
        />
      ) : (
        <div className="text-center py-12 text-gray-600">
          Inget brev att visa ännu
        </div>
      )
    }
  ];

  return (
    <WizardContainer
      steps={wizardSteps}
      onComplete={handleWizardComplete}
      onStepChange={setCurrentWizardStep}
      initialStep={initialStep}
      initialCompletedSteps={initialCompletedSteps}
    />
  );
}