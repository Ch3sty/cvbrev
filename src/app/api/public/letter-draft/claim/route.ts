/**
 * POST /api/public/letter-draft/claim
 *
 * Gör ett anonymt utkast till den nyss registrerade användarens brev
 * (docs/plan-konvertering.md, C6). Kräver inloggning: det är först här
 * hela brevtexten blir tillgänglig.
 *
 * Idempotent: har samma användare redan hämtat utkastet får de tillbaka
 * samma brev i stället för ett nytt.
 */

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getClaimableDraft } from '@/lib/letters/public-draft'

export async function POST(request: Request) {
  let token: string | undefined
  try {
    const body = await request.json()
    token = typeof body?.token === 'string' ? body.token.trim() : undefined
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 })
  }

  if (!token) {
    return NextResponse.json({ error: 'Token saknas' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient({ cookies: cookieStore })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })
  }

  // De nya konverteringstabellerna finns ännu inte i database.types.ts, så
  // admin-klienten castas här på samma sätt som i supabase/middleware.ts.
  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
  const draft = await getClaimableDraft(admin, token)

  if (!draft) {
    return NextResponse.json(
      { error: 'Utkastet finns inte längre eller har gått ut.' },
      { status: 404 }
    )
  }

  // Redan hämtat av någon annan: neka. Redan hämtat av samma användare:
  // leta upp brevet och skicka tillbaka samma redirect som första gången.
  if (draft.claimed_by && draft.claimed_by !== user.id) {
    return NextResponse.json({ error: 'Utkastet är redan hämtat.' }, { status: 409 })
  }

  if (draft.claimed_by === user.id) {
    const { data: existing } = await admin
      .from('letters')
      .select('id')
      .eq('user_id', user.id)
      .eq('title', draft.role)
      .eq('company', draft.employer)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const existingId = (existing as { id?: string } | null)?.id
    if (existingId) {
      return NextResponse.json({ redirect: `/dashboard/mina-brev/${existingId}` })
    }
  }

  const { data: letter, error: insertError } = await admin
    .from('letters')
    .insert({
      user_id: user.id,
      title: draft.role,
      company: draft.employer,
      job_title: draft.role,
      content: draft.letter_text,
      tonality: 'professional',
      is_saved: true,
    })
    .select('id')
    .single()

  if (insertError || !letter) {
    console.error('[letter-draft/claim] Kunde inte skapa brev:', insertError)
    return NextResponse.json({ error: 'Kunde inte spara brevet.' }, { status: 500 })
  }

  // Märk utkastet som hämtat. Villkoret på claimed_by is null gör att två
  // samtidiga anrop inte kan ge två brev.
  await admin
    .from('public_letter_drafts')
    .update({ claimed_by: user.id, claimed_at: new Date().toISOString() })
    .eq('token', draft.token)
    .is('claimed_by', null)

  const letterId = (letter as { id: string }).id
  return NextResponse.json({ redirect: `/dashboard/mina-brev/${letterId}` })
}
