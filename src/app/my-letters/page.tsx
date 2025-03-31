// src/app/my-letters/page.tsx
// UPPDATERAD: Hämtar maxSavedLetters från useProfile och skickar till LetterCounter
// KORRIGERAD: Fixat 'void' is not assignable to type 'ReactNode' i formatRelativeDate
// KORRIGERAD: Åtgärdat onödiga useCallback-beroenden enligt ESLint-varningar.

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/hooks/use-letters';
import { useProfile } from '@/hooks/use-profile'; // *** NY IMPORT ***
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { AlertTriangle, FileText, CheckCircle, Info } from 'lucide-react'; // Lade till Info
import Notification from '@/components/ui/notification';
import { Infinity as InfinityIcon } from 'lucide-react'; // *** NY IMPORT FÖR OÄNDLIGHETSIKON ***

// Brevräknare-komponent (Uppdaterad för att hantera Infinity)
const LetterCounter = ({ current, max }: { current: number; max: number }) => {
  // Hantera fallet med oändligt maxvärde
  const isInfinite = !isFinite(max);
  // Sätt procent till 0 om max är oändligt eller 0 för att undvika division med noll
  const percentage = isInfinite || max === 0 ? 0 : Math.min(100, (current / max) * 100);

  // Bestäm färg baserat på antalet brev (anpassa logik för oändligt)
  const getColorClass = () => {
    if (isInfinite) return "from-green-500 to-emerald-600"; // Alltid gott om plats
    if (current >= max) return "from-red-500 to-red-600"; // Full
    if (current >= max * 0.8) return "from-yellow-500 to-orange-500"; // Nästan full
    if (current >= max * 0.5) return "from-blue-500 to-purple-500"; // Halvfull
    return "from-green-500 to-emerald-600"; // Gott om plats
  };

  // Bestäm ikon och meddelande baserat på antalet brev (anpassa logik för oändligt)
  const getStatusInfo = () => {
    if (isInfinite) {
       return {
         icon: <CheckCircle className="w-5 h-5 text-green-500" />,
         message: "Obegränsat utrymme"
       };
    }
    if (current >= max) {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        message: "Maxgräns nådd"
      };
    }
    // Visa bara "X platser kvar" om det inte är oändligt och inte fullt
    if (current >= max * 0.8) {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        message: `${max - current} ${max - current === 1 ? 'plats' : 'platser'} kvar`
      };
    }
    // Default för icke-oändligt och ej nära/fullt
    return {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      message: "Gott om plats"
    };
  };

  const statusInfo = getStatusInfo();
  const maxDisplayValue = isInfinite ? <InfinityIcon className="w-4 h-4 text-pink-500 inline-block" /> : max;
  const remainingDisplayValue = isInfinite ? "∞" : max - current;

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

      {/* Räknardisplay */}
      <div className="flex items-center justify-center bg-navy-900 rounded-xl p-4 mb-3">
        {/* Cirkel med procent */}
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-navy-950 shadow-inner">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="#293548" strokeWidth="2" />
            {!isInfinite && ( // Rita bara progress-cirkeln om max inte är oändligt
                <circle
                  cx="18" cy="18" r="16"
                  fill="none"
                  stroke="url(#myletters-page-pink-gradient)" // Unikt ID
                  strokeWidth="2.5"
                  strokeDasharray={`${percentage}, 100`}
                  strokeLinecap="round"
                  style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                />
            )}
            <defs>
              <linearGradient id="myletters-page-pink-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#db2777" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-white">{current}</span>
          </div>
        </div>
        {/* Text bredvid cirkeln */}
        <div className="ml-5">
          <p className="text-sm text-gray-400">Sparade brev</p>
          <p className="text-lg font-bold text-white flex items-center gap-1">
            {current} <span className="text-pink-500 text-sm">av</span> {maxDisplayValue}
          </p>
        </div>
      </div>

       {/* Progressbar (visas endast om inte oändligt) */}
       {!isInfinite && (
         <>
          <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden mb-1">
             <div
               className={`h-full bg-gradient-to-r ${getColorClass()} transition-all duration-500 ease-out`}
               style={{ width: `${percentage}%` }}
             />
           </div>
           <div className="flex justify-end text-xs text-gray-400">
              <span>{remainingDisplayValue} {remainingDisplayValue === 1 ? 'plats' : 'platser'} lediga</span>
           </div>
         </>
       )}
       {isInfinite && ( // Visa text istället för progressbar vid oändligt
           <div className="text-center text-xs text-gray-400 mt-1">
                Obegränsat antal platser lediga
           </div>
       )}
    </div>
  );
};


