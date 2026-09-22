/**
 * Funnel är sammanslagen med Flöde till Tratt (spec-admin-tydlighet
 * 2026-09-22, punkt 11). Veckotratten ligger under fliken Veckor, och ett
 * valt antal veckor följer med.
 */

import { redirect } from 'next/navigation';

export default async function AdminFunnelRedirect({
  searchParams,
}: {
  searchParams: Promise<{ veckor?: string }>;
}) {
  const { veckor } = await searchParams;
  const n = Number(veckor);
  redirect(
    Number.isInteger(n) && n > 0 ? `/admin/tratt?vy=veckor&veckor=${n}` : '/admin/tratt?vy=veckor'
  );
}
