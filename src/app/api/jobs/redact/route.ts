// src/app/api/jobs/redact/route.ts
// ============================================================================
// Våg 1 punkt 5 i docs/plan-inloggat-omdesign.md.
//
// Tidigare klipptes träfflistan vid tio jobb och resten ersattes av en prisrad.
// Nu visas alla träffar, men de bortom gratistaket suddas. Suddningen måste
// ske serverside: en klientsidig blur är bara CSS, och texten ligger kvar i
// DOM och i nätverkssvaret för den som tittar efter. Då säljer vi något
// användaren redan har, vilket är både verkningslöst och oärligt.
//
// Rutten tar emot den ordning klienten faktiskt visar (id plus relevans),
// avgör serverside om kontot har premium, och svarar med vilka id som får
// visas i klartext plus en avidentifierad platshållare för de övriga.
// Premium får aldrig något suddat.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { userHasAccess } from '@/lib/supabase/premiumAccess';

/**
 * Hur många träffar gratisnivån ser i klartext.
 *
 * Sänkt från tio till tre i och med Dina matchningar
 * (docs/plan-jobbmatchning.md, avsnitt 2 punkt 5). Träffen är inte längre ett
 * kort i ett rutnät utan en rad med matchgrad och utskrivna skäl, och det är
 * förklaringen som är varan. Tre fullständigt förklarade träffar visar vad
 * Premium ger bättre än tio oförklarade.
 */
export const FREE_TIER_JOB_LIMIT = 3;

/** Max antal jobb vi tar emot i ett anrop, så en klient inte kan be om hur mycket som helst. */
const MAX_JOBS = 600;

/**
 * Hur många suddade rader som ritas innan betalväggen.
 *
 * Runda 2: förut skickade servern en platshållare per dold träff, alla 390.
 * Klienten ritade åtta av dem och betalväggen hamnade ändå långt ned. Nu
 * skär servern listan: fem suddade rader efter de tre fulla, och sedan
 * betalväggen. Fem räcker för att visa att listan fortsätter, och det är
 * inte fler än att tummen når betalväggen utan att skrolla en gång till.
 *
 * Det verkliga antalet dolda skickas separat, så betalväggens rubrik
 * fortfarande kan säga hur många träffar som ligger bakom den.
 */
export const REDACTED_PREVIEW_COUNT = 5;

export interface RedactedJob {
  /** Platshållar-id, aldrig jobbets riktiga id. */
  placeholderId: string;
  /** Matchningsprocenten får visas: den säljer, och avslöjar ingen annons. */
  relevance: number | null;
}

export interface JobRedactionResult {
  isPremium: boolean;
  /** Id som klienten får rendera som vanliga kort, i inskickad ordning. */
  visibleIds: string[];
  /** Suddade platser, utan titel, arbetsgivare, ort eller beskrivning. */
  redacted: RedactedJob[];
  /**
   * Hur många träffar som är dolda totalt, inte bara de som ritas.
   * Betalväggens rubrik räknar på det här talet.
   */
  hiddenCount: number;
}

interface IncomingJob {
  id?: unknown;
  relevance?: unknown;
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const incoming: IncomingJob[] = Array.isArray(body?.jobs) ? body.jobs : [];
    if (incoming.length === 0) {
      const empty: JobRedactionResult = {
        isPremium: false,
        visibleIds: [],
        redacted: [],
        hiddenCount: 0,
      };
      return NextResponse.json(empty);
    }

    const jobs = incoming.slice(0, MAX_JOBS);
    // Jobbmatchningen ligger bara i Allt (avsnitt 3), alltså featuren
    // job_matches_all. Ett spår räcker inte, och betalväggen föreslår därför
    // Allt-veckan oavsett vilket spår användaren valt.
    const isPremium = await userHasAccess(supabase, user.id, 'job_matches_all');

    // Allt ser allt. Ingen suddning, ingen betalvägg.
    if (isPremium) {
      const result: JobRedactionResult = {
        isPremium: true,
        visibleIds: jobs.map((j) => String(j.id ?? '')).filter(Boolean),
        redacted: [],
        hiddenCount: 0,
      };
      return NextResponse.json(result);
    }

    const visibleIds = jobs
      .slice(0, FREE_TIER_JOB_LIMIT)
      .map((j) => String(j.id ?? ''))
      .filter(Boolean);

    // De suddade får bara en position och sin matchningsprocent. Titel,
    // arbetsgivare, ort och beskrivning lämnar aldrig servern.
    //
    // Matchgraden som kommer in är klientens uträknade tal (match-score.ts),
    // inte serverns råa relevans. Det är avsiktligt: suddade rader ska visa
    // samma sjunkande skala som de fulla raderna ovanför, annars ser listan
    // ut att sluta mäta vid betalväggen.
    const dolda = jobs.slice(FREE_TIER_JOB_LIMIT);
    const redacted: RedactedJob[] = dolda
      .slice(0, REDACTED_PREVIEW_COUNT)
      .map((job, i) => ({
        placeholderId: `dold-${i}`,
        relevance: typeof job.relevance === 'number' ? Math.round(job.relevance) : null,
      }));

    const result: JobRedactionResult = {
      isPremium: false,
      visibleIds,
      redacted,
      hiddenCount: dolda.length,
    };
    return NextResponse.json(result);
  } catch (error) {
    console.error('[jobs/redact] Error:', error);
    return NextResponse.json({ error: 'Kunde inte avgöra vad som får visas' }, { status: 500 });
  }
}
