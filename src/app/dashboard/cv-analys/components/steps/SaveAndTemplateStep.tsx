// src/components/cv/analysis/steps/SaveAndTemplateStep.tsx
'use client';

import { useState } from 'react';
import { Save, Download, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/card';
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

export default function SaveAndTemplateStep({
  improvedCV,
  saveChoice,
  onChoiceChange,
  selectedTemplate,
  onTemplateChange,
  customName,
  onNameChange,
  isSaving
}: SaveAndTemplateStepProps) {
  const { cvCount, maxCvs, canSave, subscriptionTier, loading } = useCvQuota();
  const { profile } = useProfile();
  const [quotaRefreshKey, setQuotaRefreshKey] = useState(0);
  const [showTips, setShowTips] = useState(false);

  const nameSuggestions = generateCVNameSuggestions();
  const selectedTemplateData = selectedTemplate ? (getTemplateById(selectedTemplate) || null) : null;

  // Get actual user profile data for photo and LinkedIn
  const userProfile = {
    hasPhoto: !!profile?.profile_photo_url,
    hasLinkedIn: !!profile?.linkedin_url
  };

  const handleQuotaRefresh = () => {
    setQuotaRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Laddar...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Kompakt Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 mb-3">
          <Download className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Spara & Ladda ner</h3>
      </div>

      {/* Välj hur du vill hantera ditt CV */}
      <Card className="p-6 bg-white border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Välj vad du vill göra med ditt förbättrade CV:</h4>

        <div className="grid grid-cols-1 gap-4 mb-6">
          {/* 1. Spara & Ladda ned */}
          <button
            type="button"
            onClick={() => onChoiceChange('save-and-download')}
            disabled={isSaving || !canSave}
            className={`relative p-5 rounded-xl border-2 transition-all min-h-[88px] touch-manipulation ${
              saveChoice === 'save-and-download'
                ? 'border-green-500 bg-green-50 shadow-lg'
                : !canSave
                ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                : isSaving
                ? 'border-gray-300 bg-gray-100 cursor-wait'
                : 'border-gray-300 bg-white hover:border-green-300 hover:bg-green-50/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Save className="w-5 h-5 text-green-600" />
                <Download className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900 mb-1">Spara på Jobbcoach.ai & Ladda ned</div>
                <p className="text-sm text-gray-600">
                  Spara i ditt CV-bibliotek och ladda ned PDF automatiskt
                </p>
                {canSave && (
                  <p className="text-xs text-green-700 mt-1 font-medium">
                    {cvCount}/{maxCvs} platser använda
                  </p>
                )}
                {!canSave && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    Fullt ({cvCount}/{maxCvs}) - Ta bort gamla CV:n först
                  </p>
                )}
              </div>
            </div>
          </button>

          {/* 2. Bara ladda ned */}
          <button
            type="button"
            onClick={() => onChoiceChange('download')}
            disabled={isSaving}
            className={`relative p-5 rounded-xl border-2 transition-all min-h-[88px] touch-manipulation ${
              saveChoice === 'download'
                ? 'border-purple-500 bg-purple-50 shadow-lg'
                : isSaving
                ? 'border-gray-300 bg-gray-100 cursor-wait'
                : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <Download className="w-5 h-5 text-purple-600" />
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900 mb-1">Ladda ned CV</div>
                <p className="text-sm text-gray-600">
                  Ladda ned PDF direkt utan att spara i biblioteket
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Du kan alltid ladda upp det senare
                </p>
              </div>
            </div>
          </button>

          {/* 3. Bara spara */}
          <button
            type="button"
            onClick={() => onChoiceChange('save')}
            disabled={isSaving || !canSave}
            className={`relative p-5 rounded-xl border-2 transition-all min-h-[88px] touch-manipulation ${
              saveChoice === 'save'
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : !canSave
                ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                : isSaving
                ? 'border-gray-300 bg-gray-100 cursor-wait'
                : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <Save className="w-5 h-5 text-blue-600" />
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900 mb-1">Spara CV på Jobbcoach.ai</div>
                <p className="text-sm text-gray-600">
                  Spara i ditt CV-bibliotek (ingen nedladdning)
                </p>
                {canSave && (
                  <p className="text-xs text-blue-700 mt-1 font-medium">
                    {cvCount}/{maxCvs} platser använda
                  </p>
                )}
                {!canSave && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    Fullt ({cvCount}/{maxCvs}) - Ta bort gamla CV:n först
                  </p>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Namn input - visas bara om man väljer att spara */}
        {(saveChoice === 'save' || saveChoice === 'save-and-download') && (
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 block">CV-namn</span>
              <input
                type="text"
                value={customName}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder={nameSuggestions[0] || "Mitt CV 2026"}
                className="w-full px-4 py-3 md:py-2.5 text-base md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 min-h-[48px]"
              />
            </label>

            {/* Tips-sektion - fällbar */}
            <button
              type="button"
              onClick={() => setShowTips(!showTips)}
              className="mt-3 w-full text-left flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              <span className="font-medium">Namnförslag</span>
              <span className="ml-auto text-gray-400">{showTips ? '−' : '+'}</span>
            </button>

            {showTips && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                <p className="font-medium mb-1">💡 Tips för beskrivande namn:</p>
                <ul className="space-y-1 list-disc list-inside text-blue-800">
                  <li>Inkludera roll: "Frontend Developer CV 2026"</li>
                  <li>Inkludera bransch: "Säljare - Detaljhandel"</li>
                  <li>Inkludera månad för versionshantering</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Quota manager - visas om biblioteket är fullt */}
        {!canSave && (saveChoice === 'save' || saveChoice === 'save-and-download') && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <CVQuotaManager
              key={quotaRefreshKey}
              cvCount={cvCount}
              maxCvs={maxCvs}
              subscriptionTier={subscriptionTier}
              onCVDeleted={handleQuotaRefresh}
            />
          </div>
        )}
      </Card>

      {/* Template Selector med Carousel */}
      <TemplateSelector
        selectedTemplateId={selectedTemplate}
        onSelectTemplate={onTemplateChange}
        subscriptionTier={subscriptionTier as 'free' | 'premium'}
      />

      {/* Template Options (Photo/LinkedIn) */}
      <TemplateOptions
        template={selectedTemplateData}
        userProfile={userProfile}
      />
    </div>
  );
}
