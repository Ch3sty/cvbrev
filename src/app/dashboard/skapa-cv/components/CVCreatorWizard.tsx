'use client';

import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, User, FileText, Briefcase, GraduationCap, Wrench, Languages, Eye, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/context/notificationcontext';
import { useProfile } from '@/hooks/use-profile';
import { createClient } from '@/lib/supabase/client';
import type { CVMetadata, CVPersonalInfo, CVExperience, CVEducation, CVSkill, CVLanguage, CVCertification } from '@/lib/cv/cv-metadata';

// Lazy load steps for performance
const Step1BasicInfo = lazy(() => import('./steps/Step1BasicInfo'));
const Step2Summary = lazy(() => import('./steps/Step2Summary'));
const Step3Experience = lazy(() => import('./steps/Step3Experience'));
const Step4Education = lazy(() => import('./steps/Step4Education'));
const Step5Skills = lazy(() => import('./steps/Step5Skills'));
const Step6Languages = lazy(() => import('./steps/Step6Languages'));
const Step7Review = lazy(() => import('./steps/Step7Review'));

// Import progress bar
import CVCreatorProgressBar from './CVCreatorProgressBar';

// Auto-save hook
import { useAutoSave } from '../hooks/useAutoSave';

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

// Initial empty state
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

// Test data for admin debugging
const TEST_CV_DATA: CVDraft = {
  personalInfo: {
    fullName: 'Anna Svensson',
    email: 'anna.svensson@example.com',
    phone: '070-123 45 67',
    address: 'Stockholm',
    linkedIn: 'linkedin.com/in/annasvensson',
  },
  summary: 'Erfaren projektledare med över 8 års erfarenhet inom IT och digital transformation. Stark i att leda tvärfunktionella team och leverera komplexa projekt i tid och inom budget. Passionerad för agila metoder och kontinuerlig förbättring.',
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
        'Koordinerar samarbete mellan utveckling, design och marknadsföring',
      ],
    },
    {
      position: 'Projektledare',
      company: 'Digital Solutions Sverige',
      location: 'Stockholm',
      startDate: 'Mar 2018',
      endDate: 'Dec 2020',
      description: [
        'Ledde 5+ samtidiga webbutvecklingsprojekt för kunder inom bank och finans',
        'Ökade kundnöjdheten från 72% till 94% genom förbättrad kommunikation',
        'Introducerade automatiserade testrutiner som minskade buggar i produktion med 60%',
      ],
    },
    {
      position: 'IT-konsult',
      company: 'Accenture',
      location: 'Stockholm',
      startDate: 'Aug 2015',
      endDate: 'Feb 2018',
      description: [
        'Arbetade med systemimplementering för stora svenska företag',
        'Specialiserad på SAP-integration och processoptimering',
        'Certifierad i PRINCE2 och Scrum Master',
      ],
    },
  ],
  education: [
    {
      degree: 'Civilingenjör Industriell Ekonomi',
      institution: 'Kungliga Tekniska Högskolan (KTH)',
      location: 'Stockholm',
      graduationYear: '2015',
      description: 'Inriktning mot IT-management och projektledning',
    },
    {
      degree: 'Utbytesstudier Business Administration',
      institution: 'University of California, Berkeley',
      location: 'USA',
      graduationYear: '2014',
      description: 'Ett års utbytesstudier med fokus på entreprenörskap',
    },
  ],
  skills: [
    {
      category: 'Projektledning',
      skills: ['Scrum', 'Kanban', 'PRINCE2', 'Agile', 'Waterfall', 'SAFe'],
    },
    {
      category: 'Verktyg',
      skills: ['Jira', 'Confluence', 'Microsoft Project', 'Trello', 'Slack', 'Teams'],
    },
    {
      category: 'Tekniskt',
      skills: ['SQL', 'Python', 'Git', 'AWS', 'Azure', 'API-integration'],
    },
  ],
  languages: [
    { language: 'Svenska', proficiency: 'Modersmål' },
    { language: 'Engelska', proficiency: 'Flytande' },
    { language: 'Tyska', proficiency: 'Konversation' },
    { language: 'Spanska', proficiency: 'Nybörjare' },
  ],
  certifications: [
    { name: 'Certified Scrum Master (CSM)', issuer: 'Scrum Alliance', issueDate: '2019' },
    { name: 'PRINCE2 Practitioner', issuer: 'AXELOS', issueDate: '2018' },
    { name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', issueDate: '2022' },
    { name: 'SAFe 5 Agilist', issuer: 'Scaled Agile', issueDate: '2021' },
  ],
};

// Step configuration
const STEPS = [
  { id: 0, title: 'Kontaktuppgifter', icon: User },
  { id: 1, title: 'Om dig', icon: FileText },
  { id: 2, title: 'Erfarenhet', icon: Briefcase },
  { id: 3, title: 'Utbildning', icon: GraduationCap },
  { id: 4, title: 'Kompetenser', icon: Wrench },
  { id: 5, title: 'Språk', icon: Languages },
  { id: 6, title: 'Granska', icon: Eye },
];

