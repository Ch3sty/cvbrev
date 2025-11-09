'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useNotification } from '@/context/notificationcontext';

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
  const supabase = createClient();
  const { successWithMascotAndActivity } = useNotification();

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // CV Selection state
  const [selectedCV, setSelectedCV] = useState<string | null>(null);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
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
  const [improvedStructuredCV, setImprovedStructuredCV] = useState<any>(null);

  // Preview state
  const [originalCV, setOriginalCV] = useState('');
  const [improvedCV, setImprovedCV] = useState('');

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [savedCvId, setSavedCvId] = useState<string | undefined>();
  const [savedFileName, setSavedFileName] = useState('');

  // Dynamic potential state - uppdateras när användaren väljer förbättringar
  const [dynamicPotentialScore, setDynamicPotentialScore] = useState(0);

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
      const skillTexts = structured.skills.flatMap((skillCategory: any) => {
        // Handle categorized skills { category: string, skills: string[] }
        if (skillCategory && typeof skillCategory === 'object' && skillCategory.category && Array.isArray(skillCategory.skills)) {
          return skillCategory.skills;
        }
        // Handle plain string
        if (typeof skillCategory === 'string') return skillCategory;
        // Handle { name: string }
        if (skillCategory && typeof skillCategory === 'object' && skillCategory.name) return skillCategory.name;
        return [];
      }).filter((s: string) => s && s.trim());

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
      setCurrentAnalysisId(result.id); // Store the analysis job ID
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

  // Funktion för att beräkna dynamisk potential baserat på användarens val
  const calculateSelectedImpact = () => {
    if (!analysisResult) return 0;

    const currentAtsScore = analysisResult.atsFriendliness?.score || 0;
    let impact = 0;

    // Profil (om vald)
    if (selectedProfile && analysisResult.profileSummary?.atsImpact) {
      impact += analysisResult.profileSummary.atsImpact;
    }

    // Valda roller - använd direkt summa av atsImpact från AI
    if (analysisResult.roleBasedImprovements && selectedRoles.size > 0) {
      Array.from(selectedRoles).forEach(index => {
        const roleImpact = analysisResult.roleBasedImprovements[index]?.atsImpact || 0;
        impact += roleImpact;
      });
    }

    // Valda skills - använd AI:ns atsImpact
    if (analysisResult.skillSuggestions) {
      Array.from(selectedSkills).forEach(index => {
        const skill = analysisResult.skillSuggestions[index];
        // Use AI's atsImpact if available, otherwise fallback based on relevance
        if (skill?.atsImpact) {
          impact += skill.atsImpact;
        } else if (skill?.relevance === 'high') {
          impact += 3;
        } else if (skill?.relevance === 'medium') {
          impact += 2;
        } else {
          impact += 1;
        }
      });
    }

    // Valda allmänna - använd AI:ns atsImpact
    if (analysisResult.generalImprovements) {
      Array.from(selectedGeneral).forEach(index => {
        const imp = analysisResult.generalImprovements[index];
        // Use AI's atsImpact if available, otherwise fallback based on category
        if (imp?.atsImpact) {
          impact += imp.atsImpact;
        } else if (imp?.category === 'Nyckelord') {
          impact += 4;
        } else if (imp?.category === 'Innehåll') {
          impact += 3;
        } else {
          impact += 2;
        }
      });
    }

    return Math.min(100, currentAtsScore + impact);
  };

  // Uppdatera dynamisk potential när användaren ändrar sina val
  useEffect(() => {
    if (analysisResult) {
      setDynamicPotentialScore(calculateSelectedImpact());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProfile, selectedRoles, selectedSkills, selectedGeneral, analysisResult]);

  const generateImprovedCV = () => {
    if (!analysisResult || !structuredCV) return null;

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
    if (analysisResult.skillSuggestions && selectedSkills.size > 0) {
      const skillsToAdd: string[] = [];
      Array.from(selectedSkills).forEach(skillIndex => {
        const suggestion = analysisResult.skillSuggestions[skillIndex];
        if (suggestion?.skill) {
          skillsToAdd.push(suggestion.skill);
        }
      });
      if (skillsToAdd.length > 0) {
        // Use same structured category logic as onSaveAndDownload
        if (!improvedStructured.skills) {
          improvedStructured.skills = [];
        }

        // Find or create "Kompletterande färdigheter" category
        let supplementaryCategory = improvedStructured.skills.find(
          (cat: any) => cat.category === 'Kompletterande färdigheter'
        );

        if (!supplementaryCategory) {
          supplementaryCategory = { category: 'Kompletterande färdigheter', skills: [] };
          improvedStructured.skills.push(supplementaryCategory);
        }

        // Add skills (avoid duplicates)
        skillsToAdd.forEach(skill => {
          if (!supplementaryCategory.skills.includes(skill)) {
            supplementaryCategory.skills.push(skill);
          }
        });
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
    setImprovedStructuredCV(improvedStructured); // Store improved structured CV for database update

    return improvedStructured; // Return for immediate use
  };

  const updateAnalysisWithImprovements = async (improvedStructured: any) => {
    if (!analysisResult || !currentAnalysisId || !improvedStructured) {
      console.error('Missing required data for updating analysis');
      return;
    }

    try {
      // Create the updated result with new ATS score and improved structured CV
      const improvedResult = {
        ...analysisResult,
        atsFriendliness: {
          ...analysisResult.atsFriendliness,
          score: dynamicPotentialScore  // New calculated score based on selected improvements
        },
        structuredCV: improvedStructured  // CV with applied changes
      };

      // Update the analysis record in database
      const { error } = await supabase
        .from('cv_analysis_jobs')
        .update({
          result: improvedResult
          // display_name will be updated when user saves CV in SaveAndTemplateStep
        })
        .eq('id', currentAnalysisId);

      if (error) {
        console.error('Error updating analysis with improvements:', error);
        throw error;
      }

      console.log('Successfully updated analysis with improvements, new ATS score:', dynamicPotentialScore);
    } catch (err) {
      console.error('Failed to update analysis:', err);
    }
  };

  const handleNext = async () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    // Generate improved CV when moving to preview step
    if (currentStep === 3) {
      const improvedStructured = generateImprovedCV();
      // Update the analysis record with the improvements
      if (improvedStructured) {
        await updateAnalysisWithImprovements(improvedStructured);
      }
    }

    // Show mascot notification when reaching completion step
    if (currentStep === 5) {
      successWithMascotAndActivity(
        'CV-analysen är klar! Dina förbättringar väntar.',
        '/images/maskot/success-cv-analysis.svg',
        'cv_analysis_completed',
        'slutförde en CV-analys',
        {
          cv_id: selectedCV,
          improvements_selected: selectedRoles.size + selectedSkills.size + selectedGeneral.size + (selectedProfile ? 1 : 0)
        },
        5000
      );
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

        // Beräkna VERKLIG potential baserat på atsImpact från AI
        const calculateTruePotential = () => {
          let totalImpact = 0;
          const breakdown = {
            profile: 0,
            roles: 0,
            skills: 0,
            general: 0,
            total: 0
          };

          // Profil: använd atsImpact från AI (vanligtvis ~10 poäng)
          if (analysisResult.profileSummary?.atsImpact) {
            breakdown.profile = analysisResult.profileSummary.atsImpact;
            totalImpact += breakdown.profile;
          }

          // Roller: Viktad beräkning baserad på topp-5 roller för att undvika att
          // personer med många roller får oproportionerligt höga poäng
          if (analysisResult.roleBasedImprovements && analysisResult.roleBasedImprovements.length > 0) {
            // Sortera roller efter atsImpact (högst först)
            const sortedRoles = [...analysisResult.roleBasedImprovements]
              .sort((a: any, b: any) => (b.atsImpact || 0) - (a.atsImpact || 0));

            // Ta de 5 mest impactfulla rollerna (eller färre om det finns mindre än 5)
            const topRoles = sortedRoles.slice(0, Math.min(5, sortedRoles.length));

            // Beräkna genomsnittlig impact
            const avgImpact = topRoles.reduce((sum: number, role: any) => sum + (role.atsImpact || 0), 0) / topRoles.length;

            // Viktad poäng: genomsnitt * 4 ger max ~20 poäng från roller
            // Detta ger rättvis poängsättning oavsett antal roller (2 eller 20)
            breakdown.roles = Math.round(avgImpact * 4);
            totalImpact += breakdown.roles;
          }

          // Skills: ~0.5-1 poäng per skill beroende på relevans
          if (analysisResult.skillSuggestions) {
            breakdown.skills = analysisResult.skillSuggestions.reduce((sum: number, skill: any) => {
              if (skill.relevance === 'high') return sum + 1;
              if (skill.relevance === 'medium') return sum + 0.5;
              return sum + 0.3;
            }, 0);
            totalImpact += breakdown.skills;
          }

          // General: ~0.5-2 poäng beroende på kategori
          if (analysisResult.generalImprovements) {
            breakdown.general = analysisResult.generalImprovements.reduce((sum: number, imp: any) => {
              if (imp.category === 'Nyckelord') return sum + 2;
              if (imp.category === 'Innehåll') return sum + 1;
              return sum + 0.5;
            }, 0);
            totalImpact += breakdown.general;
          }

          breakdown.total = Math.round(totalImpact);
          return breakdown;
        };

        const impactBreakdown = calculateTruePotential();
        // Använd faktisk total från AI (nu realistisk med 1-5 per roll)
        const potentialAtsScore = Math.min(100, currentAtsScore + impactBreakdown.total);

        const totalImprovements =
          (analysisResult.profileSummary ? 1 : 0) +
          (analysisResult.roleBasedImprovements?.length || 0) +
          (analysisResult.skillSuggestions?.length || 0) +
          (analysisResult.generalImprovements?.length || 0);

        return (
          <AnalysisOverviewStep
            totalImprovements={totalImprovements}
            roleBasedCount={analysisResult.roleBasedImprovements?.length || 0}
            skillsCount={analysisResult.skillSuggestions?.length || 0}
            generalCount={analysisResult.generalImprovements?.length || 0}
            profileImproved={!!analysisResult.profileSummary}
            atsScore={currentAtsScore}
            potentialScore={potentialAtsScore}
            totalImpactBreakdown={impactBreakdown}
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
            currentAtsScore={analysisResult.atsFriendliness?.score || 0}
            dynamicPotentialScore={dynamicPotentialScore}
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
              setIsSaving(true);
              setSavedFileName(fileName);

              try {
                // Generate improved structured CV with selected changes
                let improvedStructuredCV: any = null;
                if (structuredCV && analysisResult) {
                  improvedStructuredCV = JSON.parse(JSON.stringify(structuredCV));

                  // Apply profile summary if selected
                  if (selectedProfile && analysisResult.profileSummary) {
                    // Use edited text if available, otherwise use AI suggestion
                    const profileText = editedProfileText || analysisResult.profileSummary.improvedText;
                    improvedStructuredCV.summary = profileText.trim().replace(/\s+/g, ' ');
                  }

                  // Apply role improvements for selected roles
                  if (analysisResult.roleBasedImprovements && improvedStructuredCV.experience && selectedRoles.size > 0) {
                    Array.from(selectedRoles).forEach(roleIndex => {
                      const improvement = analysisResult.roleBasedImprovements[roleIndex];
                      if (improvement && roleIndex < improvedStructuredCV.experience.length) {
                        // Use edited text if available, otherwise use AI suggestion
                        const newDescription = editedRoleTexts.get(roleIndex) || improvement.suggestedText;
                        improvedStructuredCV.experience[roleIndex].description =
                          newDescription
                            .split(/\n+/)
                            .map((line: string) => line.trim().replace(/\s+/g, ' '))  // Trim + normalisera mellanrum
                            .filter((line: string) => line.length > 0);
                      }
                    });
                  }

                  // Apply skill improvements
                  if (analysisResult.skillSuggestions && selectedSkills.size > 0) {
                    const skillsToAdd: string[] = [];
                    Array.from(selectedSkills).forEach(skillIndex => {
                      const suggestion = analysisResult.skillSuggestions[skillIndex];
                      if (suggestion?.skill) {
                        skillsToAdd.push(suggestion.skill);
                      }
                    });
                    if (skillsToAdd.length > 0) {
                      if (!improvedStructuredCV.skills) {
                        improvedStructuredCV.skills = [];
                      }

                      // Hitta eller skapa kategorin "Kompletterande färdigheter"
                      let supplementaryCategory = improvedStructuredCV.skills.find(
                        (cat: any) => cat.category === 'Kompletterande färdigheter'
                      );

                      if (!supplementaryCategory) {
                        supplementaryCategory = { category: 'Kompletterande färdigheter', skills: [] };
                        improvedStructuredCV.skills.push(supplementaryCategory);
                      }

                      // Lägg till nya skills (undvik dubletter)
                      skillsToAdd.forEach(skill => {
                        if (!supplementaryCategory.skills.includes(skill)) {
                          supplementaryCategory.skills.push(skill);
                        }
                      });
                    }
                  }
                }

                if (saveToLibrary) {
                  // Save to database
                  const response = await fetch('/api/cv/save-improved', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      fileName,
                      improvedText: improvedCV,
                      structuredData: improvedStructuredCV,
                      originalCvId: selectedCV
                    })
                  });

                  if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Kunde inte spara CV');
                  }

                  const { cvId: newCvId } = await response.json();
                  setSavedCvId(newCvId);

                  // Update the original analysis's display_name to match the CV name
                  if (currentAnalysisId) {
                    try {
                      await supabase
                        .from('cv_analysis_jobs')
                        .update({ display_name: fileName })
                        .eq('id', currentAnalysisId);
                    } catch (updateError) {
                      console.error('Failed to update analysis display name:', updateError);
                      // Don't block user flow if this fails
                    }
                  }

                  // Save improved analysis for job matching
                  if (analysisResult && newCvId) {
                    // Build improved analysis result with user's selections
                    const improvedAnalysisResult = {
                      ...analysisResult,
                      atsFriendliness: {
                        ...analysisResult.atsFriendliness,
                        score: Math.round(dynamicPotentialScore) // Updated score
                      },
                      // Update profile with improved text
                      profileSummary: selectedProfile && analysisResult.profileSummary ? {
                        ...analysisResult.profileSummary,
                        currentText: editedProfileText || analysisResult.profileSummary.improvedText
                      } : analysisResult.profileSummary,

                      // Update selected roles with improved text
                      roleBasedImprovements: analysisResult.roleBasedImprovements?.map((role: any, i: number) =>
                        selectedRoles.has(i) ? {
                          ...role,
                          currentText: editedRoleTexts.get(i) || role.suggestedText
                        } : role
                      ),

                      // Add implemented skills
                      implementedSkills: Array.from(selectedSkills).map(i =>
                        analysisResult.skillSuggestions[i]
                      ),

                      // Track which improvements were selected
                      selectedImprovements: {
                        profile: selectedProfile,
                        roles: Array.from(selectedRoles),
                        skills: Array.from(selectedSkills),
                        general: Array.from(selectedGeneral)
                      }
                    };

                    // Save improved analysis (don't block on error)
                    try {
                      await fetch('/api/cv/save-improved-analysis', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          originalAnalysisId: analysisResult.id,
                          improvedResult: improvedAnalysisResult,
                          displayName: fileName, // Use CV name from user input
                          cvId: newCvId
                        })
                      });
                    } catch (analysisError) {
                      console.error('Failed to save improved analysis:', analysisError);
                      // Don't block the user flow if this fails
                    }
                  }
                }

                // Generate and download PDF
                const pdfFileName = `${fileName.replace(/\.[^/.]+$/, '')}.pdf`;
                const requestBody: any = {
                  template: templateId,
                  format: 'pdf',
                  templateOptions: {}
                };

                if (improvedStructuredCV) {
                  requestBody.structuredData = improvedStructuredCV;
                } else if (structuredCV) {
                  requestBody.structuredData = structuredCV;
                } else {
                  const fixedCVText = improvedCV
                    .replace(/([a-zåäö])([A-ZÅÄÖ])/g, '$1 $2')
                    .replace(/([0-9])([A-ZÅÄÖ])/g, '$1 $2')
                    .replace(/([a-zåäö])([0-9])/g, '$1 $2');
                  requestBody.cvText = fixedCVText;
                }

                const pdfResponse = await fetch('/api/cv/generate-formatted', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(requestBody)
                });

                if (!pdfResponse.ok) {
                  const errorData = await pdfResponse.json();
                  throw new Error(errorData.error || 'Kunde inte generera PDF');
                }

                const blob = await pdfResponse.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = pdfFileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              } catch (error: any) {
                console.error('Save error:', error);
                alert(error.message || 'Ett fel uppstod vid sparande');
              } finally {
                setIsSaving(false);
              }
            }}
            onComplete={handleNext}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 relative z-10">
        {/* Header */}
        <motion.header
          className="mb-4 sm:mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              CV-Analys & Förbättring
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              Få konkreta förbättringsförslag baserat på svenska rekryterare
            </p>
          </div>
        </motion.header>

        {/* Progress Bar */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <AnalysisProgressBar
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={goToStep}
          />
        </div>

        {/* Main Card */}
        <motion.div
          className="bg-white/95 backdrop-blur-xl shadow-xl border border-gray-200/80 rounded-xl sm:rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Step Content */}
          <div className="p-5 sm:p-6 md:p-8 min-h-[300px] md:min-h-[400px]">
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
            <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center justify-center gap-2 touch-manipulation min-h-[48px] md:min-h-[44px] w-full sm:w-auto"
                >
                  <ChevronLeft className="w-5 h-5 md:w-4 md:h-4" />
                  <span className="text-base md:text-sm">Tillbaka</span>
                </Button>

                <div className="text-sm md:text-xs text-gray-600 font-medium">
                  Steg {currentStep + 1} av {STEPS.length}
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!canNavigateNext() || isSaving}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white flex items-center justify-center gap-2 touch-manipulation min-h-[48px] md:min-h-[44px] w-full sm:w-auto"
                >
                  <span className="text-base md:text-sm">Nästa</span>
                  <ChevronRight className="w-5 h-5 md:w-4 md:h-4" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
