'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/use-profile';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { logUserActivity } from '@/lib/activity-logger';

export default function InstallningarPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { profile, subscriptionTier } = useProfile();

  // State för kontoborttagning
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [deleteAccountConfirmText, setDeleteAccountConfirmText] = useState('');
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState('');

  // Funktion för att radera konto
  const confirmDeleteAccount = async () => {
    if (deleteAccountConfirmText !== 'radera mitt konto') {
      return;
    }

    try {
      setDeleteAccountLoading(true);
      setDeleteAccountError('');

      // 1. Logga aktiviteten först
      if (profile) {
        await logUserActivity(
          profile.id,
          'registered',
          'Användaren raderade sitt konto',
          {
            email: profile.email,
            subscription_tier: subscriptionTier,
            timestamp: new Date().toISOString()
          }
        );
      }

      // 2. Ta bort alla CV-filer och relaterad data
      const cvDeleteResponse = await fetch('/api/cv', {
        method: 'DELETE'
      });

      if (!cvDeleteResponse.ok) {
        console.warn('Kunde inte ta bort alla CV-data, men fortsätter med kontoborttagning');
      }

      // 3. Ta bort alla sparade brev
      try {
        const letterDeleteResponse = await fetch('/api/letters', {
          method: 'DELETE'
        });

        if (!letterDeleteResponse.ok) {
          console.warn('Kunde inte ta bort alla brev, men fortsätter med kontoborttagning');
        }
      } catch (err) {
        console.warn('API-rutt för borttagning av brev saknas eller är otillgänglig');
      }

      // 4. Ta bort kontot via Supabase Auth API
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        profile?.id || ''
      );

      if (deleteError) {
        if (deleteError.message.includes('permissions')) {
          // Fallback: Om vi inte har admin-rättigheter
          try {
            await supabase.auth.signOut();
            const { error: clientDeleteError } = await supabase.rpc('delete_user_account');

            if (clientDeleteError) {
              throw clientDeleteError;
            }
          } catch (rpcError: any) {
            throw new Error(`Kontoborttagning via RPC misslyckades: ${rpcError.message}`);
          }
        } else {
          throw deleteError;
        }
      }

      // 5. Videbefordra till startsidan
      router.push('/');

    } catch (error: any) {
      console.error('Fel vid borttagning av konto:', error);
      setDeleteAccountError('Ett fel uppstod vid borttagning av kontot: ' + (error.message || 'Okänt fel'));
      setDeleteAccountLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6 md:mb-8"
      >
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0">
            <Settings className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent truncate">
              Inställningar
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1 font-medium">Hantera ditt konto och säkerhet</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4 sm:space-y-6">
        {/* Sessionshantering */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200/50 shadow-xl"
        >
          <div className="pb-4 sm:pb-6 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2 flex items-center">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-md sm:rounded-lg mr-1.5 sm:mr-2 flex-shrink-0">
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              </div>
              Sessionshantering
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Hantera aktiva sessioner och inloggningsstatus för ditt konto.
            </p>
            <motion.button
              onClick={async () => {
                if (profile) {
                  logUserActivity(
                    profile.id,
                    'logout',
                    'Användaren loggade ut',
                    { from_page: 'profile_settings' }
                  ).catch(e => console.error('Loggningsfel:', e));
                }

                await supabase.auth.signOut();
                router.push('/login');
              }}
              className="flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all touch-manipulation text-sm sm:text-base"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Logga ut
            </motion.button>
          </div>
        </motion.div>

        {/* Kontoborttagning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200/50 shadow-xl"
        >
          <h3 className="text-base sm:text-lg font-semibold text-red-600 mb-1.5 sm:mb-2 flex items-center">
            <div className="p-1.5 sm:p-2 bg-red-100 rounded-md sm:rounded-lg mr-1.5 sm:mr-2 flex-shrink-0">
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
            </div>
            Radera konto
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-5">
            Om du raderar ditt konto tas all din data, CV:n och personliga brev bort permanent.
            Denna åtgärd kan inte ångras.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 p-3 sm:p-4 border border-yellow-200 rounded-lg sm:rounded-xl mb-3 sm:mb-4"
          >
            <div className="flex items-start">
              <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-md sm:rounded-lg mr-2 sm:mr-3 flex-shrink-0">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-yellow-900 font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">Viktigt att tänka på</h4>
                <ul className="text-xs sm:text-sm text-yellow-800 list-disc pl-4 space-y-1">
                  <li>All din personliga information kommer att raderas</li>
                  <li>Dina uppladdade CV:n och sparade brev förloras</li>
                  <li>Du kan inte återställa ditt konto efter borttagning</li>
                  {subscriptionTier === 'premium' && (
                    <li className="font-medium">Din premium-prenumeration kommer inte att avslutas automatiskt. Du måste separat avsluta den via Stripe kundportal.</li>
                  )}
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.button
            onClick={() => setShowDeleteAccountConfirm(true)}
            className="flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg sm:rounded-xl font-medium shadow-lg hover:shadow-xl transition-all touch-manipulation text-sm sm:text-base"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Radera mitt konto
          </motion.button>
        </motion.div>
      </div>

      {/* Delete Account confirmation modal */}
      <AnimatePresence>
        {showDeleteAccountConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4"
            onClick={() => {
              setShowDeleteAccountConfirm(false);
              setDeleteAccountConfirmText('');
              setDeleteAccountError('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                  <div className="p-1.5 sm:p-2 bg-red-100 rounded-md sm:rounded-lg mr-2 flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  </div>
                  Radera konto
                </h3>
              </div>

              <div className="p-4 sm:p-6">
                <p className="text-xs sm:text-sm md:text-base text-gray-700 mb-3 sm:mb-4">
                  Är du absolut säker på att du vill radera ditt konto? Denna åtgärd kan <span className="text-red-600 font-bold">inte ångras</span>.
                </p>

                <div className="mb-4 sm:mb-5">
                  <label htmlFor="delete-confirm" className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                    Skriv "<span className="font-semibold text-gray-900">radera mitt konto</span>" för att bekräfta:
                  </label>
                  <input
                    id="delete-confirm"
                    type="text"
                    value={deleteAccountConfirmText}
                    onChange={(e) => setDeleteAccountConfirmText(e.target.value)}
                    placeholder="radera mitt konto"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm sm:text-base"
                  />
                </div>

                {deleteAccountError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 rounded-r"
                  >
                    <p className="text-red-700 text-xs sm:text-sm">{deleteAccountError}</p>
                  </motion.div>
                )}
              </div>

              <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 bg-gray-50">
                <motion.button
                  onClick={() => {
                    setShowDeleteAccountConfirm(false);
                    setDeleteAccountConfirmText('');
                    setDeleteAccountError('');
                  }}
                  className="px-4 sm:px-6 py-2 bg-white text-gray-700 rounded-lg sm:rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base touch-manipulation order-2 sm:order-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Avbryt
                </motion.button>
                <motion.button
                  onClick={confirmDeleteAccount}
                  disabled={deleteAccountConfirmText !== 'radera mitt konto' || deleteAccountLoading}
                  className={`px-4 sm:px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg sm:rounded-xl flex items-center justify-center transition-all font-medium shadow-lg touch-manipulation text-sm sm:text-base order-1 sm:order-2
                    ${deleteAccountConfirmText !== 'radera mitt konto' ? 'opacity-50 cursor-not-allowed' : 'hover:from-red-700 hover:to-pink-700'}`}
                  whileHover={deleteAccountConfirmText === 'radera mitt konto' && !deleteAccountLoading ? { scale: 1.02, y: -2 } : {}}
                  whileTap={deleteAccountConfirmText === 'radera mitt konto' && !deleteAccountLoading ? { scale: 0.98 } : {}}
                >
                  {deleteAccountLoading ? (
                    <>
                      <motion.div
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span className="text-sm sm:text-base">Tar bort...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2"/>
                      <span className="text-sm sm:text-base">Radera permanent</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
