// src/app/api/stripe/create-checkout-session/route.ts
// Stängd 2026-11-23 (saas-leads beslut efter UX-genomgången samma dag).
//
// Rutten skapade en kassa på valfritt pris-id utan ångerrättssamtycket som
// varje köp ska ha. Ingen yta anropar den längre: alla köp går genom
// köpsteget (/dashboard/valj-spar) och create-plan-session, som kräver
// samtycket, kontrollerar kampanjen och spärrar dubbla prenumerationer.
// Filen står kvar så att ett gammalt anrop får ett tydligt svar i stället
// för en 404.

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Den här vägen till betalning är stängd. Gå till köpsteget.', kopsteg: '/dashboard/valj-spar' },
    { status: 410 }
  );
}
