// src/lib/traning/rutt.server.ts
// Det varje rutt under /api/traning gör först: inloggningen, och klienten
// skrivningarna sker med (service role, efter kontrollen).

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';
import { testSkrivKlient } from '@/lib/tests/skrivKlient';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = SupabaseClient<any, any, any>;

export type Inloggad =
  | { ok: true; userId: string; supabase: Klient; admin: Klient }
  | { ok: false; svar: NextResponse };

export async function inloggad(): Promise<Inloggad> {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore }) as unknown as Klient;
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { ok: false, svar: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { ok: true, userId: user.id, supabase, admin: testSkrivKlient() };
}

export async function lasKropp(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function fel(status: number, kod: string, extra: Record<string, unknown> = {}): NextResponse {
  return NextResponse.json({ error: kod, ...extra }, { status });
}

/** Loggar och svarar 500 utan teknisk text till klienten. */
export function internt(e: unknown, var_: string): NextResponse {
  console.error(`[traning] ${var_}:`, e);
  return NextResponse.json({ error: 'internt_fel' }, { status: 500 });
}
