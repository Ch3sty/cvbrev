/**
 * Premium Profilsida - Jobbcoach.ai
 * Ljust, modernt tema med glassmorphism och micro-interactions
 * Designad för snabb laddning och fantastisk UX
 */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/use-profile';
import { useCVStore } from '@/store/cv-store';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import Link from 'next/link';
import { logUserActivity } from '@/lib/activity-logger';
import { motion, AnimatePresence } from 'framer-motion';

// Import components
import CVUploader from '@/components/cv/cv-uploader';
import Notification from '@/components/ui/notification';
import SubscriptionInfo from '@/components/subscription/subscription-info';
import { ProfilePhotoUpload } from '@/components/profile/ProfilePhotoUpload';
import { LinkedInInput } from '@/components/profile/LinkedInInput';
import { SubscribeButton } from '@/components/subscription/SubscribeButton';
import { ManageSubscriptionButton } from '@/components/subscription/ManageSubscriptionButton';

// Import icons from Lucide
import {
  User,
  FileText,
  Settings,
  Save,
  LogOut,
  AlertTriangle,
  Upload,
  Trash,
  ExternalLink,
  Info,
  Sparkles,
  Trash2,
  Building2,
  Lightbulb,
  Trophy,
  Scale,
  Bot,
  Pencil,
  Crown,
  SearchCheck,
  Check,
  Mail,
  Phone,
  Linkedin,
  Camera
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const {
    profile,
    loading: profileLoading,
    updateProfile,
    subscriptionTier,
    remainingWeeklyAnalyses,
    weeklyAnalysisLimit
  } = useProfile();
  const { cvs, fetchCVs, isLoading: cvListLoading } = useCVStore();

  const cvCount = cvs.length;

  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'loading' | 'success' | 'error' | 'info';
    progress?: number;
    isVisible: boolean;
  } | null>(null);

  // State för kontoborttagning
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [deleteAccountConfirmText, setDeleteAccountConfirmText] = useState('');
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    linkedin_url: '',
    profile_photo_url: '',
    preferred_tonality: 'professional'
  });

  // Auth check ref
  const authCheckedRef = useRef(false);

  // *** STRIPE PRICE ID (Månad) ***
  const premiumMonthlyPriceId = "price_1R7eyuAB6xHzwmWvtzFJdaOU";
  // ******************************

  const tonalityOptions = [
    {
      value: 'auto',
      label: 'AI-val (Rekommenderas)',
      icon: <Bot className="w-5 h-5 text-purple-400" />,
      description: 'Låt AI analysera jobbannonsen och välja den bästa anpassade tonen baserat på bransch, företagskultur och tjänst.'
    },
    {
      value: 'professional',
      label: 'Professionell',
      icon: <Building2 className="w-5 h-5 text-blue-400" />,
      description: 'Formell och saklig ton som lägger fokus på kompetens och erfarenhet.'
    },
    {
      value: 'enthusiastic',
      label: 'Entusiastisk',
      icon: <Sparkles className="w-5 h-5 text-pink-400" />,
      description: 'Energisk och passionerad ton som visar stort intresse för rollen.'
    },
    {
      value: 'creative',
      label: 'Kreativ',
      icon: <Lightbulb className="w-5 h-5 text-yellow-400" />,
      description: 'Innovativ och nytänkande ton som framhäver din kreativa sida.'
    },
    {
      value: 'confident',
      label: 'Självsäker',
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
      description: 'Stark och bestämd ton som betonar prestationer och resultat.'
    },
    {
      value: 'balanced',
      label: 'Balanserad',
      icon: <Scale className="w-5 h-5 text-emerald-400" />,
      description: 'En harmonisk blandning av professionalitet och personlighet.'
    }
  ];

  // Auth check effect
  useEffect(() => {
    if (!authCheckedRef.current && !profileLoading) {
      authCheckedRef.current = true;
      if (!profile) {
        console.log('Användare ej inloggad, omdirigerar till /login');
        router.push('/login');
      }
    }
  }, [profile, profileLoading, router]);

  // Funktion för att radera konto
  const confirmDeleteAccount = async () => {
    if (deleteAccountConfirmText !== 'radera mitt konto') {
      return;
    }
    
    try {
      setDeleteAccountLoading(true);
      setDeleteAccountError('');
      
      // 1. Logga aktiviteten först (så den inte försvinner om kontot raderas)
      if (profile) {
        await logUserActivity(
          profile.id,
          'registered', // Använd motsatt aktivitet från 'registered'
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
      
      // 3. Ta bort alla sparade brev om sådan API finns
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
          // Fallback: Om vi inte har admin-rättigheter, försök med klient-API
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
      
      // 5. Videbefordra till en bekräftelsesida
      showNotificationMessage('Ditt konto har raderats', 'success');
      router.push('/'); // Eller till en speciell sida för borttaget konto om du skapar en sådan
      
    } catch (error: any) {
      console.error('Fel vid borttagning av konto:', error);
      setDeleteAccountError('Ett fel uppstod vid borttagning av kontot: ' + (error.message || 'Okänt fel'));
      setDeleteAccountLoading(false);
    }
  };

  // Update form data when profile data is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        linkedin_url: profile.linkedin_url || '',
        profile_photo_url: profile.profile_photo_url || '',
        preferred_tonality: profile.preferred_tonality || 'professional'
      });
    }
  }, [profile]);

  // Fetch CVs when component mounts
  useEffect(() => {
    fetchCVs();
  }, [fetchCVs]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle tonality selection
  const handleTonalitySelect = (value: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_tonality: value
    }));
  };

  // Show notification
  const showNotificationMessage = (message: string, type: 'loading' | 'success' | 'error' | 'info', progress?: number) => {
    setNotification({
      message,
      type,
      progress,
      isVisible: true
    });

    if (type !== 'loading') {
      setTimeout(() => {
        setNotification(prev => prev ? { ...prev, isVisible: false } : null);
        setTimeout(() => setNotification(null), 300);
      }, 5000);
    }
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification(prev => prev ? { ...prev, isVisible: false } : null);
    setTimeout(() => setNotification(null), 300);
  };

  // Handle CV upload success
  const handleUploadSuccess = () => {
    fetchCVs();
  };

  // Handle CV upload error
  const handleUploadError = (error: Error) => {
    console.error("Fel från CVUploader:", error);
  };

  // Handle request to delete CV
  const handleDeleteCV = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  // Confirm CV deletion with the specific CV ID
  const confirmDeleteCV = async () => {
    try {
      if (!deleteId) return;
      setIsDeleting(true);
      showNotificationMessage('Tar bort CV...', 'loading');
      const response = await fetch(`/api/cv/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteId }),
      });
      if (response.ok) {
        fetchCVs();
        showNotificationMessage('CV har tagits bort', 'success');
        
        // Logga aktiviteten med activity-logger
        if (profile) {
          logUserActivity(
            profile.id,
            'cv_deleted',
            'Användaren raderade ett CV',
            { cv_id: deleteId }
          ).catch(e => console.error('Loggningsfel:', e));
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte ta bort CV');
      }
    } catch (error: any) {
      showNotificationMessage(error.message || 'Ett fel uppstod vid borttagning', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteId('');
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      showNotificationMessage('Sparar profiländringar...', 'loading');
      if (formData.full_name.trim() === '') {
        showNotificationMessage('Ange ditt namn', 'error');
        setSaving(false);
        return;
      }
      const success = await updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        linkedin_url: formData.linkedin_url,
        profile_photo_url: formData.profile_photo_url,
        preferred_tonality: formData.preferred_tonality as any
      });
      if (success) {
        showNotificationMessage('Profil uppdaterad', 'success');
        
        // Logga aktiviteten med activity-logger
        if (profile) {
          logUserActivity(
            profile.id,
            'profile_updated',
            'Användaren uppdaterade sin profil',
            { 
              updated_fields: ['full_name', 'phone', 'preferred_tonality'],
              preferred_tonality: formData.preferred_tonality
            }
          ).catch(e => console.error('Loggningsfel:', e));
        }
      } else {
        showNotificationMessage('Kunde inte uppdatera profil', 'error');
      }
    } catch (error: any) {
      showNotificationMessage(error.message || 'Ett fel uppstod vid uppdatering', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Om sidan håller på att omdirigeras eller användaren inte är inloggad, visa ingenting
  if (profileLoading || !profile) {
    return null;
  }

  // === RENDER ===
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50/30 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-cyan-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </div>

      {/* Notification */}
      {notification?.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          progress={notification.progress}
          isVisible={notification.isVisible}
          onClose={handleCloseNotification}
        />
      )}

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
            Min profil
          </h1>
          <p className="text-lg text-gray-600">
            Hantera din profil, dina CV:n och inställningar
          </p>
        </motion.div>

        {/* Premium Tabs with Glassmorphism */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-wrap gap-3 bg-white/80 backdrop-blur-xl rounded-2xl p-2 border border-gray-200/50 shadow-lg">
            {/* Profil-tab */}
            <motion.button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/25'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <User className="w-5 h-5 mr-2" />
              <span>Profilinformation</span>
            </motion.button>

            {/* CV-tab */}
            <motion.button
              onClick={() => setActiveTab('cv')}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'cv'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/25'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FileText className="w-5 h-5 mr-2" />
              <span>Mina CV:n</span>
            </motion.button>

            {/* Prenumeration-tab */}
            <motion.button
              onClick={() => setActiveTab('subscription')}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'subscription'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/25'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Crown className="w-5 h-5 mr-2" />
              <span>Prenumeration</span>
              {subscriptionTier === 'premium' && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-400 text-gray-900 rounded-full font-medium">
                  Premium
                </span>
              )}
            </motion.button>

            {/* Inställningar-tab */}
            <motion.button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/25'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Settings className="w-5 h-5 mr-2" />
              <span>Inställningar</span>
            </motion.button>
          </div>
        </motion.div>

      {/* === TAB CONTENT === */}

      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Premium Profile Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 mr-3">
                  <User className="w-6 h-6 text-white" />
                </div>
                Profilinformation
              </h2>
            </div>

            <div className="space-y-6">
            {/* Email */}
            <div className="relative">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-blue-600" />
                E-postadress
              </label>
              <input
                type="email"
                id="email"
                value={profile?.email || ''}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-600 border border-gray-200 cursor-not-allowed"
              />
              <p className="mt-2 text-xs text-gray-500 flex items-center">
                <Info className="w-3 h-3 mr-1" />
                Din e-postadress kan inte ändras
              </p>
            </div>

            {/* Fullständigt namn */}
            <div className="relative">
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2 text-purple-600" />
                Fullständigt namn
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Ditt namn"
                className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
              />
            </div>

            {/* Telefon */}
            <div className="relative">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Phone className="w-4 h-4 mr-2 text-green-600" />
                Telefonnummer
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ditt telefonnummer (valfritt)"
                className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
              />
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

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {tonalityOptions
                  .filter(option => !(option.value === 'auto' && subscriptionTier !== 'premium'))
                  .map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => handleTonalitySelect(option.value)}
                    className={`
                      flex flex-col items-center justify-center p-4 rounded-xl text-center border-2 transition-all
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
                    <div className="mb-2">{option.icon}</div>
                    <span className={`text-sm font-medium ${formData.preferred_tonality === option.value ? 'text-gray-900' : 'text-gray-700'}`}>
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
                      <button
                        onClick={() => setActiveTab('subscription')}
                        className="ml-1 text-pink-600 hover:text-pink-700 underline font-medium"
                      >
                        Uppgradera här
                      </button>
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
            <div className="pt-6">
              <motion.button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center justify-center w-full md:w-auto px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-pink-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!saving ? { scale: 1.02, y: -2 } : {}}
                whileTap={!saving ? { scale: 0.98 } : {}}
              >
                {saving ? (
                  <>
                    <motion.div
                      className="w-5 h-5 mr-2 border-t-2 border-b-2 border-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Sparar...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Spara ändringar
                    <Sparkles className="w-5 h-5 ml-2" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
        </motion.div>
      )}

      {/* CV Tab */}
      {activeTab === 'cv' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* CV List */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 mr-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                Dina CV:n
              </h2>
              {/* Dynamisk räknare */}
              <div className="px-4 py-2 bg-gray-100 rounded-xl">
                <span className="text-sm font-semibold text-gray-700">
                  {cvCount} / {subscriptionTier === 'premium' ? '∞' : '1'}
                </span>
              </div>
            </div>

            {cvListLoading ? (
              <div className="flex justify-center items-center h-40">
                <motion.div
                  className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            ) : cvs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-12 bg-gray-50"
              >
                <div className="flex flex-col items-center justify-center text-gray-600">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4"
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <FileText className="w-10 h-10 text-blue-600" />
                  </motion.div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">Inga CV:n uppladdade än</p>
                  <p className="text-sm text-gray-500">Ladda upp ditt första CV för att komma igång</p>
                </div>
              </motion.div>
            ) : (
              <div className="grid gap-4">
                {cvs.map((cv, index) => (
                  <motion.div
                    key={cv.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all hover:border-pink-500/50 hover:shadow-xl"
                    whileHover={{ y: -4 }}
                  >
                    <div className="p-6 flex items-start">
                      <motion.div
                        className="p-3 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl mr-4 flex-shrink-0"
                        whileHover={{ rotate: 5, scale: 1.1 }}
                      >
                        <FileText className="w-6 h-6 text-white" />
                      </motion.div>
                      <div className="flex-grow">
                        <h3 className="font-semibold mb-1 text-gray-900 text-lg">{cv.file_name}</h3>
                        {cv.created_at && (
                          <p className="text-sm text-gray-500 flex items-center">
                            <Upload className="w-3 h-3 mr-1" />
                            Uppladdad: {new Date(cv.created_at).toLocaleDateString('sv-SE')}
                          </p>
                        )}
                      </div>
                      <motion.button
                        onClick={() => handleDeleteCV(cv.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-xl hover:bg-red-50"
                        disabled={isDeleting && deleteId === cv.id}
                        title="Ta bort CV"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isDeleting && deleteId === cv.id ? (
                          <motion.div
                            className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </motion.button>
                    </div>
                    
                    {/* CV Preview Section */}
                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                      <div className="bg-white rounded-xl p-5 shadow-sm max-h-48 overflow-auto text-gray-700 text-sm relative border border-gray-200">
                        {/* Preview Content */}
                        <div className="prose prose-sm max-w-none" style={{ whiteSpace: 'pre-line' }}>
                          {cv.cv_text && cv.cv_text.length > 400
                            ? cv.cv_text.slice(0, 400) + '...'
                            : cv.cv_text || 'Ingen förhandsgranskning tillgänglig'}
                        </div>

                        {/* Gradient Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                      </div>

                      {/* Actions Bar */}
                      <div className="flex justify-end mt-4 space-x-3">
                        <motion.button
                          onClick={() => {
                            const newWindow = window.open('', '_blank', 'width=800,height=600');
                            if (newWindow) {
                              newWindow.document.write(`
                                <!DOCTYPE html>
                                <html>
                                  <head>
                                    <title>${cv.file_name || 'CV'}</title>
                                    <style>
                                      body {
                                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                                        padding: 40px;
                                        line-height: 1.6;
                                        background: linear-gradient(to bottom right, #f9fafb, #f3f4f6);
                                        color: #1f2937;
                                      }
                                      .cv-container {
                                        max-width: 800px;
                                        margin: 0 auto;
                                        white-space: pre-line;
                                        background: white;
                                        padding: 40px;
                                        border-radius: 16px;
                                        box-shadow: 0 20px 60px rgba(0,0,0,0.1);
                                      }
                                      h1 {
                                        color: #111827;
                                        margin-bottom: 12px;
                                      }
                                      .meta {
                                        color: #6b7280;
                                        font-size: 14px;
                                        margin-bottom: 32px;
                                        padding-bottom: 16px;
                                        border-bottom: 2px solid #f3f4f6;
                                      }
                                    </style>
                                  </head>
                                  <body>
                                    <div class="cv-container">
                                      <h1>${cv.file_name || 'CV'}</h1>
                                      <div class="meta">
                                        📅 Uppladdad: ${cv.created_at ? new Date(cv.created_at).toLocaleDateString('sv-SE') : 'okänt datum'}
                                      </div>
                                      <div>${cv.cv_text ? cv.cv_text.replace(/\n/g, '<br />') : 'Inget CV-innehåll tillgängligt'}</div>
                                    </div>
                                  </body>
                                </html>
                              `);
                              newWindow.document.close();
                            }
                          }}
                          className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visa fullständigt CV
                        </motion.button>

                        {/* CV-analys knapp för Premium-användare */}
                        {subscriptionTier === 'premium' && (
                          <motion.button
                            className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
                            onClick={() => router.push(`/analysera-cv?id=${cv.id}`)}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <SearchCheck className="w-4 h-4 mr-2" />
                            Analysera CV
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          
          {/* CV Uploader */}
          {cvCount >= (subscriptionTier === 'premium' ? 999 : 1) ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-yellow-50 border-l-4 border-yellow-500 rounded-2xl"
            >
              <div className="flex items-start">
                <div className="p-2 bg-yellow-100 rounded-lg mr-4">
                  <Info className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-gray-900 mb-2">CV-gräns nådd</h4>
                  <p className="text-gray-700 text-sm mb-3">
                    {subscriptionTier === 'premium'
                      ? 'Du har nått gränsen för antal CV:n. Ta bort ett befintligt CV för att ladda upp ett nytt.'
                      : 'Som gratisanvändare kan du ha 1 CV. Ta bort ditt nuvarande CV för att ladda upp ett nytt, eller uppgradera till Premium för obegränsade uppladdningar.'}
                  </p>
                  {subscriptionTier === 'free' && (
                    <motion.button
                      onClick={() => setActiveTab('subscription')}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Uppgradera till Premium
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CVUploader
                onSuccess={handleUploadSuccess}
                onError={handleUploadError}
              />
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Subscription Tab */}
      {activeTab === 'subscription' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* 1. Visa aktuell prenumerationsinformation */}
          <SubscriptionInfo />

          {/* 2. Visa knapp för att uppgradera ELLER hantera prenumeration */}
          {profileLoading ? (
            <div className="flex justify-center items-center p-8 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50">
              <motion.div
                className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : subscriptionTier === 'free' ? (
            // ANVÄNDAREN HAR GRATISPLAN
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8 border-2 border-pink-500/30 shadow-2xl"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl mr-3">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Uppgradera till Premium</h3>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Lås upp obegränsad tillgång till brevgenerering, sparade brev, CV-uppladdningar, CV-analyser och smarta tonalitetsval för att maximera dina jobbchanser.
              </p>
              <SubscribeButton
                priceId={premiumMonthlyPriceId}
                planName="Premium Månad"
                className="w-full"
              />
              <p className="text-center text-sm text-gray-600 mt-4">
                149 kr/månad • Ingen bindningstid • Avsluta när du vill
              </p>
            </motion.div>
          ) : subscriptionTier === 'premium' ? (
            // ANVÄNDAREN HAR PREMIUM
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-8 border-2 border-yellow-500/30 shadow-2xl"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl mr-3">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Hantera din Premium-prenumeration</h3>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Via Stripes kundportal kan du se dina fakturor, uppdatera din betalningsmetod eller avsluta din prenumeration.
              </p>
              <ManageSubscriptionButton className="w-full" />
            </motion.div>
          ) : (
            // Fallback om status är okänd
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50">
              <p className="text-gray-600 text-center">Kunde inte ladda prenumerationsstatus.</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 shadow-xl">
            <div className="flex items-center mb-8">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 mr-3">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Kontoinställningar</h2>
            </div>

            <div className="space-y-8">
              {/* Sessionshantering */}
              <div className="pb-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-2">
                    <LogOut className="w-4 h-4 text-blue-600" />
                  </div>
                  Sessionshantering
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Hantera aktiva sessioner och inloggningsstatus för ditt konto.
                </p>
                <motion.button
                  onClick={async () => {
                    showNotificationMessage('Loggar ut...', 'loading');

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
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logga ut
                </motion.button>
              </div>

              {/* Kontoborttagning */}
              <div>
                <h3 className="text-lg font-semibold text-red-600 mb-2 flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg mr-2">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </div>
                  Radera konto
                </h3>
                <p className="text-sm text-gray-600 mb-5">
                  Om du raderar ditt konto tas all din data, CV:n och personliga brev bort permanent.
                  Denna åtgärd kan inte ångras.
                </p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-yellow-50 p-4 border border-yellow-200 rounded-xl mb-4"
                >
                  <div className="flex items-start">
                    <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="text-yellow-900 font-semibold mb-2">Viktigt att tänka på</h4>
                      <ul className="text-sm text-yellow-800 list-disc pl-4 space-y-1">
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
                  className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Radera mitt konto
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg mr-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                  Bekräfta borttagning
                </h3>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Är du säker på att du vill ta bort detta CV?
                </p>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center mb-5">
                  <div className="p-2 bg-pink-100 rounded-lg mr-3">
                    <FileText className="text-pink-600 w-5 h-5" />
                  </div>
                  <span className="text-gray-900 font-medium">
                    {cvs.find(cv => cv.id === deleteId)?.file_name || 'CV'}
                  </span>
                </div>
                <div className="flex items-start p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-800 text-sm">
                    Detta kan inte ångras och all data kommer att raderas permanent.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50">
                <motion.button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2 bg-white text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
                  disabled={isDeleting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Avbryt
                </motion.button>
                <motion.button
                  onClick={confirmDeleteCV}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 flex items-center transition-all font-medium shadow-lg disabled:opacity-50"
                  disabled={isDeleting}
                  whileHover={!isDeleting ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!isDeleting ? { scale: 0.98 } : {}}
                >
                  {isDeleting ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Tar bort...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2"/>
                      Ta bort CV
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account confirmation modal */}
      <AnimatePresence>
        {showDeleteAccountConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
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
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg mr-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  Radera konto
                </h3>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-4">
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
                    className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
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

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50">
                <motion.button
                  onClick={() => {
                    setShowDeleteAccountConfirm(false);
                    setDeleteAccountConfirmText('');
                    setDeleteAccountError('');
                  }}
                  className="px-6 py-2 bg-white text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Avbryt
                </motion.button>
                <motion.button
                  onClick={confirmDeleteAccount}
                  disabled={deleteAccountConfirmText !== 'radera mitt konto' || deleteAccountLoading}
                  className={`px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl flex items-center transition-all font-medium shadow-lg
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
                      Tar bort...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2"/>
                      Radera permanent
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}