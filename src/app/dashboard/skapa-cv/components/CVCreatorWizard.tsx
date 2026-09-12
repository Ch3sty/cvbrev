'use client';

import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/context/notificationcontext';
import { useProfile } from '@/hooks/use-profile';
import type {
  CVMetadata,
  CVPersonalInfo,
  CVExperience,
  CVEducation,
  CVSkill,
  CVLanguage,
  CVCertification,
} from '@/lib/cv/cv-metadata';

// Nya layout-komponenter
import SkapaCvLayout from './SkapaCvLayout';
import { SKAPA_CV_STEPS } from './steps.config';
import SkapaCvHero from './SkapaCvHero';
import SkapaCvPreview, { type PreviewSection } from './SkapaCvPreview';

// Auto-save hook
import { useAutoSave } from '../hooks/useAutoSave';
import FlowShell from '@/components/shell/FlowShell';
import { useFlowStep } from '@/lib/flow/useFlowStep';
import FlowResumeBanner from '@/components/shell/FlowResumeBanner';

// Lazy load steps for performance
const Step1Kontakt = lazy(() => import('./steps/Step1Kontakt'));
const Step2OmDig = lazy(() => import('./steps/Step2OmDig'));
const Step3Erfarenhet = lazy(() => import('./steps/Step3Erfarenhet'));
const Step4Utbildning = lazy(() => import('./steps/Step4Utbildning'));
const Step5Kompetenser = lazy(() => import('./steps/Step5Kompetenser'));
const Step6Sprak = lazy(() => import('./steps/Step6Sprak'));
const Step7Review = lazy(() => import('./steps/Step7Review'));

// Types for CV data being built
export interface CVDraft {
  personalInfo: Partial<CVPersonalInfo>;
  summary: string;
  experience: Partial<CVExperience>[];
  education: Partial<CVEducation>[];
  skills: CVSkill[];
  languages: CVLanguage[];
  certifications: CVCertification[];
}

const initialCVDraft: CVDraft = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    linkedIn: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  languages: [{ language: 'Svenska', proficiency: 'Modersmål' }],
  certifications: [],
};

const TEST_CV_DATA: CVDraft = {
  personalInfo: {
    fullName: 'Anna Svensson',
    email: 'anna.svensson@example.com',
    phone: '070-123 45 67',
    address: 'Stockholm',
    linkedIn: 'linkedin.com/in/annasvensson',
    title: 'Senior Projektledare',
  },
  summary:
    'Erfaren projektledare med över 8 års erfarenhet inom IT och digital transformation. Stark i att leda tvärfunktionella team och leverera komplexa projekt i tid och inom budget. Passionerad för agila metoder och kontinuerlig förbättring.',
  experience: [
    {
      position: 'Senior Projektledare',
      company: 'TechCorp AB',
      location: 'Stockholm',
      startDate: 'Jan 2021',
      endDate: 'Nuvarande',
      description: [
        'Leder ett team på 12 personer i utvecklingen av företagets nya e-handelsplattform',
        'Implementerade Scrum-metodologi vilket ökade teamets leveranshastighet med 40%',
        'Ansvarar för budget på 15 MSEK och rapporterar direkt till CTO',
      ],
    },
  ],
  education: [
    {
      degree: 'Civilingenjör i Industriell Ekonomi',
      institution: 'Kungliga Tekniska Högskolan',
      location: 'Stockholm',
      graduationYear: '2015',
    },
  ],
  skills: [
    {
      category: 'Projektledning',
      skills: ['Scrum', 'Kanban', 'Agile', 'PRINCE2'],
    },
    {
      category: 'Verktyg',
      skills: ['Jira', 'Confluence', 'Slack', 'MS Project'],
    },
  ],
  languages: [
    { language: 'Svenska', proficiency: 'Modersmål' },
    { language: 'Engelska', proficiency: 'Flytande' },
  ],
  certifications: [],
};

const StepSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-6 bg-orange-100/50 rounded w-1/3"></div>
    <div className="h-8 bg-orange-100/40 rounded w-3/4"></div>
    <div className="h-48 bg-orange-100/30 rounded-xl"></div>
  </div>
);

