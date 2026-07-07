'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

// Persistens för hopfällda sektioner på Bli upptäckt.
//
// Sanning: user_ui_preferences (key = 'bli_upptackt_collapsed', value =
// { sections: string[] }) med ägar-RLS, så valet överlever ut- och inloggning
// och följer med mellan enheter.
//
// Noll flimmer: localStorage läses SYNKRONT vid mount så korten renderas i
// rätt läge direkt. DB-läget synkas i bakgrunden och tar över på ny enhet.
// Skrivningar går till både localStorage (direkt) och DB (best effort).

const PREF_KEY = 'bli_upptackt_collapsed';
const LS_KEY = 'jobbcoach_bli_upptackt_collapsed';

function readLocal(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

function writeLocal(sections: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(sections));
  } catch {
    // Full disk / privat läge: DB är fortfarande sanningen.
  }
}

export interface CollapsedSectionsApi {
  isCollapsed: (id: string) => boolean;
  toggle: (id: string) => void;
}

export function useCollapsedSections(): CollapsedSectionsApi {
  // Synkron initiering ur localStorage = inget hopp vid första renderingen.
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set(readLocal()));
  const supabase = getSupabaseClient();
  const userIdRef = useRef<string | null>(null);

  // Hämta DB-läget en gång och låt det ta över (viktigt på ny enhet där
  // localStorage är tomt men användaren fällt ihop kort tidigare).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled || !user) return;
        userIdRef.current = user.id;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
          .from('user_ui_preferences')
          .select('value')
          .eq('user_id', user.id)
          .eq('key', PREF_KEY)
          .maybeSingle();
        if (cancelled) return;

        const dbSections: string[] = Array.isArray(data?.value?.sections)
          ? data.value.sections.filter((s: unknown): s is string => typeof s === 'string')
          : [];

        // DB vinner om den finns; annars behåll det synkront lästa localStorage.
        if (data) {
          setCollapsed(new Set(dbSections));
          writeLocal(dbSections);
        }
      } catch {
        // Preferensen är ren bekvämlighet: tyst vid fel.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const persist = useCallback(
    (sections: string[]) => {
      writeLocal(sections);
      const userId = userIdRef.current;
      if (!userId) return;
      // Upsert best effort, blockerar aldrig UI:t.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from('user_ui_preferences')
        .upsert(
          {
            user_id: userId,
            key: PREF_KEY,
            value: { sections },
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,key' }
        )
        .then((res: { error: unknown }) => {
          if (res.error) console.error('Kunde inte spara sektionsläge', res.error);
        });
    },
    [supabase]
  );

  const toggle = useCallback(
    (id: string) => {
      setCollapsed((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        persist([...next]);
        return next;
      });
    },
    [persist]
  );

  const isCollapsed = useCallback((id: string) => collapsed.has(id), [collapsed]);

  return { isCollapsed, toggle };
}
