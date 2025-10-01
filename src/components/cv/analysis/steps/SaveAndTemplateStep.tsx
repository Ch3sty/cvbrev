// src/components/cv/analysis/steps/SaveAndTemplateStep.tsx
'use client';

import { useState } from 'react';
import { Save, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CVQuotaManager from '../CVQuotaManager';
import TemplateSelector from '../TemplateSelector';
import { generateCVNameSuggestions } from '@/lib/cv/cvNameSuggestions';
import { useCvQuota } from '@/hooks/useCvQuota';

interface SaveAndTemplateStepProps {
  improvedCV: string;
  onSaveAndDownload: (templateId: string, fileName: string, saveToLibrary: boolean) => Promise<void>;
  isSaving: boolean;
}

export default function SaveAndTemplateStep({
  improvedCV,
  onSaveAndDownload,
  isSaving
}: SaveAndTemplateStepProps) {
  const { cvCount, maxCvs, canSave, subscriptionTier, loading } = useCvQuota();
  const [saveToLibrary, setSaveToLibrary] = useState(canSave);
  const [customName, setCustomName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>('modern-minimal');
  const [quotaRefreshKey, setQuotaRefreshKey] = useState(0);

  const nameSuggestions = generateCVNameSuggestions();

  const handleSave = async () => {
    if (!selectedTemplate) {
      alert('Välj en CV-mall');
      return;
    }

    if (saveToLibrary && !customName) {
      alert('Ange ett namn för ditt CV');
      return;
    }

    await onSaveAndDownload(selectedTemplate, customName || nameSuggestions[0], saveToLibrary);
  };

  const handleQuotaRefresh = () => {
    setQuotaRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Laddar...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
          <Download className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Spara eller ladda ner
        </h3>
        <p className="text-gray-600">
          Välj mall och spara ditt förbättrade CV
        </p>
      </div>

      {/* Save Options */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <input
            type="checkbox"
            checked={saveToLibrary && canSave}
            onChange={(e) => setSaveToLibrary(e.target.checked && canSave)}
            disabled={!canSave}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500 disabled:opacity-50"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">
              Spara till Jobbcoach.ai
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Spara ditt förbättrade CV i ditt bibliotek för senare användning
            </p>

            {saveToLibrary && canSave && (
              <div className="space-y-3">
                {/* Name Suggestions */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Välj ett namn:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {nameSuggestions.slice(0, 4).map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setCustomName(suggestion)}
                        className={`text-left p-3 rounded-lg border-2 transition-all ${
                          customName === suggestion
                            ? 'border-pink-600 bg-pink-50'
                            : 'border-gray-200 hover:border-pink-300 bg-white'
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {suggestion}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Name Input */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Eller skriv eget namn:
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="t.ex. Mitt förbättrade CV 2025"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                {/* Quota Info */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">{cvCount}/{maxCvs} CV:n sparade</span>
                    {subscriptionTier === 'free' && (
                      <span className="text-gray-600"> (Gratis plan)</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!canSave && (
              <CVQuotaManager
                key={quotaRefreshKey}
                cvCount={cvCount}
                maxCvs={maxCvs}
                subscriptionTier={subscriptionTier}
                onCVDeleted={handleQuotaRefresh}
              />
            )}
          </div>
        </div>
      </Card>

      {/* Template Selection */}
      <TemplateSelector
        selectedTemplateId={selectedTemplate}
        onSelectTemplate={setSelectedTemplate}
        subscriptionTier={subscriptionTier}
      />

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handleSave}
          disabled={!selectedTemplate || isSaving || (saveToLibrary && !canSave && !customName)}
          className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white h-12"
        >
          {isSaving ? (
            <>Bearbetar...</>
          ) : (
            <>
              {saveToLibrary && canSave ? (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Spara & Ladda ner
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Ladda ner
                </>
              )}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
