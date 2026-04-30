'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TemplateSelector from '../TemplateSelector';
import TemplateInlineOptions from '../save/TemplateInlineOptions';
import SaveActionSegments, { type SaveChoice } from '../save/SaveActionSegments';
import CvFilenameInput from '../save/CvFilenameInput';
import QuotaWarningBanner from '../save/QuotaWarningBanner';
import { generateCVNameSuggestions } from '@/lib/cv/cvNameSuggestions';
import { useCvQuota } from '@/hooks/useCvQuota';
import { getTemplateById } from '@/lib/cv/simple-templates';
import { useProfile } from '@/hooks/use-profile';

interface SaveAndTemplateStepProps {
  improvedCV: string;
  saveChoice: SaveChoice | null;
  onChoiceChange: (choice: SaveChoice) => void;
  selectedTemplate: string | null;
  onTemplateChange: (templateId: string | null) => void;
  customName: string;
  onNameChange: (name: string) => void;
  isSaving: boolean;
}

export default function SaveAndTemplateStep({
  saveChoice,
  onChoiceChange,
  selectedTemplate,
  onTemplateChange,
  customName,
  onNameChange,
  isSaving,
}: SaveAndTemplateStepProps) {
  const { cvCount, maxCvs, canSave, subscriptionTier, loading } = useCvQuota();
  const { profile } = useProfile();
  const [quotaRefreshKey, setQuotaRefreshKey] = useState(0);

  const nameSuggestions = generateCVNameSuggestions();
  const selectedTemplateData = selectedTemplate
    ? getTemplateById(selectedTemplate) || null
    : null;

  const userProfile = {
    hasPhoto: !!profile?.profile_photo_url,
    hasLinkedIn: !!profile?.linkedin_url,
  };

  const handleQuotaRefresh = () => setQuotaRefreshKey((prev) => prev + 1);
  const showFilenameInput =
    saveChoice === 'save' || saveChoice === 'save-and-download';

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 mt-3 text-sm">Laddar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* MALL ÖVERST - huvudfokus */}
      <div
        className="rounded-3xl bg-white overflow-hidden p-4 sm:p-5"
        style={{
          border: '1px solid rgba(249, 115, 22, 0.2)',
          boxShadow: '0 8px 28px -16px rgba(249, 115, 22, 0.18)',
        }}
      >
        <TemplateSelector
          selectedTemplateId={selectedTemplate}
          onSelectTemplate={onTemplateChange}
          subscriptionTier={subscriptionTier as 'free' | 'premium'}
        />

        {/* Inline-options under carousellen */}
        {selectedTemplateData && (
          <div className="mt-4 pt-4 border-t border-orange-200/40">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700">
                  Vald mall
                </div>
                <div className="text-base font-bold text-slate-900 truncate">
                  {selectedTemplateData.name}
                </div>
              </div>
            </div>
            <TemplateInlineOptions
              template={selectedTemplateData}
              userProfile={userProfile}
            />
          </div>
        )}
      </div>

      {/* Quota-warning om biblioteket fullt och man behöver det */}
      {!canSave && showFilenameInput && (
        <QuotaWarningBanner
          key={quotaRefreshKey}
          cvCount={cvCount}
          maxCvs={maxCvs}
          subscriptionTier={subscriptionTier as 'free' | 'premium'}
          onCVDeleted={handleQuotaRefresh}
        />
      )}

      {/* Spara-segments */}
      <SaveActionSegments
        value={saveChoice}
        onChange={onChoiceChange}
        canSave={canSave}
        cvCount={cvCount}
        maxCvs={maxCvs}
        disabled={isSaving}
      />

      {/* Filnamn (om relevant) */}
      <AnimatePresence>
        {showFilenameInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <CvFilenameInput
              value={customName}
              onChange={onNameChange}
              suggestions={nameSuggestions}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
