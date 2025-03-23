'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/hooks/use-letters';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import Notification from '@/components/ui/notification';

// Brevräknare-komponent
const LetterCounter = ({ current, max }: { current: number; max: number }) => {
  // Beräkna procentvärde för progressbaren
  const percentage = (current / max) * 100;
  
  // Bestäm färg baserat på antalet brev
  const getColorClass = () => {
    if (current >= max) return "from-red-500 to-red-600"; // Full
    if (current >= max * 0.8) return "from-yellow-500 to-orange-500"; // Nästan full
    if (current >= max * 0.5) return "from-blue-500 to-purple-500"; // Halvfull
    return "from-green-500 to-emerald-600"; // Gott om plats
  };

  // Bestäm ikon och meddelande baserat på antalet brev
  const getStatusInfo = () => {
    if (current >= max) {
      return { 
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        message: "Maxgräns nådd" 
      };
    }
    if (current >= max * 0.8) {
      return { 
        icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        message: `${max - current} platser kvar` 
      };
    }
    return { 
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      message: "Gott om plats" 
    };
  };

  const statusInfo = getStatusInfo();
  
  return (
    <div className="bg-navy-800 rounded-lg p-4 shadow-lg border border-gray-700 w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-pink-500 mr-2" />
          <h3 className="font-semibold text-white">Brevutrymme</h3>
        </div>
        <div className="flex items-center">
          {statusInfo.icon}
          <span className="text-xs ml-1 text-gray-300">{statusInfo.message}</span>
        </div>
      </div>
      
      {/* Snygg räknardisplay med rosa gradient */}
      <div className="flex items-center justify-center bg-navy-900 rounded-xl p-4 mb-3">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-navy-950 shadow-inner">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <circle 
              cx="18" cy="18" r="16" 
              fill="none" 
              stroke="#293548" 
              strokeWidth="2"
            />
            <circle 
              cx="18" cy="18" r="16" 
              fill="none" 
              stroke="url(#pink-gradient)" 
              strokeWidth="2.5" 
              strokeDasharray={`${percentage}, 100`}
              strokeLinecap="round"
              style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
            />
            <defs>
              <linearGradient id="pink-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#db2777" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-white">{current}</span>
          </div>
        </div>
        <div className="ml-5">
          <p className="text-sm text-gray-400">Sparade brev</p>
          <p className="text-lg font-bold text-white">
            {current} <span className="text-pink-500">av</span> {max} 
          </p>
        </div>
      </div>
      
      {/* Progressbar */}
      <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${getColorClass()} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="mt-2 flex justify-between text-xs text-gray-400">
        <span>{current} brev sparade</span>
        <span>{max - current} platser lediga</span>
      </div>
    </div>
  );
};

