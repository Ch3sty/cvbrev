'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/hooks/use-letters';
import { useProfile } from '@/hooks/use-profile';
import { useNotification } from '@/context/notificationcontext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Search, ArrowRight } from 'lucide-react';

import Notification from '@/components/ui/notification';
import LetterCard from './components/LetterCard';
import LetterCardCompact from './components/LetterCardCompact';
import ViewToggle, { type ViewMode } from './components/ViewToggle';
import CreateLetterFab from './components/CreateLetterFab';
import { LetterStackOrb, EmptyLetterIllustration } from './components/illustrations/LetterIcons';

const VIEW_MODE_STORAGE_KEY = 'minabrev_view_mode';

export default function MinaBrevPage() {
  const router = useRouter();
  const { letters, isLoading, removeLetter, refreshLetters } = useLetters();
  const { successWithMascot } = useNotification();
  const { maxSavedLetters, profile, hasReachedLetterLimit } = useProfile();

  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Default vy: list på mobil, grid på desktop. Sparat val i localStorage tar prio.
  useEffect(() => {
    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY) as ViewMode | null;
    if (saved === 'grid' || saved === 'list') {
      setViewMode(saved);
      return;
    }
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setViewMode('list');
    }
  }, []);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  };

  const refreshLettersRef = useRef(refreshLetters);
  useEffect(() => {
    refreshLettersRef.current = refreshLetters;
  }, [refreshLetters]);

  useEffect(() => {
    if (profile) {
      refreshLettersRef.current();
    }
  }, [profile]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && profile) {
        refreshLettersRef.current();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [profile]);

  const filteredLetters = useMemo(() => {
    if (!letters) return [];
    return letters.filter(
      (letter) =>
        letter.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        letter.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        letter.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [letters, searchTerm]);

  const stats = useMemo(() => {
    if (!letters) return { total: 0, thisMonth: 0 };
    const thisMonth = letters.filter((letter) => {
      if (!letter.created_at) return false;
      const letterDate = new Date(letter.created_at);
      const now = new Date();
      return (
        letterDate.getMonth() === now.getMonth() &&
        letterDate.getFullYear() === now.getFullYear()
      );
    }).length;
    return { total: letters.length, thisMonth };
  }, [letters]);

  const handleView = (letterId: string) => {
    router.push(`/dashboard/mina-brev/${letterId}`);
  };

  const handleEdit = (letterId: string) => {
    router.push(`/dashboard/mina-brev/${letterId}/edit`);
  };

  const handleDelete = async (letterId: string) => {
    if (confirm('Är du säker på att du vill ta bort detta brev?')) {
      setDeletingId(letterId);
      try {
        await removeLetter(letterId);
        successWithMascot('Brevet är borttaget.', 'letter-deleted', 3000, false);
      } catch (error) {
        setNotification({
          message: 'Kunde inte ta bort brevet',
          type: 'error',
          isVisible: true,
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleDownload = (letterId: string) => {
    router.push(`/dashboard/mina-brev/${letterId}`);
  };

  if (!profile) return null;

  const limitDisplay = maxSavedLetters === Infinity ? '∞' : String(maxSavedLetters);
  const totalCount = letters?.length || 0;

  return (
    <div className="relative">
      {/* Sidspecifik bakgrund */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(180deg, #FFF7ED 0%, #FFFBF5 40%, #FFFFFF 100%)',
        }}
      />

      <div className="max-w-6xl mx-auto pb-16 space-y-6 sm:space-y-7">
        {/* Hero med integrerad statistik-rad */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative overflow-hidden bg-white rounded-3xl border border-orange-200/50 p-5 sm:p-7"
          style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)' }}
        >
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="flex-shrink-0">
              <LetterStackOrb className="w-16 h-16 sm:w-20 sm:h-20" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 mb-1">
                Mina brev
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                Dina personliga brev
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1.5 leading-relaxed">
                Hantera, redigera och ladda ned dina sparade ansökningsbrev.
              </p>

              {/* Kompakt stat-rad */}
              {totalCount > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>
                    <span className="font-bold text-slate-900">{stats.total}</span> totalt
                  </span>
                  <span className="text-slate-300">·</span>
                  <span>
                    <span className="font-bold text-slate-900">{stats.thisMonth}</span> denna
                    månad
                  </span>
                  <span className="text-slate-300">·</span>
                  <span>
                    <span className="font-bold text-slate-900">
                      {totalCount}/{limitDisplay}
                    </span>{' '}
                    utrymme
                  </span>
                  {hasReachedLetterLimit && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="text-amber-700 font-semibold">Fullt</span>
                    </>
                  )}
                </div>
              )}

              {/* Skapa-knapp (desktop) */}
              <div className="mt-4 hidden sm:flex">
                <Link
                  href="/dashboard/skapa-brev"
                  className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-lg transition-all min-h-[44px]"
                  style={{
                    background: 'linear-gradient(135deg, #F97316, #DC2626)',
                    boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.4)',
                  }}
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  Skapa nytt brev
                  <ArrowRight
                    className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                    strokeWidth={2.5}
                  />
                </Link>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Sökfält + vy-toggle */}
        {totalCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                strokeWidth={2.5}
              />
              <input
                type="text"
                placeholder="Sök på företag eller tjänst…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-orange-200/60 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200/40 transition-all"
              />
            </div>
            <ViewToggle value={viewMode} onChange={handleViewModeChange} />
          </motion.div>
        )}

        {/* Lista */}
        {isLoading ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-orange-200/50 overflow-hidden animate-pulse"
                >
                  <div className="aspect-[16/10] bg-orange-50/60" />
                  <div className="p-5 space-y-2.5">
                    <div className="h-4 bg-orange-100/60 rounded w-3/4" />
                    <div className="h-3 bg-orange-100/40 rounded w-1/2" />
                    <div className="flex gap-1.5 pt-1">
                      <div className="h-5 w-16 bg-orange-100/40 rounded-full" />
                      <div className="h-5 w-20 bg-orange-100/40 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-orange-200/50 px-3 sm:px-4 py-3 animate-pulse flex items-center gap-3 sm:gap-4"
                >
                  <div className="w-10 h-[52px] sm:w-11 sm:h-[58px] bg-orange-50/60 rounded flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-orange-100/60 rounded w-2/3" />
                    <div className="h-3 bg-orange-100/40 rounded w-1/3" />
                  </div>
                  <div className="h-3 w-12 bg-orange-100/40 rounded hidden sm:block" />
                </div>
              ))}
            </div>
          )
        ) : totalCount === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-3xl border border-orange-200/50 p-8 sm:p-12 text-center"
            style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.12)' }}
          >
            <div className="flex justify-center mb-5">
              <EmptyLetterIllustration className="w-32 h-32 sm:w-40 sm:h-40" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Inga brev ännu</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
              Skapa ditt första personliga brev så hittar du det här. Vi hjälper dig att skriva
              ett brev som matchar tjänsten.
            </p>
            <Link
              href="/dashboard/skapa-brev"
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-lg transition-all min-h-[44px]"
              style={{
                background: 'linear-gradient(135deg, #F97316, #DC2626)',
                boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.4)',
              }}
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Skapa ditt första brev
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                strokeWidth={2.5}
              />
            </Link>
          </motion.div>
        ) : filteredLetters.length === 0 ? (
          <div className="bg-white rounded-2xl border border-orange-200/50 p-8 text-center">
            <div className="text-sm text-slate-600 mb-1">Inga brev matchar din sökning.</div>
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-sm text-orange-700 hover:text-orange-800 font-semibold"
            >
              Rensa sökning
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {filteredLetters.map((letter, index) => (
              <motion.div
                key={letter.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
              >
                <LetterCard
                  letter={letter}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                  isDeleting={deletingId === letter.id}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLetters.map((letter, index) => (
              <motion.div
                key={letter.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.3) }}
              >
                <LetterCardCompact
                  letter={letter}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                  isDeleting={deletingId === letter.id}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile FAB för "Skapa nytt brev" */}
      <CreateLetterFab />

      {notification?.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.isVisible}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
