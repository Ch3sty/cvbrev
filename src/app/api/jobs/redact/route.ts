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
import { userHasPremiumAccess } from '@/lib/supabase/premiumAccess';

/** Hur många träffar gratisnivån ser i klartext. */
export const FREE_TIER_JOB_LIMIT = 10;

/** Max antal jobb vi tar emot i ett anrop, så en klient inte kan be om hur mycket som helst. */
const MAX_JOBS = 600;

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
      const empty: JobRedactionResult = { isPremium: false, visibleIds: [], redacted: [] };
      return NextResponse.json(empty);
    }

    const jobs = incoming.slice(0, MAX_JOBS);
    const isPremium = await userHasPremiumAccess(supabase, user.id);

    // Premium ser allt. Ingen suddning, ingen betalvägg.
    if (isPremium) {
      const result: JobRedactionResult = {
        isPremium: true,
        visibleIds: jobs.map((j) => String(j.id ?? '')).filter(Boolean),
        redacted: [],
      };
      return NextResponse.json(result);
    }

    const visibleIds = jobs
      .slice(0, FREE_TIER_JOB_LIMIT)
      .map((j) => String(j.id ?? ''))
      .filter(Boolean);

    // De suddade får bara en position och sin matchningsprocent. Titel,
    // arbetsgivare, ort och beskrivning lämnar aldrig servern.
    const redacted: RedactedJob[] = jobs.slice(FREE_TIER_JOB_LIMIT).map((job, i) => ({
      placeholderId: `dold-${i}`,
      relevance: typeof job.relevance === 'number' ? Math.round(job.relevance) : null,
    }));

    const result: JobRedactionResult = { isPremium: false, visibleIds, redacted };
    return NextResponse.json(result);
  } catch (error) {
    console.error('[jobs/redact] Error:', error);
    return NextResponse.json({ error: 'Kunde inte avgöra vad som får visas' }, { status: 500 });
  }
}
