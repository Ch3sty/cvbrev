'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useLetters } from '@/hooks/use-letters';
import type { Letter } from '@/store/letter-store';
import { useProfile } from '@/hooks/use-profile';
import { useNotification } from '@/context/notificationcontext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

import LetterCard from './components/LetterCard';
import LetterCardCompact from './components/LetterCardCompact';
import ViewToggle, { type ViewMode } from './components/ViewToggle';
import PageHeader from '@/components/shell/PageHeader';
import EmptyState from '@/components/shell/EmptyState';
import StatusRow from '@/components/shell/StatusRow';
import { IlluTomBrev } from '@/components/illustrations/EmptyStateIllustrations';

// Syns inte i första vyn. Bekräftelsedialogen öppnas först vid borttagning och
// notisen bara när något gått fel, så ingen av dem behöver ligga i den JS som
// blockerar första målningen.
const ConfirmDialog = dynamic(() => import('@/components/shell/ConfirmDialog'), {
  ssr: false,
});
const Notification = dynamic(() => import('@/components/ui/notification'), {
  ssr: false,
});

const VIEW_MODE_STORAGE_KEY = 'minabrev_view_mode';

export default function MinaBrevClient({
  initialLetters,
  initialIsPremium,
}: {
  initialLetters: Letter[];
  initialIsPremium: boolean;
}) {
  const router = useRouter();

  // Listan är redan hämtad på servern, så hooken ska inte fetcha om den vid
  // montering. Vi visar serverns lista tills klienten faktiskt har hämtat en
  // färskare (efter borttagning, eller när fliken kommer tillbaka). Samma
  // grepp som skapa-brev använder, i stället för att skriva i storen under
  // render.
  const { letters: storeLetters, removeLetter, refreshLetters } = useLetters({
    skipInitialFetch: true,
  });
  const [lettersRefreshed, setLettersRefreshed] = useState(false);
  const letters = lettersRefreshed ? storeLetters : initialLetters;

  // Storen börjar tom eftersom hooken inte hämtade vid montering. Delete
  // filtrerar storen, så för att listan ska stämma efter en borttagning
  // hämtar vi om en gång och byter då till storens lista.
  const markRefreshed = () => setLettersRefreshed(true);
  const { successWithMascot } = useNotification();
  const { profile, maxSavedLetters, hasReachedLetterLimit } = useProfile();

  // Statusraden ska säga rätt sak i första målningen. Innan profilen landat
  // på klienten står maxSavedLetters på gratisvärdet, vilket hade fått en
  // premiumanvändare att först läsa "2 av 2 aktiva". Vi lånar serverns svar
  // tills klienten har sitt eget. Gränsen som faktiskt gäller kommer
  // fortfarande från useProfile.
  const effectiveMaxSavedLetters =
    profile === null && initialIsPremium ? Infinity : maxSavedLetters;

  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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

  // Hämta om när fliken kommer tillbaka i förgrunden, så ett brev som skapats
  // eller tagits bort i en annan flik syns. Den gamla effekten som hämtade om
  // så fort profile landade är borta: den dubblerade serverns hämtning.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void refreshLettersRef.current().then(() => setLettersRefreshed(true));
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

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

  const handleDelete = (letterId: string) => {
    setPendingDeleteId(letterId);
  };

  const confirmDelete = async () => {
    const letterId = pendingDeleteId;
    if (!letterId) return;
    setDeletingId(letterId);
    try {
      await removeLetter(letterId);
      // Hämta om listan så den stämmer efter borttagningen, och läs den
      // sedan ur storen i stället för ur serverns ögonblicksbild.
      await refreshLettersRef.current();
      markRefreshed();
      successWithMascot('Brevet är borttaget.', 'letter-deleted', 3000, false);
    } catch (error) {
      setNotification({
        message: 'Kunde inte ta bort brevet',
        type: 'error',
        isVisible: true,
      });
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
    }
  };

  const handleDownload = (letterId: string) => {
    router.push(`/dashboard/mina-brev/${letterId}`);
  };

  // Retroaktiv loggning: markera ett redan skapat brev som sökt tjänst.
  // API:t är idempotent på letter_id, så dubbelklick skapar ingen dubblett.
  const handleMarkApplied = async (letterId: string) => {
    const letter = letters?.find((l) => l.id === letterId);
    if (!letter) return;
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: letter.job_title || letter.title || 'Okänd tjänst',
          company: letter.company || 'Okänd arbetsgivare',
          application_channel: 'ad',
          letter_id: letter.id,
          applied_at: letter.created_at ? String(letter.created_at).slice(0, 10) : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      if (json.alreadyExists) {
        successWithMascot('Brevet är redan loggat i Sökta tjänster.', 'letter-created', 3000, false);
      } else {
        successWithMascot('Loggad i Sökta tjänster.', 'letter-created', 3500, false);
      }
    } catch (error) {
      setNotification({
        message: 'Kunde inte markera som sökt',
        type: 'error',
        isVisible: true,
      });
    }
  };

  const totalCount = letters?.length || 0;

  return (
    <div className="relative">
      {/* Sidspecifik bakgrund */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: '#FFFFFF',
        }}
      />

      <div className="max-w-6xl mx-auto pb-16 space-y-6 sm:space-y-7">
        <PageHeader
          title="Dina personliga brev"
          description="Hantera, redigera och ladda ned dina sparade ansökningsbrev."
          action={
            <Link
              href="/dashboard/skapa-brev"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-orange-600 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-700"
            >
              Skapa nytt brev
            </Link>
          }
        />

        {/* Status som rad: antal och hur många som ryms på nivån. */}
        {totalCount > 0 && (
          <StatusRow label="Dina brev">
            {effectiveMaxSavedLetters === Infinity
              ? `${stats.total} brev, ${stats.thisMonth} den här månaden.`
              : `${stats.total} brev, ${Math.min(totalCount, effectiveMaxSavedLetters)} av ${effectiveMaxSavedLetters} aktiva${
                  hasReachedLetterLimit && totalCount > effectiveMaxSavedLetters
                    ? `, ${totalCount - effectiveMaxSavedLetters} låsta`
                    : ''
                }.`}
          </StatusRow>
        )}

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
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
                strokeWidth={2.5}
              />
              <input
                type="text"
                placeholder="Sök på företag eller tjänst…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:border-orange-500 focus:outline-none"
              />
            </div>
            <ViewToggle value={viewMode} onChange={handleViewModeChange} />
          </motion.div>
        )}

        {/* Lista */}
        {totalCount === 0 ? (
          <EmptyState
            illustration={IlluTomBrev}
            title="Inga brev än"
            description="Klistra in en annons så skriver vi utkastet. Brevet hamnar här."
            action={
              <Link
                href="/dashboard/skapa-brev"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-orange-600 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-700"
              >
                Skapa ditt första brev
              </Link>
            }
          />
        ) : filteredLetters.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
            <p className="mb-1 text-sm text-neutral-600">Inga brev matchar din sökning.</p>
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="inline-flex h-11 items-center px-2 text-sm font-medium text-orange-700 underline-offset-4 hover:text-orange-800 hover:underline"
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
                  onMarkApplied={handleMarkApplied}
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
                  onMarkApplied={handleMarkApplied}
                  isDeleting={deletingId === letter.id}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {pendingDeleteId !== null && (
        <ConfirmDialog
          open
          onCancel={() => setPendingDeleteId(null)}
          onConfirm={confirmDelete}
          title="Ta bort brev"
          description="Brevet raderas permanent och kan inte återställas."
          confirmLabel="Ta bort"
          destructive
        />
      )}

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
