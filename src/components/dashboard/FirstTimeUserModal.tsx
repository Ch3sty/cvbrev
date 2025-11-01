'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

interface FirstTimeUserModalProps {
  onClose: () => void;
  onSkip: () => void;
}

export default function FirstTimeUserModal({ onClose, onSkip }: FirstTimeUserModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const supabase = getSupabaseClient();

  const steps = [
    {
      title: 'Välkommen till Jobbcoach.ai! 👋',
      description: 'Vi hjälper dig att skapa professionella personliga brev och optimera din jobbansökan med AI.',
      icon: Sparkles,
      action: null
    },
    {
      title: 'Låt oss komma igång på 3 minuter',
      description: 'För att ge dig bästa möjliga resultat behöver vi ditt CV.',
      icon: Upload,
      action: 'upload_cv'
    },
    {
      title: 'Därefter skapar vi ditt första brev',
      description: 'Välj en tjänst du vill söka och vi genererar ett skräddarsytt personligt brev åt dig.',
      icon: FileText,
      action: 'create_letter'
    }
  ];

  async function handleStart() {
    try {
      // Markera onboarding som startad
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({
            onboarding_started_at: new Date().toISOString(),
            onboarding_step: 1
          })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error marking onboarding as started:', error);
    }

    // Gå direkt till CV-uppladdning
    onClose();
    router.push('/dashboard/profil/cv?onboarding=true');
  }

  async function handleSkip() {
    try {
      // Markera onboarding som skipped
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({
            onboarding_skipped: true,
            onboarding_started_at: new Date().toISOString()
          })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error marking onboarding as skipped:', error);
    }

    onSkip();
  }

  const CurrentIcon = steps[currentStep].icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleSkip();
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-r from-blue-500 to-indigo-600">
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <CurrentIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {steps[currentStep].title}
                </h2>
                <p className="text-blue-100">
                  {steps[currentStep].description}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-8">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-blue-500'
                      : index < currentStep
                      ? 'w-2 bg-emerald-500'
                      : 'w-2 bg-slate-300'
                  }`}
                />
              ))}
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                          <h4 className="font-semibold text-slate-900">AI-genererade brev</h4>
                        </div>
                        <p className="text-sm text-slate-600">
                          Skapa skräddarsydda personliga brev på sekunder
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <h4 className="font-semibold text-slate-900">CV-analys</h4>
                        </div>
                        <p className="text-sm text-slate-600">
                          Få professionell feedback på ditt CV
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="w-5 h-5 text-teal-500" />
                          <h4 className="font-semibold text-slate-900">LinkedIn-optimering</h4>
                        </div>
                        <p className="text-sm text-slate-600">
                          Förbättra din synlighet på LinkedIn
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="w-5 h-5 text-amber-500" />
                          <h4 className="font-semibold text-slate-900">CV-mallar</h4>
                        </div>
                        <p className="text-sm text-slate-600">
                          Designa professionella CV:n med premiummallar
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">
                            Varför behöver vi ditt CV?
                          </h4>
                          <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span>Vi analyserar din kompetens och erfarenhet</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span>Personliga brev blir skräddarsydda för dig</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span>Jobbrekommendationer baseras på din profil</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <p className="text-xs text-slate-600 flex items-start gap-2">
                        <span className="text-slate-400">🔒</span>
                        <span>
                          Din data är säker. Vi använder branschledande säkerhet och GDPR-säkra processer.
                          Ditt CV delas aldrig med tredje part.
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="p-6 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
                      <h4 className="font-semibold text-slate-900 mb-3">
                        Vad händer härnäst?
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                            1
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">Ladda upp ditt CV</p>
                            <p className="text-sm text-slate-600">PDF, Word eller textfil (max 5MB)</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                            2
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">Klistra in en jobbannons</p>
                            <p className="text-sm text-slate-600">Från vilken jobbsajt som helst</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                            3
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">Få ditt personliga brev</p>
                            <p className="text-sm text-slate-600">AI:n genererar ett skräddarsytt brev på 30 sekunder</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-600">
                        ⏱️ Hela processen tar mindre än <strong>3 minuter</strong>
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <button
                onClick={handleSkip}
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Hoppa över
              </button>
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-6 py-2.5 text-slate-700 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                  >
                    Tillbaka
                  </button>
                )}
                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center gap-2"
                  >
                    Nästa
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleStart}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center gap-2"
                  >
                    Kom igång nu!
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
