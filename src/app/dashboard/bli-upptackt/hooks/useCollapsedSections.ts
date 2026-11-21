'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

// Persistens för hopfällda sektioner på Bli upptäckt.
//
// Sanning: user_ui_preferences (key = 'bli_upptackt_collapsed', value =
// { sections: string[] }) med ägar-RLS, så valet överlever ut- och inloggning
// och följer med mellan enheter.
//
// Första render använder DB-läget som servern läst (samma på server och
// klient, ingen hydreringsvarning). Finns ingen DB-rad läses localStorage
// efter monteringen. Skrivningar går till både localStorage (direkt) och DB
// (best effort).

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

/**
 * initialSections: DB-läget, läst på servern i getPageData.ts. null betyder
 * att raden saknas, och då gäller localStorage som förut.
 *
 * Hooken gjorde tidigare ett eget auth.getUser() följt av en fråga mot
 * user_ui_preferences efter mount, alltså två seriella rundturer bara för att
 * veta vilka kort som skulle vara hopfällda. Serverdatan gör den kedjan
 * överflödig, och eftersom värdet finns redan vid första render fälls korten
 * rätt direkt i stället för att hoppa när svaret kom.
 */
export function useCollapsedSections(
  initialSections: string[] | null = null
): CollapsedSectionsApi {
  // DB-läget (från servern) gäller från första render, på servern och i
  // klienten. localStorage läses INTE i första render: servern ser det inte,
  // och ett lokalt läge som skiljer sig gav en hydreringsvarning (aria-expanded
  // och fällningens stil på stegen). Saknas DB-raden läses det lokala läget
  // efter monteringen i stället.
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set(initialSections ?? []));
  const supabase = getSupabaseClient();
  const userIdRef = useRef<string | null>(null);

  // Serverläget skrivs till localStorage så nästa besök renderar likadant
  // även innan serverdatan hunnit fram. Utan serverläge tas det lokala in.
  useEffect(() => {
    if (initialSections) {
      writeLocal(initialSections);
      return;
    }
    const lokalt = readLocal();
    if (lokalt.length) setCollapsed(new Set(lokalt));
  }, [initialSections]);

  // Skrivningarna behöver användarens id. Det hämtas en gång, men blockerar
  // ingenting: det behövs först när kandidaten faktiskt fäller ihop ett kort.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled || !user) return;
        userIdRef.current = user.id;
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
