'use client';

/**
 * Personlighetstestet i sessionsramen (plan-testflode-2026-11-20 avsnitt 2,
 * Personlighet, etapp 4). Samma rutter och kroppar som förut, låsta i
 * kontrakt-steg2.test.ts:
 *
 *   GET  /api/personalityTest/answer?sessionId=  sparade svar, återupptagning
 *   POST /api/personalityTest/answer {sessionId, questionId, value}
 *   POST /api/personalityTest/complete {sessionId}
 *
 * Ramen i läget personlighet: ingen klocka, räknaren "12 / 50" öppnar
 * uppgiftsarket, ‹ i foten. Skalan är fem Svarskort (rader på mobil, fem i
 * rad på dator). Testet saknar rätt svar, så ett tryck är svaret: det sparas
 * och nästa påstående kommer efter 250 ms (gest ett_tryck). "Nästa" i foten
 * används bara efter att hon gått tillbaka och är inaktiv tills påståendet är
 * besvarat. På sista påståendet "Lämna in" med ramens dialog, aktiv först när
 * allt är besvarat. Profilen räknas på servern som förut.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import SessionsRam from '@/components/session/SessionsRam';
import { SESSION } from '@/components/session/copy';
import { sessionHandelser } from '@/components/session/handelser';
import { useLamnadSida } from '@/components/session/lagen/gemensamt';
import type { ArkCell } from '@/components/session/Uppgiftsarket';
import LikertScale from './LikertScale';
import type { LikertValue, PersonalityItem, PersonalityTestType } from '@/lib/personalityTest/types';
import { forstaObesvarade, nastaIndex, svarIOrdning } from '@/lib/personalityTest/aterupptag';

/** Undertiteln: läget och nivån, som i de andra testen. */
const UNDERTITEL: Record<PersonalityTestType, string> = {
  'personlighet-grund': 'Personlighetstest, grundnivå',
  'personlighet-avancerad': 'Personlighetstest, avancerad nivå',
};

const NIVA: Record<PersonalityTestType, string> = { 'personlighet-grund': 'grund', 'personlighet-avancerad': 'avancerad' };

/** POST-kropparna, ordagrant som förut (kontrakt-steg2.test.ts). */
export const PERSONLIGHET_KROPP = {
  svar: (sessionId: string, questionId: string, value: LikertValue) => ({ sessionId, questionId, value }),
  klar: (sessionId: string) => ({ sessionId }),
} as const;

