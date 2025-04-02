// src/app/profile/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// createClientComponentClient behövs inte om vi bara använder getSupabaseClient
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useProfile } from '@/hooks/use-profile';
import { useCVStore } from '@/store/cv-store';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
// useCallback behövs inte längre här om vi inte har komplexa callbacks
// import { useCallback } from 'react';
import Link from 'next/link';

// Import components
import CVUploader from '@/components/cv/cv-uploader';
import Notification from '@/components/ui/notification';
import SubscriptionInfo from '@/components/subscription/subscription-info'; // Behåll för visning
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
  Building2,
  Lightbulb,
  Trophy,
  Scale,
  Bot,
  Pencil,
  Crown, // För prenumerationsfliken
  SearchCheck // För CV-analys
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  // Hämta subscriptionTier från useProfile och lägg till CV-analys relaterade värden
  const {
    profile,
    loading: profileLoading,
    updateProfile,
    subscriptionTier,
    // Nya värden för CV-analys
    remainingWeeklyAnalyses,
    weeklyAnalysisLimit
  } = useProfile();
  const { cvs, fetchCVs, isLoading: cvListLoading } = useCVStore();

  // Definiera cvCount och maxCvCount variablerna
  const cvCount = cvs.length;
  // maxCvCount hämtas nu rimligen från useProfile's subscriptionLimits
  // const maxCvCount = 5; // Ta bort hårdkodad gräns
  // hasReachedCvLimit beror nu på subscriptionTier
  // const hasReachedCvLimit = cvCount >= maxCvCount; // Ta bort denna

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

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    preferred_tonality: 'professional'
  });

  // *** STRIPE PRICE ID (Månad) ***
  // Hämta samma ID som används på prissidan
  const premiumMonthlyPriceId = "price_1R7eyuAB6xHzwmWvtzFJdaOU";
  // ******************************

  const tonalityOptions = [
    // ... (tonalityOptions oförändrad)
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

  // Update form data when profile data is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        preferred_tonality: profile.preferred_tonality || 'professional'
      });
    }
  }, [profile]);

  // Fetch CVs when component mounts
  useEffect(() => {
    fetchCVs();
  }, [fetchCVs]);

  // Handle form input changes (oförändrad)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle tonality selection (oförändrad)
  const handleTonalitySelect = (value: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_tonality: value
    }));
  };

  // Show notification (oförändrad)
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

  // Close notification (oförändrad)
  const handleCloseNotification = () => {
    setNotification(prev => prev ? { ...prev, isVisible: false } : null);
    setTimeout(() => setNotification(null), 300);
  };

  // Handle CV upload success (oförändrad)
  const handleUploadSuccess = () => {
    showNotificationMessage('CV uppladdad framgångsrikt!', 'success');
    fetchCVs();
  };

  // Handle CV upload error (oförändrad)
  const handleUploadError = (error: Error) => {
    showNotificationMessage(error.message || 'Ett fel uppstod vid uppladdning', 'error');
  };

  // Handle request to delete CV (oförändrad)
  const handleDeleteCV = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  // Confirm CV deletion with the specific CV ID (oförändrad)
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
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte ta bort CV');
      }
    } catch (error: any) {
      showNotificationMessage(error.message || 'Ett fel uppstod vid borttagning', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteId(''); // Rensa ID efteråt
    }
  };

  // Save profile changes (oförändrad)
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
        preferred_tonality: formData.preferred_tonality as any
      });
      if (success) {
        showNotificationMessage('Profil uppdaterad', 'success');
      } else {
        showNotificationMessage('Kunde inte uppdatera profil', 'error');
      }
    } catch (error: any) {
      showNotificationMessage(error.message || 'Ett fel uppstod vid uppdatering', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Loading state (oförändrad)
  if (profileLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // === RENDER ===
  return (
    <div className="max-w-screen-lg mx-auto pt-8 pb-16 px-4">
      {/* Notification (oförändrad) */}
      {notification?.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          progress={notification.progress}
          isVisible={notification.isVisible}
          onClose={handleCloseNotification}
        />
      )}

      {/* Header (oförändrad) */}
      <h1 className="text-3xl font-bold text-white mb-2">Min profil</h1>
      <p className="text-gray-300 mb-8">Hantera din profil, dina CV:n och inställningar</p>

      {/* Tabs (oförändrad struktur, men innehållet i subscription-tabben ändras nedan) */}
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

      {/* Profile Information Tab (oförändrad) */}
      {activeTab === 'profile' && (
        <div className="bg-navy-800 rounded-lg p-6 mb-8">
          {/* ... innehåll för profilinformation ... */}
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
                      AI-optimerad tonalitet är endast tillgänglig för Premium-medlemmar.
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

      {/* CV Tab (lätt uppdaterad för att använda subscriptionTier för gräns) */}
      {activeTab === 'cv' && (
        <div className="space-y-6">
          {/* CV List */}
          <div className="bg-navy-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-pink-500" />
              Dina CV:n
              {/* Dynamisk räknare */}
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({cvCount} / {subscriptionTier === 'premium' ? '∞' : '1'})
              </span>
            </h2>

            {cvListLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
              </div>
            ) : cvs.length === 0 ? (
              <div className="border border-gray-700 border-dashed rounded-lg p-4 bg-navy-900/50">
                <div className="flex flex-col items-center justify-center h-20 text-gray-400">
                  <div className="text-2xl mb-2">📄</div>
                  <p className="text-sm">Inga CV:n uppladdade än</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {cvs.map((cv) => (
                  <div
                    key={cv.id}
                    className="border border-gray-700 bg-navy-900/30 rounded-lg p-4 transition-all hover:border-pink-500/50 hover:shadow-lg"
                  >
                    <div className="flex items-start">
                      <div className="p-2 bg-pink-600/80 rounded-md mr-4 flex-shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium mb-1 text-white">{cv.file_name}</h3>
                        {cv.created_at && (
                          <p className="text-xs text-gray-400 mb-3">
                            Uppladdad: {new Date(cv.created_at).toLocaleDateString('sv-SE')}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Link
                            href={`/api/cv/download/${cv.id}`} // Antagande att du har en sådan route
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Visa/Ladda ner
                          </Link>
                          {/* Ta bort Redigera för nu, om det inte är implementerat */}
                          {/* <Link href={`/profile/cv/${cv.id}/edit`} ...> ... </Link> */}
                          <button
                            onClick={() => handleDeleteCV(cv.id)}
                            className="inline-flex items-center px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                            disabled={isDeleting && deleteId === cv.id} // Inaktivera bara den som raderas
                          >
                            <Trash className="w-4 h-4 mr-1" />
                            {isDeleting && deleteId === cv.id ? 'Tar bort...' : 'Ta bort'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CV Uploader - villkor baserat på prenumerationsnivå */}
          {/* Använd ett stort nummer för premium för att simulera obegränsat */}
          {cvCount >= (subscriptionTier === 'premium' ? 999 : 1) ? (
            <div className="p-4 bg-yellow-900/30 border-l-4 border-yellow-500 rounded-lg">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-300 mb-1">CV-gräns nådd</h4>
                  <p className="text-yellow-200 text-sm">
                    {subscriptionTier === 'premium'
                      ? 'Du har nått gränsen för antal CV:n. Ta bort ett befintligt CV för att ladda upp ett nytt.' // Justera om gränsen är > 1
                      : 'Som gratisanvändare kan du ha 1 CV. Ta bort ditt nuvarande CV för att ladda upp ett nytt, eller uppgradera till Premium för obegränsade uppladdningar.'}
                  </p>
                  {subscriptionTier === 'free' && (
                    <button
                      onClick={() => setActiveTab('subscription')}
                      className="mt-2 text-pink-400 hover:text-pink-300 font-medium underline"
                    >
                      Uppgradera till Premium →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <CVUploader
              onSuccess={handleUploadSuccess}
              onError={handleUploadError}
              showNotification={showNotificationMessage}
            />
          )}
        </div>
      )}

      {/* === Subscription Tab === */}
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
                Lås upp obegränsad tillgång till brevgenerering, sparade brev, CV-uppladdningar, CV-analyser och AI-optimerad tonalitet för att maximera dina jobbchanser.
              </p>
              <SubscribeButton
                priceId={premiumMonthlyPriceId}
                planName="Premium Månad" // Används inte i knapptexten längre, men behålls som prop
                className="w-full" // Knappen har w-full internt, men detta skadar inte
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
             // Fallback om status är okänd (bör inte hända normalt)
             <div className="bg-navy-800 rounded-lg p-6">
                <p className="text-gray-400 text-center">Kunde inte ladda prenumerationsstatus.</p>
             </div>
          )}
        </div>
      )}

      {/* Settings Tab (oförändrad) */}
      {activeTab === 'settings' && (
        <div className="bg-navy-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6 text-white flex items-center">
            <Settings className="w-5 h-5 mr-2 text-pink-500" />
            Kontoinställningar
          </h2>

          <div className="space-y-6">
             {/* Fler inställningar kan läggas till här */}

            {/* Logga ut */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-md font-semibold text-red-400 mb-2">Logga ut</h3>
              <p className="text-sm text-gray-400 mb-3">Avslutar din nuvarande session.</p>
              <button
                onClick={async () => {
                  showNotificationMessage('Loggar ut...', 'loading');
                  await supabase.auth.signOut();
                  router.push('/login'); // Omdirigera till inloggningssidan
                }}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logga ut
              </button>
            </div>

             {/* Ta bort konto (Framtida funktion?) */}
             {/* <div className="border-t border-gray-700 pt-6">
              <h3 className="text-md font-semibold text-red-500 mb-2">Ta bort konto</h3>
              <p className="text-sm text-gray-400 mb-3">Tar permanent bort ditt konto och all data. Detta kan inte ångras.</p>
              <button
                 className="flex items-center px-4 py-2 bg-red-800 text-red-200 rounded-md hover:bg-red-700 transition-colors"
                 // onClick={handleDeleteAccount} // Kräver implementering
              >
                 <Trash className="w-5 h-5 mr-2" />
                 Ta bort mitt konto
              </button>
            </div> */}
          </div>
        </div>
      )}

      {/* Delete confirmation modal (oförändrad) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-navy-800 rounded-lg p-6 max-w-md w-full shadow-xl border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
              Bekräfta borttagning
            </h3>
            <p className="text-gray-300 mb-6">
              Är du säker på att du vill ta bort CV:t "{cvs.find(cv => cv.id === deleteId)?.file_name || 'detta CV'}"? Detta kan inte ångras.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                disabled={isDeleting}
              >
                Avbryt
              </button>
              <button
                onClick={confirmDeleteCV}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center transition-colors disabled:bg-red-800"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Tar bort...
                  </>
                ) : (
                  <>
                  <Trash className="w-4 h-4 mr-1"/>
                  Ja, ta bort
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