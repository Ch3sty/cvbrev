'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Lazy load steps for performance
const CVSelectionStep = lazy(() => import('./steps/CVSelectionStep'));
const AnalysisProgressStep = lazy(() => import('./steps/AnalysisProgressStep'));
const AnalysisOverviewStep = lazy(() => import('./steps/AnalysisOverviewStep'));
const SelectImprovementsStep = lazy(() => import('./steps/SelectImprovementsStep'));
const PreviewComparisonStep = lazy(() => import('./steps/PreviewComparisonStep'));
const SaveAndTemplateStep = lazy(() => import('./steps/SaveAndTemplateStep'));
const CompletionStep = lazy(() => import('./steps/CompletionStep'));

// Import progress bar
import AnalysisProgressBar from './AnalysisProgressBar';

// Types
interface CVAnalysisWizardProps {
  cvs: any[];
  onAnalysisStart: (cvId: string) => Promise<string>;
  onPollJob: (jobId: string) => Promise<any>;
  onComplete?: () => void;
}

const STEPS = [
  { id: 0, title: 'Välj CV' },
  { id: 1, title: 'Analys' },
  { id: 2, title: 'Översikt' },
  { id: 3, title: 'Välj' },
  { id: 4, title: 'Förhandsgranskning' },
  { id: 5, title: 'Välj CV-mall' },
  { id: 6, title: 'Klar' }
];

// Skeleton loader for Suspense fallback
const StepSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-full"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
  </div>
);

