'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCVStore } from '@/store/cv-store'
import { useLetters } from '@/hooks/use-letters'

type Tonality = 'professional' | 'enthusiastic' | 'creative' | 'confident' | 'balanced'

const tonalityLabels: Record<Tonality, string> = {
  'professional': 'Professionell',
  'enthusiastic': 'Entusiastisk',
  'creative': 'Kreativ',
  'confident': 'Självsäker',
  'balanced': 'Balanserad'
};

export default function CreateLetterPage() {
  // Använd de anpassade hooks
  const { cvs, fetchCVs, isLoading: cvsLoading } = useCVStore();
  const { createLetter, isGenerating } = useLetters();
  
  const [selectedCV, setSelectedCV] = useState<string | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [tonality, setTonality] = useState<Tonality>('professional')
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  
  // Ref för att förhindra dubblettladdningar
  const initialLoadRef = useRef(false);
  
  // Hämta användarens CV:n vid sidladdning, men bara en gång
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      fetchCVs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Välj det senaste CV:t som standard när data hämtats
  useEffect(() => {
    if (cvs.length > 0 && !selectedCV) {
      setSelectedCV(cvs[0].id);
    }
  }, [cvs, selectedCV]);
  
  const handleGenerateLetter = async () => {
    if (!selectedCV || !jobDescription) {
      setError('Välj ett CV och lägg till en jobbannons.');
      return;
    }
    
    setError(null);
    
    try {
      // Använd createLetter-funktionen från useLetters-hooken
      const result = await createLetter({
        cv_id: selectedCV,
        job_description: jobDescription,
        tonality: tonality
      });
      
      if (!result) {
        throw new Error('Ett fel uppstod vid generering av brevet.');
      }
      
      setGeneratedLetter(result.content);
      
      // Omdirigera till brevvisningssidan
      if (result.id) {
        router.push(`/my-letters/${result.id}`);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };
  
  return (
    <div className="container max-w-5xl px-4 py-8 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-white">Skapa ditt personliga ansökningsbrev</h1>
      <p className="mb-8 text-gray-300">
        Välj ditt CV och klistra in jobbannonsen för att generera ett personligt brev
      </p>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-6">
          {/* CV-val */}
          <div>
            <h2 className="mb-2 text-xl font-semibold text-white">Välj ditt CV</h2>
            {cvsLoading ? (
              <div className="flex items-center justify-center h-20">
                <div className="w-6 h-6 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin"></div>
              </div>
            ) : cvs.length === 0 ? (
              <div className="p-4 mb-4 text-white bg-navy-800 rounded-md">
                <p>Du har inte laddat upp något CV ännu.</p>
                <button
                  onClick={() => router.push('/profile/cv')}
                  className="px-4 py-2 mt-2 font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700"
                >
                  Ladda upp CV
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {cvs.map((cv) => (
                  <div
                    key={cv.id}
                    onClick={() => setSelectedCV(cv.id)}
                    className={`p-4 cursor-pointer rounded-md ${
                      selectedCV === cv.id ? 'bg-navy-700 border border-pink-500' : 'bg-navy-800 hover:bg-navy-700'
                    }`}
                  >
                    <p className="font-medium text-white">{cv.file_name}</p>
                    <p className="text-sm text-gray-400">
                      {cv.cv_text.substring(0, 100)}...
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Jobbannons */}
          <div>
            <h2 className="mb-2 text-xl font-semibold text-white">Jobbannons</h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Klistra in jobbannonsen här..."
              className="w-full h-64 p-3 text-white bg-navy-800 border border-gray-700 rounded-md resize-none"
            />
          </div>
          
          {/* Tonalitet */}
          <div>
            <h2 className="mb-2 text-xl font-semibold text-white">Tonalitet</h2>
            <p className="mb-4 text-sm text-gray-400">Välj stil för ditt brev</p>
            
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              {(Object.entries(tonalityLabels) as [Tonality, string][]).map(([value, label]) => (
                <div
                  key={value}
                  onClick={() => setTonality(value)}
                  className={`p-3 text-center cursor-pointer rounded-md ${
                    tonality === value ? 'bg-pink-600 text-white' : 'bg-navy-800 text-gray-300 hover:bg-navy-700'
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
          
          {/* Felmeddelande */}
          {error && (
            <div className="p-3 text-white bg-red-500 rounded-md">
              {error}
            </div>
          )}
          
          {/* Genereringsknapp */}
          <button
            onClick={handleGenerateLetter}
            disabled={isGenerating || !selectedCV || !jobDescription}
            className="w-full py-3 font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Genererar...' : 'Skapa ansökningsbrev'}
          </button>
        </div>
        
        {/* Förhandsvisning */}
        <div className="p-6 bg-navy-800 rounded-lg">
          <h2 className="mb-4 text-xl font-semibold text-white">Ditt ansökningsbrev</h2>
          
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-10 h-10 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin"></div>
              <p className="text-gray-300">Genererar ditt personliga brev...</p>
            </div>
          ) : generatedLetter ? (
            <div className="p-6 bg-white rounded-md">
              <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: generatedLetter.replace(/\n/g, '<br />') }} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="p-4 mb-4 text-6xl">📝</div>
              <p className="mb-2 text-lg text-gray-300">Ditt ansökningsbrev kommer att visas här</p>
              <p className="text-sm text-gray-400">Välj ett CV och klistra in en jobbannons för att generera ett personligt brev</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}