'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCVStore } from '@/store/cv-store'
import { useLetters } from '@/hooks/use-letters'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
// Import bibliotek för PDF-generering när de är installerade
// import jsPDF from 'jspdf'
// import html2canvas from 'html2canvas'

type Tonality = 'professional' | 'enthusiastic' | 'creative' | 'confident' | 'balanced'
type Language = 'sv' | 'en'

const tonalityLabels: Record<Tonality, string> = {
  'professional': 'Professionell',
  'enthusiastic': 'Entusiastisk',
  'creative': 'Kreativ',
  'confident': 'Självsäker',
  'balanced': 'Balanserad'
};

// En debounce-funktion för att förhindra snabba dubbelklick
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}

// Dynamisk import av PDF bibliotek (för att undvika server-side rendering problem)
const loadPdfLibs = async () => {
  const jsPDFModule = await import('jspdf');
  const html2canvasModule = await import('html2canvas');
  return {
    jsPDF: jsPDFModule.default,
    html2canvas: html2canvasModule.default
  };
};

export default function CreateLetterPage() {
  // Använd de anpassade hooks
  const { cvs, fetchCVs, isLoading: cvsLoading } = useCVStore();
  const { createLetter, saveLetter, isGenerating } = useLetters();
  
  const [selectedCV, setSelectedCV] = useState<string | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [tonality, setTonality] = useState<Tonality>('professional')
  const [language, setLanguage] = useState<Language>('sv')
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null)
  const [letterData, setLetterData] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isTonalityOpen, setIsTonalityOpen] = useState(false)
  
  // Ref till brevinnehållet för PDF-generering
  const letterContentRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter()
  
  // Ref för att förhindra dubblettladdningar
  const initialLoadRef = useRef(false);
  // Ref för att förhindra dubblettgenereringar
  const generationInProgressRef = useRef(false);
  // Timestamp för senaste genereringsförsöket
  const lastGenerationAttemptRef = useRef(0);
  
  // Stäng dropdownmenyn för tonalitet när användaren klickar utanför
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isTonalityOpen && !target.closest('.tonality-dropdown')) {
        setIsTonalityOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTonalityOpen]);
  
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
  
  // Återställ isSubmitting-state när isGenerating ändras till false
  useEffect(() => {
    if (!isGenerating && isSubmitting) {
      setIsSubmitting(false);
      generationInProgressRef.current = false;
    }
  }, [isGenerating, isSubmitting]);
  
  // Funktion för att generera brev
  const generateLetter = useCallback(async () => {
    if (!selectedCV || !jobDescription) {
      setError('Välj ett CV och lägg till en jobbannons.');
      toast.error('Välj ett CV och lägg till en jobbannons');
      return;
    }
    
    // Förhindra genereringar som sker för nära varandra i tid (3 sekunder)
    const now = Date.now();
    if (now - lastGenerationAttemptRef.current < 3000) {
      console.log('Förhindrar för snabba genereringsförsök');
      return;
    }
    
    // Förhindra dubblettanrop om generering redan pågår
    if (generationInProgressRef.current || isGenerating || isSubmitting) {
      console.log('Förhindrar dubblett brevgenerering, en generering pågår redan');
      return;
    }
    
    setError(null);
    // Återställ tidigare genererat brev och resultat
    setGeneratedLetter(null);
    setLetterData(null);
    
    // Sätt lokala flaggor för att förhindra dubblettanrop
    setIsSubmitting(true);
    generationInProgressRef.current = true;
    lastGenerationAttemptRef.current = now;
    
    toast.info('Genererar ditt brev...', { autoClose: false, toastId: 'generating' });
    
    try {
      // Skapa en säkerhetstimer som återställer UI efter 45 sekunder
      // om något går fel och flaggorna inte återställs
      const safetyTimer = setTimeout(() => {
        if (generationInProgressRef.current) {
          console.log('Säkerhetsåterställning av UI efter timeout');
          generationInProgressRef.current = false;
          setIsSubmitting(false);
          toast.dismiss('generating');
          toast.error('Genereringen tog för lång tid, försök igen');
        }
      }, 45000);
      
      // Generera innehållet för brevet men utan att spara det i databasen
      const result = await createLetter({
        cv_id: selectedCV,
        job_description: jobDescription,
        tonality: tonality,
        language: language,
        save: false // Indikera att vi inte vill spara brevet ännu
      });
      
      // Rensa säkerhetstimern
      clearTimeout(safetyTimer);
      
      toast.dismiss('generating');
      
      // Om resultatet är null, kan det vara för att ett anrop redan pågår
      if (!result) {
        console.log('Inget resultat från createLetter - kan bero på ett pågående anrop');
        setError('Kunde inte generera brev. Försök igen om en stund.');
        toast.error('Kunde inte generera brevet');
        return;
      }
      
      // Spara resultatet för att visa i UI:t och för senare användning
      setGeneratedLetter(result.content);
      setLetterData(result);
      
      toast.success('Brevet har genererats!');
    } catch (error: any) {
      toast.dismiss('generating');
      toast.error('Ett fel uppstod vid generering av brevet');
      setError(error.message || 'Ett fel uppstod vid generering av brevet.');
    } finally {
      // Återställ lokala flaggor, oavsett resultat
      generationInProgressRef.current = false;
      setIsSubmitting(false);
    }
  }, [selectedCV, jobDescription, tonality, language, isGenerating, isSubmitting, createLetter]);
  
  // Funktion för att spara brevet till databasen
  const handleSaveLetter = useCallback(async () => {
    if (!letterData) return;
    
    try {
      setIsSaving(true);
      toast.info('Sparar brevet...', { autoClose: false, toastId: 'saving' });
      
      // Anropa API:et för att spara brevet
      const savedLetter = await saveLetter(letterData);
      
      toast.dismiss('saving');
      
      if (savedLetter) {
        // Uppdatera lokalt letterData för att reflektera att det nu är sparat
        setLetterData({
          ...letterData,
          id: savedLetter.id,
          is_saved: true
        });
        
        toast.success('Brevet har sparats! Du hittar det under "Mina brev".');
      }
    } catch (error: any) {
      toast.dismiss('saving');
      toast.error('Kunde inte spara brevet');
      setError(error.message || 'Kunde inte spara brevet.');
    } finally {
      setIsSaving(false);
    }
  }, [letterData, saveLetter]);
  
  // Funktion för att navigera till redigeringssidan efter att brevet sparats
  const handleEdit = useCallback(() => {
    if (letterData && letterData.id) {
      router.push(`/my-letters/${letterData.id}/edit`);
    } else {
      toast.warning('Brevet måste sparas innan det kan redigeras');
      setError('Brevet måste sparas innan det kan redigeras.');
    }
  }, [letterData, router]);
  
  // Funktion för att ladda ner brevet som PDF
  const handleDownloadAsPdf = useCallback(async () => {
    if (!generatedLetter || !letterContentRef.current) return;
    
    try {
      setIsDownloading(true);
      toast.info('Förbereder PDF-nedladdning...', { autoClose: false, toastId: 'pdf-download' });
      
      // Dynamiskt ladda PDF-bibliotek
      try {
        const { jsPDF, html2canvas } = await loadPdfLibs();
        
        // Skapa PDF från HTML-elementet
        const contentElement = letterContentRef.current;
        const canvas = await html2canvas(contentElement, {
          scale: 2, // Högre upplösning
          useCORS: true,
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Beräkna rätt dimensions för att passa A4
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        
        // Spara PDF
        pdf.save(`${letterData?.title || 'Ansökningsbrev'}.pdf`);
        
        toast.dismiss('pdf-download');
        toast.success('Brevet har laddats ned som PDF!');
      } catch (error) {
        console.error('Fel vid laddning av PDF-bibliotek:', error);
        
        // Fallback till server-side nedladdning
        const response = await fetch('/api/letters/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: generatedLetter,
            format: 'pdf',
            metadata: {
              title: letterData?.title || 'Ansökningsbrev',
              company: letterData?.company || '',
              position: letterData?.job_title || '',
              date: new Date().toLocaleDateString('sv-SE')
            }
          }),
        });
        
        if (!response.ok) {
          throw new Error('Kunde inte generera PDF-filen');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${letterData?.title || 'Ansökningsbrev'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.dismiss('pdf-download');
        toast.success('Brevet har laddats ned som PDF!');
      }
    } catch (error) {
      console.error('PDF nedladdningsfel:', error);
      toast.dismiss('pdf-download');
      toast.error('Kunde inte ladda ner brevet som PDF');
      setError('Kunde inte ladda ner brevet som PDF. Försök igen.');
    } finally {
      setIsDownloading(false);
    }
  }, [generatedLetter, letterData]);
  
  // Funktion för att hantera nerladdning av brevet som docx
  const handleDownloadAsDocx = useCallback(async () => {
    if (!generatedLetter || !letterData) return;
    
    try {
      // Sätt loading state
      setIsDownloading(true);
      toast.info('Förbereder DOCX-nedladdning...', { autoClose: false, toastId: 'docx-download' });
      
      // Skapa metadata för dokumentet
      const metadata = {
        title: letterData.title || 'Ansökningsbrev',
        company: letterData.company || '',
        position: letterData.job_title || '',
        date: new Date().toLocaleDateString('sv-SE')
      };
      
      // Skapa en förfrågan till server-side API
      const response = await fetch('/api/letters/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: generatedLetter,
          format: 'docx',
          metadata
        }),
      });
      
      toast.dismiss('docx-download');
      
      if (!response.ok) {
        throw new Error('Kunde inte generera DOCX-filen');
      }
      
      // Få blob från svaret
      const blob = await response.blob();
      
      // Skapa en nedladdningslänk
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${metadata.title.replace(/[^a-zA-Z0-9åäöÅÄÖ]/g, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      
      // Rensa upp
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Visa notifikation
      toast.success('Brevet har laddats ned som DOCX!');
    } catch (error) {
      console.error('DOCX nedladdningsfel:', error);
      setError('Kunde inte ladda ner brevet som DOCX. Försök igen.');
      toast.error('Nedladdning misslyckades');
    } finally {
      setIsDownloading(false);
    }
  }, [generatedLetter, letterData]);
  
  // Använd en debounced version av handleGenerateLetter för att förhindra snabba dubbelklick
  const handleGenerateLetter = useCallback(
    debounce((e: React.MouseEvent) => {
      // Förhindra eventuell bubblings
      e.preventDefault();
      e.stopPropagation();
      generateLetter();
    }, 300),
    [generateLetter]
  );
  
  // Beräkna om knappen ska vara inaktiverad
  const isButtonDisabled = isGenerating || isSubmitting || !selectedCV || !jobDescription;
  
  return (
    <div className="container max-w-6xl px-4 py-8 mx-auto">
      <ToastContainer position="top-right" theme="dark" />
      
      <h1 className="mb-6 text-3xl font-bold text-white">Skapa ditt personliga ansökningsbrev</h1>
      <p className="mb-8 text-gray-300">
        Välj ditt CV och klistra in jobbannonsen för att generera ett personligt brev
      </p>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
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
                    onClick={() => !isGenerating && !isSubmitting && setSelectedCV(cv.id)}
                    className={`p-4 cursor-pointer rounded-md ${
                      selectedCV === cv.id ? 'bg-navy-700 border border-pink-500' : 'bg-navy-800 hover:bg-navy-700'
                    } ${(isGenerating || isSubmitting) ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <p className="font-medium text-white">{cv.file_name}</p>
                    <p className="text-sm text-gray-400 line-clamp-1">
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
              className="w-full h-60 p-3 text-white bg-navy-800 border border-gray-700 rounded-md resize-none"
              disabled={isGenerating || isSubmitting}
            />
          </div>
          
          {/* Inställningar (Tonalitet och Språk) */}
          <div className="flex flex-wrap gap-4">
            {/* Tonalitet - Dropdown format */}
            <div className="relative z-20 w-full sm:w-auto tonality-dropdown">
              <h2 className="mb-2 text-xl font-semibold text-white">Tonalitet</h2>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsTonalityOpen(!isTonalityOpen)}
                  disabled={isGenerating || isSubmitting}
                  className="flex items-center justify-between w-full px-4 py-2 text-white bg-navy-800 border border-gray-700 rounded-md sm:w-48"
                >
                  <span>{tonalityLabels[tonality]}</span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isTonalityOpen && (
                  <div className="absolute z-30 w-full mt-1 bg-navy-700 border border-gray-600 rounded-md shadow-lg sm:w-48">
                    {(Object.entries(tonalityLabels) as [Tonality, string][]).map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => {
                          setTonality(value);
                          setIsTonalityOpen(false);
                        }}
                        className={`block w-full px-4 py-2 text-left hover:bg-navy-600 ${
                          tonality === value ? 'bg-navy-600 text-pink-400' : 'text-white'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Språkval */}
            <div className="w-full sm:w-auto">
              <h2 className="mb-2 text-xl font-semibold text-white">Språk</h2>
              <div className="flex p-1 bg-navy-800 border border-gray-700 rounded-md">
                <button
                  onClick={() => setLanguage('sv')}
                  disabled={isGenerating || isSubmitting}
                  className={`px-4 py-1 rounded-md ${
                    language === 'sv' 
                      ? 'bg-pink-600 text-white font-medium' 
                      : 'text-gray-300 hover:bg-navy-700'
                  }`}
                >
                  Svenska
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  disabled={isGenerating || isSubmitting}
                  className={`px-4 py-1 rounded-md ${
                    language === 'en' 
                      ? 'bg-pink-600 text-white font-medium' 
                      : 'text-gray-300 hover:bg-navy-700'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
          
          {/* Felmeddelande */}
          {error && (
            <div className="p-3 text-white bg-red-500 rounded-md">
              {error}
            </div>
          )}
          
          {/* Genereringsknapp - Använda onMouseDown istället för onClick för bättre responsivitet */}
          <button
            onMouseDown={handleGenerateLetter}
            disabled={isButtonDisabled}
            className="w-full py-3 font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            aria-label={isGenerating || isSubmitting ? "Genererar brev..." : "Skapa ansökningsbrev"}
          >
            {isGenerating || isSubmitting ? (
              <span className="flex items-center justify-center">
                <span className="w-5 h-5 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></span>
                Genererar...
              </span>
            ) : (
              'Skapa ansökningsbrev'
            )}
          </button>
        </div>
        
        {/* Förhandsvisning - Gjord bredare */}
        <div className="p-6 overflow-auto bg-navy-800 rounded-lg" style={{ maxHeight: '80vh' }}>
          <h2 className="mb-4 text-xl font-semibold text-white">Ditt ansökningsbrev</h2>
          
          {isGenerating || isSubmitting ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-10 h-10 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin"></div>
              <p className="text-gray-300">Genererar ditt personliga brev...</p>
              <p className="text-sm text-gray-400">Detta kan ta upp till 30 sekunder</p>
            </div>
          ) : generatedLetter ? (
            <div>
              <div 
                ref={letterContentRef}
                className="p-6 mb-4 overflow-auto bg-white rounded-md" 
                style={{ maxHeight: '60vh' }}
              >
                <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: generatedLetter.replace(/\n/g, '<br />') }} />
              </div>
              
              {/* Åtgärdsknappar för att spara/redigera/ladda ner brevet */}
              <div className="flex flex-wrap gap-2">
                {/* Spara-knapp */}
                <button
                  onClick={handleSaveLetter}
                  disabled={isSaving || (letterData && letterData.is_saved)}
                  className="px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <span className="w-4 h-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></span>
                      Sparar...
                    </span>
                  ) : letterData && letterData.is_saved ? (
                    'Sparat'
                  ) : (
                    'Spara brev'
                  )}
                </button>
                
                {/* Redigera-knapp - visas endast om brevet har sparats */}
                {letterData && letterData.is_saved && letterData.id && (
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Redigera
                  </button>
                )}
                
                {/* Nedladdningsknappar */}
                <button
                  onClick={handleDownloadAsDocx}
                  disabled={isDownloading}
                  className="px-4 py-2 font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed"
                >
                  {isDownloading ? 'Laddar ner...' : 'Ladda ner som DOCX'}
                </button>
                
                <button
                  onClick={handleDownloadAsPdf}
                  disabled={isDownloading}
                  className="px-4 py-2 font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:bg-orange-800 disabled:cursor-not-allowed"
                >
                  {isDownloading ? 'Laddar ner...' : 'Ladda ner som PDF'}
                </button>
              </div>
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