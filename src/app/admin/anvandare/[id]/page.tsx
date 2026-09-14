/**
 * En anvandare (docs/plan-admin.md avsnitt 4.4).
 *
 * Tidslinjen ar sidans varde: det ar dar fragan "vad gor de?" far ett konkret
 * svar. Sex Supabase-kallor plus personens handelser i PostHog slas ihop till
 * en fallande lista, sa att man ser ordningen: mejlet gick ut, hon loggade in,
 * hon skrev ett brev, hon slog i kvoten, hon tittade pa priser.
 *
 * Runt tidslinjen star det som forklarar raderna: profilkortet,
 * prenumerationsstatus ur Stripe-speglingen i profiles, kvotlaget, och de fyra
 * rakningarna ur vyn.
 *
 * Aldrig brevtext, aldrig CV-text. Tidslinjen sager att ett brev skrevs och
 * till vilket foretag. Sjalva brevet ar anvandarens.
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/shell/PageHeader';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import SectionCard from '@/components/admin/SectionCard';
import MetricCard from '@/components/admin/MetricCard';
import EmptyState from '@/components/shell/EmptyState';
import FlowError from '@/components/shell/FlowError';
import { getSuperAdminUserId } from '@/lib/admin/requireSuperAdmin';
import { lasKalla } from '../data';
import { exaktTid, kortDatum, niva, sedan, tal, visningsnamn } from '../format';
import Atgarder from './Atgarder';
import {
  hamtaProfil,
  hamtaTidslinje,
  TIDSLINJE_TAK,
  type Handelse,
  type HandelseKalla,
} from './data';

export const dynamic = 'force-dynamic';

const LANK =
  'text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark hover:decoration-ink-1';

/** Kallans etikett i tidslinjen. Text, inte farg: kallan ar ingen status. */
const KALLA_TEXT: Record<HandelseKalla, string> = {
  aktivitet: 'Aktivitet',
  brev: 'Brev',
  analys: 'Analys',
  ansokan: 'Ansökan',
  premium: 'Premium',
  mejl: 'Mejl',
  posthog: 'PostHog',
};

/**
 * En rad i profilkortet. Etikett till vanster, varde till hoger, som en
 * definitionslista sa att skarmlasare lasar paret ihop.
 */
function Uppgift({
  etikett,
  children,
}: {
  etikett: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3">
      <dt className="shrink-0 text-sm text-ink-3">{etikett}</dt>
      <dd className="min-w-0 truncate text-right text-sm text-ink-1">
        {children}
      </dd>
    </div>
  );
}

function TidslinjeRad({ handelse, nu }: { handelse: Handelse; nu: number }) {
  return (
    <li className="flex items-baseline gap-4 px-4 py-3">
      <span
        className="w-24 shrink-0 text-meta text-ink-3"
        title={exaktTid(handelse.tid)}
      >
        {sedan(handelse.tid, nu)}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm text-ink-1">{handelse.rubrik}</span>
        {handelse.detalj ? (
          <span className="mt-0.5 block truncate text-meta text-ink-3">
            {handelse.detalj}
          </span>
        ) : null}
      </span>

      <span className="w-20 shrink-0 text-right text-meta text-ink-3">
        {KALLA_TEXT[handelse.kalla]}
      </span>
    </li>
  );
}

/**
 * Tidslinjens plats medan den hamtas.
 *
 * Hojden ar satt, sa ytan ar reserverad innan innehallet kommer in och CLS
 * blir noll. Skelettblocken star stilla i bg-insunken, bara traden ror sig.
 */
function TidslinjeSkelett() {
  return (
    <div className="p-4">
      <LoadingSkeleton variant="row" count={6} label="Tidslinjen hämtas" />
    </div>
  );
}

/**
 * Sjalva tidslinjen, hamtad separat.
 *
 * Den ligger i sin egen Suspense-grans for att PostHog-fragan annars hade
 * legat i kritiska vagen och kostat runt en sekund pa forsta laddningen per
 * konto. Profilen, prenumerationen och kvoten star kvar under tiden, vilket
 * ar det adminen tittar pa forst anda.
 */
