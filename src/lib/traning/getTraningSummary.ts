// src/lib/traning/getTraningSummary.ts
// =============================================================================
// Allt hemvyn i Rekryteringstester behöver, i en parallell omgång på servern
// (spec-rummen 6 våg 2 och 2.2): motorns status (plan, punkter, serie,
// planen per dag, var du tappar, senaste passet), när profilen senast ritades
// med en ny punkt, raden om fler tester och raden om Jobbsöket.
//
// Summeringen för Jobbsöket delas med layouten (hamtaSummering är cache()),
// så hemvyn kostar motorns läsning och testernas två frågor, inget mer.
//
// Går motorns läsning fel blir status null och hemvyn står i felet (X1):
// väggen och raden om Jobbsöket ritas ändå, aldrig en tom sida.
// =============================================================================

import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { testSkrivKlient } from '@/lib/tests/skrivKlient';
import { getTesterHubData } from '@/app/dashboard/tester/getHubData';
import { hamtaSummering } from '@/lib/dashboard/summaryForRequest';
import type { Scope } from '@/lib/access/features';
import type { PlanKey } from '@/lib/plans/plans';
import { dagSthlm, type Dag } from './datum';
import { hamtaTraningsstatus, type Traningsstatus } from './motor.server';
import type { FlerTesterIn, JobbsokIn } from './hemvy';

export interface TraningSummary {
  idag: Dag;
  status: Traningsstatus | null;
  flerTester: FlerTesterIn;
  jobbsok: JobbsokIn;
  /** Paketet, för betalväggens förslag (GraValSheet). */
  paket: { scope: Scope | null; track: Scope | null; planKey: PlanKey | null };
  /** Registreringens val tester eller intervju: ingången är första vyn när planen saknas. */
  valdeTester: boolean;
}

const VERBALA = ['verbal-resonemang', 'verbal-resonemang-v2', 'verbal-resonemang-expert'] as const;
const NUMERISKA = ['numeriskt-test', 'numeriskt-test-v2', 'numeriskt-test-expert'] as const;

function senast(datum: (string | null | undefined)[]): string | null {
  return datum.filter(Boolean).sort().pop() ?? null;
}

export async function getTraningSummary(userId: string): Promise<TraningSummary> {
  const supabase = createServerClient({ cookies: await cookies() });
  const admin = testSkrivKlient();
  const idag = dagSthlm();

  // Motorns status väntar bara på profilens traning_sedd_at, inte på
  // summeringen eller testerna: allt går i samma parallella omgång.
  const statusLas = (async (): Promise<Traningsstatus | null> => {
    try {
      const { data } = await supabase.from('profiles').select('traning_sedd_at').eq('id', userId).maybeSingle();
      return await hamtaTraningsstatus({
        supabase: supabase as never,
        admin,
        userId,
        idag,
        sedd_at: (data as { traning_sedd_at?: string | null } | null)?.traning_sedd_at ?? null,
      });
    } catch (e) {
      console.error('[traning] hemvyns status:', e);
      return null;
    }
  })();

  const [summering, hub, status] = await Promise.all([
    hamtaSummering(userId),
    getTesterHubData(supabase, userId, false, false, null).catch(() => null),
    statusLas,
  ]);

  const per = hub?.perTest ?? null;
  const intent = summering?.komIgang?.intent ?? null;
  return {
    idag,
    status,
    flerTester: {
      verbalSenast: per ? senast(VERBALA.map((s) => per[s]?.lastAttempt)) : null,
      numeriskSenast: per ? senast(NUMERISKA.map((s) => per[s]?.lastAttempt)) : null,
      personlighetKlar: hub?.personality.grund.lastCompletedAt ?? hub?.personality.avancerad.lastCompletedAt ?? null,
    },
    jobbsok: {
      tjanster: summering?.sidomeny?.ansokningar ?? 0,
      intervjuer: summering?.applications?.interviewCount ?? 0,
      brev: summering?.letters?.total ?? 0,
    },
    paket: {
      scope: (summering?.paket?.scope ?? null) as Scope | null,
      track: (summering?.paket?.track ?? null) as Scope | null,
      planKey: (summering?.paket?.planKey ?? null) as PlanKey | null,
    },
    valdeTester: intent === 'tester' || intent === 'intervju',
  };
}

/** Markerar att hemvyn ritats med den nya punkten: nästa visning står stilla. */
export async function markeraTraningSedd(userId: string): Promise<void> {
  try {
    await testSkrivKlient().from('profiles').update({ traning_sedd_at: new Date().toISOString() }).eq('id', userId);
  } catch (e) {
    console.error('[traning] traning_sedd_at:', e);
  }
}
