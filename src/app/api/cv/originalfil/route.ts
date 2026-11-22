/**
 * GET /api/cv/originalfil?cv=<id>
 *
 * Öppnar originalfilen bakom ett CV i kontot (klicktestet på live
 * 2026-11-22, punkt 1). Hinken cvs är privat, så här finns ingen offentlig
 * länk: rutten läser CV-raden som den inloggade (RLS släpper bara in
 * ägarens rader), kontrollerar att filen ligger i kontots egen mapp
 * users/<id>/ och skickar vidare till en signerad länk som gäller i en minut.
 * Länken skapas med användarens egen session, så lagringens regler prövar
 * ägarskapet en gång till (supabase/migrations/20261122180000_cvs_egen_mapp.sql).
 *
 * ?ladda=1 ger filen som nedladdning med filnamnet hon laddade upp.
 * Saknas filen, eller CV:t inte är hennes, blir svaret 404 med en kort sida
 * och en väg tillbaka till Ditt CV, eftersom länken öppnas i en egen flik.
 */
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { originalfilNamn, originalfilSokvag } from '@/lib/lagring/originalfil'

export const dynamic = 'force-dynamic'

const GILTIG_SEKUNDER = 60

function sida(status: number, rubrik: string, text: string): NextResponse {
  const html = `<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${rubrik}</title>
<style>body{margin:0;font:16px/1.5 system-ui,sans-serif;background:#EBEDF6;color:#1A1A1F;display:grid;place-items:center;min-height:100vh;padding:16px;box-sizing:border-box}main{max-width:420px;background:#fff;border:2px solid #D5DAF0;border-radius:22px;padding:28px}h1{font-size:22px;margin:0 0 8px}p{margin:0 0 20px;color:#4A4A55}a{display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:13px;background:#E07A2F;color:#1A1206;font-weight:700;text-decoration:none;box-shadow:0 4px 0 #A8491A}</style></head>
<body><main><h1>${rubrik}</h1><p>${text}</p><a href="/dashboard/profil/cv">Tillbaka till Ditt CV</a></main></body></html>`
  return new NextResponse(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const cvId = url.searchParams.get('cv')?.trim() ?? ''
  const ladda = url.searchParams.get('ladda') === '1'

  const supabase = createServerClient({ cookies: await cookies() })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    const tillbaka = `/api/cv/originalfil?cv=${encodeURIComponent(cvId)}${ladda ? '&ladda=1' : ''}`
    return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(tillbaka)}`, url.origin), {
      status: 302,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  const saknas = () =>
    sida(404, 'Vi hittar inte originalfilen', 'CV:t har ingen uppladdad fil, eller så är den borttagen. Texten i CV:t finns kvar i kontot.')

  if (!/^[0-9a-f-]{36}$/i.test(cvId)) return saknas()

  const { data: rad } = await supabase
    .from('cv_texts')
    .select('id, file_name, original_file_path')
    .eq('id', cvId)
    .eq('user_id', user.id)
    .maybeSingle()

  const cv = rad as { id: string; file_name: string | null; original_file_path: string | null } | null
  const sokvag = originalfilSokvag(cv?.original_file_path, user.id)
  if (!cv || !sokvag) return saknas()

  const { data: signerad, error } = await supabase.storage
    .from('cvs')
    .createSignedUrl(sokvag, GILTIG_SEKUNDER, ladda ? { download: originalfilNamn(cv.file_name, sokvag) } : undefined)

  if (error || !signerad?.signedUrl) return saknas()

  return NextResponse.redirect(signerad.signedUrl, { status: 302, headers: { 'Cache-Control': 'no-store' } })
}
