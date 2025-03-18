"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useProfile } from '@/hooks/use-profile';
import { Tab } from '@/components/ui/tab';

// Ikon-komponenter
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

export default function ProfilePage() {
  // Använd createClientComponentClient för klient-sidan
  // Denna behöver inte ändras eftersom den används i en klient-komponent
  // och inte i en route handler eller middleware
  const supabase = createClientComponentClient();
  const { profile, cv, loading, updateProfile, uploadCV } = useProfile();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
  
  // Handle CV file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const validTypes = ['.pdf', '.docx', '.txt'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!validTypes.some(type => fileExt.endsWith(type))) {
        alert('Ogiltig filtyp. Endast PDF, DOCX och TXT är tillåtna.');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Filen är för stor. Maximal storlek är 5MB.');
        return;
      }
      
      setSelectedFile(file);
    }
  };
  
  // Upload CV
  const handleUploadCV = async () => {
    if (!selectedFile) {
      alert('Välj en CV-fil först');
      return;
    }
    
    try {
      setUploading(true);
      const success = await uploadCV(selectedFile);
      
      if (success) {
        setSelectedFile(null);
      }
    } finally {
      setUploading(false);
    }
  };
  
  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // Validate input
      if (formData.full_name.trim() === '') {
        alert('Ange ditt namn');
        return;
      }
      
      const success = await updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        preferred_tonality: formData.preferred_tonality as any
      });
      
      if (success) {
        alert('Profil uppdaterad');
      }
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
      <h1 className="text-3xl font-bold text-pink-500 mb-2">Min profil</h1>
      <p className="text-gray-200 mb-8">Hantera din profil, dina CV och inställningar</p>
      
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
            <UserIcon />
            <span className="ml-2">Profilinformation</span>
          </button>
          
          <button
            onClick={() => setActiveTab('cv')}
            className={`flex items-center px-4 py-2 rounded-t-lg ${
              activeTab === 'cv' 
                ? 'text-pink-500 border-b-2 border-pink-500 font-medium' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <DocumentIcon />
            <span className="ml-2">Mitt CV</span>
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center px-4 py-2 rounded-t-lg ${
              activeTab === 'settings' 
                ? 'text-pink-500 border-b-2 border-pink-500 font-medium' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <SettingsIcon />
            <span className="ml-2">Inställningar</span>
          </button>
        </div>
      </div>
      
      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Profilinformation</h2>
          
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
                className="w-full px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                className="w-full px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                className="w-full px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                <SaveIcon />
                <span className="ml-2">{saving ? 'Sparar ändringar...' : 'Spara ändringar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* CV Tab */}
      {activeTab === 'cv' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6">Mitt CV</h2>
          
          {/* Current CV */}
          {cv && cv.url ? (
            <div className="border border-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="p-2 bg-gray-700 rounded-md mr-4">
                  <DocumentIcon />
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Nuvarande CV</h3>
                  <p className="text-sm text-gray-300 mb-1">{cv.name}</p>
                  
                  {cv.lastUpdated && (
                    <p className="text-xs text-gray-400 mb-3">
                      Uppdaterad: {new Date(cv.lastUpdated).toLocaleDateString('sv-SE')}
                    </p>
                  )}
                  
                  <div className="flex space-x-3 mt-2">
                    <a
                      href={cv.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                    >
                      Visa CV
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-gray-700 rounded-lg p-4 mb-6 text-center">
              <p className="text-gray-300 mb-2">Du har inte laddat upp något CV ännu.</p>
            </div>
          )}
          
          <h3 className="font-medium mb-3">Ladda upp CV</h3>
          
          <div className="bg-blue-900/30 border-l-4 border-blue-500 p-4 mb-4 text-sm text-blue-200">
            <p>För bästa resultat, ladda upp en CV i PDF eller DOCX-format.</p>
          </div>
          
          <div className="mb-4">
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              id="cv-upload"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
              <label htmlFor="cv-upload" className="inline-block">
                <span className="inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md cursor-pointer transition-colors">
                  Välj fil
                </span>
              </label>
              
              {selectedFile && (
                <span className="inline-flex items-center px-3 py-2 bg-gray-700 text-white rounded-md">
                  <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                </span>
              )}
              
              <button
                onClick={handleUploadCV}
                disabled={!selectedFile || uploading}
                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors disabled:bg-gray-700 disabled:text-gray-400"
              >
                {uploading ? 'Laddar upp...' : 'Ladda upp CV'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6">Inställningar</h2>
          
          <div className="border border-gray-700 rounded-lg p-4">
            <h3 className="font-medium mb-3">Kontoinställningar</h3>
            
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Logga ut
            </button>
          </div>
        </div>
      )}
    </div>
  );
}