/** Mappar currentStep till PreviewSection för highlight i mockupen */
function previewSectionForStep(step: number): PreviewSection | undefined {
  switch (step) {
    case 0:
      return 'kontakt';
    case 1:
      return 'om-dig';
    case 2:
      return 'erfarenhet';
    case 3:
      return 'utbildning';
    case 4:
      return 'kompetenser';
    case 5:
      return 'sprak';
    default:
      return undefined;
  }
}

export default function CVCreatorWizard({
  initialIsAdmin = false,
}: {
  /** Server-läst adminflagga. Styr enbart knappen "Fyll i testdata". */
  initialIsAdmin?: boolean;
}) {
  const router = useRouter();
  const { successWithMascotAndActivity } = useNotification();
  const { profile } = useProfile();

  /* Steget ligger i URL:en (?steg=N, ettbaserat) i stället för i useState.
     Tidigare lämnade bakåtgesten på mobil hela wizarden i stället för att
     backa ett steg, och en omladdning började om på steg 1 trots att
     utkastet fanns kvar. Internt räknar wizarden fortfarande 0-baserat. */
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const flow = useFlowStep({
    totalSteps: SKAPA_CV_STEPS.length,
    maxReachableStep: SKAPA_CV_STEPS.length,
  });
  const currentStep = flow.step - 1;
  const setCurrentStep = useCallback(
    (updater: number | ((prev: number) => number)) => {
      const target =
        typeof updater === 'function' ? updater(currentStep) : updater;
      flow.goToStep(target + 1);
    },
    [flow, currentStep]
  );

  // CV data state
  const [cvData, setCVData] = useState<CVDraft>(initialCVDraft);

  // Template selection state (for step 7)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('norrsken');

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Adminflaggan kommer server-läst. Tidigare gjordes den här på klienten med
  // getUser() följt av en fråga mot admin_users, alltså två rundturer efter
  // hydrering för att avgöra om en testknapp skulle synas.
  const isAdmin = initialIsAdmin;

  // Mobile preview drawer
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // Auto-save hook
  const { saveDraft, loadDraft, loadDraftSavedAt, hasDraft, clearDraft } =
    useAutoSave(cvData);

  // Pre-populate from profile if cvData empty
  useEffect(() => {
    if (
      profile &&
      !cvData.personalInfo.fullName?.trim() &&
      !cvData.personalInfo.email?.trim()
    ) {
      setCVData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          fullName: profile.full_name ?? '',
          email: profile.email ?? '',
          phone: profile.phone ?? '',
          address: profile.location ?? '',
        },
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  /* Utkastet återställdes tidigare tyst, mitt i att profil-prefillen skrev
     i samma fält. Användaren fick alltså en blandning av två källor utan
     att veta om det. Nu är det ett val: Fortsätt eller Börja om, där
     Börja om kräver bekräftelse eftersom det raderar. */
  const [pendingCvDraft, setPendingCvDraft] = useState<CVDraft | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const draftChecked = React.useRef(false);

  useEffect(() => {
    if (draftChecked.current) return;
    draftChecked.current = true;
    const existingDraft = loadDraft();
    if (existingDraft) {
      setPendingCvDraft(existingDraft);
      setDraftSavedAt(loadDraftSavedAt());
    }
  }, [loadDraft, loadDraftSavedAt]);

  const resumeCvDraft = useCallback(() => {
    if (!pendingCvDraft) return;
    setCVData(pendingCvDraft);
    setPendingCvDraft(null);
  }, [pendingCvDraft]);

  const restartCvDraft = useCallback(() => {
    clearDraft();
    setPendingCvDraft(null);
    setCurrentStep(0);
  }, [clearDraft, setCurrentStep]);

  const fillTestData = useCallback(() => {
    setCVData(TEST_CV_DATA);
    setCompletedSteps([0, 1, 2, 3, 4, 5]);
  }, []);

  const updateCVData = useCallback((updates: Partial<CVDraft>) => {
    setCVData((prev) => ({ ...prev, ...updates }));
  }, []);

  const restoreDraft = useCallback((draft: CVDraft) => {
    setCVData(draft);
  }, []);

  // Validation per step
  const canProceedFromStep = useCallback(
    (step: number): boolean => {
      switch (step) {
        case 0: {
          const hasProfileData = !!(
            profile?.full_name?.trim() &&
            profile?.email?.trim() &&
            profile?.phone?.trim()
          );
          const hasCvData = !!(
            cvData.personalInfo.fullName?.trim() &&
            cvData.personalInfo.email?.trim() &&
            cvData.personalInfo.phone?.trim()
          );
          return hasProfileData || hasCvData;
        }
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          return true;
        case 6: {
          const hasExperience =
            cvData.experience.length > 0 &&
            cvData.experience.some(
              (exp) => exp.position?.trim() && exp.company?.trim()
            );
          const hasEducation =
            cvData.education.length > 0 &&
            cvData.education.some(
              (edu) => edu.degree?.trim() && edu.institution?.trim()
            );
          return hasExperience || hasEducation;
        }
        default:
          return true;
      }
    },
    [cvData, profile]
  );

  const goToNextStep = useCallback(() => {
    if (
      currentStep < SKAPA_CV_STEPS.length - 1 &&
      canProceedFromStep(currentStep)
    ) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep]);
      }
      setCurrentStep((prev) => prev + 1);
      saveDraft();
      // Scroll to top på mobil när man byter steg
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [currentStep, canProceedFromStep, completedSteps, saveDraft]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (step: number) => {
      if (step <= currentStep || completedSteps.includes(step)) {
        setCurrentStep(step);
      }
    },
    [currentStep, completedSteps]
  );

  // Build CVMetadata for export/save
  const buildCVMetadata = useCallback((): CVMetadata => {
    return {
      personalInfo: {
        fullName: cvData.personalInfo.fullName || '',
        email: cvData.personalInfo.email || '',
        phone: cvData.personalInfo.phone,
        address: cvData.personalInfo.address,
        linkedIn: cvData.personalInfo.linkedIn,
        location: cvData.personalInfo.address,
        title: cvData.personalInfo.title,
      },
      summary: cvData.summary || undefined,
      experience: cvData.experience
        .filter((exp) => exp.position?.trim() && exp.company?.trim())
        .map((exp) => ({
          position: exp.position || '',
          company: exp.company || '',
          location: exp.location,
          startDate: exp.startDate || '',
          endDate: exp.endDate,
          description: Array.isArray(exp.description)
            ? exp.description.filter((line) => line.trim())
            : exp.description || [],
          achievements: exp.achievements,
        })),
      education: cvData.education
        .filter((edu) => edu.degree?.trim() && edu.institution?.trim())
        .map((edu) => ({
          degree: edu.degree || '',
          institution: edu.institution || '',
          location: edu.location,
          graduationYear: edu.graduationYear,
          description: edu.description,
        })),
      skills: cvData.skills.filter((skill) => skill.skills.length > 0),
      languages: cvData.languages.filter((lang) => lang.language.trim()),
      certifications: cvData.certifications.filter((cert) => cert.name.trim()),
    };
  }, [cvData]);

  const buildCVText = useCallback((metadata: CVMetadata): string => {
    const lines: string[] = [];
    lines.push(metadata.personalInfo.fullName);
    if (metadata.personalInfo.email) lines.push(metadata.personalInfo.email);
    if (metadata.personalInfo.phone) lines.push(metadata.personalInfo.phone);
    if (metadata.personalInfo.address)
      lines.push(metadata.personalInfo.address);
    lines.push('');
    if (metadata.summary) {
      lines.push('SAMMANFATTNING');
      lines.push(metadata.summary);
      lines.push('');
    }
    if (metadata.experience.length > 0) {
      lines.push('ARBETSLIVSERFARENHET');
      metadata.experience.forEach((exp) => {
        lines.push(`${exp.position} - ${exp.company}`);
        if (exp.startDate)
          lines.push(
            `${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ' - Pågående'}`
          );
        if (exp.description) {
          exp.description.forEach((desc) => lines.push(`• ${desc}`));
        }
        lines.push('');
      });
    }
    if (metadata.education.length > 0) {
      lines.push('UTBILDNING');
      metadata.education.forEach((edu) => {
        lines.push(`${edu.degree} - ${edu.institution}`);
        if (edu.graduationYear) lines.push(edu.graduationYear);
        lines.push('');
      });
    }
    if (metadata.skills.length > 0) {
      lines.push('KOMPETENSER');
      metadata.skills.forEach((skillGroup) => {
        if (skillGroup.skills.length > 0) {
          lines.push(skillGroup.skills.join(', '));
        }
      });
      lines.push('');
    }
    if (metadata.languages && metadata.languages.length > 0) {
      lines.push('SPRÅK');
      metadata.languages.forEach((lang) => {
        lines.push(`${lang.language}: ${lang.proficiency}`);
      });
      lines.push('');
    }
    return lines.join('\n');
  }, []);

  const handleComplete = useCallback(
    async (action: 'save' | 'download' | 'both') => {
      setIsSaving(true);

      try {
        const metadata = buildCVMetadata();
        const cvText = buildCVText(metadata);
        const fileName = `CV - ${cvData.personalInfo.fullName || 'Nytt CV'}`;

        if (action === 'save' || action === 'both') {
          const response = await fetch('/api/cv/save-improved', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName,
              improvedText: cvText,
              structuredData: metadata,
              originalCvId: null,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            const error = new Error(
              errorData.message || errorData.error || 'Kunde inte spara CV'
            ) as Error & { quotaExceeded?: boolean; status?: number };
            error.quotaExceeded =
              errorData.quota_exceeded === true || response.status === 403;
            error.status = response.status;
            throw error;
          }

          clearDraft();
          successWithMascotAndActivity?.(
            'Ditt CV har sparats!',
            '/images/mascots/mascot-success.svg',
            'cv_generated',
            'CV skapat framgångsrikt',
            undefined,
            5000,
            true
          );
        }

        if (action === 'download' || action === 'both') {
          const response = await fetch('/api/cv/generate-formatted', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              structuredData: metadata,
              template: selectedTemplate,
              format: 'pdf',
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Kunde inte generera PDF');
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `CV-${cvData.personalInfo.fullName?.replace(/\s+/g, '-') || 'mitt-cv'}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
        }
      } catch (error) {
        console.error('Error completing wizard:', error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [
      buildCVMetadata,
      buildCVText,
      cvData.personalInfo.fullName,
      selectedTemplate,
      clearDraft,
      successWithMascotAndActivity,
    ]
  );

  // Render step content
  const renderStepContent = () => {
    const commonProps = { cvData, updateCVData };

    switch (currentStep) {
      case 0:
        return <Step1Kontakt {...commonProps} />;
      case 1:
        return <Step2OmDig {...commonProps} />;
      case 2:
        return <Step3Erfarenhet {...commonProps} />;
      case 3:
        return <Step4Utbildning {...commonProps} />;
      case 4:
        return <Step5Kompetenser {...commonProps} />;
      case 5:
        return <Step6Sprak {...commonProps} />;
      case 6:
        return (
          <Step7Review
            {...commonProps}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            onComplete={handleComplete}
            isSaving={isSaving}
            buildCVMetadata={buildCVMetadata}
          />
        );
      default:
        return null;
    }
  };

  const isReviewStep = currentStep === 6;
  const showPreview = currentStep < 6; // Granska har egen preview

  /* Återkomstvalet tar hela ytan: det är ett vägval, inte en banner. */
  if (pendingCvDraft) {
    return (
      <FlowShell
        title="Bygg ditt CV"
        step={1}
        totalSteps={SKAPA_CV_STEPS.length}
        onExit={() => router.push('/dashboard')}
        exitLabel="Tillbaka till översikten"
      >
        <FlowResumeBanner
          savedAt={draftSavedAt ?? Date.now()}
          step={1}
          totalSteps={SKAPA_CV_STEPS.length}
          onResume={resumeCvDraft}
          onRestart={restartCvDraft}
        />
      </FlowShell>
    );
  }

  // Vad som saknas, så en spärrad knapp aldrig är tyst.
  const nextBlockedReason = !canProceedFromStep(currentStep)
    ? currentStep === 0
      ? 'Fyll i namn, e-post och telefon för att gå vidare.'
      : currentStep === 6
        ? 'Lägg till minst en erfarenhet eller utbildning.'
        : undefined
    : undefined;

  return (
    <FlowShell
      title="Bygg ditt CV"
      step={currentStep + 1}
      totalSteps={SKAPA_CV_STEPS.length}
      onBack={currentStep > 0 ? goToPreviousStep : undefined}
      onExit={currentStep === 0 ? () => router.push('/dashboard') : undefined}
      exitLabel="Tillbaka till översikten"
      primaryLabel={
        isReviewStep ? undefined : currentStep === 5 ? 'Granska CV' : 'Nästa steg'
      }
      onPrimary={isReviewStep ? undefined : goToNextStep}
      primaryDisabled={!canProceedFromStep(currentStep)}
      primaryBlockedReason={nextBlockedReason}
      footerSecondary={
        isAdmin ? (
          <button
            type="button"
            onClick={fillTestData}
            className="inline-flex h-11 items-center gap-2 px-2 text-sm font-medium text-neutral-600 underline-offset-4 hover:text-neutral-900 hover:underline"
          >
            <Bug className="h-4 w-4" strokeWidth={2} />
            Fyll i testdata
          </button>
        ) : undefined
      }
    >
      <SkapaCvLayout withPreview={showPreview}>
          {/* Hero, bara på Steg 0 */}
          {currentStep === 0 && <SkapaCvHero />}

          {/* Layout: Step + Preview (på desktop, om showPreview) */}
          {showPreview ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-start">
              {/* Vänster: input */}
              <div className="min-w-0 space-y-5">
                {/* Mobil: drawer för preview */}
                <div className="lg:hidden">
                  <button
                    type="button"
                    onClick={() => setMobilePreviewOpen(!mobilePreviewOpen)}
                    className="w-full px-4 py-3 rounded-xl border border-orange-200 bg-orange-50/40 flex items-center justify-between gap-3 hover:bg-orange-50/60 transition-colors"
                    aria-expanded={mobilePreviewOpen}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-1 h-3 rounded-sm flex-shrink-0 bg-orange-600"
                        aria-hidden="true"
                      />
                      <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange-700">
                        {mobilePreviewOpen
                          ? 'Dölj förhandsvisning'
                          : 'Visa förhandsvisning'}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-orange-700 transition-transform ${
                        mobilePreviewOpen ? 'rotate-180' : ''
                      }`}
                      strokeWidth={2.4}
                    />
                  </button>
                  <AnimatePresence>
                    {mobilePreviewOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mt-3"
                      >
                        <SkapaCvPreview
                          data={cvData}
                          activeSection={previewSectionForStep(currentStep)}
                          showGlow={false}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Step content */}
                <AnimatePresence mode="wait">
                  {/* Ren intoning. y: 12 flyttade in stegkortet underifrån
                      varje gång det byttes, och eftersom kortet kommer in sent
                      räknade webbläsaren rörelsen som ett layoutskifte. */}
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Suspense fallback={<StepSkeleton />}>
                      {renderStepContent()}
                    </Suspense>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Höger: live preview (sticky) */}
              <div className="hidden lg:block lg:sticky lg:top-32">
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="w-1 h-3 rounded-sm bg-orange-600"
                    aria-hidden="true"
                  />
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange-700">
                    Live · uppdateras medan du skriver
                  </span>
                </div>
                <SkapaCvPreview
                  data={cvData}
                  activeSection={previewSectionForStep(currentStep)}
                />
              </div>
            </div>
          ) : (
            // Granska-steget, full bredd, ingen sidor-preview (Step7 har egen)
            <AnimatePresence mode="wait">
              {/* Samma sak för granskningssteget, som är det tyngsta av dem
                  och därför det som syns mest om det flyttar när det landar. */}
              <motion.div
                key={currentStep}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Suspense fallback={<StepSkeleton />}>
                  {renderStepContent()}
                </Suspense>
              </motion.div>
            </AnimatePresence>
          )}

      </SkapaCvLayout>
    </FlowShell>
  );
}
