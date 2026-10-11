/**
 * Alla tester (spec-rummen 2.2 och 4.3): katalogen som förr var hubben på
 * /dashboard/tester, nu en undersida i Rekryteringstester. Hemvyn bor på
 * /dashboard/tester (våg 2).
 *
 * Sidan är en server component, enligt samma mönster som
 * dashboard/sokta-tjanster och dashboard/skapa-brev.
 *
 * Förut var hela sidan 'use client' och gjorde hela sitt arbete efter
 * hydrering. useAllTestStats fetchade nio session-endpoints, ett per kognitivt
 * test. Varje ProvCard fetchade sin egen, tre till. usePersonalityTestStats en
 * till. Och varje sådan route gjorde ett auth.getUser() innan den ens fick
 * fråga efter raderna. Tretton anrop, tjugosex rundturer, allt seriellt efter
 * att JS laddat. Mätningen landade på 28 rundturer och 5424 ms LCP.
 *
 * Nu läses sessionen här och all statistik hämtas i en parallell omgång med
 * två frågor (de tolv kognitiva anropen läser samma tabell och skiljer sig
 * bara på test_type). Första HTML innehåller korten färdiga.
 *
 * Premiumgraden läses bara för att avgöra om gratisraden ska visas och vilka
 * kort som markeras låsta. Kvoter och betalväggar ligger kvar där de låg: i
 * quotaService och serverside bakom att starta ett test.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getTesterHubData, emptyHubData, type TesterHubData } from '../getHubData';
import TesterHubClient from '../TesterHubClient';
import { getUserScope } from '@/lib/supabase/premiumAccess';
import { scopeHasFeature, type Scope } from '@/lib/access/features';
import { harPaket } from '@/lib/plans/harPaket';
import type { PlanKey } from '@/lib/plans/plans';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';
import { hjalpDoldUrProfil } from '@/lib/traning/hjalp';
import type { TesterTab } from '../components/TesterTabs';
import { testSkrivKlient } from '@/lib/tests/skrivKlient';
import { dagSthlm } from '@/lib/traning/datum';
import { hamtaTraningsstatus } from '@/lib/traning/motor.server';
import { kurvaUrStatus, type DinUtvecklingData } from '@/components/traning/utveckling';
import { hamtaMotordata, hamtaVarDuStar } from '@/components/traning/utveckling/data.server';

type Utvecklingsdelar = Pick<DinUtvecklingData, 'kurva' | 'varDuStar' | 'familjer' | 'tempo'>;

/**
 * Din utvecklings egna läsningar: motorns status (kurvan), Var du står och
 * motorns familjer och tempo. Fördelningen i Var du står läser många rader,
 * så sidan väntar inte på den här delen: löftet skickas till klienten och
 * fliken strömmas in (React use() bakom Suspense) medan fliken Tester ritas
 * direkt. Läsningarna startar först när hubbens data är läst, så att de inte
 * tävlar med den om databasen före första HTML (mätt 2026-10-11). Varje del
 * faller för sig; ett fel ger ett tomt kort, aldrig en trasig flik.
 */
async function lasUtvecklingsdelar(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
  sedd_at: string | null
): Promise<Utvecklingsdelar> {
  const admin = testSkrivKlient();
  const idag = dagSthlm();
  const [status, varDuStar, motor] = await Promise.all([
    hamtaTraningsstatus({ supabase: supabase as never, admin, userId, idag, sedd_at })
      .catch((e) => {
        console.error('Din utveckling: motorns status', e);
        return null;
      }),
    hamtaVarDuStar(admin, userId).catch((e) => {
      console.error('Din utveckling: Var du står', e);
      return [];
    }),
    hamtaMotordata(admin, userId).catch((e) => {
      console.error('Din utveckling: motordata', e);
      return { familjer: null, tempo: null };
    }),
  ]);
  return { kurva: kurvaUrStatus(status), varDuStar, ...motor };
}

function lasTrack(v: unknown): Scope | null {
  return v === 'cv' || v === 'tester' || v === 'allt' ? v : null;
}

