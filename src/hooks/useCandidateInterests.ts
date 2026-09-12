'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { scheduleIdle } from '@/lib/scheduleIdle';

/**
 * Delad datakälla för kandidatens rekryteringsläge, så meddelande-ikonen i
 * headern, undertexten på Bli upptäckt-raden och genvägen på sidan alltid visar
 * samma siffror. Hämtar intressen (pending + olästa) och profilens synlighet i
 * en runda vid mount, med lätt polling så nya intressen dyker upp.
 */
export interface CandidateInterestsState {
  /** Obesvarade intresseförfrågningar (kräver accept/avböj). */
  pending: number;
  /** Summa olästa meddelanden över alla trådar. */
  unread: number;
  /** Totalt antal intressen (även avböjda), för "har något hänt någonsin". */
  total: number;
  /** true när profilen är synlig i poolen (visibility <> 'off'). */
  isVisible: boolean;
  /** Synlighetsläget: 'anonymous' | 'open' | 'off' (null innan laddning). */
  visibility: 'anonymous' | 'open' | 'off' | null;
  loaded: boolean;
}

const POLL_MS = 60_000;

/**
 * Modulnivå-delning. Hooken monteras tre gånger i det inloggade skalet
 * (headerns meddelandeikon, sidomenyns rad och statusraden), och varje
 * montering gjorde tidigare ett eget auth.getUser() följt av en egen
 * hämtning. Nu delar alla prenumeranter en och samma begäran och en enda
 * polltimer, oavsett hur många komponenter som läser den.
 */
const EMPTY: CandidateInterestsState = {
  pending: 0,
  unread: 0,
  total: 0,
  isVisible: false,
  visibility: null,
  loaded: false,
};

let sharedState: CandidateInterestsState = EMPTY;
let inFlight: Promise<void> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
const subscribers = new Set<(s: CandidateInterestsState) => void>();

function publish(next: CandidateInterestsState) {
  sharedState = next;
  subscribers.forEach((fn) => fn(next));
}

async function loadShared(): Promise<void> {
  // Pågår redan en hämtning: häng på den i stället för att starta en till.
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const supabase = getSupabaseClient();
      // getSession() läser den lokala sessionen. getUser() gick över nätet
      // och låg seriellt före båda anropen nedan.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      const [interestsRes, profileRes] = await Promise.all([
        fetch('/api/candidate/interests'),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from('candidate_profiles')
          .select('visibility')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      let pending = 0;
      let unread = 0;
      let total = 0;
      if (interestsRes.ok) {
        const data = await interestsRes.json();
        const interests = (data.interests ?? []) as Array<{
          status: string;
          unreadCount?: number;
        }>;
        total = interests.length;
        pending = interests.filter((i) => i.status === 'pending').length;
        unread = interests.reduce((s, i) => s + (i.unreadCount ?? 0), 0);
      }
      const visibility =
        (profileRes?.data?.visibility as 'anonymous' | 'open' | 'off' | undefined) ?? null;
      const isVisible = !!visibility && visibility !== 'off';

      publish({ pending, unread, total, isVisible, visibility, loaded: true });
    } catch {
      publish({ ...sharedState, loaded: true });
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

export function useCandidateInterests(): CandidateInterestsState {
  const [state, setState] = useState<CandidateInterestsState>(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    // Redan hämtat i den här sessionen: visa direkt, hämta inte om.
    // Siffrorna i headern och sidomenyn behövs inte för första målningen.
    // Routen tar knappt en sekund att svara, så med ett kort tak hann den
    // ändå före LCP på tyngre sidor och blev det enda som stod i vägen.
    let avbrytIdle: (() => void) | null = null;
    if (!sharedState.loaded) avbrytIdle = scheduleIdle(() => void loadShared(), 4000);
    else setState(sharedState);

    // En enda timer för alla prenumeranter.
    if (!pollTimer) pollTimer = setInterval(() => void loadShared(), POLL_MS);

    return () => {
      avbrytIdle?.();
      subscribers.delete(setState);
      if (subscribers.size === 0 && pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };
  }, []);

  return state;
}
