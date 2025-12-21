'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/use-profile';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfilePhotoUpload } from '@/components/profile/ProfilePhotoUpload';
import { LinkedInInput } from '@/components/profile/LinkedInInput';
import {
  User,
  Save,
  Sparkles,
  Mail,
  Building2,
  Lightbulb,
  Trophy,
  Scale,
  Bot,
  Info,
  AlertTriangle,
  LogOut,
  Trash2,
  Phone,
  MapPin,
  Shield
} from 'lucide-react';
import { useNotification } from '@/context/notificationcontext';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { logUserActivity } from '@/lib/activity-logger';

export default function ProfilPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const {
    profile,
    loading: profileLoading,
    updateProfile,
    subscriptionTier
  } = useProfile();
  const { successWithMascot } = useNotification();

  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'loading' | 'success' | 'error' | 'info';
    isVisible: boolean;
  } | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    linkedin_url: '',
    profile_photo_url: '',
    preferred_tonality: 'professional' as 'professional' | 'creative' | 'enthusiastic' | 'confident' | 'balanced' | 'auto',
    phone: '',
    location: '',
    include_phone_in_letters: false,
    include_location_in_letters: false
  });

  // State för kontoborttagning
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [deleteAccountConfirmText, setDeleteAccountConfirmText] = useState('');
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState('');

  // Tonalitetsalternativ
  const tonalityOptions: Array<{
    value: 'professional' | 'creative' | 'enthusiastic' | 'confident' | 'balanced' | 'auto';
    label: string;
    icon: React.ReactNode;
    description: string;
  }> = [
    { value: 'professional', label: 'Professionell', icon: <Building2 className="w-5 h-5" />, description: 'Formell och saklig ton för företagskommunikation.' },
    { value: 'creative', label: 'Kreativ', icon: <Lightbulb className="w-5 h-5" />, description: 'Personlig och innovativ ton för kreativa branscher.' },
    { value: 'confident', label: 'Självsäker', icon: <Trophy className="w-5 h-5" />, description: 'Bestämd och självförtroende ton för ledarskapsroller.' },
    { value: 'balanced', label: 'Balanserad', icon: <Scale className="w-5 h-5" />, description: 'Lagom formell och personlig – passar de flesta situationer.' },
    { value: 'auto', label: 'Smart val', icon: <Bot className="w-5 h-5" />, description: 'AI väljer automatiskt bästa tonalitet baserat på jobbet och branschen. (Premium)' }
  ];

  // Ladda profildata när komponenten mountas
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        linkedin_url: profile.linkedin_url || '',
        profile_photo_url: profile.profile_photo_url || '',
        preferred_tonality: (profile.preferred_tonality || 'professional') as 'professional' | 'creative' | 'enthusiastic' | 'confident' | 'balanced' | 'auto',
        phone: profile.phone || '',
        location: profile.location || '',
        include_phone_in_letters: profile.include_phone_in_letters || false,
        include_location_in_letters: profile.include_location_in_letters || false
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTonalitySelect = (tonality: 'professional' | 'creative' | 'enthusiastic' | 'confident' | 'balanced' | 'auto') => {
    setFormData(prev => ({ ...prev, preferred_tonality: tonality }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setNotification({ message: 'Sparar dina ändringar...', type: 'loading', isVisible: true });

      // Validera fullständigt namn
      if (!formData.full_name || formData.full_name.trim().length < 2) {
        setNotification({
          message: 'Fullständigt namn måste vara minst 2 tecken långt.',
          type: 'error',
          isVisible: true
        });
        setSaving(false);
        return;
      }

      const success = await updateProfile(formData);

      if (success) {
        setNotification({
          message: 'Dina ändringar har sparats!',
          type: 'success',
          isVisible: true
        });

        // Show mascot notification
        successWithMascot(
          'Din profil har uppdaterats! Ändringarna är nu sparade.',
          '/images/maskot/success-profile-updated.svg',
          4000
        );
      } else {
        throw new Error('Kunde inte spara profilen');
      }
    } catch (error: any) {
      console.error('Profile save error:', error);
      setNotification({
        message: error.message || 'Ett fel uppstod vid sparande',
        type: 'error',
        isVisible: true
      });
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

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

      // 5. Show notification before redirecting
      successWithMascot(
        'Ditt konto har raderats. Tack för att du använde Jobbcoach.ai!',
        '/images/maskot/success-account-deleted.svg',
        4000,
        false // No confetti for account deletion
      );

      // 6. Delay redirect to allow user to see notification
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error: any) {
      console.error('Fel vid borttagning av konto:', error);
      setDeleteAccountError('Ett fel uppstod vid borttagning av kontot: ' + (error.message || 'Okänt fel'));
      setDeleteAccountLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="p-3 sm:p-4 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0">
            <User className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent truncate">
              Profilinformation
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1 font-medium">Hantera dina personliga uppgifter</p>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && notification.isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl border-l-4 text-sm sm:text-base ${
            notification.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
            notification.type === 'error' ? 'bg-red-50 border-red-500 text-red-800' :
            notification.type === 'loading' ? 'bg-blue-50 border-blue-500 text-blue-800' :
            'bg-gray-50 border-gray-500 text-gray-800'
          }`}
        >
          {notification.message}
        </motion.div>
      )}

      {/* Profile Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200/50 shadow-xl"
      >
        <div className="space-y-4 sm:space-y-6">
          {/* Email */}
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Mail className="w-4 h-4 mr-2 text-blue-600" />
              E-postadress
              <span className="ml-1 text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gray-50 text-gray-600 border border-gray-200 cursor-not-allowed text-sm sm:text-base"
            />
            <p className="mt-2 text-xs text-gray-500 flex items-center">
              <Info className="w-3 h-3 mr-1" />
              Din e-postadress är obligatorisk och kan inte ändras
            </p>
          </div>

          {/* Fullständigt namn */}
          <div className="relative">
            <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <User className="w-4 h-4 mr-2 text-purple-600" />
              Fullständigt namn
              <span className="ml-1 text-red-500">*</span>
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Ditt namn"
              required
              minLength={2}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-white text-gray-900 border border-gray-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm sm:text-base"
            />
            <p className="mt-2 text-xs text-gray-500 flex items-center">
              <Info className="w-3 h-3 mr-1" />
              Fullständigt namn är obligatoriskt (minst 2 tecken)
            </p>
          </div>

          {/* Profilbild */}
          <ProfilePhotoUpload
            currentPhotoUrl={formData.profile_photo_url}
            onUploadComplete={(photoUrl) => {
              setFormData(prev => ({ ...prev, profile_photo_url: photoUrl }));
            }}
            onRemovePhoto={() => {
              setFormData(prev => ({ ...prev, profile_photo_url: '' }));
            }}
            onError={(message) => {
              setNotification({
                message,
                type: 'error',
                isVisible: true
              });
            }}
            onSuccess={(message) => {
              setNotification({
                message,
                type: 'success',
                isVisible: true
              });
            }}
            isUploading={saving}
          />

          {/* LinkedIn URL */}
          <LinkedInInput
            value={formData.linkedin_url}
            onChange={(url) => {
              setFormData(prev => ({ ...prev, linkedin_url: url }));
            }}
            disabled={saving}
          />

          {/* Telefonnummer (valfritt) */}
          <div className="relative">
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Phone className="w-4 h-4 mr-2 text-green-600" />
              Telefonnummer (valfritt)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+46 70 123 45 67"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-white text-gray-900 border border-gray-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm sm:text-base"
            />

            {/* Toggle för att inkludera telefon i brev */}
            <div className="mt-3 flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.include_phone_in_letters}
                  onChange={(e) => setFormData(prev => ({ ...prev, include_phone_in_letters: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-700">
                  Inkludera i personliga brev
                </span>
              </label>
            </div>

            <p className="mt-2 text-xs text-gray-500 flex items-center">
              <Info className="w-3 h-3 mr-1 flex-shrink-0" />
              Används endast för personliga brev & CV:n. Aldrig skickas till AI-tjänster.
            </p>
          </div>

          {/* Ort/Plats (valfritt) */}
          <div className="relative">
            <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-orange-600" />
              Ort (valfritt)
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Stockholm"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-white text-gray-900 border border-gray-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm sm:text-base"
            />

            {/* Toggle för att inkludera ort i brev */}
            <div className="mt-3 flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.include_location_in_letters}
                  onChange={(e) => setFormData(prev => ({ ...prev, include_location_in_letters: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-700">
                  Inkludera i personliga brev
                </span>
              </label>
            </div>

            <p className="mt-2 text-xs text-gray-500 flex items-center">
              <Info className="w-3 h-3 mr-1 flex-shrink-0" />
              Används endast för personliga brev & CV:n. Aldrig skickas till AI-tjänster.
            </p>
          </div>

          {/* Integritets-infobox */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 text-sm mb-1">
                  Din integritet är skyddad
                </h4>
                <p className="text-sm text-blue-800">
                  Dina personuppgifter lagras säkert i vår databas och används ENDAST för att formatera dina brev.
                  Vi skickar ALDRIG dessa till externa AI-tjänster. Din data anonymiseras innan den når OpenAI.
                </p>
              </div>
            </div>
          </div>

          {/* Föredragen tonalitet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-pink-600" />
              Föredragen tonalitet
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Din standardton när du skapar nya personliga brev.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
              {tonalityOptions
                .filter(option => !(option.value === 'auto' && subscriptionTier !== 'premium'))
                .map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => handleTonalitySelect(option.value)}
                  className={`
                    flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg sm:rounded-xl text-center border-2 transition-all touch-manipulation
                    ${formData.preferred_tonality === option.value
                      ? 'border-pink-500 bg-pink-50 shadow-lg shadow-pink-500/20'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    }
                    ${option.value === 'auto' && subscriptionTier !== 'premium' ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  disabled={option.value === 'auto' && subscriptionTier !== 'premium'}
                  title={option.value === 'auto' && subscriptionTier !== 'premium' ? 'Kräver Premium' : option.description}
                  whileHover={{ scale: option.value === 'auto' && subscriptionTier !== 'premium' ? 1 : 1.02 }}
                  whileTap={{ scale: option.value === 'auto' && subscriptionTier !== 'premium' ? 1 : 0.98 }}
                >
                  <div className="mb-1.5 sm:mb-2">{option.icon}</div>
                  <span className={`text-xs sm:text-sm font-medium ${formData.preferred_tonality === option.value ? 'text-gray-900' : 'text-gray-700'}`}>
                    {option.label}
                    {option.value === 'auto' && (
                      <span className="ml-1 text-xs text-pink-600">(Premium)</span>
                    )}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Varning om auto vald utan premium */}
            {formData.preferred_tonality === 'auto' && subscriptionTier !== 'premium' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r mb-4"
              >
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-800 text-sm">
                    Smarta tonalitetsval är endast tillgänglig för Premium-medlemmar.
                    <a
                      href="/dashboard/profil/prenumeration"
                      className="ml-1 text-pink-600 hover:text-pink-700 underline font-medium"
                    >
                      Uppgradera här
                    </a>
                  </p>
                </div>
              </motion.div>
            )}

            {/* Beskrivning av vald tonalitet */}
            <div className="p-4 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50">
              {tonalityOptions.find(opt => opt.value === formData.preferred_tonality)?.description || 'Välj en tonalitet ovan.'}
            </div>
          </div>

          {/* Spara-knapp */}
          <div className="pt-4 sm:pt-6">
            <motion.button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center justify-center w-full md:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-pink-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-sm sm:text-base"
              whileHover={!saving ? { scale: 1.02, y: -2 } : {}}
              whileTap={!saving ? { scale: 0.98 } : {}}
            >
              {saving ? (
                <>
                  <motion.div
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-2 border-t-2 border-b-2 border-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="text-sm sm:text-base">Sparar...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="text-sm sm:text-base">Spara ändringar</span>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </>
              )}
            </motion.button>
          </div>

          {/* Separator */}
          <div className="pt-8 sm:pt-10 mt-8 sm:mt-10 border-t-2 border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Kontoinställningar</h2>
          </div>

          {/* Sessionshantering */}
          <div className="space-y-4">
            <div className="pb-4 sm:pb-5">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2 flex items-center">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg mr-2 flex-shrink-0">
                  <LogOut className="w-4 h-4 text-blue-600" />
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
                      { from_page: 'profile' }
                    ).catch(e => console.error('Loggningsfel:', e));
                  }

                  await supabase.auth.signOut();
                  router.push('/login');
                }}
                className="flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg hover:from-gray-700 hover:to-gray-800 transition-all touch-manipulation text-sm sm:text-base"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logga ut
              </motion.button>
            </div>

            {/* Kontoborttagning */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-red-600 mb-1.5 sm:mb-2 flex items-center">
                <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg mr-2 flex-shrink-0">
                  <Trash2 className="w-4 h-4 text-red-600" />
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
                className="bg-yellow-50 p-3 sm:p-4 border border-yellow-200 rounded-lg mb-3 sm:mb-4"
              >
                <div className="flex items-start">
                  <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg mr-2 sm:mr-3 flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-yellow-900 font-semibold mb-1.5 text-sm sm:text-base">Viktigt att tänka på</h4>
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
                className="flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all touch-manipulation text-sm sm:text-base"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Radera mitt konto
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

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
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg mr-2 flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  Radera konto
                </h3>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-700 mb-4">
                  Är du absolut säker på att du vill radera ditt konto? Denna åtgärd kan <span className="text-red-600 font-bold">inte ångras</span>.
                </p>

                <div className="mb-5">
                  <label htmlFor="delete-confirm" className="text-sm font-medium text-gray-700 mb-2 block">
                    Skriv "<span className="font-semibold text-gray-900">radera mitt konto</span>" för att bekräfta:
                  </label>
                  <input
                    id="delete-confirm"
                    type="text"
                    value={deleteAccountConfirmText}
                    onChange={(e) => setDeleteAccountConfirmText(e.target.value)}
                    placeholder="radera mitt konto"
                    className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm"
                  />
                </div>

                {deleteAccountError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r"
                  >
                    <p className="text-red-700 text-sm">{deleteAccountError}</p>
                  </motion.div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <motion.button
                  onClick={() => {
                    setShowDeleteAccountConfirm(false);
                    setDeleteAccountConfirmText('');
                    setDeleteAccountError('');
                  }}
                  className="px-6 py-2 bg-white text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-sm touch-manipulation"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Avbryt
                </motion.button>
                <motion.button
                  onClick={confirmDeleteAccount}
                  disabled={deleteAccountConfirmText !== 'radera mitt konto' || deleteAccountLoading}
                  className={`px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl flex items-center justify-center transition-all font-medium shadow-lg touch-manipulation text-sm
                    ${deleteAccountConfirmText !== 'radera mitt konto' ? 'opacity-50 cursor-not-allowed' : 'hover:from-red-700 hover:to-pink-700'}`}
                  whileHover={deleteAccountConfirmText === 'radera mitt konto' && !deleteAccountLoading ? { scale: 1.02, y: -2 } : {}}
                  whileTap={deleteAccountConfirmText === 'radera mitt konto' && !deleteAccountLoading ? { scale: 0.98 } : {}}
                >
                  {deleteAccountLoading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Tar bort...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2"/>
                      <span>Radera permanent</span>
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