export default function CVAnalysisWizard({
  cvs,
  onAnalysisStart,
  onPollJob,
  onComplete
}: CVAnalysisWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // CV Selection state
  const [selectedCV, setSelectedCV] = useState<string | null>(null);

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
  const [editedProfileText, setEditedProfileText] = useState<string | null>(null);

  // Structured CV data state
  const [structuredCV, setStructuredCV] = useState<any>(null);

  // Preview state
  const [originalCV, setOriginalCV] = useState('');
  const [improvedCV, setImprovedCV] = useState('');

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [savedCvId, setSavedCvId] = useState<string | undefined>();
  const [savedFileName, setSavedFileName] = useState('');

  // Auto-select first CV
  useEffect(() => {
    if (!selectedCV && cvs && cvs.length > 0) {
      setSelectedCV(cvs[0].id);
    }
  }, [cvs, selectedCV]);

  // Start analysis when reaching step 1
  const generatePreviewFromStructured = (structured: any) => {
    if (!structured) return '';

    const sections: string[] = [];

    // Personal Info
    if (structured.personalInfo) {
      const p = structured.personalInfo;
      const lines: string[] = [];
      if (p.fullName) lines.push(p.fullName);
      if (p.address) lines.push(p.address);
      if (p.phone) lines.push(p.phone);
      if (p.email) lines.push(p.email);
      if (lines.length > 0) sections.push(lines.join('\n'));
    }

    // Summary
    if (structured.summary) {
      sections.push('SAMMANFATTNING\n' + structured.summary);
    }

    // Education
    if (structured.education && structured.education.length > 0) {
      const eduLines = ['UTBILDNING'];
      structured.education.forEach((edu: any) => {
        eduLines.push(`${edu.degree} ${edu.graduationYear || ''}`);
        if (edu.institution) eduLines.push(edu.institution);
        if (edu.description) eduLines.push(edu.description);
      });
      sections.push(eduLines.join('\n'));
    }

    // Experience
    if (structured.experience && structured.experience.length > 0) {
      const expLines = ['ERFARENHETER'];
      structured.experience.forEach((exp: any) => {
        expLines.push(`${exp.position}, ${exp.company} ${exp.location || ''} — ${exp.startDate} - ${exp.endDate || 'Nuvarande'}`);
        if (Array.isArray(exp.description)) {
          exp.description.forEach((desc: string) => {
            if (desc && desc.trim()) expLines.push(desc);
          });
        } else if (exp.description) {
          expLines.push(exp.description);
        }
        expLines.push('');
      });
      sections.push(expLines.join('\n'));
    }

    // Skills
    if (structured.skills && structured.skills.length > 0) {
      const skillTexts = structured.skills.map((skill: any) => {
        if (typeof skill === 'string') return skill;
        if (skill && typeof skill === 'object' && skill.name) return skill.name;
        return '';
      }).filter((s: string) => s.trim());

      if (skillTexts.length > 0) {
        sections.push('FÄRDIGHETER\n' + skillTexts.join(', '));
      }
    }

    return sections.join('\n\n');
  };

  useEffect(() => {
    if (currentStep === 1 && !isAnalyzing && !analysisResult && selectedCV) {
      startAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setEstimatedTimeRemaining(50);

    const startTime = Date.now();
    const ESTIMATED_DURATION = 50000;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min(95, Math.floor((elapsed / ESTIMATED_DURATION) * 100));
      const timeRemaining = Math.max(0, Math.ceil((ESTIMATED_DURATION - elapsed) / 1000));

      setProgress(progressPercent);
      setEstimatedTimeRemaining(timeRemaining);
    }, 1000);

    try {
      if (!selectedCV) {
        throw new Error('Inget CV valt');
      }
      const jobId = await onAnalysisStart(selectedCV);
      const result = await onPollJob(jobId);

      clearInterval(progressInterval);

      setAnalysisResult(result);
      if (result.structuredCV) {
        setStructuredCV(result.structuredCV);
        // Generate original CV from structured data
        const originalPreview = generatePreviewFromStructured(result.structuredCV);
        setOriginalCV(originalPreview);
        setImprovedCV(originalPreview); // Start with same as original
      } else if (result.formattedPreview) {
        setOriginalCV(result.formattedPreview);
        setImprovedCV(result.formattedPreview);
      }
      setProgress(100);
      setEstimatedTimeRemaining(0);

      setTimeout(() => {
        handleNext();
      }, 1500);
    } catch (error) {
      console.error('Analysis error:', error);
      clearInterval(progressInterval);
      alert('Ett fel uppstod vid analysen. Försök igen.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateImprovedCV = () => {
    if (!analysisResult || !structuredCV) return;

    const improvedStructured = JSON.parse(JSON.stringify(structuredCV));

    // ONLY Apply profile summary if selected
    if (selectedProfile && analysisResult.profileSummary) {
      improvedStructured.summary = analysisResult.profileSummary.improvedText;
    }

    // ONLY Apply role improvements for selected roles
    if (analysisResult.roleBasedImprovements && improvedStructured.experience && selectedRoles.size > 0) {
      Array.from(selectedRoles).forEach(roleIndex => {
        const improvement = analysisResult.roleBasedImprovements[roleIndex];
        if (improvement && roleIndex < improvedStructured.experience.length) {
          const newDescription = improvement.suggestedText;
          improvedStructured.experience[roleIndex].description =
            newDescription.split(/\n+/).filter((line: string) => line.trim().length > 0);
        }
      });
    }

    // ONLY Apply skill improvements for selected skills
    if (analysisResult.skillImprovements && selectedSkills.size > 0) {
      const skillsToAdd: string[] = [];
      Array.from(selectedSkills).forEach(skillIndex => {
        const skill = analysisResult.skillImprovements[skillIndex];
        if (skill?.suggestedSkill) {
          skillsToAdd.push(skill.suggestedSkill);
        }
      });
      if (skillsToAdd.length > 0) {
        improvedStructured.skills = [...(improvedStructured.skills || []), ...skillsToAdd];
      }
    }

    // ONLY Apply general improvements for selected items
    if (analysisResult.generalImprovements && selectedGeneral.size > 0) {
      Array.from(selectedGeneral).forEach(genIndex => {
        const improvement = analysisResult.generalImprovements[genIndex];
        // General improvements typically suggest adding new sections or content
        // This would need specific handling based on the improvement type
        console.log('General improvement to apply:', improvement);
      });
    }

    const improved = generatePreviewFromStructured(improvedStructured);
    setImprovedCV(improved);
  };

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    // Generate improved CV when moving to preview step
    if (currentStep === 3) {
      generateImprovedCV();
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex - 1) || stepIndex === 0) {
      setCurrentStep(stepIndex);
    }
  };

  const canNavigateNext = () => {
    if (currentStep === 0) return selectedCV !== null;
    if (currentStep === 1) return false; // Analyzing
    if (currentStep === 3) {
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
          <CVSelectionStep
            cvs={cvs}
            selectedCV={selectedCV}
            onSelectCV={setSelectedCV}
          />
        );

      case 1:
        return (
          <AnalysisProgressStep
            progress={progress}
            currentActivity="Analyserar..."
            estimatedTimeRemaining={estimatedTimeRemaining}
          />
        );

      case 2:
        if (!analysisResult) return null;
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

      case 3:
        if (!analysisResult) return null;
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
            onSelectAllRoles={() => {
              const allIndices = (analysisResult.roleBasedImprovements || []).map((_: any, i: number) => i);
              setSelectedRoles(new Set(allIndices));
            }}
            onDeselectAllRoles={() => setSelectedRoles(new Set())}
            onSelectAllSkills={() => {
              const allIndices = (analysisResult.skillSuggestions || []).map((_: any, i: number) => i);
              setSelectedSkills(new Set(allIndices));
            }}
            onDeselectAllSkills={() => setSelectedSkills(new Set())}
            onSelectAllGeneral={() => {
              const allIndices = (analysisResult.generalImprovements || []).map((_: any, i: number) => i);
              setSelectedGeneral(new Set(allIndices));
            }}
            onDeselectAllGeneral={() => setSelectedGeneral(new Set())}
            onRoleTextEdit={(index, newText) => {
              const newMap = new Map(editedRoleTexts);
              newMap.set(index, newText);
              setEditedRoleTexts(newMap);
            }}
            onProfileEdit={(newText) => setEditedProfileText(newText)}
          />
        );

      case 4:
        const selectedImprovementsCount =
          (selectedProfile ? 1 : 0) + selectedRoles.size + selectedSkills.size + selectedGeneral.size;

        return (
          <PreviewComparisonStep
            originalCV={originalCV}
            improvedCV={improvedCV}
            improvementsCount={selectedImprovementsCount}
            atsImprovement={selectedImprovementsCount * 2}
          />
        );

      case 5:
        return (
          <SaveAndTemplateStep
            improvedCV={improvedCV}
            onSaveAndDownload={async (templateId, fileName, saveToLibrary) => {
              // Implementation here
            }}
            isSaving={isSaving}
          />
        );

      case 6:
        return (
          <CompletionStep
            savedCvId={savedCvId}
            fileName={savedFileName}
            onAnalyzeAnother={() => {
              if (onComplete) onComplete();
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
      {/* Morphing Background - Same as landing page */}
      <motion.div className="fixed inset-0 pointer-events-none z-0 opacity-90">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-slate-50/50" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-50/20 to-pink-50/30" />

        {/* Animated morphing gradient orbs */}
        <motion.div
          className="absolute top-[10%] left-[5%] w-[500px] h-[500px] will-change-transform"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, rgba(147, 51, 234, 0.05) 40%, transparent 70%)',
            filter: 'blur(60px)',
            willChange: 'transform',
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
          className="absolute top-[30%] right-[10%] w-[600px] h-[600px] will-change-transform"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, rgba(139, 92, 246, 0.04) 40%, transparent 70%)',
            filter: 'blur(80px)',
            willChange: 'transform',
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
          className="absolute bottom-[20%] left-[15%] w-[400px] h-[400px] will-change-transform"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.03) 40%, transparent 70%)',
            filter: 'blur(70px)',
            willChange: 'transform',
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
      </motion.div>

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none z-5">
        {[...Array(12)].map((_, i) => (
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

      {/* Main Content */}
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
              CV-Analys & Förbättring
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Få konkreta förbättringsförslag baserat på svenska rekryterare
            </p>
          </div>
        </motion.header>

        {/* Progress Bar */}
        <div className="mb-8">
          <AnalysisProgressBar
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={goToStep}
          />
        </div>

        {/* Main Card */}
        <motion.div
          className="bg-white/95 backdrop-blur-xl shadow-xl border border-gray-200/80 rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Step Content */}
          <div className="p-8 min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Suspense fallback={<StepSkeleton />}>
                  {renderStepContent()}
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Footer */}
          {currentStep < STEPS.length - 1 && currentStep !== 1 && (
            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
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
    </div>
  );
}
