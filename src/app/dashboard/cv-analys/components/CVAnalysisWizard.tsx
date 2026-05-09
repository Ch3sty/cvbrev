'use client';

import { useState, useEffect, Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useNotification } from '@/context/notificationcontext';
import { generateCVNameSuggestions } from '@/lib/cv/cvNameSuggestions';

import AnalysisFlowLayout from './AnalysisFlowLayout';
import AnalysisFlowHero from './AnalysisFlowHero';
import AnalysisFlowProgress, { ANALYSIS_STEPS } from './AnalysisFlowProgress';
import AnalysisFlowStepHeader from './AnalysisFlowStepHeader';
import QuotaExceededBanner from '@/components/cv/QuotaExceededBanner';

// Lazy-loaded steps
const CVSelectionStep = lazy(() => import('./steps/CVSelectionStep'));
const AnalysisProgressStep = lazy(() => import('./steps/AnalysisProgressStep'));
const AnalysisOverviewStep = lazy(() => import('./steps/AnalysisOverviewStep'));
const SelectImprovementsStep = lazy(() => import('./steps/SelectImprovementsStep'));
const PreviewComparisonStep = lazy(() => import('./steps/PreviewComparisonStep'));
const SaveAndTemplateStep = lazy(() => import('./steps/SaveAndTemplateStep'));
const SaveProgressStep = lazy(() => import('./steps/SaveProgressStep'));
const CompletionStep = lazy(() => import('./steps/CompletionStep'));

interface CVAnalysisWizardProps {
  cvs: any[];
  onAnalysisStart: (cvId: string) => Promise<string>;
  onPollJob: (jobId: string) => Promise<any>;
  onComplete?: () => void;
}

const STEP_META: Record<
  number,
  { title: string; description: string }
> = {
  0: {
    title: 'Vilket CV vill du analysera?',
    description: 'Välj från ditt bibliotek. Du kan alltid byta senare.',
  },
  1: {
    title: 'Vi analyserar ditt CV',
    description: 'Det tar ungefär 30 till 60 sekunder. Stanna kvar.',
  },
  2: {
    title: 'Här är ditt resultat',
    description: 'Vi har gått igenom ditt CV. Så här kan det bli bättre.',
  },
  3: {
    title: 'Välj vilka förbättringar du vill ha',
    description: 'Vi tillämpar bara det du markerar. Du har full kontroll.',
  },
  4: {
    title: 'Granska din nya version',
    description: 'Jämför före och efter. Vill du ändra? Gå tillbaka.',
  },
  5: {
    title: 'Mall och spara',
    description: 'Välj en mall som passar dig och bestäm vad som ska hända.',
  },
  6: {
    title: 'Klart',
    description: 'Ditt CV är optimerat och redo att skicka in.',
  },
};

const StepSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-slate-200/70 rounded-xl w-3/4" />
    <div className="h-4 bg-slate-200/60 rounded w-full" />
    <div className="h-4 bg-slate-200/60 rounded w-5/6" />
    <div className="h-64 bg-slate-200/50 rounded-2xl" />
  </div>
);

