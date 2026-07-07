'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

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
  loaded: boolean;
}

const POLL_MS = 60_000;

export function useCandidateInterests(): CandidateInterestsState {
  const [state, setState] = useState<CandidateInterestsState>({
    pending: 0,
    unread: 0,
    total: 0,
    isVisible: false,
    loaded: false,
  });

  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabaseClient();

    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled || !user) return;

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
        const isVisible =
          !!profileRes?.data?.visibility && profileRes.data.visibility !== 'off';

        if (!cancelled) setState({ pending, unread, total, isVisible, loaded: true });
      } catch {
        if (!cancelled) setState((s) => ({ ...s, loaded: true }));
      }
    };

    load();
    const t = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return state;
}
