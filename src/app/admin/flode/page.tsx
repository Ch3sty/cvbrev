/**
 * Flöde är sammanslagen med Funnel till Tratt (spec-admin-tydlighet
 * 2026-09-22, punkt 11). Gamla länkar och bokmärken hamnar på köpvägen.
 * Ett fönster på 7 eller 30 dagar följer med; 90 finns inte längre.
 */

import { redirect } from 'next/navigation';

export default async function AdminFlodeRedirect({
  searchParams,
}: {
  searchParams: Promise<{ dagar?: string }>;
}) {
  const { dagar } = await searchParams;
  redirect(dagar === '7' || dagar === '30' ? `/admin/tratt?fonster=${dagar}` : '/admin/tratt');
}
