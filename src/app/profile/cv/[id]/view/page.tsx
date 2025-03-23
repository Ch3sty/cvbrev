'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { ArrowLeft, Pencil, AlertTriangle } from 'lucide-react';
import { use } from 'react';

export default function CVViewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cvData, setCvData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  
  // Unwrap params med React.use()
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  // Funktion för att formatera datum
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Okänt datum';
    
    try {
      const date = new Date(dateString);
      
      // Kontrollera om datumet är giltigt
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

  // Hämta CV-data från databasen
  useEffect(() => {
    async function fetchCVData() {
      try {
        setLoading(true);
        setError(null);
        
        // Hämta aktuell användarsession
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }
        
        // Hämta CV-data
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
        } else {
          setError('Inget CV hittades');
        }
      } catch (error) {
        console.error('Fel vid hämtning av CV:', error);
        setError('Ett fel uppstod vid hämtning av CV');
      } finally {
        setLoading(false);
      }
    }
    
    fetchCVData();
  }, [id, router, supabase]);

  const handleBack = () => {
    router.push('/profile');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-screen-lg mx-auto pt-8 pb-16 px-4">
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBack}
            className="flex items-center mr-4 px-3 py-2 bg-navy-700 hover:bg-navy-600 rounded-md text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka
          </button>
        </div>
        
        <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-md flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-500">Fel</h3>
            <p className="text-gray-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto pt-8 pb-16 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="flex items-center mr-4 px-3 py-2 bg-navy-700 hover:bg-navy-600 rounded-md text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka
          </button>
          <h1 className="text-2xl font-bold text-white">{cvData?.file_name || 'CV'}</h1>
        </div>
        
        {cvData && (
          <Link 
            href={`/profile/cv/${cvData.id}/edit`}
            className="inline-flex items-center px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Redigera
          </Link>
        )}
      </div>
      
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
          
          <div className="bg-navy-700 border border-gray-600 rounded-md p-6 whitespace-pre-wrap">
            {cvData.cv_text}
          </div>
        </div>
      )}
    </div>
  );
}