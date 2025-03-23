'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Save, AlertTriangle } from 'lucide-react';
import { use } from 'react';

export default function CVEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cvData, setCvData] = useState<any>(null);
  const [cvText, setCvText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const supabase = createClientComponentClient();

  // Med Next.js 15 ska vi unwrappa params med use()
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  // Ref för att förhindra dubbla anrop
  const initialLoadRef = useRef(false);

  // Function to format date
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Okänt datum';
    
    try {
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Ogiltigt datum';
      }
      
      return date.toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      
    } catch (error) {
      console.error('Fel vid formatering av datum:', error);
      return 'Okänt datum';
    }
  };

  // Fetch CV data from the database
  useEffect(() => {
    async function fetchCVData() {
      if (!initialLoadRef.current) {
        try {
          setLoading(true);
          setError(null);
          
          // Get current user session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            router.push('/login');
            return;
          }
          
          // Fetch CV data
          const { data, error } = await supabase
            .from('cv_texts')
            .select('*')
            .eq('id', id)
            .eq('user_id', session.user.id)
            .single();
          
          if (error) {
            console.error('Fel vid hämtning av CV:', error);
            setError('Kunde inte hitta det begärda CV:t');
            return;
          }
          
          if (data) {
            setCvData(data);
            setCvText(data.cv_text || '');
          } else {
            setError('Inget CV hittades');
          }
        } catch (error) {
          console.error('Fel vid hämtning av CV:', error);
          setError('Ett fel uppstod vid hämtning av CV');
        } finally {
          setLoading(false);
        }
        
        initialLoadRef.current = true;
      }
    }
    
    fetchCVData();
  }, [id, router, supabase]);

  // Save updated CV text
  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccessMessage('');
      setError(null);
      
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      // Använd API-rutten för att uppdatera CV-texten
      const response = await fetch('/api/cv/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          cv_text: cvText
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte uppdatera CV-texten');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setCvData(result.data);
        setSuccessMessage('CV-texten har sparats');
        
        // Hide message after a few seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        throw new Error('Kunde inte uppdatera CV-texten');
      }
    } catch (error: any) {
      setError('Ett fel uppstod: ' + (error.message || 'Okänt fel'));
      console.error('Fel vid uppdatering av CV:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push(`/profile/cv/${id}`);
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
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-600 text-white p-3 rounded-md shadow-lg z-50">
          {successMessage}
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="flex items-center mr-4 px-3 py-2 bg-navy-700 hover:bg-navy-600 rounded-md text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka
          </button>
          <h1 className="text-2xl font-bold text-white">Redigera {cvData?.file_name || 'CV'}</h1>
        </div>
        
        {cvData && (
          <Link 
            href={`/profile/cv/${id}`}
            className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Visa CV
          </Link>
        )}
      </div>
      
      {error && (
        <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-md mb-6 flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-500">Fel</h3>
            <p className="text-gray-300">{error}</p>
          </div>
        </div>
      )}
      
      {cvData && (
        <div className="bg-navy-800 rounded-lg p-6 shadow-lg border border-gray-700">
          <div className="mb-4">
            <p className="text-sm text-gray-400">
              Uppladdad: {formatDate(cvData.created_at)} 
              {cvData.updated_at && cvData.updated_at !== cvData.created_at && 
                ` • Uppdaterad: ${formatDate(cvData.updated_at)}`
              }
            </p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="cv-text" className="block text-sm font-medium text-gray-300 mb-2">
              CV-text
            </label>
            <textarea
              id="cv-text"
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              className="w-full min-h-[500px] px-3 py-2 rounded-md bg-navy-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-y"
            />
          </div>
          
          <div className="flex justify-between">
            <Link
              href={`/profile/cv/${id}`}
              className="px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700"
            >
              Avbryt
            </Link>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md transition-colors disabled:bg-gray-700 disabled:text-gray-400"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Sparar ändringar...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Spara ändringar
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}