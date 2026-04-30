'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/hooks/use-letters';
import { useProfile } from '@/hooks/use-profile';
import { useNotification } from '@/context/notificationcontext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText, Plus, Search, Calendar, TrendingUp, Target,
  ArrowRight,
} from 'lucide-react';

import Notification from '@/components/ui/notification';
import LetterCard from './components/LetterCard';
import { LetterStackOrb, EmptyLetterIllustration } from './components/illustrations/LetterIcons';

interface StatPillProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  value: string | number;
  label: string;
  accent: 'orange' | 'emerald' | 'amber' | 'slate';
}

const StatPill = ({ icon: Icon, value, label, accent }: StatPillProps) => {
  const accentClasses = {
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
  } as const;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-orange-200/50"
      style={{ boxShadow: '0 4px 16px -10px rgba(249, 115, 22, 0.15)' }}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${accentClasses[accent]}`}>
        <Icon className="w-4 h-4" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-lg sm:text-xl font-bold text-slate-900 leading-none">{value}</div>
        <div className="text-[11px] text-slate-500 mt-1 truncate">{label}</div>
      </div>
    </div>
  );
};

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
    if (!letters) return { total: 0, thisMonth: 0, avgPerMonth: 0 };
    const thisMonth = letters.filter((letter) => {
      if (!letter.created_at) return false;
      const letterDate = new Date(letter.created_at);
      const now = new Date();
      return (
        letterDate.getMonth() === now.getMonth() &&
        letterDate.getFullYear() === now.getFullYear()
      );
    }).length;
    return {
      total: letters.length,
      thisMonth,
      avgPerMonth: letters.length > 0 ? Math.round(letters.length / 3) : 0,
    };
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

      <div className="max-w-5xl mx-auto pb-16 space-y-6 sm:space-y-8">
        {/* Hero */}
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

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
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
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                </Link>
                <span className="text-xs text-slate-500 sm:ml-1">
                  {totalCount} av {limitDisplay} brev sparade
                  {hasReachedLetterLimit && (
                    <span className="ml-2 text-amber-700 font-semibold">· Fullt</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Stat-pillar (kompakt) */}
        {totalCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          >
            <StatPill icon={FileText} value={stats.total} label="Totalt antal brev" accent="orange" />
            <StatPill icon={Calendar} value={stats.thisMonth} label="Skapade denna månad" accent="emerald" />
            <StatPill icon={TrendingUp} value={stats.avgPerMonth} label="Genomsnitt/månad" accent="amber" />
            <StatPill
              icon={Target}
              value={`${totalCount}/${limitDisplay}`}
              label={hasReachedLetterLimit ? 'Fullt brevutrymme' : 'Brevutrymme'}
              accent="slate"
            />
          </motion.div>
        )}

        {/* Sökfält */}
        {totalCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="relative"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={2.5} />
            <input
              type="text"
              placeholder="Sök på företag eller tjänst…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-orange-200/60 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200/40 transition-all"
            />
          </motion.div>
        )}

        {/* Lista */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-orange-200/50 p-5 animate-pulse"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100/60 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-orange-100/60 rounded w-2/3" />
                    <div className="h-3 bg-orange-100/40 rounded w-1/3" />
                    <div className="h-3 bg-orange-100/30 rounded w-full mt-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
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
        ) : (
          <div className="space-y-3">
            {filteredLetters.map((letter, index) => (
              <motion.div
                key={letter.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
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
        )}
      </div>

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
