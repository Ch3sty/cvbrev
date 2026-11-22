/**
 * GET /api/jobbmatchning/aktivt-cv: det aktiva CV:t för matchningen, med
 * CV:ts ort ifylld när tolkningen lämnade den tom (cvOrt.server.ts,
 * klicktestet 2026-11-22 punkt 5). Matchade jobb läser hit efter att ett CV
 * lästs in, i stället för att läsa tabellen direkt i webbläsaren.
 * Svar: { cv } (null när inget CV är inläst).
 */
import { NextResponse } from 'next/server'
import { underlag } from '../underlag'

export const dynamic = 'force-dynamic'

export async function GET() {
  const u = await underlag()
  if (u instanceof NextResponse) return u
  return NextResponse.json({ cv: u.cv }, { headers: { 'Cache-Control': 'no-store' } })
}