// Skeleton loader for Suspense fallback
const StepSkeleton = () => (
  <div className="animate-pulse space-y-4 p-4">
    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-full"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    <div className="h-48 bg-gray-200 rounded"></div>
  </div>
);

export default function CVCreatorWizard() {
  const router = useRouter();
  const { successWithMascotAndActivity } = useNotification();
  const { profile, loading: profileLoading } = useProfile();
  const supabase = createClient();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // CV data state
  const [cvData, setCVData] = useState<CVDraft>(initialCVDraft);

  // Template selection state (for step 7)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern-minimal');

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Admin state for test data button
  const [isAdmin, setIsAdmin] = useState(false);

  // Auto-save hook
  const { lastSaved, isSavingDraft, saveDraft, loadDraft, hasDraft, clearDraft } = useAutoSave(cvData);

  // Check for existing draft on mount
  useEffect(() => {
    const existingDraft = loadDraft();
    if (existingDraft) {
      // Show recovery option handled in Step1
    }
  }, [loadDraft]);

  // Check admin status on mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('role')
            .eq('id', user.id)
            .eq('role', 'super_admin')
            .maybeSingle();

          setIsAdmin(!!adminData);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdminStatus();
  }, [supabase]);

  // Fill with test data (admin only)
  const fillTestData = useCallback(() => {
    setCVData(TEST_CV_DATA);
    setCompletedSteps([0, 1, 2, 3, 4, 5]); // Mark all steps as completed
  }, []);

  // Update CV data helper
  const updateCVData = useCallback((updates: Partial<CVDraft>) => {
    setCVData(prev => ({ ...prev, ...updates }));
  }, []);

  // Restore draft
  const restoreDraft = useCallback((draft: CVDraft) => {
    setCVData(draft);
  }, []);

  // Validation for each step
  const canProceedFromStep = useCallback((step: number): boolean => {
    switch (step) {
      case 0: // Basic Info - validate profile has required fields
        // Check profile OR cvData (in case of draft restore)
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
      case 1: // Summary - optional but encouraged
        return true;
      case 2: // Experience - at least one OR skip
        return true; // Can skip
      case 3: // Education - at least one OR skip
        return true; // Can skip
      case 4: // Skills - optional
        return true;
      case 5: // Languages - optional
        return true;
      case 6: // Review - check minimum requirements
        const hasExperience = cvData.experience.length > 0 &&
          cvData.experience.some(exp => exp.position?.trim() && exp.company?.trim());
        const hasEducation = cvData.education.length > 0 &&
          cvData.education.some(edu => edu.degree?.trim() && edu.institution?.trim());
        return hasExperience || hasEducation;
      default:
        return true;
    }
  }, [cvData, profile]);

  // Navigation handlers
  const goToNextStep = useCallback(() => {
    if (currentStep < STEPS.length - 1 && canProceedFromStep(currentStep)) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      setCurrentStep(prev => prev + 1);
      // Save draft
      saveDraft();
    }
  }, [currentStep, canProceedFromStep, completedSteps, saveDraft]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    // Can only go to completed steps or current step
    if (step <= currentStep || completedSteps.includes(step)) {
      setCurrentStep(step);
    }
  }, [currentStep, completedSteps]);

  // Convert draft to CVMetadata for saving/export
  const buildCVMetadata = useCallback((): CVMetadata => {
    return {
      personalInfo: {
        fullName: cvData.personalInfo.fullName || '',
        email: cvData.personalInfo.email || '',
        phone: cvData.personalInfo.phone,
        address: cvData.personalInfo.address,
        linkedIn: cvData.personalInfo.linkedIn,
        location: cvData.personalInfo.address,
      },
      summary: cvData.summary || undefined,
      experience: cvData.experience
        .filter(exp => exp.position?.trim() && exp.company?.trim())
        .map(exp => ({
          position: exp.position || '',
          company: exp.company || '',
          location: exp.location,
          startDate: exp.startDate || '',
          endDate: exp.endDate,
          // Filter out empty lines from description
          description: Array.isArray(exp.description)
            ? exp.description.filter(line => line.trim())
            : exp.description || [],
          achievements: exp.achievements,
        })),
      education: cvData.education
        .filter(edu => edu.degree?.trim() && edu.institution?.trim())
        .map(edu => ({
          degree: edu.degree || '',
          institution: edu.institution || '',
          location: edu.location,
          graduationYear: edu.graduationYear,
          description: edu.description,
        })),
      skills: cvData.skills.filter(skill => skill.skills.length > 0),
      languages: cvData.languages.filter(lang => lang.language.trim()),
      certifications: cvData.certifications.filter(cert => cert.name.trim()),
    };
  }, [cvData]);

  // Convert CVMetadata to plain text for storage
  const buildCVText = useCallback((metadata: CVMetadata): string => {
    const lines: string[] = [];

    // Personal info
    lines.push(metadata.personalInfo.fullName);
    if (metadata.personalInfo.email) lines.push(metadata.personalInfo.email);
    if (metadata.personalInfo.phone) lines.push(metadata.personalInfo.phone);
    if (metadata.personalInfo.address) lines.push(metadata.personalInfo.address);
    lines.push('');

    // Summary
    if (metadata.summary) {
      lines.push('SAMMANFATTNING');
      lines.push(metadata.summary);
      lines.push('');
    }

    // Experience
    if (metadata.experience.length > 0) {
      lines.push('ARBETSLIVSERFARENHET');
      metadata.experience.forEach(exp => {
        lines.push(`${exp.position} - ${exp.company}`);
        if (exp.startDate) lines.push(`${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ' - Pågående'}`);
        if (exp.description) {
          exp.description.forEach(desc => lines.push(`• ${desc}`));
        }
        lines.push('');
      });
    }

    // Education
    if (metadata.education.length > 0) {
      lines.push('UTBILDNING');
      metadata.education.forEach(edu => {
        lines.push(`${edu.degree} - ${edu.institution}`);
        if (edu.graduationYear) lines.push(edu.graduationYear);
        lines.push('');
      });
    }

    // Skills
    if (metadata.skills.length > 0) {
      lines.push('KOMPETENSER');
      metadata.skills.forEach(skillGroup => {
        if (skillGroup.skills.length > 0) {
          lines.push(skillGroup.skills.join(', '));
        }
      });
      lines.push('');
    }

    // Languages
    if (metadata.languages && metadata.languages.length > 0) {
      lines.push('SPRÅK');
      metadata.languages.forEach(lang => {
        lines.push(`${lang.language}: ${lang.proficiency}`);
      });
      lines.push('');
    }

    return lines.join('\n');
  }, []);

  // Handle complete wizard
  const handleComplete = useCallback(async (action: 'save' | 'download' | 'both') => {
    setIsSaving(true);

    try {
      const metadata = buildCVMetadata();
      const cvText = buildCVText(metadata);
      const fileName = `CV - ${cvData.personalInfo.fullName || 'Nytt CV'}`;

      if (action === 'save' || action === 'both') {
        // Save to database
        const response = await fetch('/api/cv/save-improved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName,
            improvedText: cvText, // Required by API
            structuredData: metadata,
            originalCvId: null, // New CV, not improving existing
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Kunde inte spara CV');
        }

        // Clear draft after successful save
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
        // Generate PDF
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

        // Download the PDF
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

      // Bekräftelse visas nu i Step7Review istället för redirect
    } catch (error) {
      console.error('Error completing wizard:', error);
      // Kasta vidare felet så att Step7Review kan hantera det
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [buildCVMetadata, buildCVText, cvData.personalInfo.fullName, selectedTemplate, clearDraft, successWithMascotAndActivity]);

  // Render current step content
  const renderStepContent = () => {
    const commonProps = {
      cvData,
      updateCVData,
    };

    switch (currentStep) {
      case 0:
        return (
          <Step1BasicInfo
            {...commonProps}
            hasDraft={hasDraft}
            onRestoreDraft={restoreDraft}
            loadDraft={loadDraft}
            clearDraft={clearDraft}
          />
        );
      case 1:
        return <Step2Summary {...commonProps} />;
      case 2:
        return <Step3Experience {...commonProps} />;
      case 3:
        return <Step4Education {...commonProps} />;
      case 4:
        return <Step5Skills {...commonProps} />;
      case 5:
        return <Step6Languages {...commonProps} />;
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
      {/* Header with Progress Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1 text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Tillbaka till Dashboard</span>
              <span className="sm:hidden">Tillbaka</span>
            </button>

            <div className="flex items-center gap-3">
              {/* Admin Test Data Button */}
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fillTestData}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50 hover:border-orange-400"
                >
                  <Bug className="w-4 h-4 mr-1" />
                  Fyll testdata
                </Button>
              )}

              {lastSaved && (
                <span className="text-xs text-gray-500">
                  {isSavingDraft ? 'Sparar...' : `Sparad ${lastSaved.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}`}
                </span>
              )}
            </div>
          </div>

          <CVCreatorProgressBar
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={goToStep}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Suspense fallback={<StepSkeleton />}>
                {renderStepContent()}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Footer */}
      {currentStep < 6 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:p-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStep === 0}
              className="min-h-[48px] md:min-h-[44px]"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Tillbaka
            </Button>

            <Button
              onClick={goToNextStep}
              disabled={!canProceedFromStep(currentStep)}
              className="min-h-[48px] md:min-h-[44px] bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
            >
              {currentStep === 5 ? 'Granska CV' : 'Nästa'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Spacer for fixed footer */}
      {currentStep < 6 && <div className="h-24" />}
    </div>
  );
}
