'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { motion } from 'framer-motion';
import { ProfilePhotoUpload } from '@/components/profile/ProfilePhotoUpload';
import { LinkedInInput } from '@/components/profile/LinkedInInput';
import {
  User,
  Save,
  Sparkles,
  AlertTriangle,
  Info,
  Mail,
  Building2,
  Lightbulb,
  Trophy,
  Scale,
  Bot
} from 'lucide-react';

export default function ProfilPage() {
  const {
    profile,
    loading: profileLoading,
    updateProfile,
    subscriptionTier
  } = useProfile();

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
    preferred_tonality: 'professional' as 'professional' | 'creative' | 'enthusiastic' | 'confident' | 'balanced' | 'auto'
  });

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
        preferred_tonality: (profile.preferred_tonality || 'professional') as 'professional' | 'creative' | 'enthusiastic' | 'confident' | 'balanced' | 'auto'
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6 md:mb-8"
      >
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0">
            <User className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent truncate">
              Profilinformation
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1 font-medium">Hantera dina personliga uppgifter</p>
          </div>
        </div>
      </motion.div>

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
        </div>
      </motion.div>
    </div>
  );
}
