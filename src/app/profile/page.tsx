"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useProfile } from '@/hooks/use-profile';

// Import nya komponenter
import CVUploader from '@/components/cv/cv-uploader';
import CVList from '@/components/cv/cv-list';

// Importera ikoner från Lucide
import { 
  User, 
  FileText, 
  Settings, 
  Save, 
  LogOut,
  AlertTriangle 
} from 'lucide-react';

// Importera din Notification-komponent
import Notification from '@/components/ui/notification';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { profile, cv, loading, updateProfile, deleteCV } = useProfile();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
  
  // Tonalitet options med ikoner
  const tonalityOptions = [
    { 
      value: 'professional', 
      label: 'Professionell',
      icon: '🏢',
      description: 'Formell och affärsmässig ton som passar traditionella företag och branscher.'
    },
    { 
      value: 'enthusiastic', 
      label: 'Entusiastisk',
      icon: '🔥',
      description: 'Energisk och passionerad ton som visar stort intresse för rollen.'
    },
    { 
      value: 'creative', 
      label: 'Kreativ',
      icon: '💡',
      description: 'Innovativ och nytänkande ton som framhäver din kreativa sida.'
    },
    { 
      value: 'confident', 
      label: 'Självsäker',
      icon: '🏆',
      description: 'Stark och bestämd ton som betonar dina prestationer och förmågor.'
    },
    { 
      value: 'balanced', 
      label: 'Balanserad',
      icon: '⚖️',
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

  // Visa notifikation
  const showNotificationMessage = (message: string, type: 'loading' | 'success' | 'error' | 'info', progress?: number) => {
    setNotification({ 
      message, 
      type, 
      progress,
      isVisible: true 
    });
    
    if (type !== 'loading') {
      // Autostäng notifikationen efter 5 sekunder
      setTimeout(() => {
        setNotification(prev => prev ? { ...prev, isVisible: false } : null);
        setTimeout(() => setNotification(null), 300); // Ta bort från DOM efter fade-out
      }, 5000);
    }
  };
  
  // Stäng notifikation
  const handleCloseNotification = () => {
    setNotification(prev => prev ? { ...prev, isVisible: false } : null);
    setTimeout(() => setNotification(null), 300); // Ta bort från DOM efter fade-out
  };
  
  // Hantera CV-uppladdningsframgång
  const handleUploadSuccess = () => {
    showNotificationMessage('CV uppladdad framgångsrikt!', 'success');
  };
  
  // Hantera CV-uppladdningsfel
  const handleUploadError = (error: Error) => {
    showNotificationMessage(error.message || 'Ett fel uppstod vid uppladdning', 'error');
  };
  
  // Hantera begäran om att ta bort CV
  const handleDeleteCV = () => {
    setShowDeleteConfirm(true);
  };
  
  // Bekräfta borttagning av CV
  const confirmDeleteCV = async () => {
    try {
      setIsDeleting(true);
      showNotificationMessage('Tar bort CV...', 'loading');
      
      const success = await deleteCV();
      
      if (success) {
        showNotificationMessage('CV har tagits bort', 'success');
      } else {
        showNotificationMessage('Kunde inte ta bort CV', 'error');
      }
    } catch (error: any) {
      showNotificationMessage(error.message || 'Ett fel uppstod vid borttagning', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      showNotificationMessage('Sparar profiländringar...', 'loading');
      
      // Validate input
      if (formData.full_name.trim() === '') {
        showNotificationMessage('Ange ditt namn', 'error');
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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto pt-8 pb-16 px-4">
      {/* Notifikation */}
      {notification?.isVisible && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          progress={notification.progress}
          isVisible={notification.isVisible}
          onClose={handleCloseNotification} 
        />
      )}
      
      <h1 className="text-3xl font-bold text-white mb-2">Min profil</h1>
      <p className="text-gray-300 mb-8">Hantera din profil, dina CV:n och inställningar</p>
      
      {/* Tabs */}
      <div className="mb-8 border-b border-gray-700">
        <div className="flex space-x-2">
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
      
      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <div className="bg-navy-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 text-white flex items-center">
            <User className="w-5 h-5 mr-2 text-pink-500" />
            Profilinformation
          </h2>
          
          <div className="space-y-6">
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
                placeholder="Ditt telefonnummer"
                className="w-full px-3 py-2 rounded-md bg-navy-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Föredragen tonalitet
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Detta är din standard när du genererar nya brev
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                {tonalityOptions.map((option) => (
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
                    `}
                  >
                    <span className="text-2xl mb-1">{option.icon}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="p-4 border border-gray-700 rounded-md text-sm text-gray-300">
                {tonalityOptions.find(opt => opt.value === formData.preferred_tonality)?.description || 'Välj en tonalitet ovan.'}
              </div>
            </div>
            
            <div className="pt-4">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center justify-center w-full md:w-auto px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 font-medium transition-colors disabled:bg-gray-700 disabled:text-gray-400"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                    Sparar ändringar...
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
          {/* CV-lista med existerande/tomma CV-slots */}
          <div className="bg-navy-800 rounded-lg p-6">
            <CVList 
              onDeleteClick={handleDeleteCV}
              maxSlots={5}
            />
          </div>
          
          {/* CV-uppladdare */}
          <CVUploader 
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
            showNotification={showNotificationMessage}
          />
        </div>
      )}
      
      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-navy-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6 text-white flex items-center">
            <Settings className="w-5 h-5 mr-2 text-pink-500" />
            Inställningar
          </h2>
          
          <div className="border border-gray-700 rounded-lg p-4">
            <h3 className="font-medium mb-3 text-white">Kontoinställningar</h3>
            
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logga ut
            </button>
          </div>
        </div>
      )}
      
      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-navy-800 p-6 rounded-lg max-w-md">
            <div className="flex items-start mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" />
              <h3 className="text-xl font-semibold text-white">Bekräfta borttagning</h3>
            </div>
            
            <p className="mb-6 text-gray-300">
              Är du säker på att du vill ta bort ditt CV? Detta kan inte ångras.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                Avbryt
              </button>
              <button
                onClick={confirmDeleteCV}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                    Tar bort...
                  </>
                ) : 'Ta bort'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}