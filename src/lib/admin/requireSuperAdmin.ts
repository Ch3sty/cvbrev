// src/lib/admin/requireSuperAdmin.ts
// Enda behörighetskontrollen för adminen. Varje rutt under
// src/app/api/admin/** börjar med requireSuperAdmin(), och layouten
// src/app/admin/layout.tsx kör isSuperAdmin() på servern innan något
// renderas. Ingen rutt gör en egen admin_users-fråga.
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const ADMIN_ROLE = 'super_admin' as const;

export type SuperAdminResult =
  | { ok: true; userId: string; email: string | null }
  | { ok: false; response: NextResponse };

/**
 * Läser den inloggade användaren ur sessionen och kontrollerar att hen har
 * rollen super_admin i admin_users. Rollen läses med service role, så
 * kontrollen fungerar även när admin_users är RLS-låst.
 *
 * 401 utan session, 403 utan roll.
 */
export async function requireSuperAdmin(): Promise<SuperAdminResult> {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Ej inloggad' }, { status: 401 }),
    };
  }

  const hasRole = await hasSuperAdminRole(user.id);

  if (!hasRole) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Kräver super_admin' },
        { status: 403 }
      ),
    };
  }

  return { ok: true, userId: user.id, email: user.email ?? null };
}

/**
 * Samma kontroll utan NextResponse, för server components och layouten.
 * Returnerar användarens id när hen är super_admin, annars null.
 */
export async function getSuperAdminUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const hasRole = await hasSuperAdminRole(user.id);
  return hasRole ? user.id : null;
}

/** Slår upp rollen i admin_users med service role. */
export async function hasSuperAdminRole(userId: string): Promise<boolean> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('admin_users')
      .select('role')
      .eq('id', userId)
      .eq('role', ADMIN_ROLE)
      .maybeSingle();

    if (error) {
      console.error('requireSuperAdmin: kunde inte läsa admin_users', error);
      return false;
    }

    return Boolean(data);
  } catch (err) {
    console.error('requireSuperAdmin: oväntat fel', err);
    return false;
  }
}
