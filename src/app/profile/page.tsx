// src/app/profile/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/use-profile';
import { useCVStore } from '@/store/cv-store';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import Link from 'next/link';
import { logUserActivity } from '@/lib/activity-logger';

// Import components
import CVUploader from '@/components/cv/cv-uploader';
import Notification from '@/components/ui/notification';
import SubscriptionInfo from '@/components/subscription/subscription-info';
import { ProfilePhotoUpload } from '@/components/profile/ProfilePhotoUpload';
import { LinkedInInput } from '@/components/profile/LinkedInInput';
// *** NYA IMPORTER FÖR STRIPE ***
import { SubscribeButton } from '@/components/subscription/SubscribeButton';
import { ManageSubscriptionButton } from '@/components/subscription/ManageSubscriptionButton';
// *******************************

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
  Check
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
  const premiumMonthlyPriceId = "price_1SQSVlPWMWdjmTDjx1yo9m00";
  // ******************************

  const tonalityOptions = [
    {
      value: 'auto',
      label: 'Smart val (Rekommenderas)',
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
    <div className="max-w-screen-lg mx-auto pt-8 pb-16 px-4">
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

      {/* Header */}
      <h1 className="text-3xl font-bold text-white mb-2">Min profil</h1>
      <p className="text-gray-300 mb-8">Hantera din profil, dina CV:n och inställningar</p>

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-700">
        <div className="flex flex-wrap gap-2">
          {/* Profil-tab */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center px-4 py-2 rounded-t-lg ${
              activeTab === 'profile'
                ? 'text-pink-500 border-b-2 border-pink-500 font-medium'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-5 h-5 mr-2" />
            <span>Profilinformation</span>
          </button>

          {/* CV-tab */}
          <button
            onClick={() => setActiveTab('cv')}
            className={`flex items-center px-4 py-2 rounded-t-lg ${
              activeTab === 'cv'
                ? 'text-pink-500 border-b-2 border-pink-500 font-medium'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-5 h-5 mr-2" />
            <span>Mina CV:n</span>
          </button>

          {/* Prenumeration-tab */}
          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex items-center px-4 py-2 rounded-t-lg ${
              activeTab === 'subscription'
                ? 'text-pink-500 border-b-2 border-pink-500 font-medium'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Crown className="w-5 h-5 mr-2" />
            <span>Prenumeration</span>
            {subscriptionTier === 'premium' && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-500 text-gray-900 rounded-full font-medium">
                Premium
              </span>
            )}
          </button>

          {/* Inställningar-tab */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center px-4 py-2 rounded-t-lg ${
              activeTab === 'settings'
                ? 'text-pink-500 border-b-2 border-pink-500 font-medium'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5 mr-2" />
            <span>Inställningar</span>
          </button>
        </div>
      </div>

      {/* === TAB CONTENT === */}

      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <div className="bg-navy-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 text-white flex items-center">
            <User className="w-5 h-5 mr-2 text-pink-500" />
            Profilinformation
          </h2>

          <div className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={profile?.email || ''}
                disabled
                className="w-full px-3 py-2 rounded-md bg-navy-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <p className="mt-1 text-xs text-gray-400">Din e-postadress kan inte ändras</p>
            </div>

            {/* Fullständigt namn */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-300 mb-1">
                Fullständigt namn
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Ditt namn"
                className="w-full px-3 py-2 rounded-md bg-navy-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Telefon */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                Telefonnummer
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ditt telefonnummer (valfritt)"
                className="w-full px-3 py-2 rounded-md bg-navy-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Föredragen tonalitet
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Din standardton när du skapar nya personliga brev.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {tonalityOptions
                  .filter(option => !(option.value === 'auto' && subscriptionTier !== 'premium'))
                  .map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleTonalitySelect(option.value)}
                    className={`
                      flex flex-col items-center justify-center p-3 rounded-lg text-center border transition-all
                      ${formData.preferred_tonality === option.value
                        ? 'border-pink-500 bg-pink-500/10 text-white'
                        : 'border-gray-700 bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                      }
                      ${option.value === 'auto' && subscriptionTier !== 'premium' ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    disabled={option.value === 'auto' && subscriptionTier !== 'premium'}
                    title={option.value === 'auto' && subscriptionTier !== 'premium' ? 'Kräver Premium' : option.description}
                  >
                    <div className="mb-1">{option.icon}</div>
                    <span className="text-sm font-medium">
                      {option.label}
                      {option.value === 'auto' && (
                        <span className="ml-1 text-xs text-pink-400">(Premium)</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>

              {/* Varning om auto vald utan premium */}
              {formData.preferred_tonality === 'auto' && subscriptionTier !== 'premium' && (
                <div className="p-3 bg-yellow-900/30 border-l-4 border-yellow-500 rounded-r mb-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-yellow-200 text-sm">
                      Smart tonalitet är endast tillgänglig för Premium-medlemmar.
                      <button
                        onClick={() => setActiveTab('subscription')}
                        className="ml-1 text-pink-400 hover:text-pink-300 underline"
                      >
                        Uppgradera här
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* Beskrivning av vald tonalitet */}
              <div className="p-4 border border-gray-700 rounded-md text-sm text-gray-300 bg-navy-900/30">
                {tonalityOptions.find(opt => opt.value === formData.preferred_tonality)?.description || 'Välj en tonalitet ovan.'}
              </div>
            </div>

            {/* Spara-knapp */}
            <div className="pt-4">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center justify-center w-full md:w-auto px-6 py-3 bg-pink-600 text-white rounded-md hover:bg-pink-700 font-medium transition-colors disabled:bg-gray-700 disabled:text-gray-400"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                    Sparar...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Spara ändringar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CV Tab */}
      {activeTab === 'cv' && (
        <div className="space-y-6">
          {/* CV List */}
          <div className="bg-navy-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-pink-500" />
              Dina CV:n
              {/* Dynamisk räknare */}
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({cvCount} / {subscriptionTier === 'premium' ? '∞' : '2'})
              </span>
            </h2>

            {cvListLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
              </div>
            ) : cvs.length === 0 ? (
              <div className="border border-gray-700 border-dashed rounded-lg p-6 bg-navy-900/50">
                <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                  <FileText className="w-12 h-12 mb-3 text-gray-600" />
                  <p className="text-lg mb-1">Inga CV:n uppladdade än</p>
                  <p className="text-sm text-gray-500">Ladda upp ditt första CV för att komma igång</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {cvs.map((cv) => (
                  <div
                    key={cv.id}
                    className="border border-gray-700 bg-navy-900/30 rounded-lg overflow-hidden transition-all hover:border-pink-500/30 hover:shadow-lg cv-card animate-slideUp"
                  >
                    <div className="p-4 flex items-start">
                      <div className="p-3 bg-pink-600/20 rounded-md mr-4 flex-shrink-0">
                        <FileText className="w-6 h-6 text-pink-500" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium mb-1 text-white text-lg">{cv.file_name}</h3>
                        {cv.created_at && (
                          <p className="text-xs text-gray-400">
                            Uppladdad: {new Date(cv.created_at).toLocaleDateString('sv-SE')}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteCV(cv.id)}
                        className="p-2 text-gray-400 hover:text-pink-400 transition-colors rounded-full hover:bg-pink-500/10"
                        disabled={isDeleting && deleteId === cv.id}
                        title="Ta bort CV"
                      >
                        {isDeleting && deleteId === cv.id ? (
                          <div className="w-5 h-5 border-t-2 border-b-2 border-pink-300 rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    
                    {/* CV Preview Section */}
                    <div className="border-t border-gray-700 p-4 bg-navy-950/50">
                      <div className="bg-white/95 rounded-md p-5 shadow-inner max-h-56 overflow-auto elegant-scrollbar text-gray-800 text-sm relative">
                        {/* Preview Content */}
                        <div className="prose prose-sm max-w-none" style={{ whiteSpace: 'pre-line' }}>
                          {cv.cv_text && cv.cv_text.length > 500 
                            ? cv.cv_text.slice(0, 500) + '...' 
                            : cv.cv_text || 'Ingen förhandsgranskning tillgänglig'}
                        </div>
                        
                        {/* Gradient Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent"></div>
                      </div>
                      
                      {/* Actions Bar */}
<div className="flex justify-end mt-3 space-x-2">
  <button
    onClick={() => {
      // Skapa ett popup-fönster med CV-innehållet istället för att försöka ladda ned det
      const newWindow = window.open('', '_blank', 'width=800,height=600');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${cv.file_name || 'CV'}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  padding: 20px; 
                  line-height: 1.6;
                  background-color: white;
                  color: #333;
                }
                h1 { color: #333; }
                .cv-container {
                  max-width: 800px;
                  margin: 0 auto;
                  white-space: pre-line;
                  background: white;
                  padding: 30px;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .meta {
                  color: #666;
                  font-size: 14px;
                  margin-bottom: 20px;
                }
              </style>
            </head>
            <body>
              <div class="cv-container">
                <h1>${cv.file_name || 'CV'}</h1>
                <div class="meta">
                  Uppladdad: ${cv.created_at ? new Date(cv.created_at).toLocaleDateString('sv-SE') : 'okänt datum'}
                </div>
                <div>${cv.cv_text ? cv.cv_text.replace(/\n/g, '<br />') : 'Inget CV-innehåll tillgängligt'}</div>
              </div>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    }}
    className="flex items-center px-3 py-1.5 text-sm bg-navy-700 hover:bg-navy-600 text-white rounded-md transition-colors border border-gray-700"
  >
    <ExternalLink className="w-4 h-4 mr-1.5" />
    Visa fullständigt CV
  </button>
  
  {/* CV-analys knapp för Premium-användare */}
  {subscriptionTier === 'premium' && (
    <button
      className="flex items-center px-3 py-1.5 text-sm bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 rounded-md transition-colors"
      onClick={() => router.push(`/analysera-cv?id=${cv.id}`)}
    >
      <SearchCheck className="w-4 h-4 mr-1.5" />
      Analysera CV
    </button>
  )}
</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* CV Uploader */}
          {cvCount >= (subscriptionTier === 'premium' ? 999 : 2) ? (
            <div className="p-5 bg-navy-800 border-l-4 border-yellow-500 rounded-lg">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-1">CV-gräns nådd</h4>
                  <p className="text-gray-300 text-sm">
                    {subscriptionTier === 'premium'
                      ? 'Du har nått gränsen för antal CV:n. Ta bort ett befintligt CV för att ladda upp ett nytt.'
                      : 'Som gratisanvändare kan du ha 2 CV. Ta bort ett CV för att ladda upp ett nytt, eller uppgradera till Premium för obegränsade uppladdningar.'}
                  </p>
                  {subscriptionTier === 'free' && (
                    <button
                      onClick={() => setActiveTab('subscription')}
                      className="mt-2 text-pink-400 hover:text-pink-300 font-medium flex items-center"
                    >
                      <Crown className="w-4 h-4 mr-1" />
                      Uppgradera till Premium
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <CVUploader
              onSuccess={handleUploadSuccess}
              onError={handleUploadError}
            />
          )}
        </div>
      )}

      {/* Subscription Tab */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          {/* 1. Visa aktuell prenumerationsinformation */}
          <SubscriptionInfo />

          {/* 2. Visa knapp för att uppgradera ELLER hantera prenumeration */}
          {profileLoading ? (
            <div className="flex justify-center items-center p-6 bg-navy-800 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          ) : subscriptionTier === 'free' ? (
            // ANVÄNDAREN HAR GRATISPLAN
            <div className="bg-navy-800 rounded-lg p-6 border border-pink-500/30 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Uppgradera till Premium</h3>
              <p className="text-gray-300 mb-5 text-sm">
                Lås upp obegränsad tillgång till brevgenerering, sparade brev, CV-uppladdningar, CV-analyser och smart tonalitet för att maximera dina jobbchanser.
              </p>
              <SubscribeButton
                priceId={premiumMonthlyPriceId}
                planName="Premium Månad"
                className="w-full"
              />
              <p className="text-center text-xs text-gray-400 mt-3">
                149 kr/månad. Ingen bindningstid. Avsluta när du vill.
              </p>
            </div>
          ) : subscriptionTier === 'premium' ? (
            // ANVÄNDAREN HAR PREMIUM
            <div className="bg-navy-800 rounded-lg p-6 border border-yellow-500/30 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Crown className="w-5 h-5 mr-2 text-yellow-400" />
                Hantera din Premium-prenumeration
              </h3>
              <p className="text-gray-300 mb-5 text-sm">
                Via Stripes kundportal kan du se dina fakturor, uppdatera din betalningsmetod eller avsluta din prenumeration.
              </p>
              <ManageSubscriptionButton className="w-full" />
            </div>
          ) : (
            // Fallback om status är okänd
            <div className="bg-navy-800 rounded-lg p-6">
              <p className="text-gray-400 text-center">Kunde inte ladda prenumerationsstatus.</p>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-navy-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6 text-white flex items-center">
            <Settings className="w-5 h-5 mr-2 text-pink-500" />
            Kontoinställningar
          </h2>

          <div className="space-y-8">
            {/* Sessionshantering */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-md font-semibold text-gray-200 mb-2 flex items-center">
                <LogOut className="w-4 h-4 mr-2 text-blue-400" />
                Sessionshantering
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                Hantera aktiva sessioner och inloggningsstatus för ditt konto.
              </p>
              <button
                onClick={async () => {
                  showNotificationMessage('Loggar ut...', 'loading');
                  
                  // Logga aktiviteten
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
                className="flex items-center px-4 py-2 bg-navy-600 text-white rounded-md hover:bg-navy-500 transition-colors border border-gray-700"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logga ut
              </button>
            </div>

            {/* Kontoborttagning */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-md font-semibold text-pink-400 mb-2 flex items-center">
                <Trash2 className="w-4 h-4 mr-2" />
                Radera konto
              </h3>
              <p className="text-sm text-gray-400 mb-5">
                Om du raderar ditt konto tas all din data, CV:n och personliga brev bort permanent. 
                Denna åtgärd kan inte ångras.
              </p>
              
              <div className="bg-navy-900/50 p-4 border border-gray-700 rounded-md mb-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-200 font-medium mb-1">Viktigt att tänka på</h4>
                    <ul className="text-xs text-gray-300 list-disc pl-4 space-y-1">
                      <li>All din personliga information kommer att raderas</li>
                      <li>Dina uppladdade CV:n och sparade brev förloras</li>
                      <li>Du kan inte återställa ditt konto efter borttagning</li>
                      {subscriptionTier === 'premium' && (
                        <li className="text-yellow-300">Din premium-prenumeration kommer <b>inte</b> att avslutas automatiskt. Du måste separat avsluta den via Stripe kundportal.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowDeleteAccountConfirm(true)}
                className="flex items-center px-4 py-2.5 bg-navy-700 hover:bg-pink-900/30 text-pink-400 hover:text-pink-300 rounded-md transition-colors border border-pink-900/50"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Radera mitt konto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 backdrop-blur-sm transition-all">
          <div className="bg-navy-800 rounded-lg max-w-md w-full shadow-xl border border-gray-700">
            <div className="p-5 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                Bekräfta borttagning
              </h3>
            </div>
            
            <div className="p-5">
              <p className="text-gray-300 mb-2">
                Är du säker på att du vill ta bort detta CV?
              </p>
              <div className="bg-navy-900/50 p-3 rounded-md border border-gray-700 flex items-center mb-5">
                <FileText className="text-pink-400 w-5 h-5 mr-3 flex-shrink-0" />
                <span className="text-white font-medium">
                  {cvs.find(cv => cv.id === deleteId)?.file_name || 'CV'}
                </span>
              </div>
              <p className="text-yellow-300 text-sm flex items-start">
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                Detta kan inte ångras och all data kommer att raderas permanent.
              </p>
            </div>
            
            <div className="p-5 border-t border-gray-700 flex justify-end space-x-3 bg-navy-900/30">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-navy-700 text-white rounded-md hover:bg-navy-600 transition-colors"
                disabled={isDeleting}
              >
                Avbryt
              </button>
              <button
                onClick={confirmDeleteCV}
                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 flex items-center transition-colors"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Tar bort...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-1.5"/>
                    Ta bort CV
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account confirmation modal */}
      {showDeleteAccountConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 backdrop-blur-sm transition-all">
          <div className="bg-navy-800 rounded-lg max-w-md w-full shadow-xl border border-gray-700 animate-fadeIn">
            <div className="p-5 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-pink-500" />
                Radera konto
              </h3>
            </div>
            
            <div className="p-5">
              <p className="text-gray-300 mb-4">
                Är du absolut säker på att du vill radera ditt konto? Denna åtgärd kan <span className="text-pink-400 font-bold">inte ångras</span>.
              </p>
              
              <div className="mb-5">
                <label htmlFor="delete-confirm" className="text-sm font-medium text-gray-300 mb-2 block">
                  Skriv "<span className="text-white">radera mitt konto</span>" för att bekräfta:
                </label>
                <input
                  id="delete-confirm"
                  type="text"
                  value={deleteAccountConfirmText}
                  onChange={(e) => setDeleteAccountConfirmText(e.target.value)}
                  placeholder="radera mitt konto"
                  className="w-full px-3 py-2 rounded-md bg-navy-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              {deleteAccountError && (
                <div className="mb-4 p-3 bg-red-900/30 border-l-4 border-red-500 rounded-r">
                  <p className="text-red-300 text-sm">{deleteAccountError}</p>
                </div>
              )}
            </div>
            
            <div className="p-5 border-t border-gray-700 flex justify-end space-x-3 bg-navy-900/30">
              <button
                onClick={() => {
                  setShowDeleteAccountConfirm(false);
                  setDeleteAccountConfirmText('');
                  setDeleteAccountError('');
                }}
                className="px-4 py-2 bg-navy-700 text-white rounded-md hover:bg-navy-600 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={confirmDeleteAccount}
                disabled={deleteAccountConfirmText !== 'radera mitt konto' || deleteAccountLoading}
                className={`px-4 py-2 bg-pink-600 text-white rounded-md flex items-center transition-colors
                  ${deleteAccountConfirmText !== 'radera mitt konto' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-700'}`}
              >
                {deleteAccountLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Tar bort...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-1.5"/>
                    Radera permanent
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}