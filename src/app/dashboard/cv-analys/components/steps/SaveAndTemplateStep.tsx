'use client';

import { useState } from 'react';
import { Save, Download, Lightbulb, Check } from 'lucide-react';
import CVQuotaManager from '../CVQuotaManager';
import TemplateSelector from '../TemplateSelector';
import TemplateOptions from '../TemplateOptions';
import { generateCVNameSuggestions } from '@/lib/cv/cvNameSuggestions';
import { useCvQuota } from '@/hooks/useCvQuota';
import { getTemplateById } from '@/lib/cv/simple-templates';
import { useProfile } from '@/hooks/use-profile';

interface SaveAndTemplateStepProps {
  improvedCV: string;
  saveChoice: 'save-and-download' | 'download' | 'save' | null;
  onChoiceChange: (choice: 'save-and-download' | 'download' | 'save') => void;
  selectedTemplate: string | null;
  onTemplateChange: (templateId: string | null) => void;
  customName: string;
  onNameChange: (name: string) => void;
  isSaving: boolean;
}

type ChoiceOption = {
  id: 'save-and-download' | 'download' | 'save';
  title: string;
  description: string;
  iconA: typeof Save;
  iconB?: typeof Download;
  needsQuota: boolean;
};

const CHOICES: ChoiceOption[] = [
  {
    id: 'save-and-download',
    title: 'Spara på Jobbcoach.ai & ladda ned',
    description: 'Spara i ditt CV-bibliotek och ladda ned PDF samtidigt.',
    iconA: Save,
    iconB: Download,
    needsQuota: true,
  },
  {
    id: 'download',
    title: 'Ladda ned CV',
    description: 'Ladda ned PDF utan att spara i biblioteket. Du kan ladda upp det senare.',
    iconA: Download,
    needsQuota: false,
  },
  {
    id: 'save',
    title: 'Spara CV på Jobbcoach.ai',
    description: 'Spara i ditt CV-bibliotek utan nedladdning.',
    iconA: Save,
    needsQuota: true,
  },
];

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
  const [showTips, setShowTips] = useState(false);

  const nameSuggestions = generateCVNameSuggestions();
  const selectedTemplateData = selectedTemplate
    ? getTemplateById(selectedTemplate) || null
    : null;

  const userProfile = {
    hasPhoto: !!profile?.profile_photo_url,
    hasLinkedIn: !!profile?.linkedin_url,
  };

  const handleQuotaRefresh = () => setQuotaRefreshKey((prev) => prev + 1);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 mt-3 text-sm">Laddar...</p>
      </div>
    );
  }

  const showNameInput = saveChoice === 'save' || saveChoice === 'save-and-download';

  return (
    <div className="space-y-6">
      {/* Spara-val */}
      <div>
        <h4 className="text-base font-bold text-slate-900 mb-3">
          Vad vill du göra med ditt förbättrade CV?
        </h4>

        <div className="grid grid-cols-1 gap-3">
          {CHOICES.map((choice) => {
            const isSelected = saveChoice === choice.id;
            const isDisabled = (choice.needsQuota && !canSave) || isSaving;

            return (
              <button
                key={choice.id}
                type="button"
                onClick={() => !isDisabled && onChoiceChange(choice.id)}
                disabled={isDisabled}
                className={`relative w-full text-left rounded-2xl border-2 p-4 sm:p-5 transition-all min-h-[80px] focus:outline-none ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/40'
                    : isDisabled
                    ? 'border-slate-200 bg-slate-50/60 opacity-60 cursor-not-allowed'
                    : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/30'
                }`}
                style={{
                  boxShadow: isSelected
                    ? '0 0 0 4px rgba(16, 185, 129, 0.12), 0 8px 20px -8px rgba(16, 185, 129, 0.25)'
                    : '0 1px 2px rgba(0, 0, 0, 0.04)',
                }}
                aria-pressed={isSelected}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white"
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, #10B981, #059669)'
                        : 'linear-gradient(135deg, #F97316, #DC2626)',
                      boxShadow: isSelected
                        ? '0 4px 12px -3px rgba(16, 185, 129, 0.4)'
                        : '0 4px 12px -3px rgba(220, 38, 38, 0.35)',
                    }}
                  >
                    {choice.iconB ? (
                      <div className="flex items-center gap-0.5">
                        <choice.iconA className="w-3.5 h-3.5" strokeWidth={2.5} />
                        <choice.iconB className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </div>
                    ) : (
                      <choice.iconA className="w-5 h-5" strokeWidth={2.25} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-slate-900 text-sm sm:text-base mb-1">
                      {choice.title}
                    </h5>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {choice.description}
                    </p>
                    {choice.needsQuota && (
                      <p
                        className={`text-xs mt-2 font-semibold ${
                          canSave ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {canSave ? (
                          <>
                            {cvCount}/{maxCvs} platser använda
                          </>
                        ) : (
                          <>
                            Biblioteket är fullt ({cvCount}/{maxCvs})
                          </>
                        )}
                      </p>
                    )}
                  </div>

                  {isSelected && (
                    <div
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                      }}
                    >
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Namn-input */}
      {showNameInput && (
        <div className="bg-white rounded-2xl border border-orange-200/50 p-4 sm:p-5 space-y-3">
          <label className="block">
            <span className="text-sm font-semibold text-slate-900 mb-2 block">
              Ge ditt CV ett namn
            </span>
            <input
              type="text"
              value={customName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder={nameSuggestions[0] || 'Mitt CV 2026'}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[48px]"
            />
          </label>

          <button
            type="button"
            onClick={() => setShowTips(!showTips)}
            className="w-full text-left flex items-center gap-2 text-sm text-slate-600 hover:text-orange-700 transition-colors py-1"
          >
            <Lightbulb className="w-4 h-4" />
            <span className="font-semibold">Namnförslag</span>
            <span className="ml-auto text-slate-400">{showTips ? '−' : '+'}</span>
          </button>

          {showTips && (
            <div
              className="p-3 rounded-xl text-xs text-orange-900 leading-relaxed"
              style={{
                background:
                  'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(220, 38, 38, 0.05) 100%)',
                border: '1px solid rgba(249, 115, 22, 0.15)',
              }}
            >
              <p className="font-semibold mb-1.5">Tips för beskrivande namn:</p>
              <ul className="space-y-1 list-disc list-inside text-orange-800">
                <li>Inkludera roll: &quot;Frontend Developer CV 2026&quot;</li>
                <li>Inkludera bransch: &quot;Säljare - Detaljhandel&quot;</li>
                <li>Lägg till månad för versionshantering</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Quota manager om biblioteket fullt */}
      {!canSave && showNameInput && (
        <div className="bg-white rounded-2xl border border-red-200 p-4 sm:p-5">
          <CVQuotaManager
            key={quotaRefreshKey}
            cvCount={cvCount}
            maxCvs={maxCvs}
            subscriptionTier={subscriptionTier}
            onCVDeleted={handleQuotaRefresh}
          />
        </div>
      )}

      {/* Mall-väljare */}
      <div className="bg-white rounded-2xl border border-orange-200/50 p-4 sm:p-5">
        <TemplateSelector
          selectedTemplateId={selectedTemplate}
          onSelectTemplate={onTemplateChange}
          subscriptionTier={subscriptionTier as 'free' | 'premium'}
        />
      </div>

      {/* Mall-options */}
      <TemplateOptions template={selectedTemplateData} userProfile={userProfile} />
    </div>
  );
}
