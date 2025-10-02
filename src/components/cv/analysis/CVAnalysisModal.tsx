// src/components/cv/analysis/CVAnalysisModal.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnalysisProgressBar from './AnalysisProgressBar';
import AnalysisProgressStep from './steps/AnalysisProgressStep';
import AnalysisOverviewStep from './steps/AnalysisOverviewStep';
import SelectImprovementsStep from './steps/SelectImprovementsStep';
import PreviewComparisonStep from './steps/PreviewComparisonStep';
import SaveAndTemplateStep from './steps/SaveAndTemplateStep';
import CompletionStep from './steps/CompletionStep';
import { applyImprovements } from '@/lib/cv/cvDiffUtils';

interface CVAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvId: string;
  cvContent: string;
  onAnalysisStart: () => Promise<string>; // Returns jobId
  onPollJob: (jobId: string) => Promise<any>; // Returns analysis result
  onComplete?: (result: any) => void; // Optional callback when analysis completes
}

const STEPS = [
  { id: 0, title: 'Analys' },
  { id: 1, title: 'Översikt' },
  { id: 2, title: 'Välj' },
  { id: 3, title: 'Förhandsgranskning' },
  { id: 4, title: 'Spara' },
  { id: 5, title: 'Klar' }
];

export default function CVAnalysisModal({
  isOpen,
  onClose,
  cvId,
  cvContent,
  onAnalysisStart,
  onPollJob,
  onComplete
}: CVAnalysisModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(50);

  // Selection state
  const [selectedProfile, setSelectedProfile] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<Set<number>>(new Set());
  const [selectedSkills, setSelectedSkills] = useState<Set<number>>(new Set());
  const [selectedGeneral, setSelectedGeneral] = useState<Set<number>>(new Set());
  const [editedRoleTexts, setEditedRoleTexts] = useState<Map<number, string>>(new Map());

  // Preview state
  const [improvedCV, setImprovedCV] = useState('');

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [savedCvId, setSavedCvId] = useState<string | undefined>();
  const [savedFileName, setSavedFileName] = useState('');

  // Start analysis when modal opens
  useEffect(() => {
    if (isOpen && currentStep === 0 && !isAnalyzing && !analysisResult) {
      startAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset after animation
      setTimeout(() => {
        setCurrentStep(0);
        setCompletedSteps([]);
        setAnalysisResult(null);
        setProgress(0);
        setSelectedProfile(false);
        setSelectedRoles(new Set());
        setSelectedSkills(new Set());
        setSelectedGeneral(new Set());
        setImprovedCV('');
        setSavedCvId(undefined);
        setSavedFileName('');
      }, 300);
    }
  }, [isOpen]);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setEstimatedTimeRemaining(50);

    // Start progress simulation BEFORE async operations
    const startTime = Date.now();
    const ESTIMATED_DURATION = 50000; // 50 seconds

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min(95, Math.floor((elapsed / ESTIMATED_DURATION) * 100));
      const timeRemaining = Math.max(0, Math.ceil((ESTIMATED_DURATION - elapsed) / 1000));

      setProgress(progressPercent);
      setEstimatedTimeRemaining(timeRemaining);
    }, 1000); // 1 second intervals for smoother visible updates

    try {
      const jobId = await onAnalysisStart();

      // Poll for result
      const result = await onPollJob(jobId);

      // Clear progress interval
      clearInterval(progressInterval);

      setAnalysisResult(result);
      setProgress(100);
      setEstimatedTimeRemaining(0);

      // Auto-advance to overview after short delay
      setTimeout(() => {
        handleNext();
      }, 1500);
    } catch (error) {
      console.error('Analysis error:', error);
      clearInterval(progressInterval);
      alert('Ett fel uppstod vid analysen. Försök igen.');
      onClose();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 2) {
      // Before going to preview, generate improved CV
      generateImprovedCV();
    }

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) { // Can't go back from analysis
      setCurrentStep(currentStep - 1);
    }
  };

  const generateImprovedCV = () => {
    if (!analysisResult) return;

    const improvements: any[] = [];

    // Add profile summary if selected
    if (selectedProfile && analysisResult.profileSummary) {
      improvements.push({
        currentText: analysisResult.profileSummary.currentText,
        suggestedText: analysisResult.profileSummary.improvedText
      });
    }

    // Add selected role improvements
    if (analysisResult.roleBasedImprovements) {
      Array.from(selectedRoles).forEach(index => {
        const role = analysisResult.roleBasedImprovements[index];
        improvements.push({
          currentText: role.currentText,
          suggestedText: editedRoleTexts.get(index) || role.suggestedText
        });
      });
    }

    // Apply improvements to CV text
    const improved = applyImprovements(cvContent, improvements);
    setImprovedCV(improved);
  };

  const handleSaveAndDownload = async (
    templateId: string,
    fileName: string,
    saveToLibrary: boolean
  ) => {
    setIsSaving(true);
    setSavedFileName(fileName);

    try {
      if (saveToLibrary) {
        // Save to database
        const response = await fetch('/api/cv/save-improved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName,
            improvedText: improvedCV,
            originalCvId: cvId
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Kunde inte spara CV');
        }

        const { cvId: newCvId } = await response.json();
        setSavedCvId(newCvId);
      }

      // Generate PDF with template and download
      const pdfFileName = `${fileName.replace(/\.[^/.]+$/, '')}.pdf`;

      const pdfResponse = await fetch('/api/cv/generate-formatted', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template: templateId,
          cvText: improvedCV,
          format: 'pdf',
          templateOptions: {}
        })
      });

      if (!pdfResponse.ok) {
        const errorData = await pdfResponse.json();
        throw new Error(errorData.error || 'Kunde inte generera PDF');
      }

      // Download PDF
      const blob = await pdfResponse.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Move to completion step
      handleNext();
    } catch (error: any) {
      console.error('Save error:', error);
      alert(error.message || 'Ett fel uppstod när CV:t skulle sparas');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyzeAnother = () => {
    // Call onComplete with analysis result if available
    if (onComplete && analysisResult) {
      onComplete(analysisResult);
    }
    onClose();
  };

  const canNavigateNext = () => {
    if (currentStep === 0) return false; // Analyzing
    if (currentStep === 2) {
      // Must select at least one improvement
      const totalSelected =
        (selectedProfile ? 1 : 0) +
        selectedRoles.size +
        selectedSkills.size +
        selectedGeneral.size;
      return totalSelected > 0;
    }
    return true;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <AnalysisProgressStep
            progress={progress}
            currentActivity="Analyserar..."
            estimatedTimeRemaining={estimatedTimeRemaining}
          />
        );

      case 1:
        if (!analysisResult) return null;

        // Calculate ATS scores
        const currentAtsScore = analysisResult.atsFriendliness?.score || 0;
        const totalImprovements =
          (analysisResult.profileSummary ? 1 : 0) +
          (analysisResult.roleBasedImprovements?.length || 0) +
          (analysisResult.skillSuggestions?.length || 0) +
          (analysisResult.generalImprovements?.length || 0);
        const potentialAtsScore = Math.min(100, currentAtsScore + (totalImprovements * 2));

        return (
          <AnalysisOverviewStep
            totalImprovements={totalImprovements}
            roleBasedCount={analysisResult.roleBasedImprovements?.length || 0}
            skillsCount={analysisResult.skillSuggestions?.length || 0}
            generalCount={analysisResult.generalImprovements?.length || 0}
            profileImproved={!!analysisResult.profileSummary}
            atsScore={currentAtsScore}
            potentialScore={potentialAtsScore}
          />
        );

      case 2:
        if (!analysisResult) return null;

        // SelectImprovementsStep handles ALL data validation internally via useSafeData hook
        // No need to pre-process data here - pass raw data directly
        return (
          <SelectImprovementsStep
            profileSummary={analysisResult.profileSummary}
            roleBasedImprovements={analysisResult.roleBasedImprovements}
            skillSuggestions={analysisResult.skillSuggestions}
            generalImprovements={analysisResult.generalImprovements}
            selectedProfile={selectedProfile}
            selectedRoles={selectedRoles}
            selectedSkills={selectedSkills}
            selectedGeneral={selectedGeneral}
            onToggleProfile={() => setSelectedProfile(!selectedProfile)}
            onToggleRole={(index) => {
              const newSet = new Set(selectedRoles);
              if (newSet.has(index)) {
                newSet.delete(index);
              } else {
                newSet.add(index);
              }
              setSelectedRoles(newSet);
            }}
            onToggleSkill={(index) => {
              const newSet = new Set(selectedSkills);
              if (newSet.has(index)) {
                newSet.delete(index);
              } else {
                newSet.add(index);
              }
              setSelectedSkills(newSet);
            }}
            onToggleGeneral={(index) => {
              const newSet = new Set(selectedGeneral);
              if (newSet.has(index)) {
                newSet.delete(index);
              } else {
                newSet.add(index);
              }
              setSelectedGeneral(newSet);
            }}
            onRoleTextEdit={(index, newText) => {
              const newMap = new Map(editedRoleTexts);
              newMap.set(index, newText);
              setEditedRoleTexts(newMap);
            }}
          />
        );

      case 3:
        const selectedImprovementsCount =
          (selectedProfile ? 1 : 0) +
          selectedRoles.size +
          selectedSkills.size +
          selectedGeneral.size;

        return (
          <PreviewComparisonStep
            originalCV={cvContent}
            improvedCV={improvedCV}
            improvementsCount={selectedImprovementsCount}
            atsImprovement={selectedImprovementsCount * 2}
          />
        );

      case 4:
        return (
          <SaveAndTemplateStep
            improvedCV={improvedCV}
            onSaveAndDownload={handleSaveAndDownload}
            isSaving={isSaving}
          />
        );

      case 5:
        return (
          <CompletionStep
            savedCvId={savedCvId}
            fileName={savedFileName}
            onAnalyzeAnother={handleAnalyzeAnother}
          />
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:ml-64">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={currentStep > 0 ? onClose : undefined}
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                CV-Analys & Förbättring
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Vi hjälper dig optimera ditt CV
              </p>
            </div>

            {currentStep > 0 && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="px-8 pt-8">
            <AnalysisProgressBar
              steps={STEPS}
              currentStep={currentStep}
              completedSteps={completedSteps}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          {currentStep > 0 && currentStep < STEPS.length - 1 && (
            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep <= 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Tillbaka
                </Button>

                <div className="text-sm text-gray-600">
                  Steg {currentStep + 1} av {STEPS.length}
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!canNavigateNext() || isSaving}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white flex items-center gap-2"
                >
                  Nästa
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
