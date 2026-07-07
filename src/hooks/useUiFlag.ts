'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

// Återanvändbar engångsflagga för UI (t.ex. "har sett popovern", "har stängt
// introkortet"). Sanning: user_ui_preferences (key per flagga), så valet
// överlever ut- och inloggning och följer med mellan enheter. localStorage
// läses synkront vid mount för nollflimmer, DB tar över i bakgrunden.
//
// Returnerar [flag, setFlag]. flag=true betyder "redan gjort/sett/stängt".

function lsKey(key: string): string {
  return `jobbcoach_uiflag_${key}`;
}

function readLocal(key: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(lsKey(key)) === '1';
  } catch {
    return false;
  }
}

export function useUiFlag(key: string): [boolean, () => void] {
  const [flag, setFlag] = useState<boolean>(() => readLocal(key));
  const supabase = getSupabaseClient();
  const userIdRef = useRef<string | null>(null);

  // Hämta DB-läget en gång och låt det ta över (viktigt på ny enhet).
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
          .eq('key', `flag:${key}`)
          .maybeSingle();
        if (cancelled) return;
        if (data?.value?.set === true) {
          setFlag(true);
          try {
            window.localStorage.setItem(lsKey(key), '1');
          } catch {
            // Icke-kritiskt.
          }
        }
      } catch {
        // Flaggan är ren bekvämlighet: tyst vid fel.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, key]);

  const set = useCallback(() => {
    setFlag(true);
    try {
      window.localStorage.setItem(lsKey(key), '1');
    } catch {
      // Icke-kritiskt.
    }
    const userId = userIdRef.current;
    if (!userId) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('user_ui_preferences')
      .upsert(
        {
          user_id: userId,
          key: `flag:${key}`,
          value: { set: true },
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,key' }
      )
      .then((res: { error: unknown }) => {
        if (res.error) console.error('Kunde inte spara UI-flagga', res.error);
      });
  }, [supabase, key]);

  return [flag, set];
}
