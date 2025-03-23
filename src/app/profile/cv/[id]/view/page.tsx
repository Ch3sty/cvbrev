'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft } from 'lucide-react';

// CV View Page
export default function ViewCVPage({ params }: any) {
  const router = useRouter();
  const [cvData, setCvData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  // Hämta CV-data baserat på ID
  useEffect(() => {
    async function fetchCVData() {
      try {
        setIsLoading(true);
        
        // Verifiera inloggning
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        
        const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : null;
        
        if (!id) {
          setError('Ogiltigt CV ID');
          setIsLoading(false);
          return;
        }
        
        // Hämta CV-data från databasen
        const { data, error } = await supabase
          .from('cv_texts')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Få publika URL:en om det behövs för visning
          const { data: { publicUrl } } = supabase.storage
            .from('cvs')
            .getPublicUrl(data.original_file_path);
          
          setCvData({
            ...data,
            publicUrl
          });
        } else {
          setError('Kunde inte hitta CV');
        }
      } catch (error: any) {
        console.error('Error fetching CV:', error);
        setError(error.message || 'Ett fel uppstod');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (params && params.id) {
      fetchCVData();
    }
  }, [params, router, supabase]);

  // Visa laddningsindikator
  if (isLoading) {
    return (
      <div className="container max-w-4xl px-4 py-8 mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Visa felmeddelande
  if (error || !cvData) {
    return (
      <div className="container max-w-4xl px-4 py-8 mx-auto">
        <div className="p-4 bg-red-500 rounded-md">
          <h2 className="mb-2 text-xl font-bold text-white">Ett fel uppstod</h2>
          <p className="text-white">{error || 'CV kunde inte hittas'}</p>
          <Link href="/profile" className="inline-block px-4 py-2 mt-4 text-white bg-red-700 rounded-md hover:bg-red-800">
            Tillbaka till profil
          </Link>
        </div>
      </div>
    );
  }

  // Huvudinnehåll
  return (
    <div className="container max-w-4xl px-4 py-8 mx-auto">
      <div className="flex flex-col mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">{cvData.file_name || 'Mitt CV'}</h1>
          <div className="mb-4">
            {cvData.created_at && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Uppladdad {new Date(cvData.created_at).toLocaleDateString('sv-SE')}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex mt-4 space-x-2 md:mt-0">
          {cvData.publicUrl && (
            <a
              href={cvData.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Öppna PDF
            </a>
          )}
        </div>
      </div>

      <div className="p-8 overflow-auto bg-white rounded-lg shadow-lg">
        <pre className="whitespace-pre-wrap text-gray-800 font-sans">
          {cvData.cv_text}
        </pre>
      </div>

      <div className="flex justify-between mt-6">
        <Link
          href="/profile"
          className="px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka till profil
        </Link>
      </div>
    </div>
  );
}