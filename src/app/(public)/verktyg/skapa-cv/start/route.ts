/**
 * Startbladets formulär på /verktyg/skapa-cv postar hit med GET (?yrke=,
 * ?start=ladda|skriv), så att det fungerar utan JavaScript. Vi skickar vidare
 * till registreringen med byggaren som mål (../startval.ts). Ingen sida,
 * inget sparas.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { lasStartval, startvalHref } from '../startval'

export function GET(req: NextRequest) {
  const sok = req.nextUrl.searchParams
  const mal = startvalHref(sok.get('yrke'), lasStartval(sok.get('start')))
  const res = NextResponse.redirect(new URL(mal, req.nextUrl.origin), 303)
  res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  res.headers.set('Cache-Control', 'no-store')
  return res
}
