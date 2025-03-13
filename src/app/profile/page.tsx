'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ClientLayout from '@/components/ClientLayout';
import ProfileForm from '@/components/ProfileForm';
import CVUpload from '@/components/CVUpload';
import { toast, Toaster } from 'react-hot-toast';

// Definiera typer för profildata
interface UserProfile {
  id?: string;
  email?: string;
  full_name?: string;
  phone?: string;
  preferred_tonality?: string;
  cv?: {
    name: string;
    last_updated?: string;
  } | null;
  [key: string]: any;
}

export default function ProfilePage() {
  const { user, loading: authLoading, userProfile, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [forceShowContent, setForceShowContent] = useState<boolean>(false);
  const router = useRouter();

  // Timeout-hantering för att visa sidan
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceShowContent(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // Hantera profiluppdatering
  const handleProfileUpdate = async (formData: UserProfile) => {
    if (!user) {
      toast.error("Du måste vara inloggad för att uppdatera din profil");
      return;
    }
    
    try {
      // Uppdatera profil i profiles-tabellen
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.full_name,
          phone: formData.phone,
          preferred_tonality: formData.preferred_tonality
        })
        .select();

      if (error) {
        console.error('Fel vid uppdatering av profil:', error);
        toast.error('Kunde inte spara profilinformation');
        return;
      }

      // Uppdatera profilen i kontexten
      await refreshUserProfile();
      
      toast.success("Profilinformation sparad");
    } catch (error) {
      console.error("Fel vid uppdatering av profil:", error);
      toast.error('Kunde inte spara profilinformation. Försök igen senare.');
    }
  };

  // Hantera CV-uppladdning
  const handleCVUpload = async (file: File) => {
    if (!user) {
      toast.error("Du måste vara inloggad för att ladda upp CV");
      return;
    }
    
    try {
      // Ladda upp filen till Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/cv.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) {
        console.error('Fel vid CV-uppladdning:', uploadError);
        toast.error('Kunde inte ladda upp CV');
        return;
      }

      // Uppdatera profilen med CV-information
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          cv: {
            name: file.name,
            last_updated: new Date().toISOString()
          }
        })
        .select();

      if (profileError) {
        console.error('Fel vid uppdatering av CV-information:', profileError);
        toast.error('Kunde inte uppdatera CV-information');
        return;
      }

      // Uppdatera profilen i kontexten
      await refreshUserProfile();
      
      toast.success('CV har laddats upp');
    } catch (error) {
      console.error("Fel vid CV-uppladdning:", error);
      toast.error('Kunde inte ladda upp CV. Försök igen senare.');
    }
  };

  // Hantera CV-nedladdning
  const handleDownloadCV = async () => {
    if (!user || !userProfile?.cv) {
      toast.error('Inget CV hittat');
      return;
    }

    try {
      const fileExt = userProfile.cv.name.split('.').pop();
      const fileName = `${user.id}/cv.${fileExt}`;

      // Hämta nedladdnings-URL
      const { data, error } = await supabase.storage
        .from('cvs')
        .download(fileName);

      if (error) {
        console.error('Fel vid nedladdning av CV:', error);
        toast.error('Kunde inte ladda ner CV');
        return;
      }

      // Skapa nedladdningslänk
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = userProfile.cv.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Fel vid nedladdning av CV:', error);
      toast.error('Kunde inte ladda ner CV');
    }
  };

  // Hantera lösenordsåterställning
  const handlePasswordReset = async () => {
    if (!user?.email) {
      toast.error('Ingen e-post hittad');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        console.error('Fel vid lösenordsåterställning:', error);
        toast.error('Kunde inte skicka återställningslänk');
        return;
      }

      toast.success('Återställningslänk skickad till din e-post');
    } catch (error) {
      console.error('Oväntat fel vid lösenordsåterställning:', error);
      toast.error('Något gick fel. Försök igen senare.');
    }
  };

  // Hantera kontobortagning
  const handleDeleteAccount = async () => {
    if (!user) {
      toast.error('Du måste vara inloggad');
      return;
    }

    if (!window.confirm('Är du säker? Detta kan inte ångras.')) {
      return;
    }

    try {
      // Ta bort användarens profil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.error('Fel vid borttagning av profil:', profileError);
        toast.error('Kunde inte ta bort kontot');
        return;
      }

      // Ta bort användarens CV från storage
      await supabase.storage
        .from('cvs')
        .remove([`${user.id}/cv.pdf`, `${user.id}/cv.docx`]);

      // Ta bort alla användarens brev
      await supabase
        .from('letters')
        .delete()
        .eq('user_id', user.id);

      // Ta bort användaren från auth
      const { error: authError } = await supabase.auth.signOut();

      if (authError) {
        console.error('Fel vid utloggning:', authError);
      }

      // Omdirigera till startsidan
      router.push('/');
      toast.success('Konto borttaget');
    } catch (error) {
      console.error('Fel vid kontobortagning:', error);
      toast.error('Kunde inte ta bort kontot. Försök igen senare.');
    }
  };

  // Laddningsskärm
  if ((authLoading || loading) && !forceShowContent) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-pink-500 border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400">Laddar profilinformation...</p>
        <button 
          onClick={() => setForceShowContent(true)}
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white"
        >
          Fortsätt utan att vänta
        </button>
      </div>
    );
  }

  if (!user && !forceShowContent) {
    return null; // Kommer att omdirigeras via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <ClientLayout>
        <div className="container mx-auto px-4 py-8">
          <Toaster position="top-right" />
          
          <h1 className="text-3xl font-bold mb-6">Min <span className="text-pink-500">profil</span></h1>
          
          <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
            {/* Tab-meny */}
            <div className="flex border-b border-gray-700">
              {['profile', 'cv', 'settings'].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === tab
                      ? 'border-b-2 border-pink-500 text-pink-500'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'profile' ? 'Profilinformation' : tab === 'cv' ? 'Mitt CV' : 'Inställningar'}
                </button>
              ))}
            </div>

            {/* Tab-innehåll */}
            <div className="p-6">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Profilinformation</h2>
                  <ProfileForm 
                    user={user} 
                    initialData={userProfile || {}} 
                    onSubmit={handleProfileUpdate}
                  />
                </div>
              )}

              {activeTab === 'cv' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Mitt CV</h2>
                  <p className="text-gray-400 mb-4">
                    Ladda upp ditt standard-CV som kommer användas automatiskt när du skapar nya ansökningsbrev.
                  </p>
                  <CVUpload 
                    savedCV={userProfile?.cv}
                    onUpload={handleCVUpload}
                    onDownload={handleDownloadCV}
                  />
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Inställningar</h2>
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-700 rounded-lg">
                      <h3 className="font-medium mb-2">Byt lösenord</h3>
                      <p className="text-sm text-gray-400 mb-3">
                        Av säkerhetsskäl är det bra att regelbundet byta lösenord.
                      </p>
                      <button 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded text-sm"
                        onClick={handlePasswordReset}
                      >
                        Skicka återställningslänk
                      </button>
                    </div>

                    <div className="p-4 border border-gray-700 rounded-lg">
                      <h3 className="font-medium mb-2">Ta bort konto</h3>
                      <p className="text-sm text-gray-400 mb-3">
                        Detta kommer att radera all din data och kan inte ångras.
                      </p>
                      <button 
                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded text-sm"
                        onClick={handleDeleteAccount}
                      >
                        Ta bort mitt konto
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ClientLayout>
    </div>
  );
}