'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Palette,
  Settings,
  Wand2,
  Download,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Crown,
  User,
  Linkedin
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CVGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCV: any;
  selectedTemplate: any;
  onGenerate: (options: any) => Promise<void>;
  isGenerating: boolean;
}

interface GenerationStep {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
}

const GENERATION_STEPS: GenerationStep[] = [
  {
    id: 'review',
    title: 'Granska val',
    subtitle: 'Kontrollera ditt CV och vald mall',
    icon: FileText,
    color: 'blue'
  },
  {
    id: 'customize',
    title: 'Anpassa',
    subtitle: 'Välj dina anpassningsalternativ',
    icon: Settings,
    color: 'purple'
  },
  {
    id: 'generate',
    title: 'Generera',
    subtitle: 'AI skapar ditt professionella CV',
    icon: Wand2,
    color: 'pink'
  },
  {
    id: 'download',
    title: 'Ladda ner',
    subtitle: 'Ditt CV är redo för nedladdning',
    icon: Download,
    color: 'green'
  }
];

export default function CVGenerationModal({
  isOpen,
  onClose,
  selectedCV,
  selectedTemplate,
  onGenerate,
  isGenerating
}: CVGenerationModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [includePhoto, setIncludePhoto] = useState(true);
  const [includeLinkedIn, setIncludeLinkedIn] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const canCustomize = selectedTemplate?.id === 'platinum-executive' ||
                      selectedTemplate?.id === 'nordic-professional' ||
                      selectedTemplate?.id === 'creative-minimal';

  const progress = ((currentStep + 1) / GENERATION_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < GENERATION_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    const options = canCustomize ? {
      includePhoto,
      includeLinkedIn
    } : {};

    await onGenerate(options);
    setIsCompleted(true);
    setCurrentStep(3); // Move to download step
  };

  const resetModal = () => {
    setCurrentStep(0);
    setIsCompleted(false);
    setIncludePhoto(true);
    setIncludeLinkedIn(true);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const getStepColor = (step: GenerationStep, index: number) => {
    if (index < currentStep) return 'text-green-600 bg-green-50';
    if (index === currentStep) {
      switch (step.color) {
        case 'blue': return 'text-blue-600 bg-blue-50';
        case 'purple': return 'text-purple-600 bg-purple-50';
        case 'pink': return 'text-pink-600 bg-pink-50';
        case 'green': return 'text-green-600 bg-green-50';
        default: return 'text-gray-600 bg-gray-50';
      }
    }
    return 'text-gray-400 bg-gray-50';
  };

  const renderStepContent = () => {
    const step = GENERATION_STEPS[currentStep];

    switch (step.id) {
      case 'review':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* CV Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Valt CV
                </h3>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{selectedCV?.file_name}</p>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {selectedCV?.cv_text?.substring(0, 150)}...
                  </p>
                </div>
              </div>

              {/* Template Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  Vald Mall
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{selectedTemplate?.name}</p>
                    {selectedTemplate?.tier === 'premium' && (
                      <Badge className="bg-amber-100 text-amber-800">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{selectedTemplate?.description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'customize':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {canCustomize ? (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Anpassningsalternativ
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-600" />
                      <div>
                        <Label htmlFor="include-photo" className="font-medium text-gray-900 cursor-pointer">
                          Inkludera profilbild
                        </Label>
                        <p className="text-sm text-gray-600">Lägg till en profilbild i ditt CV</p>
                      </div>
                    </div>
                    <Switch
                      id="include-photo"
                      checked={includePhoto}
                      onCheckedChange={setIncludePhoto}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <Linkedin className="w-5 h-5 text-blue-600" />
                      <div>
                        <Label htmlFor="include-linkedin" className="font-medium text-gray-900 cursor-pointer">
                          Inkludera LinkedIn-länk
                        </Label>
                        <p className="text-sm text-gray-600">Visa din LinkedIn-profil i CV:t</p>
                      </div>
                    </div>
                    <Switch
                      id="include-linkedin"
                      checked={includeLinkedIn}
                      onCheckedChange={setIncludeLinkedIn}
                    />
                  </div>
                </div>

                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-700 font-medium">
                    {includePhoto && includeLinkedIn ? '💼 Executive Layout med foto & LinkedIn' :
                     includePhoto && !includeLinkedIn ? '📸 Professional Layout med foto' :
                     !includePhoto && includeLinkedIn ? '💼 Business Layout med LinkedIn' :
                     '✨ Clean Layout utan extra element'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Ingen anpassning tillgänglig</h3>
                <p className="text-gray-600">
                  Denna mall har en fast design som är optimerad för professionell användning.
                </p>
              </div>
            )}
          </motion.div>
        );

      case 'generate':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <motion.div
              animate={isGenerating ? { rotate: 360 } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-6"
            >
              <Wand2 className="w-16 h-16 text-pink-600" />
            </motion.div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isGenerating ? 'Skapar ditt CV...' : 'Redo att skapa ditt CV'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {isGenerating
                ? 'AI:n arbetar med att skapa ett professionellt CV baserat på din information och valda mall.'
                : 'Klicka på "Skapa CV" för att låta AI:n generera ditt professionella CV.'
              }
            </p>

            {isGenerating && (
              <motion.div
                className="mt-6 max-w-xs mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Progress value={75} className="h-2" />
                <p className="text-sm text-gray-500 mt-2">Bearbetar...</p>
              </motion.div>
            )}
          </motion.div>
        );

      case 'download':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-6" />
            </motion.div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              CV skapat framgångsrikt!
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Ditt professionella CV har skapats och nedladdningen har startat automatiskt.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto"
            >
              <p className="text-sm text-green-700">
                💡 <strong>Tips:</strong> Granska ditt CV och gör eventuella justeringar innan du skickar det till arbetsgivare.
              </p>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white/95 backdrop-blur-xl border border-gray-200/80">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-pink-600" />
            Skapa ditt CV
          </DialogTitle>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Steg {currentStep + 1} av {GENERATION_STEPS.length}
              </span>
              <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex justify-center space-x-4 py-6 border-b border-gray-100">
          {GENERATION_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <motion.div
                key={step.id}
                className="flex flex-col items-center space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-100 text-green-600'
                      : getStepColor(step, index)
                  }`}
                  whileHover={{ scale: 1.05 }}
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </motion.div>
                <div className="text-center">
                  <p className={`text-xs font-medium ${
                    isActive ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center border-t border-gray-200 pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Föregående
          </Button>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="text-gray-600 hover:text-gray-800"
            >
              Avbryt
            </Button>

            {currentStep === GENERATION_STEPS.length - 1 ? (
              <Button
                onClick={handleClose}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Klar
              </Button>
            ) : currentStep === 2 ? (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Skapar...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Skapa CV
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white flex items-center gap-2"
              >
                Nästa
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}