export default function MyLettersPage() {
  const router = useRouter();
  const { 
    letters, 
    fetchLetters, 
    isLoading, 
    isDeleting, 
    error, 
    removeLetter 
  } = useLetters();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPageMounted, setIsPageMounted] = useState(false);
  
  // Lägg till notifikationsstate
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    message: string;
    type: 'loading' | 'success' | 'error' | 'info';
    progress: number;
  }>({
    isVisible: false,
    message: '',
    type: 'loading',
    progress: 0
  });
  
  // När sidan renderas första gången, sätt isPageMounted till true
  useEffect(() => {
    setIsPageMounted(true);
    
    return () => {
      setIsPageMounted(false);
    };
  }, []);
  
  // Stäng notifikationen - wrappat i useCallback för att förhindra oändlig rendering
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
  
  // Hämta brev när sidan laddas - körs EFTER komponenten är monterad
  // Kontrollera att vi bara anropar fetchLetters en gång vid sidladdning
  useEffect(() => {
    if (!isPageMounted) return;
    
    const loadLetters = async () => {
      try {
        // Använd cache=true för att undvika att trigga oändliga omladdningar
        await fetchLetters(true, true);
        
        // Visa ingen success-notifikation vid normal laddning
      } catch (err) {
        // Visa felnotifikation endast om något gick fel
        showNotification('error', 'Kunde inte hämta dina brev', 5000);
      }
    };
    
    loadLetters();
  }, [fetchLetters, isPageMounted, showNotification]);
  
  // Formatera datum relativt (t.ex. "för 3 dagar sedan")
  const formatRelativeDate = useCallback((dateString: string | null) => {
    if (!dateString) return 'Okänt datum';
    
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: sv
      });
    } catch (error) {
      return 'Okänt datum';
    }
  }, []);
  
  // Förhandsvisning av brevinnehåll
  const getPreview = useCallback((content: string) => {
    if (!content) return '';
    
    // Ta bort HTML-taggar och begränsa längden
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > 150
      ? plainText.substring(0, 150) + '...'
      : plainText;
  }, []);
  
  // Bekräfta och radera brev
  const handleDelete = useCallback((id: string) => {
    // Förhindra att visa bekräftelsedialog om borttagning redan pågår
    if (isDeleting) return;
    
    setDeleteId(id);
    setShowDeleteConfirm(true);
  }, [isDeleting]);
  
  const confirmDelete = useCallback(async () => {
    if (!deleteId || isDeleting) return;
    
    try {
      // Visa laddningsnotifikation
      showNotification('loading', 'Tar bort brevet...');
      
      const success = await removeLetter(deleteId);
      
      if (success) {
        // Visa framgångsnotifikation
        showNotification('success', 'Brevet har tagits bort', 3000);
        setShowDeleteConfirm(false);
        setDeleteId(null);
      } else {
        // Visa felnotifikation
        showNotification('error', 'Kunde inte ta bort brevet', 5000);
      }
    } catch (error) {
      console.error('Error deleting letter:', error);
      // Visa felnotifikation
      showNotification('error', 'Ett fel uppstod vid borttagning av brevet', 5000);
    }
  }, [deleteId, isDeleting, removeLetter, showNotification]);
  
  const cancelDelete = useCallback(() => {
    if (isDeleting) return;
    setShowDeleteConfirm(false);
    setDeleteId(null);
  }, [isDeleting]);
  
  // Hantera felmeddelande som kommer från hook
  useEffect(() => {
    if (error) {
      showNotification('error', error, 5000);
    }
  }, [error, showNotification]);
  
  return (
    <div className="container max-w-5xl px-4 py-8 mx-auto">
      {/* Notifikationskomponent */}
      <Notification 
        isVisible={notification.isVisible}
        message={notification.message}
        type={notification.type}
        progress={notification.progress}
        onClose={closeNotification}
      />
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Huvudsektionen med brev */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Mina sparade brev</h1>
            <Link
              href="/create-letter"
              className="px-4 py-2 text-white bg-pink-600 rounded-md hover:bg-pink-700"
            >
              Skapa nytt brev
            </Link>
          </div>
          
          {/* Informationsmeddelande när det börjar bli många brev */}
          {letters.length >= 8 && (
            <div className="p-4 mb-6 bg-yellow-900/30 border-l-4 border-yellow-500 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-yellow-200">
                  {letters.length >= 10 
                    ? "Du har nått maxgränsen på 10 sparade brev. För att skapa ett nytt brev, ta först bort ett befintligt."
                    : `Du närmar dig maxgränsen på 10 sparade brev. Du kan spara ytterligare ${10 - letters.length} brev.`}
                </p>
              </div>
            </div>
          )}
          
          {/* Laddningsindikator - visa inte separat laddning om vi har notifikation */}
          {isLoading && !notification.isVisible && (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin"></div>
            </div>
          )}
          
          {!isLoading && letters.length === 0 ? (
            <div className="p-8 text-center bg-navy-800 rounded-lg">
              <div className="flex justify-center mb-4">
                <FileText className="w-20 h-20 text-gray-500" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-white">Inga sparade brev ännu</h2>
              <p className="mb-6 text-gray-300">
                Du har inte sparat några brev ännu. Skapa ditt första personliga ansökningsbrev!
              </p>
              <Link
                href="/create-letter"
                className="px-6 py-3 text-white bg-pink-600 rounded-md hover:bg-pink-700"
              >
                Skapa ditt första brev
              </Link>
              <div className="mt-4 text-sm text-gray-400">
                <span className="font-medium">0</span> av <span className="font-medium">10</span> platser använda
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {letters.map((letter) => (
                <div key={letter.id} className="p-6 transition-shadow bg-navy-800 rounded-lg hover:shadow-lg">
                  <div className="flex flex-col justify-between mb-4 md:flex-row md:items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        {letter.title || 'Ansökningsbrev'}
                      </h2>
                      <div className="flex flex-wrap mt-2 space-x-2">
                        {letter.company && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {letter.company}
                          </span>
                        )}
                        {letter.job_title && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {letter.job_title}
                          </span>
                        )}
                        {letter.tonality && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                            {letter.tonality.charAt(0).toUpperCase() + letter.tonality.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-400 md:mt-0">
                      Skapad {formatRelativeDate(letter.created_at)}
                    </div>
                  </div>
                  
                  <p className="mb-6 text-gray-300">
                    {getPreview(letter.content)}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/my-letters/${letter.id}`}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Visa
                    </Link>
                    <Link
                      href={`/my-letters/${letter.id}/edit`}
                      className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
                    >
                      Redigera
                    </Link>
                    <button
                      onClick={() => handleDelete(letter.id)}
                      disabled={isDeleting}
                      className={`px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 
                        ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isDeleting && deleteId === letter.id ? 'Tar bort...' : 'Ta bort'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Brevräknare i sidofältet */}
        <div className="md:w-64">
          <LetterCounter current={letters.length} max={10} />
          
          {/* Tips-sektion */}
          <div className="bg-navy-800 rounded-lg p-4 shadow-lg border border-gray-700 mt-6">
            <h3 className="font-semibold text-white flex items-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tips
            </h3>
            <div className="text-sm text-gray-300">
              <p className="mb-2">Brev du inte längre behöver kan tas bort för att frigöra plats för nya.</p>
              <p>Använd "Redigera" för att göra förbättringar baserat på feedback från rekryterare.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 bg-navy-800 rounded-lg max-w-md">
            <div className="flex items-start mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" />
              <h3 className="text-xl font-semibold text-white">Bekräfta borttagning</h3>
            </div>
            
            <p className="mb-6 text-gray-300">
              Är du säker på att du vill ta bort detta brev? Detta kan inte ångras.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className={`px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700
                  ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Avbryt
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className={`px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center
                  ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
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