export const personlighetApi = {
  async sparade(sessionId: string): Promise<{ completed: boolean; answers: unknown } | null> {
    try {
      const res = await fetch(`/api/personalityTest/answer?sessionId=${encodeURIComponent(sessionId)}`, { cache: 'no-store' });
      return res.ok ? await res.json() : null;
    } catch {
      return null;
    }
  },
  async svara(sessionId: string, questionId: string, value: LikertValue): Promise<boolean> {
    try {
      const res = await fetch('/api/personalityTest/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(PERSONLIGHET_KROPP.svar(sessionId, questionId, value)),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
  async lamnaIn(sessionId: string): Promise<{ ok: boolean; fel?: string }> {
    try {
      const res = await fetch('/api/personalityTest/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(PERSONLIGHET_KROPP.klar(sessionId)),
      });
      const data = await res.json().catch(() => null);
      return data && (data.success || data.message) ? { ok: true } : { ok: false, fel: data?.error };
    } catch {
      return { ok: false };
    }
  },
};

interface TestSessionViewProps {
  sessionId: string;
  testType: PersonalityTestType;
  items: PersonalityItem[];
  resultsBasePath: string; // ex: '/dashboard/tester/personlighet-grund/test'
  /** Sparade svar, lästa på servern (sparade.server.ts). Utelämnade: vyn hämtar själv. */
  sparade?: { answers: unknown[]; completed: boolean } | null;
}

const VIDARE_MS = 250;

export default function TestSessionView({ sessionId, testType, items, resultsBasePath, sparade: franServern = null }: TestSessionViewProps) {
  const router = useRouter();
  const start = useMemo(() => {
    if (!franServern) return null;
    const s = svarIOrdning(items, franServern.answers as never);
    return { svar: s, forsta: forstaObesvarade(s) };
    // Bara vid första renderingen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [idx, setIdx] = useState(start?.forsta ?? 0);
  const [svar, setSvar] = useState<(LikertValue | null)[]>(() => start?.svar ?? Array(items.length).fill(null));
  const [laddat, setLaddat] = useState(Boolean(start));
  const [besokta, setBesokta] = useState<Set<number>>(() => new Set(Array.from({ length: (start?.forsta ?? 0) + 1 }, (_, i) => i)));
  // Låset gäller från tryck tills sparningen bekräftats och vyn gått vidare,
  // så att ett snabbt andra tryck aldrig landar på samma påstående.
  const lasRef = useRef(false);
  const [last, setLast] = useState(false);
  const [sparfel, setSparfel] = useState(false);
  const [lamnaInOppen, setLamnaInOppen] = useState(false);
  const [lamnar, setLamnar] = useState(false);
  const [lamnaFel, setLamnaFel] = useState(false);
  const ankom = useRef(Date.now());
  const sessionStart = useRef(Date.now());
  const via = useRef<'tap' | 'keyboard'>('tap');
  const bas = useMemo(() => ({ test_kind: 'personlighet', lage: 'personlighet' as const, niva: NIVA[testType], format: null }), [testType]);

  // Sparade svar hämtas vid start, så att en omladdning fortsätter vid första
  // obesvarade. Lästa på servern: bara test_session_started.
  useEffect(() => {
    if (start) {
      sessionHandelser.startad(bas, { session_id: sessionId, antal: items.length, tid_budget_s: null, resumed: start.svar.some((s) => s !== null) });
      return;
    }
    let avbruten = false;
    void (async () => {
      const data = await personlighetApi.sparade(sessionId);
      if (avbruten) return;
      if (data?.completed) {
        router.replace(`${resultsBasePath}/${sessionId}/results`);
        return;
      }
      const sparade = svarIOrdning(items, (data?.answers ?? null) as never);
      const forsta = forstaObesvarade(sparade);
      setSvar(sparade);
      setIdx(forsta);
      setBesokta(new Set(Array.from({ length: forsta + 1 }, (_, i) => i)));
      setLaddat(true);
      ankom.current = Date.now();
      sessionHandelser.startad(bas, {
        session_id: sessionId,
        antal: items.length,
        tid_budget_s: null,
        resumed: sparade.some((s) => s !== null),
      });
    })();
    return () => {
      avbruten = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, items, resultsBasePath, router, bas]);

  const besvarade = useMemo(() => svar.filter((a) => a !== null).length, [svar]);
  const allaBesvarade = besvarade === items.length;
  const sista = idx === items.length - 1;

  const avbrottVidLamning = useLamnadSida(laddat && !lamnar, () =>
    sessionHandelser.avbruten(bas, { session_id: sessionId, index: idx, besvarade, elapsed_ms: Date.now() - sessionStart.current })
  );

  const ga = useCallback((till: number) => {
    if (lasRef.current || till < 0 || till >= items.length) return;
    setIdx(till);
    setBesokta((b) => new Set(b).add(till));
    ankom.current = Date.now();
    via.current = 'tap';
  }, [items.length]);

  const valj = useCallback(
    async (i: number) => {
      if (lasRef.current || !laddat) return;
      const varde = (i + 1) as LikertValue;
      lasRef.current = true;
      setLast(true);
      setSparfel(false);
      const fran = idx;
      const forra = svar[fran];
      const nya = [...svar];
      nya[fran] = varde;
      setSvar(nya);
      const ok = await personlighetApi.svara(sessionId, items[fran].id, varde);
      if (!ok) {
        setSvar((cur) => {
          const bak = [...cur];
          bak[fran] = forra;
          return bak;
        });
        setSparfel(true);
        lasRef.current = false;
        setLast(false);
        return;
      }
      sessionHandelser.besvarad(bas, { session_id: sessionId, index: fran, elapsed_ms: Date.now() - ankom.current, via: via.current, vet_inte: false });
      // Ett tryck går vidare: till nästa obesvarade efter 250 ms. På sista
      // påståendet står vyn kvar med Lämna in.
      setTimeout(() => {
        const till = nastaIndex(nya, fran);
        lasRef.current = false;
        setLast(false);
        if (till !== fran) {
          setIdx(till);
          setBesokta((b) => new Set(b).add(till));
          ankom.current = Date.now();
        }
        via.current = 'tap';
      }, VIDARE_MS);
    },
    [idx, svar, items, laddat, sessionId, bas]
  );

  const lamnaIn = async () => {
    setLamnar(true);
    setLamnaFel(false);
    const r = await personlighetApi.lamnaIn(sessionId);
    if (!r.ok) {
      setLamnar(false);
      setLamnaFel(true);
      setLamnaInOppen(false);
      return;
    }
    avbrottVidLamning();
    sessionHandelser.klar(bas, { session_id: sessionId, besvarade, elapsed_ms: Date.now() - sessionStart.current, over_tid: false });
    router.push(`${resultsBasePath}/${sessionId}/results`);
  };

  const celler: ArkCell[] = items.map((_, i) =>
    i === idx ? 'aktuell' : svar[i] !== null ? 'besvarad' : besokta.has(i) && i < Math.max(...besokta) ? 'hoppad' : 'kvar'
  );

  const item = items[idx];
  const titel = 'Personlighet';
  const undertitel = UNDERTITEL[testType];

  if (!laddat || !item) {
    return (
      <SessionsRam
        lage="personlighet"
        titel={titel}
        undertitel={undertitel}
        form="mellan"
        raknare={null}
        framsteg={0}
        bekraftaAvbryt={false}
        onAvbryt={() => router.push('/dashboard/tester')}
        fot={null}
      >
        <p aria-busy="true" className="loading-thread rounded-xl border border-kant bg-papper p-4 text-sm text-ink-3">
          {SESSION.laddar.session}
        </p>
      </SessionsRam>
    );
  }

  return (
    <SessionsRam
      lage="personlighet"
      titel={titel}
      undertitel={undertitel}
      form="mellan"
      raknare={{ nr: idx + 1, antal: items.length }}
      framsteg={besvarade / items.length}
      nyckel={item.id}
      bekraftaAvbryt={!lamnar}
      onAvbryt={() => {
        avbrottVidLamning();
        sessionHandelser.avbruten(bas, { session_id: sessionId, index: idx, besvarade, elapsed_ms: Date.now() - sessionStart.current });
        router.push('/dashboard/tester');
      }}
      lamnaIn={{
        open: lamnaInOppen,
        obesvarade: items.length - besvarade,
        onBekrafta: lamnaIn,
        onStang: () => setLamnaInOppen(false),
        text: 'Alla påståenden är besvarade. Vi räknar fram din profil och du ser den direkt.',
      }}
      ark={{ celler, onValj: (i) => ga(i) }}
      tangent={last || lamnar ? null : { antal: 5, onValj: (i) => ((via.current = 'keyboard'), void valj(i)) }}
      rad={
        sparfel || lamnaFel ? (
          <p role="alert" className="rounded-xl border border-kant bg-papper px-3.5 py-2.5 text-sm leading-5 text-ink-1">
            {lamnaFel ? 'Profilen gick inte att räkna fram. Svaren är sparade, försök igen.' : 'Svaret sparades inte. Tryck igen.'}
          </p>
        ) : null
      }
      fot={{
        vanster: { typ: 'tillbaka', disabled: idx === 0 || last, onClick: () => ga(idx - 1) },
        primar: sista
          ? {
              text: SESSION.knapp.lamnaIn,
              onClick: () => setLamnaInOppen(true),
              disabled: !allaBesvarade || last,
              laddar: lamnar,
              data: 'lamna-in',
            }
          : {
              text: SESSION.knapp.nasta,
              onClick: () => ga(idx + 1),
              disabled: svar[idx] === null || last,
              data: 'nasta',
            },
      }}
    >
      <div className="flex flex-col gap-4 lg:gap-5" data-personlighet>
        <div className="rounded-xl border border-kant bg-papper px-4 py-5 lg:px-6 lg:py-7" data-pastaende>
          <p className="text-[12px] font-semibold uppercase leading-4 tracking-[.06em] text-ink-3">
            Påstående {idx + 1} av {items.length}
          </p>
          <h2 tabIndex={-1} data-uppgift-rubrik className="text-fraga mt-1.5 text-ink-1 outline-none">
            {item.text}
          </h2>
          <p className="mt-2 text-sm leading-5 text-ink-2">Välj det som stämmer bäst för dig. Det finns inga rätt eller fel.</p>
        </div>
        <LikertScale value={svar[idx]} onChange={(v) => void valj(v - 1)} disabled={last} />
      </div>
    </SessionsRam>
  );
}
