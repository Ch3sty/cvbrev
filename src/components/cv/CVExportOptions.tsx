'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  FileText,
  Save,
  Calendar,
  Briefcase,
  Target,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Palette,
  Clock
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CVExportOptionsProps {
  improvedCV: string;
  cvId: string;
  onExportComplete?: () => void;
  className?: string;
}

type ExportFormat = 'pdf' | 'docx';
type NamingOption = 'optimized' | 'ats' | 'date' | 'custom';

export default function CVExportOptions({
  improvedCV,
  cvId,
  onExportComplete,
  className = ''
}: CVExportOptionsProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [selectedNaming, setSelectedNaming] = useState<NamingOption>('optimized');
  const [customName, setCustomName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showTemplateOption, setShowTemplateOption] = useState(false);

  const namingOptions = [
    {
      id: 'optimized' as NamingOption,
      label: 'Optimerat CV',
      description: 'Smart namngivning baserat på förbättringar',
      icon: Sparkles,
      example: 'Optimerat CV - 2024-01-15'
    },
    {
      id: 'ats' as NamingOption,
      label: 'ATS-anpassat CV',
      description: 'Fokus på rekryteringssystem',
      icon: Target,
      example: 'ATS-anpassat CV - Senior Developer'
    },
    {
      id: 'date' as NamingOption,
      label: 'Datumbaserat',
      description: 'Inkludera dagens datum',
      icon: Calendar,
      example: 'Uppdaterat CV - 2024-01-15'
    },
    {
      id: 'custom' as NamingOption,
      label: 'Anpassat namn',
      description: 'Välj ditt eget filnamn',
      icon: FileText,
      example: 'Ditt valda namn'
    }
  ];

  const formatOptions = [
    {
      id: 'pdf' as ExportFormat,
      label: 'PDF',
      description: 'Bäst för utskrift och delning',
      icon: FileText,
      recommended: true
    },
    {
      id: 'docx' as ExportFormat,
      label: 'Word',
      description: 'Redigerbar i Microsoft Word',
      icon: FileText,
      recommended: false
    }
  ];

  const generateFilename = (): string => {
    const date = new Date().toLocaleDateString('sv-SE');

    switch (selectedNaming) {
      case 'optimized':
        return `Optimerat CV - ${date}`;
      case 'ats':
        return `ATS-anpassat CV - ${date}`;
      case 'date':
        return `Uppdaterat CV - ${date}`;
      case 'custom':
        return customName || `CV - ${date}`;
      default:
        return `CV - ${date}`;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSaving(false);
    setShowTemplateOption(true);
  };

  const handleExport = async () => {
    setIsExporting(true);

    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsExporting(false);
    onExportComplete?.();
  };

  return (
    <div className={`cv-export-options space-y-6 ${className}`}>
      {/* Format Selection */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          Välj exportformat
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {formatOptions.map((format) => {
            const Icon = format.icon;
            const isSelected = selectedFormat === format.id;

            return (
              <motion.div
                key={format.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  onClick={() => setSelectedFormat(format.id)}
                  className={`
                    cursor-pointer p-4 transition-all duration-200
                    ${isSelected
                      ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-300 shadow-md'
                      : 'bg-white hover:bg-gray-50 border-gray-200'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      p-2 rounded-lg
                      ${isSelected ? 'bg-white shadow-sm' : 'bg-gray-100'}
                    `}>
                      <Icon className={`h-5 w-5 ${isSelected ? 'text-pink-600' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                          {format.label}
                        </span>
                        {format.recommended && (
                          <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                            Rekommenderad
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {format.description}
                      </p>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <CheckCircle2 className="h-5 w-5 text-pink-600" />
                      </motion.div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Naming Options */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Save className="h-4 w-4 text-gray-500" />
          Namngivning
        </h4>
        <div className="space-y-2">
          {namingOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedNaming === option.id;

            return (
              <motion.div
                key={option.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  onClick={() => setSelectedNaming(option.id)}
                  className={`
                    cursor-pointer p-3 transition-all duration-200
                    ${isSelected
                      ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-300'
                      : 'bg-white hover:bg-gray-50 border-gray-200'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      p-1.5 rounded-lg
                      ${isSelected ? 'bg-white shadow-sm' : 'bg-gray-100'}
                    `}>
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-pink-600' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={`font-medium text-sm ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                            {option.label}
                          </span>
                          <p className="text-xs text-gray-500">
                            {option.description}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-pink-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isSelected && option.id === 'custom' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3"
                    >
                      <input
                        type="text"
                        placeholder="Ange filnamn..."
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </motion.div>
                  )}

                  {isSelected && option.id !== 'custom' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="mt-2 text-xs text-gray-500 italic"
                    >
                      Exempel: {option.example}
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Generated Filename Preview */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-1">
              Filnamn förhandsvisning
            </h5>
            <p className="font-mono text-sm text-gray-900">
              {generateFilename()}.{selectedFormat}
            </p>
          </div>
          <div className="text-2xl">📄</div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={isSaving || isExporting}
          variant="outline"
          className="flex-1 bg-white hover:bg-gray-50"
        >
          {isSaving ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Sparar...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Spara på sidan
            </>
          )}
        </Button>

        <Button
          onClick={handleExport}
          disabled={isSaving || isExporting}
          className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
        >
          {isExporting ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Exporterar...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Ladda ner
            </>
          )}
        </Button>
      </div>

      {/* Template Option */}
      {showTemplateOption && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  <Palette className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">
                    Vill du applicera en designmall?
                  </h5>
                  <p className="text-sm text-gray-600 mt-1">
                    Gör ditt CV ännu snyggare med våra professionella mallar
                  </p>
                </div>
              </div>
              <Button
                onClick={() => window.location.href = '/dashboard/cv-mallar'}
                size="sm"
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
              >
                Välj mall
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}