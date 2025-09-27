'use client';

import { useEffect, useState, useCallback, useRef, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/hooks/use-letters';
import { useProfile } from '@/hooks/use-profile';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
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
  Infinity as InfinityIcon,
  Search,
  Filter,
  X,
  ChevronDown,
  Calendar,
  SortAsc,
  SortDesc,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';
import Notification from '@/components/ui/notification';
import DownloadButton from '@/components/letters/download-button';

// Tag component with light theme colors
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

  const iconAndColor = {
    company: {
      icon: <Building2 className="w-4 h-4 mr-1.5 text-blue-600" />,
      bgClass: "bg-blue-50 text-blue-700 border-blue-200"
    },
    job: {
      icon: <Briefcase className="w-4 h-4 mr-1.5 text-purple-600" />,
      bgClass: "bg-purple-50 text-purple-700 border-purple-200"
    },
    tone: {
      icon: <MessageSquare className="w-4 h-4 mr-1.5 text-pink-600" />,
      bgClass: "bg-pink-50 text-pink-700 border-pink-200"
    }
  };

  const { icon, bgClass } = iconAndColor[type];
  const displayValue = type === 'tone' ? value.charAt(0).toUpperCase() + value.slice(1) : value;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${bgClass}`}
      title={`${label}: ${displayValue}`}
      style={{maxWidth: '180px'}}
    >
      {icon}
      <span className="truncate">
        {displayValue}
      </span>
    </span>
  );
});
LetterTag.displayName = 'LetterTag';

// Premium letter counter with light theme
const LetterCounter = memo(({ current, max }: { current: number; max: number }) => {
  const isInfinite = !isFinite(max);
  const percentage = isInfinite || max === 0 ? 0 : Math.min(100, (current / max) * 100);

  const getColorClass = () => {
    if (isInfinite) return "from-emerald-500 to-green-600";
    if (current >= max) return "from-red-500 to-red-600";
    if (current >= max * 0.8) return "from-yellow-500 to-orange-500";
    return "from-emerald-500 to-green-600";
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
  const maxDisplayValue = isInfinite ? <InfinityIcon className="w-4 h-4 text-pink-600 inline-block" /> : max;
  const remainingDisplayValue = isInfinite ? "∞" : max - current;

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-pink-600 mr-2" />
          <h3 className="font-semibold text-gray-900 text-lg">Brevutrymme</h3>
        </div>
        <div className="flex items-center" title={statusInfo.message}>
          {statusInfo.icon}
        </div>
      </div>

      <div className="flex items-center justify-center bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm border border-gray-200">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="#E5E7EB" strokeWidth="2.5" />
            {!isInfinite && (
              <circle
                cx="18" cy="18" r="16"
                fill="none"
                stroke="url(#letter-counter-gradient)"
                strokeWidth="2.5"
                strokeDasharray={`${percentage}, 100`}
                strokeLinecap="round"
                style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
              />
            )}
            <defs>
              <linearGradient id="letter-counter-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-900">{current}</span>
          </div>
        </div>
        <div className="ml-5">
          <p className="text-sm text-gray-600">Sparade brev</p>
          <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
            {current} <span className="text-pink-600 text-sm">av</span> {maxDisplayValue}
          </p>
        </div>
      </div>

      {!isInfinite && (
        <>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
            <div
              className={`h-full bg-gradient-to-r ${getColorClass()} transition-all duration-500 ease-out rounded-full`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-end text-xs text-gray-600 mt-1">
            <span>{remainingDisplayValue} {remainingDisplayValue === 1 ? 'plats' : 'platser'} lediga</span>
          </div>
        </>
      )}
      {isInfinite && (
        <div className="text-center text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
          Obegränsat antal platser tillgängliga.
        </div>
      )}
    </div>
  );
});
LetterCounter.displayName = 'LetterCounter';

export default function MinaBrevPage() {
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
  } = useProfile();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPageMounted, setIsPageMounted] = useState(false);

  const [notification, setNotification] = useState<{
    isVisible: boolean;
    message: string;
    type: 'loading' | 'success' | 'error' | 'info';
    progress?: number;
  } | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'company'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

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
        setTimeout(() => setNotification(null), 300);
      }, duration);
    }
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(prev => prev ? { ...prev, isVisible: false } : null);
    setTimeout(() => setNotification(null), 300);
  }, []);

  const handleDownloadLoadingChange = useCallback((isLoading: boolean, message?: string) => {
    if (isLoading && message) {
      showNotificationMessage(message, 'loading');
    } else if (!isLoading && message) {
      closeNotification();
      const isError = message.toLowerCase().includes('kunde inte') || message.toLowerCase().includes('fel');
      setTimeout(() => {
        showNotificationMessage(message, isError ? 'error' : 'success', 3000);
      }, 100);
    } else if (!isLoading) {
      closeNotification();
    }
  }, [showNotificationMessage, closeNotification]);

  // Fetch letters effect
  useEffect(() => {
    if (!isPageMounted || !profile) return;

    let isStillMounted = true;
    let hasInitiallyLoaded = false;

    const loadLetters = async () => {
      try {
        await fetchLetters(true, true);
        hasInitiallyLoaded = true;
      } catch (err) {
        if (isStillMounted) {
          showNotificationMessage('Kunde inte hämta dina brev', 'error');
        }
      }
    };

    if (!hasInitiallyLoaded) {
      loadLetters();
    }

    return () => {
      isStillMounted = false;
    };
  }, [isPageMounted, !!profile]);

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

  const handleDelete = useCallback((id: string) => {
    if (isDeleting) return;
    setDeleteId(id);
    setShowDeleteConfirm(true);
  }, [isDeleting]);

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

  const cancelDelete = useCallback(() => {
    if (isDeleting) return;
    setShowDeleteConfirm(false);
    setDeleteId(null);
  }, [isDeleting]);

  const stableShowError = useCallback((errorMsg: string) => {
    showNotificationMessage(errorMsg, 'error', 5000);
  }, [showNotificationMessage]);

  useEffect(() => {
    if (error) {
      stableShowError(error);
    }
  }, [error, stableShowError]);

  const isLoading = lettersLoading || profileLoading;
  const remainingLetters = !isFinite(maxSavedLetters) ? Infinity : maxSavedLetters - (letters?.length ?? 0);

  const isRecentlyUpdated = (updated: string | null, created: string | null): boolean => {
    if (!updated || !created) return false;
    const now = new Date();
    const updateDate = new Date(updated);
    const createDate = new Date(created);
    return updateDate > createDate &&
           (now.getTime() - updateDate.getTime()) < 24 * 60 * 60 * 1000;
  };

  // Filter and search logic
  const filteredLetters = useMemo(() => {
    if (!letters || letters.length === 0) return [];

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

    // Apply sorting
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

  // Group letters by date
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

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCompany('');
    setSelectedTone('');
    setSortBy('date');
    setSortOrder('desc');
  }, []);

  const hasActiveFilters = useMemo(() => {
    return searchTerm || selectedCompany || selectedTone || sortBy !== 'date' || sortOrder !== 'desc';
  }, [searchTerm, selectedCompany, selectedTone, sortBy, sortOrder]);

  if (profileLoading || !profile) {
    return null;
  }

  return (
    <div className="max-w-screen-xl mx-auto pt-8 pb-16 px-4 bg-gradient-to-br from-slate-50 to-gray-50 min-h-screen">
      {/* Notification */}
      {notification?.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          progress={notification.progress}
          isVisible={notification.isVisible}
          onClose={closeNotification}
        />
      )}

      {/* Premium Header with gradient - Ljust tema */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center mb-4"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 blur-xl opacity-20"></div>
            <h1 className="relative text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Mina sparade brev
            </h1>
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-gray-700 text-lg leading-relaxed max-w-3xl"
        >
          Här hittar du alla dina sparade ansökningsbrev. Hantera, redigera och ladda ner dina dokument med stil.
        </motion.p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main section with letters */}
        <div className="flex-1 space-y-6">

          {/* Premium Search and Filter Bar - Ljust tema */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative bg-white/95 backdrop-blur-xl p-6 rounded-xl border border-gray-200/80 shadow-lg space-y-4 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 pointer-events-none"></div>
            <div className="relative z-10 space-y-4">
              {/* Top row: Stats and actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center mb-3 sm:mb-0">
                  <FileText className="w-5 h-5 text-pink-600 mr-2" />
                  <span className="text-gray-900 font-medium">
                    {filteredLetters.length} av {letters.length} brev
                    {hasActiveFilters && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md border border-blue-200">
                        Filtrerade
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center px-3 py-2 text-gray-700 bg-white hover:bg-gray-50 rounded-md transition-colors border border-gray-200 shadow-sm"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                    {hasActiveFilters && (
                      <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </button>

                  <Link href="/dashboard/skapa-brev"
                    className={`inline-flex items-center px-5 py-2.5 text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-pink-500/25 ${subscriptionTier === 'free' && hasReachedLetterLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 backdrop-blur-sm transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200 pt-4 space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Company Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Företag</label>
                        <select
                          value={selectedCompany}
                          onChange={(e) => setSelectedCompany(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-pink-500"
                        >
                          <option value="">Alla företag</option>
                          {filterOptions.companies.map(company => (
                            <option key={company} value={company}>{company}</option>
                          ))}
                        </select>
                      </div>

                      {/* Tone Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tonalitet</label>
                        <select
                          value={selectedTone}
                          onChange={(e) => setSelectedTone(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-pink-500"
                        >
                          <option value="">Alla tonaliteter</option>
                          {filterOptions.tones.map(tone => (
                            <option key={tone} value={tone}>{tone.charAt(0).toUpperCase() + tone.slice(1)}</option>
                          ))}
                        </select>
                      </div>

                      {/* Sort By */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sortera efter</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'company')}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-pink-500"
                        >
                          <option value="date">Datum</option>
                          <option value="title">Titel</option>
                          <option value="company">Företag</option>
                        </select>
                      </div>

                      {/* Sort Order */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ordning</label>
                        <button
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-center"
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
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rensa alla filter
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Warning messages */}
          {!isLoading && (
            <>
              {subscriptionTier === 'free' && hasReachedLetterLimit && isFinite(maxSavedLetters) && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg"
                >
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-red-800 mb-1">Maxgräns nådd</h4>
                      <p className="text-red-700 text-sm">
                        Du har nått maxgränsen ({maxSavedLetters}). Ta bort ett brev eller
                        <Link href="/profile#subscription" className="ml-1 text-pink-600 hover:text-pink-700 underline">
                          uppgradera till Premium
                        </Link>.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              {subscriptionTier === 'free' && !hasReachedLetterLimit && isFinite(maxSavedLetters) && letters.length >= maxSavedLetters * 0.8 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg"
                >
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" />
                    <p className="text-yellow-800 text-sm">
                      Du närmar dig maxgränsen ({maxSavedLetters}). {remainingLetters} {remainingLetters === 1 ? 'plats' : 'platser'} kvar.
                    </p>
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center py-16"
            >
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-600"></div>
            </motion.div>
          )}

          {/* Empty state */}
          {!isLoading && letters.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="border border-gray-300 border-dashed rounded-xl p-8 bg-white/50 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center justify-center text-gray-600 py-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                  className="mb-4"
                >
                  <FileText className="w-16 h-16 text-gray-400" />
                </motion.div>
                <h2 className="mb-2 text-xl font-semibold text-gray-900">Inga sparade brev ännu</h2>
                <p className="mb-6 text-gray-600 text-sm max-w-md">
                  Det ser lite tomt ut här. Klicka nedan för att skapa ditt första AI-genererade personliga brev!
                </p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Link
                    href="/dashboard/skapa-brev"
                    className="inline-flex items-center px-6 py-3 text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-pink-500/25"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Skapa ditt första brev
                  </Link>
                </motion.div>
                <div className="mt-5 text-sm text-gray-500">
                  0 av {!isFinite(maxSavedLetters) ? <InfinityIcon className="w-3 h-3 inline" /> : maxSavedLetters} platser använda
                </div>
              </div>
            </motion.div>
          )}

          {/* No results after filtering */}
          {!isLoading && letters.length > 0 && filteredLetters.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-300 border-dashed rounded-xl p-8 bg-white/50 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center justify-center text-gray-600 py-8 text-center">
                <Search className="w-16 h-16 mb-4 text-gray-400" />
                <h2 className="mb-2 text-xl font-semibold text-gray-900">Inga brev matchade din sökning</h2>
                <p className="mb-6 text-gray-600 text-sm max-w-md">
                  Prova att ändra söktermer eller ta bort filter för att se fler resultat.
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <X className="w-4 h-4 mr-2" />
                  Rensa alla filter
                </button>
              </div>
            </motion.div>
          )}

          {/* Letters list - Grouped */}
          {!isLoading && filteredLetters.length > 0 && (
            <div className="space-y-8">
              {/* Recently updated */}
              {groupedLetters && groupedLetters.recent.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center px-1">
                    <Sparkles className="w-4 h-4 mr-2 text-pink-600" />
                    Nyligen uppdaterade
                  </h2>
                  <div className="space-y-4">
                    {groupedLetters.recent.map((letter, index) => (
                      <motion.div
                        key={letter.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="group relative bg-white/95 backdrop-blur-xl rounded-xl border border-gray-200/80 transition-all duration-300 hover:border-pink-300/60 hover:shadow-xl hover:shadow-pink-500/10 overflow-hidden"
                      >
                        {/* Premium gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-purple-500/0 group-hover:from-pink-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>

                        {/* Card content */}
                        <div className="relative p-6">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-3">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0 flex items-center">
                              <FileText className="w-5 h-5 mr-2 text-pink-600" />
                              {letter.title || 'Ansökningsbrev'}
                              {isRecentlyUpdated(letter.updated_at, letter.created_at) && (
                                <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-md border border-green-200">
                                  Nyligen uppdaterad
                                </span>
                              )}
                            </h2>
                            <div className="text-xs bg-gray-100 px-2.5 py-1 rounded-md flex items-center self-start sm:self-auto">
                              <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                              <span className="text-gray-700">
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

                        {/* Preview with gradient */}
                        <div className="relative border-t border-gray-200/50 p-4 bg-gradient-to-b from-gray-50/30 to-gray-100/50">
                          <div className="text-sm text-gray-700 bg-white/80 p-3 rounded-md border border-gray-200/50 max-h-28 overflow-auto" style={{ lineHeight: '1.5', fontStyle: 'italic' }}>
                            {getPreview(letter.content) || <span className="text-gray-500">Ingen förhandsvisning</span>}
                          </div>
                        </div>

                        {/* Premium action buttons */}
                        <div className="relative border-t border-gray-200/50 p-4 bg-gradient-to-b from-gray-50/20 to-gray-100/40 space-y-3">
                          {/* Top row: View, Edit, Delete */}
                          <div className="flex flex-wrap gap-2 justify-end">
                            <Link
                              href={`/dashboard/mina-brev/${letter.id}`}
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg transition-all shadow-md hover:shadow-blue-500/25 hover:scale-105"
                            >
                              <Eye className="w-4 h-4 mr-1.5" />
                              Visa
                            </Link>
                            <Link
                              href={`/dashboard/mina-brev/${letter.id}/edit`}
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all shadow-md hover:shadow-purple-500/25 hover:scale-105"
                            >
                              <Pencil className="w-4 h-4 mr-1.5" />
                              Redigera
                            </Link>
                            <button
                              onClick={() => handleDelete(letter.id)}
                              disabled={isDeleting}
                              className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg transition-all shadow-md hover:shadow-red-500/25 hover:scale-105 ${isDeleting && deleteId === letter.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {isDeleting && deleteId === letter.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                  Tar bort...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4 mr-1.5" />
                                  Ta bort
                                </>
                              )}
                            </button>
                          </div>

                          {/* Bottom row: Download buttons */}
                          <div className="border-t border-gray-200 pt-3 space-y-2">
                            <div className="text-xs text-gray-600 mb-2">Ladda ned som:</div>
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
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Older letters */}
              {groupedLetters && groupedLetters.older.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {groupedLetters.recent.length > 0 && <hr className="border-gray-300 my-6" />}
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center px-1">
                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                    Tidigare brev
                  </h2>
                  <div className="space-y-4">
                    {groupedLetters.older.map((letter, index) => (
                      <motion.div
                        key={letter.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="group relative bg-white/95 backdrop-blur-xl rounded-xl border border-gray-200/80 transition-all duration-300 hover:border-blue-300/60 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden"
                      >
                        {/* Premium gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all duration-300 pointer-events-none"></div>

                        {/* Card content */}
                        <div className="relative p-6">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-3">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0 flex items-center">
                              <FileText className="w-5 h-5 mr-2 text-blue-600" />
                              {letter.title || 'Ansökningsbrev'}
                            </h2>
                            <div className="text-xs bg-gray-100 px-2.5 py-1 rounded-md flex items-center self-start sm:self-auto">
                              <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                              <span className="text-gray-700">
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

                        {/* Preview with gradient */}
                        <div className="relative border-t border-gray-200/50 p-4 bg-gradient-to-b from-gray-50/30 to-gray-100/50">
                          <div className="text-sm text-gray-700 bg-white/80 p-3 rounded-md border border-gray-200/50 max-h-28 overflow-auto" style={{ lineHeight: '1.5', fontStyle: 'italic' }}>
                            {getPreview(letter.content) || <span className="text-gray-500">Ingen förhandsvisning</span>}
                          </div>
                        </div>

                        {/* Premium action buttons */}
                        <div className="relative border-t border-gray-200/50 p-4 bg-gradient-to-b from-gray-50/20 to-gray-100/40 space-y-3">
                          {/* Top row: View, Edit, Delete */}
                          <div className="flex flex-wrap gap-2 justify-end">
                            <Link
                              href={`/dashboard/mina-brev/${letter.id}`}
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg transition-all shadow-md hover:shadow-blue-500/25 hover:scale-105"
                            >
                              <Eye className="w-4 h-4 mr-1.5" />
                              Visa
                            </Link>
                            <Link
                              href={`/dashboard/mina-brev/${letter.id}/edit`}
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all shadow-md hover:shadow-purple-500/25 hover:scale-105"
                            >
                              <Pencil className="w-4 h-4 mr-1.5" />
                              Redigera
                            </Link>
                            <button
                              onClick={() => handleDelete(letter.id)}
                              disabled={isDeleting}
                              className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg transition-all shadow-md hover:shadow-red-500/25 hover:scale-105 ${isDeleting && deleteId === letter.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {isDeleting && deleteId === letter.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                  Tar bort...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4 mr-1.5" />
                                  Ta bort
                                </>
                              )}
                            </button>
                          </div>

                          {/* Bottom row: Download buttons */}
                          <div className="border-t border-gray-200 pt-3 space-y-2">
                            <div className="text-xs text-gray-600 mb-2">Ladda ned som:</div>
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
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-80 flex-shrink-0 space-y-6">
          {!profileLoading ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <LetterCounter current={letters?.length ?? 0} max={maxSavedLetters ?? 0} />
            </motion.div>
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 w-full animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="flex items-center justify-center bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
                <div className="w-16 h-16 rounded-full bg-gray-200"></div>
                <div className="ml-5 space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 ml-auto"></div>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative bg-white/95 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-gray-200/80 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 pointer-events-none"></div>
            <div className="relative">
              <h3 className="font-semibold text-gray-900 flex items-center mb-4 text-lg">
                <Info className="h-5 w-5 text-cyan-600 mr-2 flex-shrink-0" />
                Tips & Trix
              </h3>
              <div className="text-sm text-gray-700 space-y-3">
                <div className="flex items-start">
                  <span className="text-cyan-600 mr-2">•</span>
                  <p>Behåll dina bästa brev och ta bort de du inte längre behöver för att hålla listan relevant.</p>
                </div>
                <div className="flex items-start">
                  <span className="text-cyan-600 mr-2">•</span>
                  <p>Använd "Redigera" för att finjustera ett befintligt brev istället för att skapa ett helt nytt varje gång.</p>
                </div>
                <div className="flex items-start">
                  <span className="text-cyan-600 mr-2">•</span>
                  <p>Ladda ner dina brev i PDF-format för bästa utskriftsresultat.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative bg-white/95 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-gray-200/80 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 pointer-events-none"></div>
            <div className="relative">
              <h3 className="font-semibold text-gray-900 flex items-center mb-4 text-lg">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                Statistik
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Totalt antal brev:</span>
                  <span className="font-semibold text-gray-900">{letters?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Denna månaden:</span>
                  <span className="font-semibold text-gray-900">
                    {letters?.filter(letter => {
                      const letterDate = new Date(letter.created_at || '');
                      const now = new Date();
                      return letterDate.getMonth() === now.getMonth() && letterDate.getFullYear() === now.getFullYear();
                    }).length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Senaste aktivitet:</span>
                  <span className="font-semibold text-gray-900">
                    {letters && letters.length > 0
                      ? formatRelativeDate(letters[0]?.updated_at || letters[0]?.created_at)
                      : 'Ingen aktivitet'
                    }
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-gray-200 mx-4"
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                  Bekräfta borttagning
                </h3>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Är du säker på att du vill ta bort brevet
                  <span className="font-medium text-gray-900 mx-1">"{letters.find(l => l.id === deleteId)?.title || 'detta brev'}"</span>?
                </p>
                <div className="bg-yellow-50 p-3 border border-yellow-200 rounded-md flex items-start">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-800 text-sm">
                    Denna åtgärd kan inte ångras och brevet raderas permanent.
                  </p>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50">
                <button
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 border border-gray-300"
                >
                  Avbryt
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Tar bort...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      Ta bort brevet
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}