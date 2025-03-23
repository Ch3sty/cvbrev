'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCVStore } from '@/store/cv-store'
import { useLetters } from '@/hooks/use-letters'
import { 
  FileText, 
  Upload, 
  MessageSquare, 
  ChevronDown, 
  Info, 
  Building2, 
  Sparkles, 
  Lightbulb, 
  Trophy, 
  Scale, 
  Bot
} from 'lucide-react'
import Notification from '@/components/ui/notification' // Importera notifikationskomponenten

type Tonality = 'professional' | 'enthusiastic' | 'creative' | 'confident' | 'balanced' | 'auto'
type Language = 'sv' | 'en'

interface TonalityInfo {
  label: string;
  description: string;
  icon: React.ReactNode;
  recommendedFor: string;
}

// Tonalitetsbeskrivningar med mer utförlig information och Lucide-ikoner
const tonalityInfo: Record<Tonality, TonalityInfo> = {
  'professional': {
    label: 'Professionell',
    description: 'Formell och saklig ton som lägger fokus på kompetens och erfarenhet.',
    icon: <Building2 className="w-5 h-5 text-blue-400" />,
    recommendedFor: 'Traditionella branscher som bank, juridik och offentlig sektor.'
  },
  'enthusiastic': {
    label: 'Entusiastisk',
    description: 'Energisk och passionerad ton som visar stort intresse för tjänsten.',
    icon: <Sparkles className="w-5 h-5 text-pink-400" />,
    recommendedFor: 'Kreativa yrken, startups och kundorienterade roller.'
  },
  'creative': {
    label: 'Kreativ',
    description: 'Innovativ och nytänkande ton som framhäver din kreativa sida.',
    icon: <Lightbulb className="w-5 h-5 text-yellow-400" />,
    recommendedFor: 'Design, marknadsföring och kulturella sektorer.'
  },
  'confident': {
    label: 'Självsäker',
    description: 'Stark och bestämd ton som betonar prestationer och resultat.',
    icon: <Trophy className="w-5 h-5 text-amber-400" />,
    recommendedFor: 'Chefsroller, sälj och konsultroller.'
  },
  'balanced': {
    label: 'Balanserad',
    description: 'En harmonisk blandning av professionalitet och personlighet.',
    icon: <Scale className="w-5 h-5 text-emerald-400" />,
    recommendedFor: 'De flesta tjänster när du är osäker.'
  },
  'auto': {
    label: 'AI-val (Rekommenderas)',
    description: 'Låt AI analysera jobbannonsen och välja den bästa anpassade tonen baserat på bransch, företagskultur och tjänst.',
    icon: <Bot className="w-5 h-5 text-purple-400" />,
    recommendedFor: 'Alla ansökningar för att maximera dina chanser att få jobbet.'
  }
};

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
  const [tonality, setTonality] = useState<Tonality>('auto') // Default är nu 'auto'
  const [language, setLanguage] = useState<Language>('sv')
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null)
  const [letterData, setLetterData] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isTonalityOpen, setIsTonalityOpen] = useState(false)
  
  // Notifikationsstate
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'loading' as 'loading' | 'success' | 'error' | 'info',
    progress: 0
  })
  
  // Ref till brevinnehållet för PDF-generering
  const letterContentRef = useRef<HTMLDivElement>(null);
  const tonalityDropdownRef = useRef<HTMLDivElement>(null);
  
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
      if (tonalityDropdownRef.current && !tonalityDropdownRef.current.contains(event.target as Node)) {
        setIsTonalityOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
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
  
  // Stäng notifikationen
  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  }, []);
  
 // Visa notifikation med typ och meddelande - wrappat i useCallback för att förhindra oändlig rendering
  const showNotification = useCallback((type: 'loading' | 'success' | 'error' | 'info', message: string, duration?: number) => {
    setNotification({
      isVisible: true,
      message,
      type,
      progress: type === 'loading' ? 0 : 100
    });
    
    // Auto-close för success och error notifikationer
    if (type !== 'loading' && duration) {
      setTimeout(closeNotification, duration);
    }
  }, [closeNotification]);
  
  // Funktion för att generera brev
  const generateLetter = useCallback(async () => {
    if (!selectedCV || !jobDescription) {
      setError('Välj ett CV och lägg till en jobbannons.');
      showNotification('error', 'Välj ett CV och lägg till en jobbannons', 3000);
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
    
    // Visa notifikation för användaren
    showNotification('loading', 'Genererar ditt brev...');
    
    try {
      // Skapa en säkerhetstimer som återställer UI efter 45 sekunder
      // om något går fel och flaggorna inte återställs
      const safetyTimer = setTimeout(() => {
        if (generationInProgressRef.current) {
          console.log('Säkerhetsåterställning av UI efter timeout');
          generationInProgressRef.current = false;
          setIsSubmitting(false);
          closeNotification();
          showNotification('error', 'Genereringen tog för lång tid, försök igen', 5000);
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
      
      closeNotification();
      
      // Om resultatet är null, kan det vara för att ett anrop redan pågår
      if (!result) {
        console.log('Inget resultat från createLetter - kan bero på ett pågående anrop');
        setError('Kunde inte generera brev. Försök igen om en stund.');
        showNotification('error', 'Kunde inte generera brevet', 5000);
        return;
      }
      
      // Spara resultatet för att visa i UI:t och för senare användning
      setGeneratedLetter(result.content);
      setLetterData(result);
      
      showNotification('success', 'Brevet har genererats!', 3000);
    } catch (error: any) {
      closeNotification();
      showNotification('error', 'Ett fel uppstod vid generering av brevet', 5000);
      setError(error.message || 'Ett fel uppstod vid generering av brevet.');
    } finally {
      // Återställ lokala flaggor, oavsett resultat
      generationInProgressRef.current = false;
      setIsSubmitting(false);
    }
  }, [selectedCV, jobDescription, tonality, language, isGenerating, isSubmitting, createLetter, showNotification, closeNotification]);
  
  // Funktion för att spara brevet till databasen
  const handleSaveLetter = useCallback(async () => {
    if (!letterData) return;
    
    try {
      setIsSaving(true);
      showNotification('loading', 'Sparar brevet...');
      
      // Anropa API:et för att spara brevet
      const savedLetter = await saveLetter(letterData);
      
      closeNotification();
      
      if (savedLetter) {
        // Uppdatera lokalt letterData för att reflektera att det nu är sparat
        setLetterData({
          ...letterData,
          id: savedLetter.id,
          is_saved: true
        });
        
        showNotification('success', 'Brevet har sparats! Du hittar det under "Mina brev".', 3000);
      }
    } catch (error: any) {
      closeNotification();
      showNotification('error', 'Kunde inte spara brevet', 5000);
      setError(error.message || 'Kunde inte spara brevet.');
    } finally {
      setIsSaving(false);
    }
  }, [letterData, saveLetter, showNotification, closeNotification]);
  
  // Funktion för att navigera till redigeringssidan efter att brevet sparats
  const handleEdit = useCallback(() => {
    if (letterData && letterData.id) {
      router.push(`/my-letters/${letterData.id}/edit`);
    } else {
      showNotification('error', 'Brevet måste sparas innan det kan redigeras', 3000);
      setError('Brevet måste sparas innan det kan redigeras.');
    }
  }, [letterData, router, showNotification]);
  
  // Funktion för att ladda ner brevet som PDF
  const handleDownloadAsPdf = useCallback(async () => {
    if (!generatedLetter || !letterContentRef.current) return;
    
    try {
      setIsDownloading(true);
      showNotification('loading', 'Förbereder PDF-nedladdning...');
      
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
        
        closeNotification();
        showNotification('success', 'Brevet har laddats ned som PDF!', 3000);
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
        
        closeNotification();
        showNotification('success', 'Brevet har laddats ned som PDF!', 3000);
      }
    } catch (error) {
      console.error('PDF nedladdningsfel:', error);
      closeNotification();
      showNotification('error', 'Kunde inte ladda ner brevet som PDF', 5000);
      setError('Kunde inte ladda ner brevet som PDF. Försök igen.');
    } finally {
      setIsDownloading(false);
    }
  }, [generatedLetter, letterData, showNotification, closeNotification]);
  
  // Funktion för att hantera nerladdning av brevet som docx
  const handleDownloadAsDocx = useCallback(async () => {
    if (!generatedLetter || !letterData) return;
    
    try {
      // Sätt loading state
      setIsDownloading(true);
      showNotification('loading', 'Förbereder DOCX-nedladdning...');
      
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
      
      closeNotification();
      
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
      showNotification('success', 'Brevet har laddats ned som DOCX!', 3000);
    } catch (error) {
      console.error('DOCX nedladdningsfel:', error);
      setError('Kunde inte ladda ner brevet som DOCX. Försök igen.');
      showNotification('error', 'Nedladdning misslyckades', 5000);
    } finally {
      setIsDownloading(false);
    }
  }, [generatedLetter, letterData, showNotification, closeNotification]);
  
  // Beräkna om knappen ska vara inaktiverad
  const isButtonDisabled = isGenerating || isSubmitting || !selectedCV || !jobDescription;
  
  return (
    <div className="container max-w-6xl px-4 py-8 mx-auto">
      {/* Notifikationskomponent */}
      <Notification 
        isVisible={notification.isVisible}
        message={notification.message}
        type={notification.type}
        progress={notification.progress}
        onClose={closeNotification}
      />
      
      <h1 className="mb-6 text-3xl font-bold text-white">Skapa ditt personliga ansökningsbrev</h1>
      <p className="mb-8 text-gray-300">
        Välj ditt CV och klistra in jobbannonsen för att generera ett personligt brev
      </p>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          {/* CV-val */}
          <div>
            <h2 className="mb-2 text-xl font-semibold text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-400" />
              Välj ditt CV
            </h2>
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
            <h2 className="mb-2 text-xl font-semibold text-white flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-purple-400" />
              Jobbannons
            </h2>
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
            {/* Tonalitet - Med modern dropdown och infokort */}
            <div className="relative w-full" ref={tonalityDropdownRef}>
              <div className="flex items-center mb-2">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-pink-400" />
                  Tonalitet 
                </h2>
                <div className="ml-2 text-gray-400 flex items-center text-sm">
                  <Info className="w-4 h-4 mr-1" />
                  <span>Välj hur ditt brev ska låta</span>
                </div>
              </div>
              
              {/* Tonalitetsväljare */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setIsTonalityOpen(!isTonalityOpen)}
                  disabled={isGenerating || isSubmitting}
                  className="flex items-center justify-between w-full px-4 py-3 text-white bg-navy-800 border border-gray-700 rounded-md"
                >
                  <div className="flex items-center">
                    {tonalityInfo[tonality].icon}
                    <span className="ml-2">{tonalityInfo[tonality].label}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${isTonalityOpen ? 'transform rotate-180' : ''}`} />
                </button>
                
                {isTonalityOpen && (
                  <div className="absolute z-30 w-full mt-1 bg-navy-700 border border-gray-600 rounded-md shadow-lg">
                    {(Object.entries(tonalityInfo) as [Tonality, TonalityInfo][]).map(([value, info]) => (
                      <div key={value} className="border-b border-gray-700 last:border-0">
                        <button
                          onClick={() => {
                            setTonality(value);
                            setIsTonalityOpen(false);
                          }}
                          className={`flex items-center w-full p-3 text-left hover:bg-navy-600 ${
                            tonality === value ? 'bg-navy-600' : ''
                          }`}
                        >
                          <div className="flex-shrink-0">{info.icon}</div>
                          <div className="ml-3">
                            <p className={`font-medium ${tonality === value ? 'text-pink-400' : 'text-white'}`}>
                              {info.label}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">{info.description}</p>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Tonalitets-info */}
              <div className="p-4 bg-navy-800/50 rounded-md border border-gray-700">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">{tonalityInfo[tonality].icon}</div>
                  <div className="ml-3">
                    <p className="text-white font-medium">{tonalityInfo[tonality].label}</p>
                    <p className="text-sm text-gray-400 mt-1">{tonalityInfo[tonality].description}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      <span className="text-pink-400 font-medium">Rekommenderas för:</span> {tonalityInfo[tonality].recommendedFor}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Språkval */}
            <div className="w-full">
              <h2 className="mb-2 text-xl font-semibold text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 5H12M2 5V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7H4C2.89543 7 2 6.10457 2 5ZM2 5C2 3.89543 2.89543 3 4 3H8C9.10457 3 10 3.89543 10 5V7" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 13L8 16.5M8 16.5L7 20M8 16.5L5 16.5M8 16.5L11 16.5" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17 12L15 17L19 17" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Språk
              </h2>
              <div className="flex p-1 bg-navy-800 border border-gray-700 rounded-md">
                <button
                  onClick={() => setLanguage('sv')}
                  disabled={isGenerating || isSubmitting}
                  className={`flex-1 px-4 py-2 rounded-md font-medium flex items-center justify-center ${
                    language === 'sv' 
                      ? 'bg-pink-600/80 text-white' 
                      : 'text-gray-300 hover:bg-navy-700'
                  }`}
                >
                  <span className="mr-2">🇸🇪</span>
                  Svenska
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  disabled={isGenerating || isSubmitting}
                  className={`flex-1 px-4 py-2 rounded-md font-medium flex items-center justify-center ${
                    language === 'en' 
                      ? 'bg-pink-600/80 text-white' 
                      : 'text-gray-300 hover:bg-navy-700'
                  }`}
                >
                  <span className="mr-2">🇬🇧</span>
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
          
          {/* Genereringsknapp */}
          <button
            onClick={generateLetter}
            disabled={isButtonDisabled}
            className="w-full py-3 font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
            aria-label={isGenerating || isSubmitting ? "Genererar brev..." : "Skapa ansökningsbrev"}
          >
            {isGenerating || isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Genererar...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Upload className="w-5 h-5 mr-2" />
                Skapa ansökningsbrev
              </span>
            )}
          </button>
        </div>
        
        {/* Förhandsvisning - Gjord bredare */}
        <div className="p-6 overflow-auto bg-navy-800 rounded-lg" style={{ maxHeight: '80vh' }}>
          <h2 className="mb-4 text-xl font-semibold text-white flex items-center">
            <FileText className="w-5 h-5 mr-2 text-green-400" />
            Ditt ansökningsbrev
          </h2>
          
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
                  className="px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sparar...
                    </>
                  ) : letterData && letterData.is_saved ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Sparat
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Spara brev
                    </>
                  )}
                </button>
                
                {/* Redigera-knapp - visas endast om brevet har sparats */}
                {letterData && letterData.is_saved && letterData.id && (
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Redigera
                  </button>
                )}
                
                {/* Nedladdningsknappar */}
                <button
                  onClick={handleDownloadAsDocx}
                  disabled={isDownloading}
                  className="px-4 py-2 font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed flex items-center"
                >
                  {isDownloading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Laddar ner...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      DOCX
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleDownloadAsPdf}
                  disabled={isDownloading}
                  className="px-4 py-2 font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:bg-orange-800 disabled:cursor-not-allowed flex items-center"
                >
                  {isDownloading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Laddar ner...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      PDF
                    </>
                  )}
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