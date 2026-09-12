// src/components/cv/analysis/steps/PreviewComparisonStep.tsx
'use client';

import { motion } from 'framer-motion';
import { Eye, CheckCircle2, TrendingUp } from 'lucide-react';
import CVComparisonViewer from '../CVComparisonViewer';

interface PreviewComparisonStepProps {
  originalCV: string;
  improvedCV: string;
  improvementsCount: number;
  atsImprovement: number;
}

export default function PreviewComparisonStep({
  originalCV,
  improvedCV,
  improvementsCount,
  atsImprovement
}: PreviewComparisonStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mb-4 flex items-center justify-center">
          <Eye className="w-8 h-8 text-neutral-700" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Förhandsgranskning
        </h3>
        <p className="text-gray-600">
          Granska ditt förbättrade CV innan du sparar eller laddar ner
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {improvementsCount}
              </div>
              <div className="text-sm text-gray-600">
                Förbättringar tillämpade
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                +{atsImprovement}
              </div>
              <div className="text-sm text-gray-600">
                ATS-poäng förbättring
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Viewer */}
      <CVComparisonViewer
        originalCV={originalCV}
        improvedCV={improvedCV}
      />

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-sm text-blue-900">
          Tryck på <span className="font-semibold">Tillbaka</span> för att ändra dina val,
          eller <span className="font-semibold">Nästa</span> för att fortsätta till nedladdning
        </p>
      </div>
    </div>
  );
}