async function Tidslinjen({ userId, nu }: { userId: string; nu: number }) {
  let data: Awaited<ReturnType<typeof hamtaTidslinje>>;
  try {
    data = await hamtaTidslinje(userId);
  } catch (fel) {
    console.error('[admin/anvandare/[id]] tidslinjen kunde inte lasas:', fel);
    return (
      <div className="p-4">
        <FlowError message="Tidslinjen kunde inte läsas. Ladda om sidan." />
      </div>
    );
  }

  const { handelser, antalPerKalla, posthogFel } = data;
  const beskuren = handelser.length >= TIDSLINJE_TAK;

  return (
    <>
      {posthogFel ? (
        <p className="border-b border-kant px-4 py-3 text-meta text-ink-3">
          PostHog svarade inte, så sidvisningarna saknas i listan. Allt ur
          Supabase står kvar.
        </p>
      ) : null}

      {handelser.length === 0 ? (
        <div className="p-4">
          <EmptyState
            bare
            title="Ingenting har hänt än"
            description="Kontot finns, men har inte lämnat spår i någon av källorna."
          />
        </div>
      ) : (
        <ol className="divide-y divide-kant">
          {handelser.map((h) => (
            <TidslinjeRad key={h.id} handelse={h} nu={nu} />
          ))}
        </ol>
      )}

      <p className="border-t border-kant px-4 py-3 text-meta text-ink-3">
        {tal(handelser.length)} händelser. Källor: aktivitet{' '}
        {tal(antalPerKalla.aktivitet)}, brev {tal(antalPerKalla.brev)}, analys{' '}
        {tal(antalPerKalla.analys)}, ansökan {tal(antalPerKalla.ansokan)},
        premium {tal(antalPerKalla.premium)}, mejl {tal(antalPerKalla.mejl)},
        PostHog {tal(antalPerKalla.posthog)}.
        {beskuren ? ` Visar de ${TIDSLINJE_TAK} senaste.` : ''}
      </p>
    </>
  );
}