export default async function AllaTesterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const startflik: TesterTab = sp.flik === 'utveckling' ? 'utveckling' : 'tester';
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const user = await hamtaVerifieradAnvandare();

  if (!user) {
    redirect('/login');
  }

  let data: TesterHubData;
  let track: Scope | null = null;
  let planKey: PlanKey | null = null;
  // traning_sedd_at behövs bara av motorns status i Din utveckling.
  let seddAt: string | null = null;
  let hjalpDold: boolean | null = null;

  try {
    // Scopet påverkar bara presentationen, inte vilka rader vi läser, så det
    // hämtas i samma omgång som statistiken i stället för före. Historiken
    // trimmas dock i hämtningen, alltså läses scopet först och skickas in.
    //
    // Efter paketomgången är frågan inte längre "är hon premium" utan vilket
    // spår hon köpt: en kund med CV-paketet har inte testhistoriken, och en
    // kund med Träningspaketet har den (docs/plan-paket-och-onboarding.md, avsnitt 4
    // och 5).
    //
    // hjalp_dold läses för sig: kolumnen kommer med migreringen
    // 20261011160000_hjalp_dold.sql, och saknas den ska bara hjälpvalet falla
    // tillbaka på localStorage, inte hela profilraden.
    const [scope, profileRes, hjalpRes] = await Promise.all([
      getUserScope(supabase, user.id),
      supabase
        .from('profiles')
        .select('onboarding_track, premium_until, price_id, subscription_status, traning_sedd_at')
        .eq('id', user.id)
        .maybeSingle(),
      Promise.resolve(
        (supabase as any).from('profiles').select('hjalp_dold').eq('id', user.id).maybeSingle()
      ).catch((e: unknown) => ({ data: null, error: e })) as Promise<{ data: unknown; error: unknown }>,
    ]);
    hjalpDold = hjalpRes.error ? null : hjalpDoldUrProfil(hjalpRes.data);
    const profil = (profileRes.data ?? null) as {
      onboarding_track?: string | null;
      premium_until?: string | null;
      price_id?: string | null;
      subscription_status?: string | null;
      traning_sedd_at?: string | null;
    } | null;
    seddAt = profil?.traning_sedd_at ?? null;
    track = lasTrack(profil?.onboarding_track);
    planKey = harPaket(scope, profil?.premium_until ? new Date(profil.premium_until) : null, new Date(), {
      priceId: profil?.price_id,
      status: profil?.subscription_status,
    });
    const hasHistory = scopeHasFeature(scope, 'test_history');

    data = await getTesterHubData(supabase, user.id, scope !== null, hasHistory, scope);
  } catch (error) {
    // Går läsningen fel ska hubben ändå gå att öppna och starta test ifrån.
    // Korten visar då noll försök, precis som för en ny användare.
    console.error('Testhubben: kunde inte hämta statistiken', error);
    data = emptyHubData(false, false);
  }
  // Din utveckling: startar nu, sidan väntar inte på den.
  const utveckling: Promise<DinUtvecklingData> = lasUtvecklingsdelar(supabase, user.id, seddAt).then((d) => ({
    ...d,
    idag: dagSthlm(),
    perTest: data.perTest,
    hasHistory: data.hasHistory,
  }));

  const gjortNagot =
    data.aggregate.hasAnyData || data.personality.grund.hasProfile || data.personality.avancerad.hasProfile;
  // Hjälpen och "Så går det till" (skiss Provbladet, avsnitt 1 och 4) är
  // öppna så länge inget test är gjort. traning_sedd_at sätts bara av hemvyn
  // efter mätningen och mäter inte det vi vill veta (testansvarig
  // 2026-10-11, punkt 5).
  const forsta = !gjortNagot;

  return (
    <TesterHubClient
      data={data}
      track={track}
      planKey={planKey}
      hjalp={{ dold: hjalpDold, forsta }}
      startflik={startflik}
      utveckling={utveckling}
    />
  );
}
