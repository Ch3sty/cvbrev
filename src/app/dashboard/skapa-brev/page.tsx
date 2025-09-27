'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, MessageSquare, SlidersHorizontal, Brain, Eye } from 'lucide-react';

// Store & Hooks
import { useCVStore } from '@/store/cv-store';
import { useLetters } from '@/hooks/use-letters';
import { useProfile } from '@/hooks/use-profile';

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
  const { fetchCVs } = useCVStore();
  const { createLetter, saveLetter, isGenerating } = useLetters();
  const { profile, subscriptionTier, remainingWeeklyLetters, updateRemainingLetters } = useProfile();

  // Form State
  const [selectedCV, setSelectedCV] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [tonality, setTonality] = useState<Tonality>('balanced');
  const [language, setLanguage] = useState<Language>('sv');
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [letterData, setLetterData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentWizardStep, setCurrentWizardStep] = useState(0);
  const [shouldGenerate, setShouldGenerate] = useState(false);

  const isPremium = subscriptionTier === 'premium';

  useEffect(() => {
    fetchCVs();
  }, [fetchCVs]);

  // Generate letter when reaching the generation step
  useEffect(() => {
    if (currentWizardStep === 3 && !generatedLetter && !isGenerating && shouldGenerate) {
      handleGenerateLetter();
    }
  }, [currentWizardStep, shouldGenerate]);

  const handleCVUpload = async (file: File) => {
    // Implementation for CV upload
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/cv/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setSelectedCV(data.cvId);
    } catch (error) {
      console.error('CV upload error:', error);
      throw error;
    }
  };

  const handleGenerateLetter = async () => {
    if (!selectedCV || !jobDescription) return;

    setError(null);

    try {
      const result = await createLetter({
        cv_id: selectedCV,
        job_description: jobDescription,
        tonality,
        language,
        save: false // Generate preview first, save later in preview step
      });

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
  };

  const handleEditLetter = (content: string) => {
    setGeneratedLetter(content);
    if (letterData) {
      setLetterData({ ...letterData, content });
    }
  };

  const handleDownloadLetter = async () => {
    if (!generatedLetter || !letterData) return;

    try {
      // Save letter first
      await saveLetter({
        ...letterData,
        content: generatedLetter,
        cv_id: selectedCV!,
        job_description: jobDescription,
        tonality,
        language
      });

      // Then download as PDF
      const response = await fetch('/api/letters/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: generatedLetter })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'personligt-brev.pdf';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleWizardComplete = () => {
    router.push('/dashboard/mina-brev');
  };

  // Define wizard steps
  const wizardSteps: WizardStep[] = [
    {
      id: 1,
      title: 'Välj ditt CV',
      description: 'Ladda upp eller välj från dina sparade CV:n',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      component: (
        <CVSelectionStep
          selectedCV={selectedCV}
          onCVSelect={setSelectedCV}
          onCVUpload={handleCVUpload}
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
      canNavigateNext: () => {
        setShouldGenerate(true);
        return true;
      }
    },
    {
      id: 4,
      title: 'AI skapar ditt brev',
      description: 'Vänta medan AI analyserar och genererar',
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
        />
      ) : (
        <div className="text-center py-12 text-gray-600">
          Inget brev att visa ännu
        </div>
      )
    }
  ];

  // Track current step for generation trigger
  const handleStepChange = (step: number) => {
    setCurrentWizardStep(step);
  };

  return (
    <WizardContainer
      steps={wizardSteps.map((step, index) => ({
        ...step,
        component: (
          <div onFocus={() => handleStepChange(index)}>
            {step.component}
          </div>
        )
      }))}
      onComplete={handleWizardComplete}
    />
  );
}