export default async function AdminAnvandarePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Layouten har redan slappt in bara super_admin. Id:t slas upp igen har, men
  // parallellt med profilen och aldrig fore: en sekventiell auth-rundtur lade
  // ett halvt sekund pa forsta byten utan att gora kontrollen sakrare.
  // Uppslaget anvands bara for att stanga av atgarderna pa adminens eget
  // konto; rutterna vagrar ett sjalvanrop oavsett vad sidan visar.
  let detalj: Awaited<ReturnType<typeof hamtaProfil>>;
  let egetId: string | null;
  try {
    [detalj, egetId] = await Promise.all([
      hamtaProfil(id),
      getSuperAdminUserId(),
    ]);
  } catch (fel) {
    console.error('[admin/anvandare/[id]] sidan kunde inte renderas:', fel);
    return (
      <div className="space-y-4 sm:space-y-6">
        <PageHeader title="Användare" />
        <FlowError
          title="Användaren kunde inte läsas"
          message="En av källorna svarade inte. Ladda om sidan, eller gå tillbaka till listan."
        />
      </div>
    );
  }

  if (!detalj) notFound();

  const { profil, kvot } = detalj;
  const nu = Date.now();

  const namn = visningsnamn(profil.full_name, profil.email);
  const nivan = niva(profil);
  const kalla = lasKalla(profil.acquisition_source);

  // Prenumerationsstatus ur Stripe-speglingen i profiles. Adminen pratar aldrig
  // med Stripe i kritiska vagen: speglingen ar det som ar snabbt nog.
  const prenStatus = profil.subscription_status ?? 'ingen prenumeration';
  const harStripe = Boolean(profil.stripe_customer_id);

  const aktiveringsNot =
    'Känt mätfel: milstolpen sätts inte vid uppladdning, så tomt betyder inte att det inte hänt.';

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={namn}
        description={`${profil.email ?? 'utan e-post'} · ${nivan} · konto sedan ${kortDatum(profil.created_at)}`}
      />

      <p>
        <Link href="/admin/anvandare" className={LANK}>
          Till listan
        </Link>
      </p>

      {/* --------------------------------------------------- Rakningarna --- */}
      <SectionCard rubrik="Vad kontot har gjort">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard etikett="Brev" varde={tal(profil.letter_count)} />
          <MetricCard etikett="CV" varde={tal(profil.cv_count)} />
          <MetricCard
            etikett="Ansökningar"
            varde={tal(profil.application_count)}
          />
          <MetricCard
            etikett="CV-analyser"
            varde={tal(profil.analysis_count)}
          />
        </div>
      </SectionCard>

      {/* ------------------------------------------------------ Profilen --- */}
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <SectionCard rubrik="Profil" naken>
          <dl className="divide-y divide-kant">
            <Uppgift etikett="E-post">{profil.email ?? '–'}</Uppgift>
            <Uppgift etikett="Namn">{profil.full_name ?? '–'}</Uppgift>
            <Uppgift etikett="Nivå">{nivan}</Uppgift>
            <Uppgift etikett="Konto skapat">
              <span className="tabular-nums">
                {kortDatum(profil.created_at)}
              </span>
            </Uppgift>
            <Uppgift etikett="Senast aktiv">
              <span title={profil.last_activity_at ?? undefined}>
                {sedan(profil.last_activity_at, nu)}
              </span>
            </Uppgift>
            <Uppgift etikett="Anskaffningskälla">{kalla ?? '–'}</Uppgift>
          </dl>

          {!kalla ? (
            <p className="px-4 pb-3 text-meta text-ink-3">
              Känt mätfel: anskaffningskälla sätts inte vid registrering.
            </p>
          ) : null}
        </SectionCard>

        <SectionCard rubrik="Prenumeration" naken>
          <dl className="divide-y divide-kant">
            <Uppgift etikett="Status">{prenStatus}</Uppgift>
            <Uppgift etikett="Nivå i profilen">
              {profil.subscription_tier ?? '–'}
            </Uppgift>
            <Uppgift etikett="Premiumkälla">
              {profil.premium_source ?? '–'}
            </Uppgift>
            <Uppgift etikett="Premium till">
              <span className="tabular-nums">
                {profil.premium_until ? exaktTid(profil.premium_until) : '–'}
              </span>
            </Uppgift>
            <Uppgift etikett="Perioden slutar">
              <span className="tabular-nums">
                {profil.current_period_end
                  ? exaktTid(profil.current_period_end)
                  : '–'}
              </span>
            </Uppgift>
            <Uppgift etikett="Stripe-kund">
              {harStripe ? (
                <a
                  href={`https://dashboard.stripe.com/customers/${profil.stripe_customer_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
                >
                  {profil.stripe_customer_id}
                </a>
              ) : (
                '–'
              )}
            </Uppgift>
          </dl>
        </SectionCard>
      </div>

      {/* --------------------------------------------- Aktivering och kvot --- */}
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <SectionCard rubrik="Aktiveringsmilstolpar" naken>
          <dl className="divide-y divide-kant">
            <Uppgift etikett="Första CV">
              <span className="tabular-nums">
                {profil.first_cv_uploaded_at
                  ? kortDatum(profil.first_cv_uploaded_at)
                  : '–'}
              </span>
            </Uppgift>
            <Uppgift etikett="Första brev">
              <span className="tabular-nums">
                {profil.first_letter_created_at
                  ? kortDatum(profil.first_letter_created_at)
                  : '–'}
              </span>
            </Uppgift>
            <Uppgift etikett="Första analys">
              <span className="tabular-nums">
                {profil.first_cv_analyzed_at
                  ? kortDatum(profil.first_cv_analyzed_at)
                  : '–'}
              </span>
            </Uppgift>
          </dl>
          <p className="px-4 pb-3 text-meta text-ink-3">{aktiveringsNot}</p>
        </SectionCard>

        <SectionCard rubrik="Kvotläge i dag" naken>
          {kvot ? (
            <>
              <dl className="divide-y divide-kant">
                {kvot.items.map((post) => (
                  <Uppgift key={post.key} etikett={post.label}>
                    <span className="tabular-nums">
                      {post.limit === null
                        ? `${tal(post.used)} av obegränsat`
                        : `${tal(post.used)} av ${tal(post.limit)}`}
                    </span>
                  </Uppgift>
                ))}
              </dl>
              <p className="px-4 pb-3 text-meta text-ink-3">
                Nollställs {exaktTid(kvot.nextResetAt)} svensk tid.
              </p>
            </>
          ) : (
            <p className="px-4 py-3 text-sm text-ink-2">
              Kvoten kunde inte läsas.
            </p>
          )}
        </SectionCard>
      </div>

      {/* ---------------------------------------------------- Tidslinjen --- */}
      <SectionCard rubrik="Tidslinje" naken>
        <Suspense fallback={<TidslinjeSkelett />}>
          <Tidslinjen userId={profil.id} nu={nu} />
        </Suspense>
      </SectionCard>

      {/* ----------------------------------------------------- Atgarder --- */}
      <SectionCard rubrik="Adminåtgärder">
        <Atgarder
          userId={profil.id}
          epost={profil.email ?? namn}
          egetId={egetId ?? ''}
        />
      </SectionCard>
    </div>
  );
}
