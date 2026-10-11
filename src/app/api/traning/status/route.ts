// /api/traning/status: läget för Träningens hemvy och kurvan (våg 2 och 3b
// kan läsa det här eller anropa hamtaTraningsstatus direkt från en server
// component). Nivå, punkter (bara senaste utan historik), planen med status
// per dag, serien, formordet, "Var du tappar", milstolparna och de ovisade
// kvittona, dagar till provet. Registrerar märken som nås av datumet.

import { NextResponse } from 'next/server';
import { hamtaTraningsstatus } from '@/lib/traning/motor.server';
import { inloggad, internt } from '@/lib/traning/rutt.server';

export async function GET() {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  try {
    const { data: profil } = await a.supabase
      .from('profiles')
      .select('traning_sedd_at')
      .eq('id', a.userId)
      .maybeSingle();
    const status = await hamtaTraningsstatus({
      supabase: a.supabase,
      admin: a.admin,
      userId: a.userId,
      sedd_at: (profil as { traning_sedd_at?: string | null } | null)?.traning_sedd_at ?? null,
    });
    return NextResponse.json(status);
  } catch (e) {
    return internt(e, 'status GET');
  }
}