export default function CVAnalysisWizard({
  cvs,
  onAnalysisStart,
  onPollJob,
  onComplete,
}: CVAnalysisWizardProps) {
  const supabase = createClient();
  const { successWithMascotAndActivity } = useNotification();

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const [selectedCV, setSelectedCV] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(50);

  const [selectedProfile, setSelectedProfile] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<Set<number>>(new Set());
  const [selectedSkills, setSelectedSkills] = useState<Set<number>>(new Set());
  const [selectedGeneral, setSelectedGeneral] = useState<Set<number>>(new Set());
  const [editedRoleTexts, setEditedRoleTexts] = useState<Map<number, string>>(new Map());
  const [editedProfileText, setEditedProfileText] = useState<string | null>(null);

  const [structuredCV, setStructuredCV] = useState<any>(null);
  const [, setImprovedStructuredCV] = useState<any>(null);

  const [originalCV, setOriginalCV] = useState('');
  const [improvedCV, setImprovedCV] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [savedCvId, setSavedCvId] = useState<string | undefined>();
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [savedFileName, setSavedFileName] = useState('');

  const [saveChoice, setSaveChoice] = useState<'save-and-download' | 'download' | 'save' | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>('norrsken');
  const [customCVName, setCustomCVName] = useState('');

  const [showSaveProgress, setShowSaveProgress] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);

  const [dynamicPotentialScore, setDynamicPotentialScore] = useState(0);

  // Steg 3: spårar vilka kategorier användaren har besökt och hur många som finns
  const [visitedSelectCategories, setVisitedSelectCategories] = useState<Set<string>>(new Set());
  const [visibleSelectCategories, setVisibleSelectCategories] = useState<string[]>([]);

  // Auto-välj första CV
  useEffect(() => {
    if (!selectedCV && cvs && cvs.length > 0) {
      setSelectedCV(cvs[0].id);
    }
  }, [cvs, selectedCV]);

  /**
   * Splittar en skill-sträng på vanliga separatorer och städar varje del.
   * Exempel: "Kunskaper-Säljteknik-Mötesbokning" → ["Kunskaper", "Säljteknik", "Mötesbokning"]
   * Exempel: "Ledarskap 3/5 4/5 5/5" → ["Ledarskap"]
   */
  const splitSkillString = (raw: string): string[] => {
    if (!raw || typeof raw !== 'string') return [];
    // Splitta på separatorer som ofta klumpar ihop skills i CV:n
    const parts = raw
      .split(/\s*[-–—•|/;,]\s*|\s+(?:och|samt)\s+/i)
      .map((s) => s.trim())
      // Ta bort betygs-suffix typ "3/5", "4/5 5/5", "(grund)"
      .map((s) => s.replace(/\s*\d+\/\d+(\s*\d+\/\d+)*\s*$/g, '').trim())
      .map((s) => s.replace(/^\(.*\)|\(.*\)$/g, '').trim())
      .filter((s) => s.length >= 2 && s.length <= 60);
    return parts;
  };

  /**
   * Normaliserar skills-listan i strukturerad CV-data: splittar bindestreckade skills,
   * tar bort dubbletter och tomma värden. Returnerar en kopia.
   */
  const sanitizeStructuredCV = (structured: any): any => {
    if (!structured) return structured;
    const copy = JSON.parse(JSON.stringify(structured));
    if (Array.isArray(copy.skills)) {
      copy.skills = copy.skills
        .map((category: any) => {
          if (
            category &&
            typeof category === 'object' &&
            Array.isArray(category.skills)
          ) {
            const flat = category.skills.flatMap((s: any) =>
              typeof s === 'string' ? splitSkillString(s) : []
            );
            // Dedupe case-insensitive
            const seen = new Set<string>();
            const unique = flat.filter((s: string) => {
              const k = s.toLowerCase();
              if (seen.has(k)) return false;
              seen.add(k);
              return true;
            });
            return { ...category, skills: unique };
          }
          if (typeof category === 'string') {
            return { category: 'Färdigheter', skills: splitSkillString(category) };
          }
          return category;
        })
        .filter((c: any) => c && Array.isArray(c.skills) && c.skills.length > 0);
    }
    return copy;
  };

  const generatePreviewFromStructured = (structured: any) => {
    if (!structured) return '';
    const sections: string[] = [];

    if (structured.personalInfo) {
      const p = structured.personalInfo;
      const lines: string[] = [];
      if (p.fullName) lines.push(p.fullName);
      if (p.address) lines.push(p.address);
      if (p.phone) lines.push(p.phone);
      if (p.email) lines.push(p.email);
      if (lines.length > 0) sections.push(lines.join('\n'));
    }

    if (structured.summary) {
      sections.push('SAMMANFATTNING\n' + structured.summary);
    }

    if (structured.education && structured.education.length > 0) {
      const eduLines = ['UTBILDNING'];
      structured.education.forEach((edu: any) => {
        eduLines.push(`${edu.degree} ${edu.graduationYear || ''}`);
        if (edu.institution) eduLines.push(edu.institution);
        if (edu.description) eduLines.push(edu.description);
      });
      sections.push(eduLines.join('\n'));
    }

    if (structured.experience && structured.experience.length > 0) {
      const expLines = ['ERFARENHETER'];
      structured.experience.forEach((exp: any) => {
        expLines.push(
          `${exp.position}, ${exp.company} ${exp.location || ''} ${exp.startDate} - ${exp.endDate || 'Nuvarande'}`
        );
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

    if (structured.skills && structured.skills.length > 0) {
      const skillTexts = structured.skills
        .flatMap((skillCategory: any) => {
          if (
            skillCategory &&
            typeof skillCategory === 'object' &&
            skillCategory.category &&
            Array.isArray(skillCategory.skills)
          ) {
            return skillCategory.skills;
          }
          if (typeof skillCategory === 'string') return skillCategory;
          if (skillCategory && typeof skillCategory === 'object' && skillCategory.name)
            return skillCategory.name;
          return [];
        })
        .filter((s: string) => s && s.trim());

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
      if (!selectedCV) throw new Error('Inget CV valt');

      const jobId = await onAnalysisStart(selectedCV);
      const result = await onPollJob(jobId);

      clearInterval(progressInterval);

      setAnalysisResult(result);
      setCurrentAnalysisId(result.id);
      if (result.structuredCV) {
        setStructuredCV(result.structuredCV);
        const originalPreview = generatePreviewFromStructured(result.structuredCV);
        setOriginalCV(originalPreview);
        setImprovedCV(originalPreview);
      } else if (result.formattedPreview) {
        setOriginalCV(result.formattedPreview);
        setImprovedCV(result.formattedPreview);
      }
      setProgress(100);
      setEstimatedTimeRemaining(0);

      setTimeout(() => handleNext(), 1500);
    } catch (error) {
      console.error('Analysis error:', error);
      clearInterval(progressInterval);
      alert('Ett fel uppstod vid analysen. Försök igen.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateSelectedImpact = () => {
    if (!analysisResult) return 0;

    const currentAtsScore = analysisResult.atsFriendliness?.score || 0;
    let impact = 0;

    if (selectedProfile && analysisResult.profileSummary?.atsImpact) {
      impact += analysisResult.profileSummary.atsImpact;
    }

    if (analysisResult.roleBasedImprovements && selectedRoles.size > 0) {
      Array.from(selectedRoles).forEach((index) => {
        const roleImpact = analysisResult.roleBasedImprovements[index]?.atsImpact || 0;
        impact += roleImpact;
      });
    }

    if (analysisResult.skillSuggestions) {
      Array.from(selectedSkills).forEach((index) => {
        const skill = analysisResult.skillSuggestions[index];
        if (skill?.atsImpact) impact += skill.atsImpact;
        else if (skill?.relevance === 'high') impact += 3;
        else if (skill?.relevance === 'medium') impact += 2;
        else impact += 1;
      });
    }

    if (analysisResult.generalImprovements) {
      Array.from(selectedGeneral).forEach((index) => {
        const imp = analysisResult.generalImprovements[index];
        if (imp?.atsImpact) impact += imp.atsImpact;
        else if (imp?.category === 'Nyckelord') impact += 4;
        else if (imp?.category === 'Innehåll') impact += 3;
        else impact += 2;
      });
    }

    return Math.min(100, currentAtsScore + impact);
  };

  useEffect(() => {
    if (analysisResult) {
      setDynamicPotentialScore(calculateSelectedImpact());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProfile, selectedRoles, selectedSkills, selectedGeneral, analysisResult]);

  const generateImprovedCV = () => {
    if (!analysisResult || !structuredCV) return null;

    const improvedStructured = JSON.parse(JSON.stringify(structuredCV));

    if (selectedProfile && analysisResult.profileSummary) {
      improvedStructured.summary = analysisResult.profileSummary.improvedText;
    }

    if (
      analysisResult.roleBasedImprovements &&
      improvedStructured.experience &&
      selectedRoles.size > 0
    ) {
      Array.from(selectedRoles).forEach((roleIndex) => {
        const improvement = analysisResult.roleBasedImprovements[roleIndex];
        if (improvement && roleIndex < improvedStructured.experience.length) {
          const newDescription = improvement.suggestedText;
          improvedStructured.experience[roleIndex].description = newDescription
            .split(/\n+/)
            .filter((line: string) => line.trim().length > 0);
        }
      });
    }

    if (analysisResult.skillSuggestions && selectedSkills.size > 0) {
      const skillsToAdd: string[] = [];
      Array.from(selectedSkills).forEach((skillIndex) => {
        const suggestion = analysisResult.skillSuggestions[skillIndex];
        if (suggestion?.skill) skillsToAdd.push(suggestion.skill);
      });
      if (skillsToAdd.length > 0) {
        if (!improvedStructured.skills) improvedStructured.skills = [];

        let supplementaryCategory = improvedStructured.skills.find(
          (cat: any) => cat.category === 'Kompletterande färdigheter'
        );

        if (!supplementaryCategory) {
          supplementaryCategory = { category: 'Kompletterande färdigheter', skills: [] };
          improvedStructured.skills.push(supplementaryCategory);
        }

        skillsToAdd.forEach((skill) => {
          if (!supplementaryCategory.skills.includes(skill)) {
            supplementaryCategory.skills.push(skill);
          }
        });
      }
    }

    if (analysisResult.generalImprovements && selectedGeneral.size > 0) {
      Array.from(selectedGeneral).forEach((genIndex) => {
        const improvement = analysisResult.generalImprovements[genIndex];
        console.log('General improvement to apply:', improvement);
      });
    }

    const improved = generatePreviewFromStructured(improvedStructured);
    setImprovedCV(improved);
    setImprovedStructuredCV(improvedStructured);

    return improvedStructured;
  };

  const updateAnalysisWithImprovements = async (improvedStructured: any) => {
    if (!analysisResult || !currentAnalysisId || !improvedStructured) return;

    try {
      const improvedResult = {
        ...analysisResult,
        atsFriendliness: {
          ...analysisResult.atsFriendliness,
          score: dynamicPotentialScore,
        },
        structuredCV: improvedStructured,
      };

      const { error } = await supabase
        .from('cv_analysis_jobs')
        .update({ result: improvedResult })
        .eq('id', currentAnalysisId);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to update analysis:', err);
    }
  };

  const handleNext = async () => {
    // Steg 5: spara/ladda ned
    if (currentStep === 5) {
      if (!saveChoice || !selectedTemplate) {
        alert('Välj ett alternativ och en CV-mall');
        return;
      }

      setShowSaveProgress(true);
      setSaveProgress(0);
      setIsSaving(true);

      const progressInterval = setInterval(() => {
        setSaveProgress((prev) => Math.min(95, prev + 5));
      }, 300);

      const fileName = customCVName || generateCVNameSuggestions()[0];
      setSavedFileName(fileName);

      try {
        let improvedStructuredCV: any = null;
        if (structuredCV && analysisResult) {
          improvedStructuredCV = JSON.parse(JSON.stringify(structuredCV));

          if (selectedProfile && analysisResult.profileSummary) {
            const profileText = editedProfileText || analysisResult.profileSummary.improvedText;
            improvedStructuredCV.summary = profileText.trim().replace(/\s+/g, ' ');
          }

          if (
            analysisResult.roleBasedImprovements &&
            improvedStructuredCV.experience &&
            selectedRoles.size > 0
          ) {
            Array.from(selectedRoles).forEach((roleIndex) => {
              const improvement = analysisResult.roleBasedImprovements[roleIndex];
              if (improvement && roleIndex < improvedStructuredCV.experience.length) {
                const newDescription =
                  editedRoleTexts.get(roleIndex) || improvement.suggestedText;
                improvedStructuredCV.experience[roleIndex].description = newDescription
                  .split(/\n+/)
                  .map((line: string) => line.trim().replace(/\s+/g, ' '))
                  .filter((line: string) => line.length > 0);
              }
            });
          }

          if (analysisResult.skillSuggestions && selectedSkills.size > 0) {
            const skillsToAdd: string[] = [];
            Array.from(selectedSkills).forEach((skillIndex) => {
              const suggestion = analysisResult.skillSuggestions[skillIndex];
              if (suggestion?.skill) skillsToAdd.push(suggestion.skill);
            });
            if (skillsToAdd.length > 0) {
              if (!improvedStructuredCV.skills) improvedStructuredCV.skills = [];

              let supplementaryCategory = improvedStructuredCV.skills.find(
                (cat: any) => cat.category === 'Kompletterande färdigheter'
              );

              if (!supplementaryCategory) {
                supplementaryCategory = {
                  category: 'Kompletterande färdigheter',
                  skills: [],
                };
                improvedStructuredCV.skills.push(supplementaryCategory);
              }

              skillsToAdd.forEach((skill) => {
                if (!supplementaryCategory.skills.includes(skill)) {
                  supplementaryCategory.skills.push(skill);
                }
              });
            }
          }

          // Splitta bindestreckade skills och dedupe innan vi skickar till backend.
          // CV-parsern lamnar ibland kvar klumpar som "Kunskaper-Saljteknik-Motesbokning..."
          // som vi maste plocka isar for att mallarna ska kunna rendera dem som chips.
          improvedStructuredCV = sanitizeStructuredCV(improvedStructuredCV);
        }

        const shouldSave = saveChoice === 'save-and-download' || saveChoice === 'save';

        if (shouldSave) {
          const response = await fetch('/api/cv/save-improved', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName,
              improvedText: improvedCV,
              structuredData: improvedStructuredCV,
              originalCvId: selectedCV,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            const err = new Error(
              errorData.message || errorData.error || 'Kunde inte spara CV'
            ) as Error & { quotaExceeded?: boolean; status?: number };
            err.quotaExceeded =
              errorData.quota_exceeded === true || response.status === 403;
            err.status = response.status;
            throw err;
          }

          const { cvId: newCvId } = await response.json();
          setSavedCvId(newCvId);

          if (currentAnalysisId) {
            try {
              await supabase
                .from('cv_analysis_jobs')
                .update({ display_name: fileName })
                .eq('id', currentAnalysisId);
            } catch (updateError) {
              console.error('Failed to update analysis display name:', updateError);
            }
          }

          if (analysisResult && newCvId) {
            const improvedAnalysisResult = {
              ...analysisResult,
              atsFriendliness: {
                ...analysisResult.atsFriendliness,
                score: Math.round(dynamicPotentialScore),
              },
              profileSummary:
                selectedProfile && analysisResult.profileSummary
                  ? {
                      ...analysisResult.profileSummary,
                      currentText:
                        editedProfileText || analysisResult.profileSummary.improvedText,
                    }
                  : analysisResult.profileSummary,
              roleBasedImprovements: analysisResult.roleBasedImprovements?.map(
                (role: any, i: number) =>
                  selectedRoles.has(i)
                    ? {
                        ...role,
                        currentText: editedRoleTexts.get(i) || role.suggestedText,
                      }
                    : role
              ),
              implementedSkills: Array.from(selectedSkills).map(
                (i) => analysisResult.skillSuggestions[i]
              ),
              selectedImprovements: {
                profile: selectedProfile,
                roles: Array.from(selectedRoles),
                skills: Array.from(selectedSkills),
                general: Array.from(selectedGeneral),
              },
            };

            try {
              await fetch('/api/cv/save-improved-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  originalAnalysisId: analysisResult.id,
                  improvedResult: improvedAnalysisResult,
                  displayName: fileName,
                  cvId: newCvId,
                }),
              });
            } catch (analysisError) {
              console.error('Failed to save improved analysis:', analysisError);
            }
          }
        }

        let pdfFailed = false;
        try {
          const pdfFileName = `${fileName.replace(/\.[^/.]+$/, '')}.pdf`;
          const requestBody: any = {
            template: selectedTemplate,
            format: 'pdf',
            templateOptions: {},
          };

          if (improvedStructuredCV) requestBody.structuredData = improvedStructuredCV;
          else if (structuredCV) requestBody.structuredData = sanitizeStructuredCV(structuredCV);
          else {
            const fixedCVText = improvedCV
              .replace(/([a-zåäö])([A-ZÅÄÖ])/g, '$1 $2')
              .replace(/([0-9])([A-ZÅÄÖ])/g, '$1 $2')
              .replace(/([a-zåäö])([0-9])/g, '$1 $2');
            requestBody.cvText = fixedCVText;
          }

          const pdfResponse = await fetch('/api/cv/generate-formatted', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
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
        } catch (pdfError: any) {
          console.error('PDF generation error:', pdfError);
          pdfFailed = true;
        }

        clearInterval(progressInterval);
        setSaveProgress(100);

        if (pdfFailed && shouldSave) {
          successWithMascotAndActivity(
            'Vi har sparat ditt CV. PDF-nedladdningen misslyckades, men du kan ladda ner det senare från ditt CV-bibliotek.',
            'cv-analyzed',
            'cv_analysis_completed',
            'slutförde en CV-analys',
            {
              cv_id: selectedCV,
              improvements_selected:
                selectedRoles.size +
                selectedSkills.size +
                selectedGeneral.size +
                (selectedProfile ? 1 : 0),
            },
            7000
          );
        } else if (pdfFailed && !shouldSave) {
          alert('Kunde inte generera PDF. Försök igen senare.');
          setIsSaving(false);
          setShowSaveProgress(false);
          setSaveProgress(0);
          return;
        } else {
          successWithMascotAndActivity(
            'Vi är klara med din analys. Dina förbättringar väntar.',
            'cv-analyzed',
            'cv_analysis_completed',
            'slutförde en CV-analys',
            {
              cv_id: selectedCV,
              improvements_selected:
                selectedRoles.size +
                selectedSkills.size +
                selectedGeneral.size +
                (selectedProfile ? 1 : 0),
            },
            5000
          );
        }

        setTimeout(() => {
          setIsSaving(false);
          setShowSaveProgress(false);
          setSaveProgress(0);
          if (!completedSteps.includes(currentStep)) {
            setCompletedSteps([...completedSteps, currentStep]);
          }
          setCurrentStep(currentStep + 1);
        }, 1000);
      } catch (error: any) {
        console.error('Save error:', error);
        clearInterval(progressInterval);
        const isQuota = error?.quotaExceeded === true;
        if (isQuota) {
          setQuotaError(error.message);
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        } else {
          alert(error.message || 'Ett fel uppstod vid sparande');
        }
        setIsSaving(false);
        setShowSaveProgress(false);
        setSaveProgress(0);
      }
      return;
    }

    // Normal step advancement
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    if (currentStep === 3) {
      const improvedStructured = generateImprovedCV();
      if (improvedStructured) {
        await updateAnalysisWithImprovements(improvedStructured);
      }
    }

    if (currentStep < ANALYSIS_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex - 1) || stepIndex === 0 || completedSteps.includes(stepIndex)) {
      setCurrentStep(stepIndex);
    }
  };

  const canNavigateNext = () => {
    if (currentStep === 0) return selectedCV !== null;
    if (currentStep === 1) return false;
    if (currentStep === 3) {
      const totalSelected =
        (selectedProfile ? 1 : 0) +
        selectedRoles.size +
        selectedSkills.size +
        selectedGeneral.size;
      const allCategoriesVisited =
        visibleSelectCategories.length > 0 &&
        visibleSelectCategories.every((c) => visitedSelectCategories.has(c));
      return totalSelected > 0 && allCategoriesVisited;
    }
    if (currentStep === 5) {
      return saveChoice !== null && selectedTemplate !== null;
    }
    return true;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <CVSelectionStep cvs={cvs} selectedCV={selectedCV} onSelectCV={setSelectedCV} />
        );

      case 1:
        return (
          <AnalysisProgressStep
            progress={progress}
            currentActivity="Analyserar..."
            estimatedTimeRemaining={estimatedTimeRemaining}
          />
        );

      case 2: {
        if (!analysisResult) return null;
        const currentAtsScore = analysisResult.atsFriendliness?.score || 0;

        const calculateTruePotential = () => {
          let totalImpact = 0;
          const breakdown = { profile: 0, roles: 0, skills: 0, general: 0, total: 0 };

          if (analysisResult.profileSummary?.atsImpact) {
            breakdown.profile = analysisResult.profileSummary.atsImpact;
            totalImpact += breakdown.profile;
          }

          if (
            analysisResult.roleBasedImprovements &&
            analysisResult.roleBasedImprovements.length > 0
          ) {
            const sortedRoles = [...analysisResult.roleBasedImprovements].sort(
              (a: any, b: any) => (b.atsImpact || 0) - (a.atsImpact || 0)
            );
            const topRoles = sortedRoles.slice(0, Math.min(5, sortedRoles.length));
            const avgImpact =
              topRoles.reduce(
                (sum: number, role: any) => sum + (role.atsImpact || 0),
                0
              ) / topRoles.length;
            breakdown.roles = Math.round(avgImpact * 4);
            totalImpact += breakdown.roles;
          }

          if (analysisResult.skillSuggestions) {
            breakdown.skills = analysisResult.skillSuggestions.reduce(
              (sum: number, skill: any) => {
                if (skill.relevance === 'high') return sum + 1;
                if (skill.relevance === 'medium') return sum + 0.5;
                return sum + 0.3;
              },
              0
            );
            totalImpact += breakdown.skills;
          }

          if (analysisResult.generalImprovements) {
            breakdown.general = analysisResult.generalImprovements.reduce(
              (sum: number, imp: any) => {
                if (imp.category === 'Nyckelord') return sum + 2;
                if (imp.category === 'Innehåll') return sum + 1;
                return sum + 0.5;
              },
              0
            );
            totalImpact += breakdown.general;
          }

          breakdown.total = Math.round(totalImpact);
          return breakdown;
        };

        const impactBreakdown = calculateTruePotential();
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
      }

      case 3: {
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
              if (newSet.has(index)) newSet.delete(index);
              else newSet.add(index);
              setSelectedRoles(newSet);
            }}
            onToggleSkill={(index) => {
              const newSet = new Set(selectedSkills);
              if (newSet.has(index)) newSet.delete(index);
              else newSet.add(index);
              setSelectedSkills(newSet);
            }}
            onToggleGeneral={(index) => {
              const newSet = new Set(selectedGeneral);
              if (newSet.has(index)) newSet.delete(index);
              else newSet.add(index);
              setSelectedGeneral(newSet);
            }}
            onSelectAllRoles={() => {
              const allIndices = (analysisResult.roleBasedImprovements || []).map(
                (_: any, i: number) => i
              );
              setSelectedRoles(new Set(allIndices));
            }}
            onDeselectAllRoles={() => setSelectedRoles(new Set())}
            onSelectAllSkills={() => {
              const allIndices = (analysisResult.skillSuggestions || []).map(
                (_: any, i: number) => i
              );
              setSelectedSkills(new Set(allIndices));
            }}
            onDeselectAllSkills={() => setSelectedSkills(new Set())}
            onSelectAllGeneral={() => {
              const allIndices = (analysisResult.generalImprovements || []).map(
                (_: any, i: number) => i
              );
              setSelectedGeneral(new Set(allIndices));
            }}
            onDeselectAllGeneral={() => setSelectedGeneral(new Set())}
            onRoleTextEdit={(index, newText) => {
              const newMap = new Map(editedRoleTexts);
              newMap.set(index, newText);
              setEditedRoleTexts(newMap);
            }}
            onProfileEdit={(newText) => setEditedProfileText(newText)}
            onCategoryVisited={(id) => {
              setVisitedSelectCategories((prev) => {
                if (prev.has(id)) return prev;
                const next = new Set(prev);
                next.add(id);
                return next;
              });
            }}
            onVisibleCategoriesChange={(cats) => {
              setVisibleSelectCategories(cats);
            }}
          />
        );
      }

      case 4: {
        const selectedImprovementsCount =
          (selectedProfile ? 1 : 0) +
          selectedRoles.size +
          selectedSkills.size +
          selectedGeneral.size;

        // Bygg en strukturerad change-log direkt från analysisResult + selections.
        const changeLog = analysisResult
          ? {
              profile:
                selectedProfile && analysisResult.profileSummary
                  ? {
                      currentText: analysisResult.profileSummary.currentText || '',
                      improvedText:
                        editedProfileText ||
                        analysisResult.profileSummary.improvedText ||
                        '',
                      atsImpact:
                        analysisResult.profileSummary.atsImpact || 0,
                      changes: Array.isArray(
                        analysisResult.profileSummary.changes
                      )
                        ? analysisResult.profileSummary.changes
                        : [],
                    }
                  : undefined,
              roles:
                analysisResult.roleBasedImprovements && selectedRoles.size > 0
                  ? Array.from(selectedRoles)
                      .sort((a, b) => a - b)
                      .map((idx: number) => {
                        const r = analysisResult.roleBasedImprovements[idx];
                        return {
                          index: idx,
                          roleTitle: r?.roleTitle || `Roll ${idx + 1}`,
                          company: r?.company || '',
                          period: r?.period || '',
                          currentText: r?.currentText || '',
                          improvedText:
                            editedRoleTexts.get(idx) || r?.suggestedText || '',
                          keywordsAdded: Array.isArray(r?.improvements?.keywords)
                            ? r.improvements.keywords.length
                            : 0,
                          quantified: !r?.improvements?.hasQuantification,
                          atsImpact: r?.atsImpact || 0,
                        };
                      })
                  : [],
              skills:
                analysisResult.skillSuggestions && selectedSkills.size > 0
                  ? {
                      items: Array.from(selectedSkills)
                        .sort((a, b) => a - b)
                        .map((idx: number) => {
                          const s = analysisResult.skillSuggestions[idx];
                          return {
                            skill: s?.skill || '',
                            relevance: (s?.relevance ||
                              'medium') as 'high' | 'medium' | 'low',
                          };
                        })
                        .filter((s) => s.skill),
                      atsImpact: Array.from(selectedSkills).reduce(
                        (sum: number, idx: number) => {
                          const s = analysisResult.skillSuggestions[idx];
                          if (s?.atsImpact) return sum + s.atsImpact;
                          if (s?.relevance === 'high') return sum + 3;
                          if (s?.relevance === 'medium') return sum + 2;
                          return sum + 1;
                        },
                        0
                      ),
                    }
                  : undefined,
              general:
                analysisResult.generalImprovements &&
                analysisResult.generalImprovements.length > 0
                  ? {
                      bullets: analysisResult.generalImprovements.map(
                        (g: any) =>
                          g?.area ||
                          g?.title ||
                          g?.suggestion ||
                          g?.description ||
                          'Förbättring'
                      ),
                    }
                  : undefined,
            }
          : undefined;

        return (
          <PreviewComparisonStep
            originalCV={originalCV}
            improvedCV={improvedCV}
            improvementsCount={selectedImprovementsCount}
            atsImprovement={Math.round(dynamicPotentialScore - (analysisResult?.atsFriendliness?.score || 0))}
            changeLog={changeLog}
            thumbnailSeed={currentAnalysisId || selectedCV || 'cv'}
          />
        );
      }

      case 5:
        if (showSaveProgress) {
          return <SaveProgressStep progress={saveProgress} />;
        }
        return (
          <SaveAndTemplateStep
            improvedCV={improvedCV}
            saveChoice={saveChoice}
            onChoiceChange={setSaveChoice}
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
            customName={customCVName}
            onNameChange={setCustomCVName}
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

  const meta = STEP_META[currentStep];
  const showStepHeader = currentStep !== 1 && currentStep !== 6;
  const showStepHeaderForFinishing = currentStep === 6 ? false : showStepHeader;

  return (
    <div className="relative">
      {/* Innehåll - ärver bakgrunden från dashboard-layouten */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <AnalysisFlowLayout>
          <AnalysisFlowProgress
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={goToStep}
          />

          {/* Kvotgräns nådd */}
          {quotaError && (
            <div className="mb-4">
              <QuotaExceededBanner message={quotaError} />
            </div>
          )}

          {/* Hero visas bara på Steg 0 */}
          {currentStep === 0 && <AnalysisFlowHero />}

          {/* Step-header per steg */}
          {showStepHeaderForFinishing && meta && (
            <AnalysisFlowStepHeader
              stepNumber={currentStep + 1}
              title={meta.title}
              description={meta.description}
              isDone={completedSteps.includes(currentStep)}
              isActive
            />
          )}

          {/* Step-innehåll med transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep + (showSaveProgress ? '-saving' : '')}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<StepSkeleton />}>{renderStepContent()}</Suspense>
            </motion.div>
          </AnimatePresence>

          {/* Navigation-knappar (dolda på Steg 1, 6 och under SaveProgress) */}
          {currentStep !== 1 && currentStep !== 6 && !showSaveProgress && (() => {
            const canNext = canNavigateNext();

            // Steg 3-specifik logik
            const totalVisible = visibleSelectCategories.length;
            const totalVisited = visibleSelectCategories.filter((c) =>
              visitedSelectCategories.has(c)
            ).length;
            const totalSelectedStep3 =
              (selectedProfile ? 1 : 0) +
              selectedRoles.size +
              selectedSkills.size +
              selectedGeneral.size;
            const isStep3 = currentStep === 3;
            const allVisited = isStep3 && totalVisible > 0 && totalVisited === totalVisible;
            const remainingCategories = isStep3
              ? Math.max(0, totalVisible - totalVisited)
              : 0;

            // Visa "Färdig, gå vidare"-läge när alla kategorier besökts + minst en vald
            const finishedMode = isStep3 && allVisited && totalSelectedStep3 > 0;

            // Hjälptext under knappen
            let helperText: string | null = null;
            if (isStep3 && !canNext && !isSaving) {
              if (totalSelectedStep3 === 0) {
                helperText = 'Välj minst en förbättring';
              } else if (remainingCategories > 0) {
                helperText = `Kolla resten först (${remainingCategories} av ${totalVisible} ${
                  remainingCategories === 1 ? 'kategori kvar' : 'kategorier kvar'
                })`;
              }
            }

            const buttonLabel =
              currentStep === 5
                ? 'Spara mitt CV'
                : finishedMode
                ? 'Färdig, gå vidare'
                : 'Nästa';

            return (
              <div className="pt-2">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 0 || isSaving}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm min-h-[48px] disabled:opacity-40 disabled:cursor-not-allowed hover:border-orange-300 hover:bg-orange-50/40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
                    Tillbaka
                  </button>

                  <motion.button
                    type="button"
                    onClick={handleNext}
                    disabled={!canNext || isSaving}
                    className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl text-white font-semibold text-sm min-h-[48px] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    style={{
                      background:
                        canNext && !isSaving
                          ? 'linear-gradient(135deg, #F97316, #DC2626)'
                          : '#E2E8F0',
                      boxShadow:
                        canNext && !isSaving
                          ? '0 8px 20px -6px rgba(220, 38, 38, 0.45)'
                          : 'none',
                      color: canNext && !isSaving ? 'white' : '#94A3B8',
                    }}
                    animate={
                      finishedMode && !isSaving
                        ? { scale: [1, 1.04, 1] }
                        : { scale: 1 }
                    }
                    transition={
                      finishedMode && !isSaving
                        ? {
                            duration: 1.6,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }
                        : { duration: 0.2 }
                    }
                  >
                    {buttonLabel}
                    <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                  </motion.button>
                </div>

                {helperText && (
                  <motion.p
                    key={helperText}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-right text-xs text-slate-500 mt-2 sm:mt-2.5 px-1"
                  >
                    {helperText}
                  </motion.p>
                )}
              </div>
            );
          })()}
        </AnalysisFlowLayout>
      </div>
    </div>
  );
}