export default function MyLettersPage() {
  const router = useRouter();
  const {
    letters,
    fetchLetters,
    isLoading: lettersLoading, // Byt namn för att undvika konflikt
    isDeleting,
    error,
    removeLetter
  } = useLetters();

  // *** HÄMTA PROFILINFORMATION ***
  const {
      maxSavedLetters = 0, // Ge default 0 tills laddat
      subscriptionTier,
      loading: profileLoading, // Byt namn för att undvika konflikt
      hasReachedLetterLimit,   // Kan användas för att visa varning
      refreshProfile            // Kan användas för att uppdatera vid behov
  } = useProfile();
  // *****************************

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPageMounted, setIsPageMounted] = useState(false);

  const [notification, setNotification] = useState<{
    isVisible: boolean;
    message: string;
    type: 'loading' | 'success' | 'error' | 'info';
    progress: number;
  }>({ isVisible: false, message: '', type: 'loading', progress: 0 });

  useEffect(() => { setIsPageMounted(true); return () => { setIsPageMounted(false); }; }, []);

  const closeNotification = useCallback(() => { setNotification(prev => ({ ...prev, isVisible: false })); }, []);

  const showNotification = useCallback((type: 'loading' | 'success' | 'error' | 'info', message: string, duration?: number) => {
    setNotification({ isVisible: true, message, type, progress: type === 'loading' ? 0 : 100 });
    if (type !== 'loading' && duration) { setTimeout(closeNotification, duration); }
  }, [closeNotification]);

  // Hämta brev när sidan laddas och är monterad
  useEffect(() => {
    if (!isPageMounted) return;
    const loadLetters = async () => {
      try {
        await fetchLetters(true, true); // Cache = true
      } catch (err) {
        showNotification('error', 'Kunde inte hämta dina brev', 5000);
      }
    };
    loadLetters();
  }, [fetchLetters, isPageMounted, showNotification]);


  // *** KORRIGERAD IMPLEMENTATION AV formatRelativeDate ***
  const formatRelativeDate = useCallback((dateString: string | null): string => { // Ange returtyp : string
    if (!dateString) {
        return 'Okänt datum'; // Returnera sträng om null
    }
    try {
      // Försök skapa ett Date-objekt
      const date = new Date(dateString);
      // Kontrollera om datumet är giltigt
      if (isNaN(date.getTime())) {
        console.warn("Invalid date string passed to formatRelativeDate:", dateString);
        return 'Okänt datum'; // Returnera sträng om ogiltigt datum
      }
      // Formatera om giltigt
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: sv
      });
    } catch (error) {
      console.error("Error formatting date in formatRelativeDate:", error); // Logga felet
      return 'Okänt datum'; // *** Returnera sträng även vid oväntat fel ***
    }
  }, []); // Tomt beroende är ok här


  // *** KORRIGERAD IMPLEMENTATION AV getPreview ***
  const getPreview = useCallback((content: string | null) => { // Hantera null för content
    if (!content) {
        return ''; // Returnera tom sträng om null
    }
    try {
        // Ta bort HTML-taggar och trimma extra whitespace
        const plainText = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        // Begränsa längden
        return plainText.length > 150
          ? plainText.substring(0, 150) + '...'
          : plainText;
    } catch (error) {
        console.error("Error generating preview in getPreview:", error);
        return ''; // Returnera tom sträng vid fel
    }
  }, []);


  // *** KORRIGERAD IMPLEMENTATION AV handleDelete ***
  const handleDelete = useCallback((id: string) => {
    // Förhindra att visa bekräftelsedialog om borttagning redan pågår
    if (isDeleting) {
        console.log("Delete already in progress, ignoring new request.");
        return;
    }
    console.log("Requesting delete for letter ID:", id);
    setDeleteId(id);
    setShowDeleteConfirm(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDeleting]); // Korrekt beroende


  // *** KORRIGERAD IMPLEMENTATION AV confirmDelete ***
  const confirmDelete = useCallback(async () => {
    if (!deleteId) {
        console.warn("confirmDelete called without deleteId set.");
        return;
    }
     // isDeleting kollas implicit av useLetters' removeLetter
     console.log("Confirming delete for letter ID:", deleteId);
    try {
      showNotification('loading', 'Tar bort brevet...');
      const success = await removeLetter(deleteId);
      if (success) {
        console.log("Letter", deleteId, "deleted successfully.");
        showNotification('success', 'Brevet har tagits bort', 3000);
        setShowDeleteConfirm(false); // Stäng modal
        setDeleteId(null);      // Rensa ID
        // Ingen manuell fetchLetters behövs, useLetters uppdaterar sin state
      } else {
        console.warn("removeLetter returned false for ID:", deleteId);
        showNotification('error', 'Kunde inte ta bort brevet (servern nekade?)', 5000);
      }
    } catch (err) {
      console.error('Exception during confirmDelete for ID:', deleteId, err);
      const message = err instanceof Error ? err.message : 'Ett okänt fel uppstod vid borttagning.';
      showNotification('error', message, 5000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteId, removeLetter, showNotification]); // Korrekta beroenden


  // *** KORRIGERAD IMPLEMENTATION AV cancelDelete ***
  const cancelDelete = useCallback(() => {
    if (isDeleting) {
        console.log("Cannot cancel delete, already in progress.");
        return;
    }
    console.log("Cancelling delete.");
    setShowDeleteConfirm(false);
    setDeleteId(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDeleting]); // Korrekt beroende


  // Hantera fel från useLetters hook
  useEffect(() => {
      if (error) {
        console.error("Error received from useLetters hook:", error);
        showNotification('error', error, 5000);
      }
  }, [error, showNotification]);

  // Kombinera laddningsstatus
  const isLoading = lettersLoading || profileLoading;

  // Beräkna återstående brev endast om gränsen är ett nummer
  const remainingLetters = !isFinite(maxSavedLetters) ? Infinity : maxSavedLetters - (letters?.length ?? 0);

  return (
    <div className="container max-w-5xl px-4 py-8 mx-auto">
      {/* Notifikationskomponent */}
      <Notification
        isVisible={notification.isVisible} message={notification.message} type={notification.type}
        progress={notification.progress} onClose={closeNotification}
      />

      <div className="flex flex-col md:flex-row gap-8">
        {/* Huvudsektionen med brev */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Mina sparade brev</h1>
            {/* Knapp för att skapa nytt brev (med gränskontroll) */}
            <Link href="/create-letter"
               className={`px-4 py-2 text-white bg-pink-600 rounded-md hover:bg-pink-700 transition-opacity ${
                 subscriptionTier === 'free' && hasReachedLetterLimit ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
               }`}
               aria-disabled={subscriptionTier === 'free' && hasReachedLetterLimit}
               onClick={(e) => {
                 if (subscriptionTier === 'free' && hasReachedLetterLimit) {
                   e.preventDefault();
                   showNotification('info', `Du har nått maxgränsen på ${maxSavedLetters} sparade brev. Ta bort ett brev för att skapa ett nytt, eller uppgradera.`, 5000);
                 }
               }}>
              Skapa nytt brev
            </Link>
          </div>

          {/* Varningsmeddelanden (visas endast när laddning är klar) */}
          {!isLoading && (
            <>
              {subscriptionTier === 'free' && hasReachedLetterLimit && isFinite(maxSavedLetters) && (
                <div className="p-4 mb-6 bg-red-900/30 border-l-4 border-red-500 rounded-lg">
                  <div className="flex items-start"> <AlertTriangle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" /> <div> <h4 className="font-semibold text-red-300 mb-1">Maxgräns nådd</h4> <p className="text-red-200 text-sm"> Du har nått maxgränsen på {maxSavedLetters} sparade brev. För att skapa ett nytt brev, ta först bort ett befintligt eller <Link href="/profile#subscription" className="ml-1 text-pink-400 hover:text-pink-300 underline">uppgradera till Premium</Link> för obegränsat utrymme. </p> </div> </div>
                </div>
              )}
              {subscriptionTier === 'free' && !hasReachedLetterLimit && isFinite(maxSavedLetters) && letters.length >= maxSavedLetters * 0.8 && (
                 <div className="p-4 mb-6 bg-yellow-900/30 border-l-4 border-yellow-500 rounded-lg">
                   <div className="flex items-start"> <Info className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" /> <p className="text-yellow-200 text-sm"> Du närmar dig maxgränsen på {maxSavedLetters} sparade brev. Du kan spara ytterligare {remainingLetters} {remainingLetters === 1 ? 'brev' : 'brev'}. </p> </div> {/* Lade till plural */}
                 </div>
              )}
            </>
          )}

          {/* Laddningsindikator */}
          {isLoading && ( <div className="flex justify-center items-center h-64"><div className="w-12 h-12 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin"></div></div> )}

          {/* Ingen brev-vy */}
          {!isLoading && letters.length === 0 ? (
             <div className="p-8 text-center bg-navy-800 rounded-lg">
                <div className="flex justify-center mb-4"><FileText className="w-20 h-20 text-gray-500" /></div>
                <h2 className="mb-4 text-2xl font-bold text-white">Inga sparade brev ännu</h2>
                <p className="mb-6 text-gray-300">Du har inte sparat några brev ännu. Skapa ditt första personliga ansökningsbrev!</p>
                <Link href="/create-letter" className="px-6 py-3 text-white bg-pink-600 rounded-md hover:bg-pink-700">Skapa ditt första brev</Link>
                <div className="mt-4 text-sm text-gray-400">
                  <span className="font-medium">0</span> av <span className="font-medium">{!isFinite(maxSavedLetters) ? <InfinityIcon className="w-3 h-3 inline" /> : maxSavedLetters}</span> platser använda
                </div>
             </div>
          ) : (
             // Lista med brev
            <div className="space-y-6">
              {!isLoading && letters.map((letter) => (
                <div key={letter.id} className="p-6 transition-shadow bg-navy-800 rounded-lg hover:shadow-lg border border-gray-700/50">
                  <div className="flex flex-col justify-between mb-4 md:flex-row md:items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-white">{letter.title || 'Ansökningsbrev'}</h2>
                      <div className="flex flex-wrap mt-2 space-x-2">
                         {letter.company && (<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-700/50">{letter.company}</span>)}
                         {letter.job_title && (<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/50 text-purple-300 border border-purple-700/50">{letter.job_title}</span>)}
                         {letter.tonality && (<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-900/50 text-pink-300 border border-pink-700/50">{letter.tonality.charAt(0).toUpperCase() + letter.tonality.slice(1)}</span>)}
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-400 md:mt-0">
                      {/* Använder korrigerad funktion */}
                      Sparad {formatRelativeDate(letter.updated_at || letter.created_at)}
                    </div>
                  </div>
                  {/* Använder korrigerad funktion */}
                  <p className="mb-6 text-gray-300">{getPreview(letter.content)}</p>
                  <div className="flex flex-wrap gap-2">
                     <Link href={`/my-letters/${letter.id}`} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Visa</Link>
                     <Link href={`/my-letters/${letter.id}/edit`} className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700">Redigera</Link>
                     <button onClick={() => handleDelete(letter.id)} disabled={isDeleting} className={`px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 ${isDeleting && deleteId === letter.id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                       {isDeleting && deleteId === letter.id ? (<><div className="w-4 h-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>Tar bort...</>) : 'Ta bort'}
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidofältet */}
        <div className="md:w-64 flex-shrink-0">
          {!profileLoading && (
            <LetterCounter current={letters?.length ?? 0} max={maxSavedLetters ?? 0} /> // Säkerställ att letters finns
          )}
          {profileLoading && ( <div className="bg-navy-800 rounded-lg p-4 shadow-lg border border-gray-700 w-full animate-pulse"><div className="h-5 bg-gray-700 rounded w-3/4 mb-3"></div><div className="flex items-center justify-center bg-navy-900 rounded-xl p-4 mb-3"><div className="w-16 h-16 rounded-full bg-navy-950"></div><div className="ml-5 space-y-2"><div className="h-3 bg-gray-700 rounded w-16"></div><div className="h-4 bg-gray-700 rounded w-12"></div></div></div><div className="h-2 bg-navy-700 rounded-full mb-2"></div><div className="flex justify-between"><div className="h-3 bg-gray-700 rounded w-1/3"></div><div className="h-3 bg-gray-700 rounded w-1/3"></div></div></div> )}
          <div className="bg-navy-800 rounded-lg p-4 shadow-lg border border-gray-700 mt-6">
             <h3 className="font-semibold text-white flex items-center mb-3"><Info className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" />Tips</h3>
             <div className="text-sm text-gray-300"><p className="mb-2">Brev du inte längre behöver kan tas bort för att frigöra plats för nya.</p><p>Använd "Redigera" för att göra förbättringar baserat på feedback från rekryterare.</p></div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && ( <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"> <div className="p-6 bg-navy-800 rounded-lg max-w-md w-full shadow-xl border border-gray-700"> <div className="flex items-start mb-4"><AlertTriangle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" /><h3 className="text-xl font-semibold text-white">Bekräfta borttagning</h3></div> <p className="mb-6 text-gray-300">Är du säker på att du vill ta bort detta brev? Detta kan inte ångras.</p> <div className="flex justify-end space-x-3"> <button onClick={cancelDelete} disabled={isDeleting} className={`px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}>Avbryt</button> <button onClick={confirmDelete} disabled={isDeleting} className={`px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}>{isDeleting ? (<><div className="w-4 h-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>Tar bort...</>) : 'Ta bort'}</button> </div> </div> </div> )}
    </div>
  );
}