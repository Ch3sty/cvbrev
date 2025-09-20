// src/app/dashboard/my-letters/page.tsx
// UPPDATERAD: Anpassad design för att likna ProfilePage, Inklusive knappstilar (navy-700 för Visa/Redigera)
// KORRIGERAD: Fixat 'void' is not assignable to type 'ReactNode' i formatRelativeDate
// KORRIGERAD: Åtgärdat onödiga useCallback-beroenden enligt ESLint-varningar.

'use client';

import { useEffect, useState, useCallback, useRef, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/hooks/use-letters';
import { useProfile } from '@/hooks/use-profile';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import {
  AlertTriangle,
  FileText,
  CheckCircle,
  Info,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  Plus,
  Building2,
  Briefcase,
  MessageSquare,
  Clock,
  Infinity as InfinityIcon, // Importera och döp om för att undvika namnkonflikt
  Search,
  Filter,
  X,
  ChevronDown,
  Calendar,
  SortAsc,
  SortDesc
} from 'lucide-react';
import Notification from '@/components/ui/notification';
import DownloadButton from '@/components/letters/download-button';

// Taggkomponent - Anpassad stil för att passa in bättre - memoizerad för prestanda
const LetterTag = memo(({
  label,
  value,
  type
}: {
  label: string;
  value: string | null;
  type: 'company' | 'job' | 'tone'
}) => {
  if (!value) return null;

  // Ikoner och färger baserade på typ (tonade för att passa navy-temat)
  const iconAndColor = {
    company: {
      icon: <Building2 className="w-4 h-4 mr-1.5 text-blue-400" />,
      bgClass: "bg-blue-900/30 text-blue-200 border-blue-700/50" // Mörkare blå
    },
    job: {
      icon: <Briefcase className="w-4 h-4 mr-1.5 text-purple-400" />,
      bgClass: "bg-purple-900/30 text-purple-200 border-purple-700/50" // Mörkare lila
    },
    tone: {
      icon: <MessageSquare className="w-4 h-4 mr-1.5 text-pink-400" />,
      bgClass: "bg-pink-900/30 text-pink-200 border-pink-700/50" // Mörkare rosa
    }
  };

  const { icon, bgClass } = iconAndColor[type];
  const displayValue = type === 'tone' ? value.charAt(0).toUpperCase() + value.slice(1) : value;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${bgClass}`}
      title={`${label}: ${displayValue}`} // Lägg till tooltip för fullständig info
      style={{maxWidth: '180px'}} // Begränsa bredden lite
    >
      {icon}
      <span className="truncate">
        {displayValue}
      </span>
    </span>
  );
});
LetterTag.displayName = 'LetterTag';

// Brevräknare-komponent (Behållen struktur, små stiljusteringar) - memoizerad för prestanda
const LetterCounter = memo(({ current, max }: { current: number; max: number }) => {
  const isInfinite = !isFinite(max);
  const percentage = isInfinite || max === 0 ? 0 : Math.min(100, (current / max) * 100);

  // Färger (anpassade för att matcha ProfilePage-temat bättre)
  const getColorClass = () => {
    if (isInfinite) return "from-emerald-500 to-green-600"; // Konsekvent grön för oändligt
    if (current >= max) return "from-red-500 to-red-600";
    if (current >= max * 0.8) return "from-yellow-500 to-orange-500";
    return "from-emerald-500 to-green-600"; // Standardgrön
  };

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
    if (current >= max * 0.8) {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        message: `${max - current} ${max - current === 1 ? 'plats' : 'platser'} kvar`
      };
    }
    return {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      message: "Gott om plats"
    };
  };

  const statusInfo = getStatusInfo();
  const maxDisplayValue = isInfinite ? <InfinityIcon className="w-4 h-4 text-pink-400 inline-block" /> : max;
  const remainingDisplayValue = isInfinite ? "∞" : max - current;

  return (
    // Använder navy-800 och gränser likt ProfilePage-komponenter
    <div className="bg-navy-800 rounded-lg p-5 shadow-md border border-gray-700 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-pink-500 mr-2" />
          <h3 className="font-semibold text-white text-lg">Brevutrymme</h3>
        </div>
        <div className="flex items-center" title={statusInfo.message}>
          {statusInfo.icon}
          {/* <span className="text-xs ml-1.5 text-gray-400">{statusInfo.message}</span> */}
        </div>
      </div>

      {/* Räknardisplay med navy-900 bakgrund */}
      <div className="flex items-center justify-center bg-navy-900 rounded-xl p-4 mb-4 border border-gray-700/50">
        {/* Cirkel med procent */}
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-navy-950 shadow-inner">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            {/* Mörkare bakgrundscirkel */}
            <circle cx="18" cy="18" r="16" fill="none" stroke="#374151" strokeWidth="2.5" />
            {!isInfinite && (
                <circle
                  cx="18" cy="18" r="16"
                  fill="none"
                  stroke="url(#myletters-page-pink-gradient-v2)" // Unikt ID
                  strokeWidth="2.5"
                  strokeDasharray={`${percentage}, 100`}
                  strokeLinecap="round"
                  style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                />
            )}
            <defs>
              {/* Använd samma gradient som i ProfilePage om möjligt, annars definiera här */}
              <linearGradient id="myletters-page-pink-gradient-v2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" /> {/* pink-500 */}
                <stop offset="100%" stopColor="#d946ef" /> {/* fuchsia-500 */}
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
          <div className="h-2 bg-navy-700 rounded-full overflow-hidden mb-1 border border-gray-600/50">
             <div
               className={`h-full bg-gradient-to-r ${getColorClass()} transition-all duration-500 ease-out rounded-full`}
               style={{ width: `${percentage}%` }}
             />
           </div>
           <div className="flex justify-end text-xs text-gray-400 mt-1">
              <span>{remainingDisplayValue} {remainingDisplayValue === 1 ? 'plats' : 'platser'} lediga</span>
           </div>
         </>
       )}
       {isInfinite && ( // Visa text istället för progressbar vid oändligt
           <div className="text-center text-xs text-gray-400 mt-2 p-2 bg-navy-900 rounded-md border border-gray-700/50">
                Obegränsat antal platser tillgängliga.
           </div>
       )}
    </div>
  );
});
LetterCounter.displayName = 'LetterCounter';


export default function MyLettersPage() {
  const router = useRouter();
  const {
    letters,
    fetchLetters,
    isLoading: lettersLoading,
    isDeleting,
    error,
    removeLetter
  } = useLetters();

  const {
      maxSavedLetters = 0,
      subscriptionTier,
      loading: profileLoading,
      hasReachedLetterLimit,
      profile,
      // refreshProfile // Kanske inte behövs här
  } = useProfile();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPageMounted, setIsPageMounted] = useState(false);

  const [notification, setNotification] = useState<{
    isVisible: boolean;
    message: string;
    type: 'loading' | 'success' | 'error' | 'info';
    progress?: number; // Behåll progress som optionell
  } | null>(null); // Initiera som null

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'company'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Auth check ref
  const authCheckedRef = useRef(false);

  // Auth check effect
  useEffect(() => {
    if (!authCheckedRef.current && !profileLoading) {
      authCheckedRef.current = true;
      if (!profile) {
        console.log('Användare ej inloggad, omdirigerar till /login');
        router.push('/login');
      }
    }
  }, [profile, profileLoading, router]);

  useEffect(() => { setIsPageMounted(true); return () => { setIsPageMounted(false); }; }, []);

  // Uppdaterad showNotificationMessage för att matcha ProfilePage
  const showNotificationMessage = useCallback((message: string, type: 'loading' | 'success' | 'error' | 'info', duration: number = 5000, progress?: number) => {
    setNotification({
      message,
      type,
      progress,
      isVisible: true
    });

    if (type !== 'loading') {
      setTimeout(() => {
        setNotification(prev => prev ? { ...prev, isVisible: false } : null);
        // Låt notificationen försvinna helt innan den sätts till null
        setTimeout(() => setNotification(null), 300);
      }, duration);
    }
  }, []);

  // Uppdaterad closeNotification för att matcha ProfilePage
  const closeNotification = useCallback(() => {
    setNotification(prev => prev ? { ...prev, isVisible: false } : null);
    setTimeout(() => setNotification(null), 300);
  }, []);
  
  // Callback för att hantera loading-feedback från DownloadButton
  const handleDownloadLoadingChange = useCallback((isLoading: boolean, message?: string) => {
    if (isLoading && message) {
      showNotificationMessage(message, 'loading');
    } else if (!isLoading && message) {
      // Stäng loading notification och visa framgång/fel
      closeNotification();
      const isError = message.toLowerCase().includes('kunde inte') || message.toLowerCase().includes('fel');
      setTimeout(() => {
        showNotificationMessage(message, isError ? 'error' : 'success', 3000);
      }, 100);
    } else if (!isLoading) {
      // Stäng loading notification utan meddelande
      closeNotification();
    }
  }, [showNotificationMessage, closeNotification]);

  // Hämta brev - endast vid initial mount för att undvika re-rendering
  useEffect(() => {
    if (!isPageMounted || !profile) return;
    
    let isStillMounted = true;
    let hasInitiallyLoaded = false;
    
    const loadLetters = async () => {
      try {
        // Visa ingen laddningsnotis här, använd global laddningsindikator
        await fetchLetters(true, true);
        hasInitiallyLoaded = true;
      } catch (err) {
        if (isStillMounted) {
          showNotificationMessage('Kunde inte hämta dina brev', 'error');
        }
      }
    };
    
    // Kör endast en gång när komponenten först mountas och profil finns
    if (!hasInitiallyLoaded) {
      loadLetters();
    }
    
    return () => {
      isStillMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPageMounted, !!profile]); // Bara beroende av mount-status och profil existens

  // Formatera datum med memoization för bättre prestanda
  const formatRelativeDate = useCallback((dateString: string | null): string => {
    if (!dateString) return 'Okänt datum';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date string passed to formatRelativeDate:", dateString);
        return 'Okänt datum';
      }
      return formatDistanceToNow(date, { addSuffix: true, locale: sv });
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Okänt datum';
    }
  }, []);

  // Förhandsvisning med memoization för bättre prestanda
  const getPreview = useCallback((content: string | null) => {
    if (!content) return '';
    try {
        const plainText = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        return plainText.length > 150
          ? plainText.substring(0, 150) + '...'
          : plainText;
    } catch (error) {
        console.error("Error generating preview:", error);
        return '';
    }
  }, []);

  // Hantera borttagning
  const handleDelete = useCallback((id: string) => {
    if (isDeleting) return;
    setDeleteId(id);
    setShowDeleteConfirm(true);
  }, [isDeleting]);

  // Bekräfta borttagning - stabiliserad
  const confirmDelete = useCallback(async () => {
    if (!deleteId) return;
    let loadingNotificationShown = false;
    try {
      showNotificationMessage('Tar bort brevet...', 'loading');
      loadingNotificationShown = true;
      const success = await removeLetter(deleteId);
      if (success) {
        showNotificationMessage('Brevet har tagits bort', 'success', 3000);
        setShowDeleteConfirm(false);
        setDeleteId(null);
      } else {
        showNotificationMessage('Kunde inte ta bort brevet', 'error', 5000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ett okänt fel uppstod.';
      showNotificationMessage(message, 'error', 5000);
    } finally {
      if (loadingNotificationShown) {
           closeNotification();
       }
    }
  }, [deleteId, removeLetter, showNotificationMessage, closeNotification]);

  // Avbryt borttagning
  const cancelDelete = useCallback(() => {
    if (isDeleting) return;
    setShowDeleteConfirm(false);
    setDeleteId(null);
  }, [isDeleting]);

  // Hantera fel från useLetters hook - memoizerad för prestanda
  const stableShowError = useCallback((errorMsg: string) => {
    showNotificationMessage(errorMsg, 'error', 5000);
  }, [showNotificationMessage]);

  useEffect(() => {
      if (error) {
        stableShowError(error);
      }
  }, [error, stableShowError]);

  // Kombinera laddningsstatus
  const isLoading = lettersLoading || profileLoading;

  const remainingLetters = !isFinite(maxSavedLetters) ? Infinity : maxSavedLetters - (letters?.length ?? 0);

  // Funktion för att kontrollera om ett brev ändrats nyligen (senaste 24h)
  const isRecentlyUpdated = (updated: string | null, created: string | null): boolean => {
    if (!updated || !created) return false;
    const now = new Date();
    const updateDate = new Date(updated);
    const createDate = new Date(created);
    return updateDate > createDate &&
           (now.getTime() - updateDate.getTime()) < 24 * 60 * 60 * 1000;
  };

  // Filter and search logic - Optimized to reduce re-calculations
  const filteredLetters = useMemo(() => {
    if (!letters || letters.length === 0) return [];
    
    // Use a more efficient filtering approach
    let filtered = letters;
    
    // Apply search filter
    const trimmedSearch = searchTerm.trim();
    if (trimmedSearch) {
      const search = trimmedSearch.toLowerCase();
      filtered = filtered.filter(letter => 
        letter.title?.toLowerCase().includes(search) ||
        letter.company?.toLowerCase().includes(search) ||
        letter.job_title?.toLowerCase().includes(search) ||
        letter.content?.toLowerCase().includes(search)
      );
    }
    
    // Apply company filter
    if (selectedCompany) {
      filtered = filtered.filter(letter => letter.company === selectedCompany);
    }
    
    // Apply tone filter  
    if (selectedTone) {
      filtered = filtered.filter(letter => letter.tonality === selectedTone);
    }
    
    // Apply sorting - avoid creating new arrays unnecessarily
    if (filtered.length <= 1) return filtered;
    
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '');
          break;
        case 'company':
          comparison = (a.company || '').localeCompare(b.company || '');
          break;
        case 'date':
        default:
          const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
          const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
          comparison = dateA - dateB;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [letters, searchTerm, selectedCompany, selectedTone, sortBy, sortOrder]);

  // Get unique companies and tones for filter options
  const filterOptions = useMemo(() => {
    if (!letters) return { companies: [], tones: [] };
    
    const companies = [...new Set(letters.map(l => l.company).filter(Boolean))].sort() as string[];
    const tones = [...new Set(letters.map(l => l.tonality).filter(Boolean))].sort() as string[];
    
    return { companies, tones };
  }, [letters]);

  // Hjälpfunktion för att gruppera brev efter datum - memoizerad
  const groupedLetters = useMemo(() => {
    if (!filteredLetters || filteredLetters.length === 0) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recent: any[] = [];
    const older: any[] = [];
    
    for (const letter of filteredLetters) {
      const letterDate = new Date(letter.updated_at || letter.created_at || new Date());
      if (letterDate >= yesterday) {
        recent.push(letter);
      } else {
        older.push(letter);
      }
    }
    
    return { recent, older };
  }, [filteredLetters]);

  // Clear all filters - memoizerad
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCompany('');
    setSelectedTone('');
    setSortBy('date');
    setSortOrder('desc');
  }, []);

  // Check if any filters are active - memoizerad
  const hasActiveFilters = useMemo(() => {
    return searchTerm || selectedCompany || selectedTone || sortBy !== 'date' || sortOrder !== 'desc';
  }, [searchTerm, selectedCompany, selectedTone, sortBy, sortOrder]);

  // Om sidan håller på att omdirigeras eller användaren inte är inloggad, visa ingenting
  if (profileLoading || !profile) {
    return null;
  }

  return (
    // Använd ProfilePage container-stil
    <div className="max-w-screen-lg mx-auto pt-8 pb-16 px-4">
      {/* Notification - Matchar ProfilePage */}
      {notification?.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          progress={notification.progress}
          isVisible={notification.isVisible}
          onClose={closeNotification}
        />
      )}

      {/* Header - Matchar ProfilePage */}
      <h1 className="text-3xl font-bold text-white mb-2">Mina sparade brev</h1>
      <p className="text-gray-300 mb-8">
        Här hittar du alla dina sparade ansökningsbrev som du kan visa, redigera eller ta bort.
      </p>

      <div className="flex flex-col md:flex-row gap-6"> {/* Minskad gap */}
        {/* Huvudsektionen med brev */}
        <div className="flex-1 space-y-6"> {/* Använd space-y för avstånd */}

          {/* Search and Filter Bar */}
          <div className="bg-navy-800 p-5 rounded-lg border border-gray-700 shadow-md space-y-4">
            {/* Top row: Stats and actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-3 sm:mb-0">
                <FileText className="w-5 h-5 text-pink-500 mr-2" />
                <span className="text-white font-medium">
                  {filteredLetters.length} av {letters.length} brev
                  {hasActiveFilters && (
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded-md">
                      Filtrerade
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-3 py-2 text-white bg-navy-700 hover:bg-navy-600 rounded-md transition-colors border border-gray-600"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                  {hasActiveFilters && (
                    <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </button>
                
                <Link href="/create-letter"
                  className={`inline-flex items-center px-4 py-2 text-white bg-pink-600 rounded-md hover:bg-pink-700 transition-colors font-medium ${subscriptionTier === 'free' && hasReachedLetterLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-disabled={subscriptionTier === 'free' && hasReachedLetterLimit}
                  onClick={(e) => {
                    if (subscriptionTier === 'free' && hasReachedLetterLimit) {
                      e.preventDefault();
                      showNotificationMessage(`Du har nått maxgränsen på ${maxSavedLetters} sparade brev. Ta bort ett brev för att skapa ett nytt, eller uppgradera.`, 'info', 7000);
                    }
                  }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Skapa nytt brev
                </Link>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Sök i brev, företag, tjänster..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-navy-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="border-t border-gray-700 pt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Company Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Företag</label>
                    <select
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      className="w-full px-3 py-2 bg-navy-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-pink-500"
                    >
                      <option value="">Alla företag</option>
                      {filterOptions.companies.map(company => (
                        <option key={company} value={company}>{company}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tone Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tonalitet</label>
                    <select
                      value={selectedTone}
                      onChange={(e) => setSelectedTone(e.target.value)}
                      className="w-full px-3 py-2 bg-navy-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-pink-500"
                    >
                      <option value="">Alla tonaliteter</option>
                      {filterOptions.tones.map(tone => (
                        <option key={tone} value={tone}>{tone.charAt(0).toUpperCase() + tone.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sortera efter</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'company')}
                      className="w-full px-3 py-2 bg-navy-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-pink-500"
                    >
                      <option value="date">Datum</option>
                      <option value="title">Titel</option>
                      <option value="company">Företag</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Ordning</label>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="w-full px-3 py-2 bg-navy-700 border border-gray-600 rounded-md text-white hover:bg-navy-600 transition-colors flex items-center justify-center"
                    >
                      {sortOrder === 'asc' ? (
                        <><SortAsc className="w-4 h-4 mr-2" /> Stigande</>
                      ) : (
                        <><SortDesc className="w-4 h-4 mr-2" /> Fallande</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors flex items-center"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Rensa alla filter
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Varningsmeddelanden - Matchar ProfilePage */}
          {!isLoading && (
            <>
              {subscriptionTier === 'free' && hasReachedLetterLimit && isFinite(maxSavedLetters) && (
                <div className="p-4 bg-red-900/30 border-l-4 border-red-500 rounded-r-lg animate-fadeIn">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-red-200 mb-1">Maxgräns nådd</h4>
                      <p className="text-red-200 text-sm">
                        Du har nått maxgränsen ({maxSavedLetters}). Ta bort ett brev eller
                        <Link href="/profile#subscription" className="ml-1 text-pink-400 hover:text-pink-300 underline">
                          uppgradera till Premium
                        </Link>.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {subscriptionTier === 'free' && !hasReachedLetterLimit && isFinite(maxSavedLetters) && letters.length >= maxSavedLetters * 0.8 && (
                 <div className="p-4 bg-yellow-900/30 border-l-4 border-yellow-500 rounded-r-lg animate-fadeIn">
                   <div className="flex items-start">
                     <Info className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
                     <p className="text-yellow-200 text-sm">
                       Du närmar dig maxgränsen ({maxSavedLetters}). {remainingLetters} {remainingLetters === 1 ? 'plats' : 'platser'} kvar.
                     </p>
                   </div>
                 </div>
              )}
            </>
          )}

          {/* Laddningsindikator - Matchar ProfilePage */}
          {isLoading && (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          )}

          {/* Ingen brev-vy - Anpassad till ProfilePage-stil */}
          {!isLoading && letters.length === 0 && (
             <div className="border border-gray-700 border-dashed rounded-lg p-8 bg-navy-900/50 animate-fadeIn">
                <div className="flex flex-col items-center justify-center text-gray-400 py-8 text-center">
                  <FileText className="w-16 h-16 mb-4 text-gray-600" />
                  <h2 className="mb-2 text-xl font-semibold text-white">Inga sparade brev ännu</h2>
                  <p className="mb-6 text-gray-400 text-sm max-w-md">
                    Det ser lite tomt ut här. Klicka nedan för att skapa ditt första AI-genererade personliga brev!
                  </p>
                  <Link
                    href="/create-letter"
                    className="inline-flex items-center px-6 py-3 text-white bg-pink-600 rounded-md hover:bg-pink-700 transition-colors font-medium" // ProfilePage knappstil
                    >
                    <Plus className="w-5 h-5 mr-2" />
                    Skapa ditt första brev
                  </Link>
                   <div className="mt-5 text-sm text-gray-500">
                     0 av {!isFinite(maxSavedLetters) ? <InfinityIcon className="w-3 h-3 inline" /> : maxSavedLetters} platser använda
                   </div>
                </div>
             </div>
          )}

          {/* No results after filtering */}
          {!isLoading && letters.length > 0 && filteredLetters.length === 0 && (
            <div className="border border-gray-700 border-dashed rounded-lg p-8 bg-navy-900/50 animate-fadeIn">
              <div className="flex flex-col items-center justify-center text-gray-400 py-8 text-center">
                <Search className="w-16 h-16 mb-4 text-gray-600" />
                <h2 className="mb-2 text-xl font-semibold text-white">Inga brev matchade din sökning</h2>
                <p className="mb-6 text-gray-400 text-sm max-w-md">
                  Prova att ändra söktermer eller ta bort filter för att se fler resultat.
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 text-white bg-navy-700 rounded-md hover:bg-navy-600 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Rensa alla filter
                </button>
              </div>
            </div>
          )}

          {/* Lista med brev - Grupperad */}
          {!isLoading && filteredLetters.length > 0 && (
            <div className="space-y-8">
              {/* Nyligen uppdaterade */}
              {groupedLetters && groupedLetters.recent.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-200 mb-3 flex items-center px-1">
                     <Clock className="w-4 h-4 mr-2 text-pink-400" />
                     Nyligen uppdaterade
                  </h2>
                  <div className="space-y-4">
                    {groupedLetters.recent.map((letter) => (
                      <div
                        key={letter.id}
                        className="letter-card bg-navy-800 rounded-lg border border-gray-700 transition-all hover:border-pink-500/50 hover:shadow-lg cv-card animate-slideUp"
                      >
                        {/* Kortets innehåll */}
                        <div className="p-5">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-3">
                             <h2 className="text-lg font-semibold text-white mb-2 sm:mb-0 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-pink-500" />
                                {letter.title || 'Ansökningsbrev'}
                                {isRecentlyUpdated(letter.updated_at, letter.created_at) && (
                                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-900/50 text-green-300 rounded-md border border-green-700/50">
                                    Nyligen uppdaterad
                                  </span>
                                )}
                             </h2>
                            <div className="text-xs bg-navy-700/60 px-2.5 py-1 rounded-md flex items-center self-start sm:self-auto">
                              <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                              <span className="text-gray-300">
                                {formatRelativeDate(letter.updated_at || letter.created_at)}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-row flex-wrap gap-2 mb-4">
                            <LetterTag label="Företag" value={letter.company} type="company" />
                            <LetterTag label="Tjänst" value={letter.job_title} type="job" />
                            <LetterTag label="Tonalitet" value={letter.tonality} type="tone" />
                          </div>
                        </div>
                        {/* Förhandsvisning */}
                        <div className="border-t border-gray-700 p-4 bg-navy-900/30">
                           <div className="text-sm text-gray-300 bg-navy-950/50 p-3 rounded-md border border-gray-700/50 elegant-scrollbar max-h-28 overflow-auto" style={{ lineHeight: '1.5', fontStyle: 'italic' }}>
                             {getPreview(letter.content) || <span className="text-gray-500">Ingen förhandsvisning</span>}
                           </div>
                        </div>
                        {/* Åtgärdsknappar */}
                        <div className="border-t border-gray-700 p-4 bg-navy-900/30 space-y-3">
                          {/* Top row: Visa, Redigera, Ta bort */}
                          <div className="flex flex-wrap gap-2 justify-end">
                            {/* ÄNDRAD KNAPPSTIL */}
                            <Link href={`/dashboard/my-letters/${letter.id}`} className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-navy-700 hover:bg-navy-600 rounded-md transition-colors border border-gray-700"> <Eye className="w-4 h-4 mr-1.5" /> Visa </Link>
                            {/* ÄNDRAD KNAPPSTIL */}
                            <Link href={`/dashboard/my-letters/${letter.id}/edit`} className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-navy-700 hover:bg-navy-600 rounded-md transition-colors border border-gray-700"> <Pencil className="w-4 h-4 mr-1.5" /> Redigera </Link>
                            {/* BEHÅLLEN KNAPPSTIL */}
                            <button onClick={() => handleDelete(letter.id)} disabled={isDeleting} className={`inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 transition-colors ${isDeleting && deleteId === letter.id ? 'opacity-50 cursor-not-allowed' : ''}`}> {isDeleting && deleteId === letter.id ? ( <> <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Tar bort... </> ) : ( <> <Trash2 className="w-4 h-4 mr-1.5" /> Ta bort </> )} </button>
                          </div>
                          
                          {/* Bottom row: Download buttons */}
                          <div className="border-t border-gray-700 pt-3 space-y-2">
                            <div className="text-xs text-gray-400 mb-2">Ladda ned som:</div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <div className="flex-1">
                                <DownloadButton
                                  format="pdf"
                                  letterContent={letter.content || ''}
                                  metadata={{
                                    title: letter.title,
                                    company: letter.company,
                                    position: letter.job_title,
                                    job_title: letter.job_title
                                  }}
                                  className="w-full"
                                  showTemplateSelector={false}
                                  showPreview={true}
                                  onLoadingChange={handleDownloadLoadingChange}
                                />
                              </div>
                              <div className="flex-1">
                                <DownloadButton
                                  format="docx"
                                  letterContent={letter.content || ''}
                                  metadata={{
                                    title: letter.title,
                                    company: letter.company,
                                    position: letter.job_title,
                                    job_title: letter.job_title
                                  }}
                                  className="w-full"
                                  showTemplateSelector={false}
                                  showPreview={false}
                                  onLoadingChange={handleDownloadLoadingChange}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tidigare brev */}
              {groupedLetters && groupedLetters.older.length > 0 && (
                 <div>
                    {groupedLetters.recent.length > 0 && <hr className="border-gray-700 my-6" />}
                    <h2 className="text-lg font-semibold text-gray-200 mb-3 flex items-center px-1">
                       <FileText className="w-4 h-4 mr-2 text-blue-400" />
                       Tidigare brev
                    </h2>
                   <div className="space-y-4">
                     {groupedLetters.older.map((letter) => (
                       <div
                         key={letter.id}
                         className="letter-card bg-navy-800 rounded-lg border border-gray-700 transition-all hover:border-blue-500/50 hover:shadow-lg cv-card animate-slideUp" // Ändrat hover-border till blå
                       >
                         {/* Kortets innehåll */}
                         <div className="p-5">
                           <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-3">
                              <h2 className="text-lg font-semibold text-white mb-2 sm:mb-0 flex items-center">
                                 <FileText className="w-5 h-5 mr-2 text-blue-500" /> {/* Ändrat ikonfärg till blå */}
                                 {letter.title || 'Ansökningsbrev'}
                              </h2>
                             <div className="text-xs bg-navy-700/60 px-2.5 py-1 rounded-md flex items-center self-start sm:self-auto">
                               <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                               <span className="text-gray-300">
                                 {formatRelativeDate(letter.updated_at || letter.created_at)}
                               </span>
                             </div>
                           </div>
                           <div className="flex flex-row flex-wrap gap-2 mb-4">
                             <LetterTag label="Företag" value={letter.company} type="company" />
                             <LetterTag label="Tjänst" value={letter.job_title} type="job" />
                             <LetterTag label="Tonalitet" value={letter.tonality} type="tone" />
                           </div>
                         </div>
                         {/* Förhandsvisning */}
                         <div className="border-t border-gray-700 p-4 bg-navy-900/30">
                            <div className="text-sm text-gray-300 bg-navy-950/50 p-3 rounded-md border border-gray-700/50 elegant-scrollbar max-h-28 overflow-auto" style={{ lineHeight: '1.5', fontStyle: 'italic' }}>
                              {getPreview(letter.content) || <span className="text-gray-500">Ingen förhandsvisning</span>}
                            </div>
                         </div>
                         {/* Åtgärdsknappar */}
                         <div className="border-t border-gray-700 p-4 bg-navy-900/30 space-y-3">
                           {/* Top row: Visa, Redigera, Ta bort */}
                           <div className="flex flex-wrap gap-2 justify-end">
                             {/* ÄNDRAD KNAPPSTIL */}
                             <Link href={`/dashboard/my-letters/${letter.id}`} className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-navy-700 hover:bg-navy-600 rounded-md transition-colors border border-gray-700"> <Eye className="w-4 h-4 mr-1.5" /> Visa </Link>
                             {/* ÄNDRAD KNAPPSTIL */}
                             <Link href={`/dashboard/my-letters/${letter.id}/edit`} className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-navy-700 hover:bg-navy-600 rounded-md transition-colors border border-gray-700"> <Pencil className="w-4 h-4 mr-1.5" /> Redigera </Link>
                             {/* BEHÅLLEN KNAPPSTIL */}
                             <button onClick={() => handleDelete(letter.id)} disabled={isDeleting} className={`inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 transition-colors ${isDeleting && deleteId === letter.id ? 'opacity-50 cursor-not-allowed' : ''}`}> {isDeleting && deleteId === letter.id ? ( <> <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Tar bort... </> ) : ( <> <Trash2 className="w-4 h-4 mr-1.5" /> Ta bort </> )} </button>
                           </div>
                           
                           {/* Bottom row: Download buttons */}
                           <div className="border-t border-gray-700 pt-3 space-y-2">
                             <div className="text-xs text-gray-400 mb-2">Ladda ned som:</div>
                             <div className="flex flex-col sm:flex-row gap-2">
                               <div className="flex-1">
                                 <DownloadButton
                                   format="pdf"
                                   letterContent={letter.content || ''}
                                   metadata={{
                                     title: letter.title || undefined,
                                     company: letter.company || undefined,
                                     position: letter.job_title || undefined,
                                     job_title: letter.job_title || undefined
                                   }}
                                   className="w-full"
                                   showTemplateSelector={false}
                                   showPreview={true}
                                   onLoadingChange={handleDownloadLoadingChange}
                                 />
                               </div>
                               <div className="flex-1">
                                 <DownloadButton
                                   format="docx"
                                   letterContent={letter.content || ''}
                                   metadata={{
                                     title: letter.title || undefined,
                                     company: letter.company || undefined,
                                     position: letter.job_title || undefined,
                                     job_title: letter.job_title || undefined
                                   }}
                                   className="w-full"
                                   showTemplateSelector={false}
                                   showPreview={false}
                                   onLoadingChange={handleDownloadLoadingChange}
                                 />
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
              )}

              {/* Fallback om det fortfarande inte finns några grupperade brev (fallback, sällsynt) */}
              {!isLoading && (!groupedLetters || (groupedLetters.recent.length === 0 && groupedLetters.older.length === 0)) && letters.length > 0 && (
                <div className="space-y-4">
                  {letters.map((letter) => (
                    <div
                      key={letter.id}
                      className="letter-card bg-navy-800 rounded-lg border border-gray-700 transition-all hover:border-pink-500/50 hover:shadow-lg cv-card animate-slideUp"
                    >
                      {/* Kortets innehåll */}
                      <div className="p-5">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-3">
                           <h2 className="text-lg font-semibold text-white mb-2 sm:mb-0 flex items-center">
                              <FileText className="w-5 h-5 mr-2 text-pink-500" />
                              {letter.title || 'Ansökningsbrev'}
                           </h2>
                          <div className="text-xs bg-navy-700/60 px-2.5 py-1 rounded-md flex items-center self-start sm:self-auto">
                            <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                            <span className="text-gray-300">
                              {formatRelativeDate(letter.updated_at || letter.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-row flex-wrap gap-2 mb-4">
                          <LetterTag label="Företag" value={letter.company} type="company" />
                          <LetterTag label="Tjänst" value={letter.job_title} type="job" />
                          <LetterTag label="Tonalitet" value={letter.tonality} type="tone" />
                        </div>
                      </div>
                      {/* Förhandsvisning */}
                      <div className="border-t border-gray-700 p-4 bg-navy-900/30">
                         <div className="text-sm text-gray-300 bg-navy-950/50 p-3 rounded-md border border-gray-700/50 elegant-scrollbar max-h-28 overflow-auto" style={{ lineHeight: '1.5', fontStyle: 'italic' }}>
                           {getPreview(letter.content) || <span className="text-gray-500">Ingen förhandsvisning</span>}
                         </div>
                      </div>
                      {/* Åtgärdsknappar */}
                      <div className="border-t border-gray-700 p-4 bg-navy-900/30 space-y-3">
                        {/* Top row: Visa, Redigera, Ta bort */}
                        <div className="flex flex-wrap gap-2 justify-end">
                          {/* ÄNDRAD KNAPPSTIL */}
                          <Link href={`/dashboard/my-letters/${letter.id}`} className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-navy-700 hover:bg-navy-600 rounded-md transition-colors border border-gray-700"> <Eye className="w-4 h-4 mr-1.5" /> Visa </Link>
                          {/* ÄNDRAD KNAPPSTIL */}
                          <Link href={`/dashboard/my-letters/${letter.id}/edit`} className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-navy-700 hover:bg-navy-600 rounded-md transition-colors border border-gray-700"> <Pencil className="w-4 h-4 mr-1.5" /> Redigera </Link>
                          {/* BEHÅLLEN KNAPPSTIL */}
                          <button onClick={() => handleDelete(letter.id)} disabled={isDeleting} className={`inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 transition-colors ${isDeleting && deleteId === letter.id ? 'opacity-50 cursor-not-allowed' : ''}`}> {isDeleting && deleteId === letter.id ? ( <> <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Tar bort... </> ) : ( <> <Trash2 className="w-4 h-4 mr-1.5" /> Ta bort </> )} </button>
                        </div>
                        
                        {/* Bottom row: Download buttons */}
                        <div className="border-t border-gray-700 pt-3 space-y-2">
                          <div className="text-xs text-gray-400 mb-2">Ladda ned som:</div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-1">
                              <DownloadButton
                                format="pdf"
                                letterContent={letter.content || ''}
                                metadata={{
                                  title: letter.title || undefined,
                                  company: letter.company || undefined,
                                  position: letter.job_title || undefined,
                                  job_title: letter.job_title || undefined
                                }}
                                className="w-full"
                                showTemplateSelector={false}
                                showPreview={true}
                                onLoadingChange={handleDownloadLoadingChange}
                              />
                            </div>
                            <div className="flex-1">
                              <DownloadButton
                                format="docx"
                                letterContent={letter.content || ''}
                                metadata={{
                                  title: letter.title || undefined,
                                  company: letter.company || undefined,
                                  position: letter.job_title || undefined,
                                  job_title: letter.job_title || undefined
                                }}
                                className="w-full"
                                showTemplateSelector={false}
                                showPreview={false}
                                onLoadingChange={handleDownloadLoadingChange}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div> {/* Slut på huvudsektion */}

        {/* Sidofältet */}
        <div className="md:w-72 flex-shrink-0 space-y-6">
          {!profileLoading ? (
            <LetterCounter current={letters?.length ?? 0} max={maxSavedLetters ?? 0} />
          ) : (
            // Skeleton loader för LetterCounter
            <div className="bg-navy-800 rounded-lg p-5 shadow-md border border-gray-700 w-full animate-pulse"> <div className="h-5 bg-gray-700 rounded w-3/4 mb-4"></div> <div className="flex items-center justify-center bg-navy-900 rounded-xl p-4 mb-4 border border-gray-700/50"> <div className="w-16 h-16 rounded-full bg-navy-950"></div> <div className="ml-5 space-y-2 flex-1"> <div className="h-4 bg-gray-700 rounded w-20"></div> <div className="h-5 bg-gray-700 rounded w-16"></div> </div> </div> <div className="h-2 bg-navy-700 rounded-full mb-2 border border-gray-600/50"></div> <div className="h-3 bg-gray-700 rounded w-1/2 ml-auto"></div> </div>
          )}
          <div className="bg-navy-800 rounded-lg p-5 shadow-md border border-gray-700">
             <h3 className="font-semibold text-white flex items-center mb-3 text-lg"> <Info className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" /> Tips & Trix </h3>
             <div className="text-sm text-gray-300 space-y-2"> <p>Behåll dina bästa brev och ta bort de du inte längre behöver för att hålla listan relevant.</p> <p>Använd "Redigera" för att finjustera ett befintligt brev istället för att skapa ett helt nytt varje gång.</p> </div>
          </div>
        </div> {/* Slut på sidofältet */}
      </div> {/* Slut på flex-row */}

      {/* Delete confirmation modal - Anpassad till ProfilePage-stil */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 backdrop-blur-sm transition-opacity animate-fadeIn">
          <div className="bg-navy-800 rounded-lg max-w-md w-full shadow-xl border border-gray-700">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-700"> <h3 className="text-xl font-semibold text-white flex items-center"> <AlertTriangle className="w-5 h-5 mr-2 text-pink-500" /> Bekräfta borttagning </h3> </div>
            {/* Modal Body */}
            <div className="p-5"> <p className="text-gray-300 mb-4"> Är du säker på att du vill ta bort brevet <span className="font-medium text-white mx-1">"{letters.find(l => l.id === deleteId)?.title || 'detta brev'}"</span>? </p> <div className="bg-navy-900/50 p-3 border border-gray-700 rounded-md flex items-start"> <AlertTriangle className="w-4 h-4 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" /> <p className="text-yellow-200 text-sm"> Denna åtgärd kan inte ångras och brevet raderas permanent. </p> </div> </div>
            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-700 flex justify-end space-x-3 bg-navy-900/30">
              <button onClick={cancelDelete} disabled={isDeleting} className="px-4 py-2 bg-navy-700 text-white rounded-md hover:bg-navy-600 transition-colors disabled:opacity-50"> Avbryt </button>
              <button onClick={confirmDelete} disabled={isDeleting} className={`px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}> {isDeleting ? ( <> <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Tar bort... </> ) : ( <> <Trash2 className="w-4 h-4 mr-1.5" /> Ta bort brevet </> )} </button>
            </div>
          </div>
        </div>
      )}
    </div> // Slut på container
  );
}