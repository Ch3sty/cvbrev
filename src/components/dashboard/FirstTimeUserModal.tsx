'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Upload,
  ArrowRight,
  Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

interface FirstTimeUserModalProps {
  onClose: () => void;
  onSkip: () => void;
}

export default function FirstTimeUserModal({ onClose, onSkip }: FirstTimeUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseClient();

  async function handleStart() {
    setIsLoading(true);
    try {
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

    onClose();
    router.push('/dashboard/profil/cv?onboarding=true');
  }

  async function handleSkip() {
    try {
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 pb-4 bg-gradient-to-r from-blue-600 to-indigo-700">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Tre steg till ditt första brev
                </h2>
                <p className="text-blue-100 text-sm mt-0.5">
                  Det tar under 3 minuter.
                </p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="p-6 space-y-5">
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Ladda upp ditt CV</p>
                  <p className="text-sm text-slate-600">Vi analyserar din kompetens och erfarenhet</p>
                </div>
              </div>

              {/* Connector line */}
              <div className="ml-[15px] w-px h-2 bg-slate-200" />

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Klistra in en jobbannons</p>
                  <p className="text-sm text-slate-600">Från valfri jobbsajt</p>
                </div>
              </div>

              {/* Connector line */}
              <div className="ml-[15px] w-px h-2 bg-slate-200" />

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Få ett skräddarsytt brev</p>
                  <p className="text-sm text-slate-600">Vi matchar din profil mot tjänsten du söker</p>
                </div>
              </div>
            </div>

            {/* Privacy note */}
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <Shield className="w-3.5 h-3.5 flex-shrink-0" />
              <span>GDPR-säkert. Delas aldrig med tredje part.</span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-0">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleSkip}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors py-2"
              >
                Jag utforskar själv
              </button>
              <button
                onClick={handleStart}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                Ladda upp ditt CV
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
