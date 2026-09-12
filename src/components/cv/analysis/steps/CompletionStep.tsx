// src/components/cv/analysis/steps/CompletionStep.tsx
'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Download, FolderOpen, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CompletionStepProps {
  savedCvId?: string;
  fileName: string;
  onAnalyzeAnother: () => void;
  onDownloadAgain?: () => void;
}

export default function CompletionStep({
  savedCvId,
  fileName,
  onAnalyzeAnother,
  onDownloadAgain
}: CompletionStepProps) {
  return (
    <div className="text-center space-y-8 py-8">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15
        }}
      >
        <div className="mb-6 flex items-center justify-center relative">
          <CheckCircle2 className="w-16 h-16 text-green-600" />
        </div>

        <h3 className="text-3xl font-bold text-gray-900 mb-3">
          Klart!
        </h3>
        <p className="text-lg text-gray-600 mb-2">
          Ditt CV har förbättrats framgångsrikt
        </p>
        <p className="text-sm text-gray-500">
          {fileName}
        </p>
      </motion.div>

      {/* Success Cards */}
      <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <Card className="p-4 bg-white border-blue-200">
          <div className="text-3xl font-bold text-blue-600 mb-1">✓</div>
          <div className="text-sm font-medium text-gray-900">ATS-Optimerat</div>
          <div className="text-xs text-gray-600 mt-1">Redo för tracking-system</div>
        </Card>

        <Card className="p-4 bg-white border-purple-200">
          <div className="text-3xl font-bold text-purple-600 mb-1">✓</div>
          <div className="text-sm font-medium text-gray-900">Förbättrat</div>
          <div className="text-xs text-gray-600 mt-1">Professionellt innehåll</div>
        </Card>

        <Card className="p-4 bg-white border-green-200">
          <div className="text-3xl font-bold text-green-600 mb-1">✓</div>
          <div className="text-sm font-medium text-gray-900">Redo att använda</div>
          <div className="text-xs text-gray-600 mt-1">Börja söka jobb nu</div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
        {onDownloadAgain && (
          <Button
            onClick={onDownloadAgain}
            variant="outline"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Ladda ner igen
          </Button>
        )}

        {savedCvId && (
          <Button
            onClick={() => window.location.href = '/dashboard/profil/cv'}
            variant="outline"
            className="flex-1"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Visa i bibliotek
          </Button>
        )}

        <Button
          onClick={onAnalyzeAnother}
          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Analysera ett annat CV
        </Button>
      </div>

      {/* Tips */}
      <Card className="max-w-2xl mx-auto p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-gray-900 mb-3">💡 Nästa steg:</h4>
        <ul className="text-sm text-gray-700 space-y-2 text-left">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Använd ditt förbättrade CV när du söker jobb</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Skapa ett matchande personligt brev med vår brevgenerator</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Kom ihåg att anpassa ditt CV för varje specifik tjänst</span>
          </li>
        </ul>

        <Button
          onClick={() => window.location.href = '/dashboard/skapa-brev'}
          variant="outline"
          className="w-full mt-4"
        >
          Skapa personligt brev →
        </Button>
      </Card>
    </div>
  );
}
