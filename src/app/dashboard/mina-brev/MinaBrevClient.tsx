'use client';

/**
 * Mina brev, listvyn (docs/design/overlamning-opus.md, avsnitt 4, "Lista").
 *
 * Väggen (RumHuvud) med kvotraden, det lyfta kortet med Skapa nytt brev, sökfältet som
 * insunket fält och breven som kort utan skugga. Tomt läge via EmptyState,
 * borttagning via ConfirmDialog. Ingen rörelse, inga orange ytor, ingen egen
 * sidbakgrund: marken kommer från skalet.
 */

import { KNAPP_PRIMAR, KNAPP_SEKUNDAR_SMAL, LANK_VAGG } from '@/components/shell/knappar'
import { PAKETRADER } from '@/components/paywall/paywall-copy'
import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useLetters } from '@/hooks/use-letters';
import type { Letter } from '@/store/letter-store';
import { useProfile } from '@/hooks/use-profile';
import { useNotification } from '@/context/notificationcontext';
import Link from 'next/link';

import LetterCard from './components/LetterCard';
import LetterCardCompact from './components/LetterCardCompact';
import ViewToggle, { type ViewMode } from './components/ViewToggle';
import RumHuvud from '@/components/rum/RumHuvud';
import Golv from '@/components/rum/Golv';
import LyftKort from '@/components/rum/LyftKort';
import { LYFT, RUBRIK } from '@/lib/rum/copy';
import EmptyState from '@/components/shell/EmptyState';
import { IlluTomBrev } from '@/components/illustrations/EmptyStateIllustrations';
import { PREMIUM_HREF } from '@/lib/premium/premiumEntry';
import { useBetalvaggVisad } from '@/hooks/useBetalvaggVisad';

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

// Lyftkortets Skapa nytt brev är vyns kopparknapp; tomma lägen har sekundär.
const PRIMARY = KNAPP_SEKUNDAR_SMAL;

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

  // Nedladdningen bor på brevets egen sida, där formatet också kan gå i
  // betalvägg. Menyvalen tar användaren dit i stället för att ladda ner
  // blint från listan.
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

  // Ett låst brevkort länkar till köpsteget med platsen kvot, och en länk
  // från en låst funktion till köpsteget är en vägg (spec-rummen 23.8).
  // Mäts per lista, inte per kort: fem låsta brev är en skärm, en exponering.
  const harLastKort = !!letters?.some((l) => l.isLocked);
  useBetalvaggVisad('kvot', harLastKort);

  const totalCount = letters?.length || 0;
  const harLasta =
    effectiveMaxSavedLetters !== Infinity &&
    hasReachedLetterLimit &&
    totalCount > effectiveMaxSavedLetters;

  return (
    <>
      {/* Väggen säger var du är (spec 16.3.2): kvotradens text står i
          raden, med dess länk efter texten. Nytt brev bär det lyfta kortet. */}
      <RumHuvud
        title={RUBRIK.minaBrev}
        description={
          totalCount > 0 ? (
            <>
              {effectiveMaxSavedLetters === Infinity
                ? `${stats.total} brev, ${stats.thisMonth} den här månaden.`
                : `${Math.min(totalCount, effectiveMaxSavedLetters)} av ${effectiveMaxSavedLetters} aktiva${
                    harLasta ? `, ${totalCount - effectiveMaxSavedLetters} låsta` : ''
                  }.`}
              {harLasta ? (
                <>
                  {' '}
                  <Link href={PREMIUM_HREF} className={LANK_VAGG}>
                    {PAKETRADER.jamfor}
                  </Link>
                </>
              ) : null}
            </>
          ) : (
            'Läs, redigera och ladda ner de brev du har sparat.'
          )
        }
        tat={false}
      />
    <Golv lyft>
      <LyftKort
        label={LYFT.minaBrev.titel}
        eyebrow={LYFT.minaBrev.eyebrow}
        eyebrowTon="neutral"
        titel={LYFT.minaBrev.titel}
        text={LYFT.minaBrev.text}
        handling={
          <Link href="/dashboard/skapa-brev" className={KNAPP_PRIMAR}>
            {LYFT.minaBrev.handling}
          </Link>
        }
      />
    <div className="w-full max-w-5xl space-y-4">

      {/* Sökfält och vyväljare */}
      {totalCount > 0 && (
        <div className="flex items-center gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Sök bland dina brev</span>
            <input
              type="search"
              placeholder="Sök på företag eller tjänst"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 w-full rounded-lg border border-kant bg-papper-2 px-3 text-sm text-ink-1  placeholder:text-ink-3 focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1"
            />
          </label>
          <ViewToggle value={viewMode} onChange={handleViewModeChange} />
        </div>
      )}

      {/* Lista */}
      {totalCount === 0 ? (
        <EmptyState
          illustration={IlluTomBrev}
          title="Inga brev än"
          description="Klistra in en annons så skriver vi utkastet. Brevet hamnar här."
          action={
            <Link href="/dashboard/skapa-brev" className={PRIMARY}>
              Skapa ditt första brev
            </Link>
          }
        />
      ) : filteredLetters.length === 0 ? (
        <EmptyState
          title="Inget brev matchar sökningen"
          description="Prova ett annat företag eller en annan tjänst."
          action={
            <button type="button" onClick={() => setSearchTerm('')} className={PRIMARY}>
              Rensa sökningen
            </button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredLetters.map((letter) => (
            <LetterCard
              key={letter.id}
              letter={letter}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDownload={handleDownload}
              onMarkApplied={handleMarkApplied}
              isDeleting={deletingId === letter.id}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLetters.map((letter) => (
            <LetterCardCompact
              key={letter.id}
              letter={letter}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDownload={handleDownload}
              onMarkApplied={handleMarkApplied}
              isDeleting={deletingId === letter.id}
            />
          ))}
        </div>
      )}

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
    </Golv>
    </>
  );
}
