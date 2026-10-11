'use client';

/**
 * Prenumeration (spec-rummen våg 5, copy-premium avsnitt 3, art-director
 * 24.2 fråga 3).
 *
 * Bara Jobbcoach Premium, 149 kr i månaden, säljs. Rubriken är
 * "Prenumeration" och väggens rad är statusen ("Du är på gratisnivån",
 * "Träningspaketet, 79 kr i veckan, förnyas 17 oktober", "Jobbcoach Premium,
 * 149 kr i månaden. Nästa dragning 11 november."). Golvregeln gäller som i
 * alla rum. Tre lägen:
 *
 *   gratis   köpet är sidans primära handling: Premium-kortet är LyftKort
 *            först på golvet, köpknappen bär köpet till köpsteget där
 *            ångerrättssamtycket kryssas. Blockeringslistan och gratisnivån
 *            står under.
 *   spår     en befintlig kund med CV-paketet eller Träningspaketet. Samma
 *            lyfta kort, men knappen byter pris på hennes prenumeration via
 *            create-upgrade-session (all_month, proration, månaden från i
 *            dag). Hit skickar betalväggen en spårkund (spec-rummen 17.5).
 *   Premium  inget kort och ingen platta. Hantera-raderna först (Byt
 *            betalkort, Kvitton, Säg upp eller Ångra uppsägningen), sedan
 *            "Allt i Premium" som rader: vad hon har, inte vad hon kan köpa.
 *            Admin- och tidsbegränsad Premium: bara meningen om att den inte
 *            hanteras i ett abonnemang.
 *
 * Allt som avgör läget kommer som props från servern. Klienten sköter
 * felbannern, köp- och bytesanropen och uppsägningsenkäten.
 */

import { PAKETRADER } from '@/components/paywall/paywall-copy';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Slash, X } from '@/components/illustrations/RumIkoner';

import RumHuvud from '@/components/rum/RumHuvud';
import { RUBRIK } from '@/lib/rum/copy';
import Golv from '@/components/rum/Golv';
import SektRubrik from '@/components/rum/SektRubrik';
import Rader, { Rad } from '@/components/rum/Rader';
import PaketKort, { type PaketKortProps } from '@/components/pricing/PaketKort';
import { capture } from '@/lib/analytics/events';
import { PLAN_BY_KEY, SALD_PLAN, kopKnapp, type PlanKey } from '@/lib/plans/plans';
import type { Scope } from '@/lib/access/features';
import {
  FEATURE_ETIKETT,
  KONTO,
  PAKET_KORT,
  gangerText,
  statusRadText,
  uppsagdStatusText,
} from '@/components/pricing/paket-copy';
import { FREE_HIGHLIGHTS } from '@/app/(public)/priser/components/priser-data';
import PaketBytesRad from '@/components/paywall/PaketBytesRad';
import { bytPaket, type BytUtfall } from '@/lib/stripe/bytPaketKlient';
import CancelFlowModal from './components/CancelFlowModal';
import type { Blockeringar } from './blockeringar';
import { kopstegHref } from '@/lib/onboarding/steps';

// En API-rutt som svarar med en redirect till Stripe: vanlig <a>, inte
// next/link, som annars hämtar RSC från rutten, loggar fel och skapar en
// extra portalsession innan den faller tillbaka på vanlig navigering.
const PORTAL = '/api/stripe/create-portal-session';

const RAD =
  'flex min-h-14 items-center justify-between gap-3 px-4 py-3 text-[15px] font-semibold text-ink-1 hover:bg-papper-2';
const LISTA = 'divide-y divide-kant overflow-hidden rounded-2xl border border-kant bg-papper';

export interface PrenumerationClientProps {
  tillstand: 'free' | 'track' | 'all';
  scope: Scope | null;
  track: Scope | null;
  paket: PlanKey | null;
  premiumUntil: string | null;
  /** Uppsagt i Stripe: gäller perioden ut, förnyas inte. */
  uppsagd?: boolean;
  premiumSource: string | null;
  harStripePrenumeration: boolean;
  blockeringar: Blockeringar;
  /** Det som föreslås: alltid det som säljs. */
  foreslagetPaket?: PlanKey;
}

export default function PrenumerationClient({
  tillstand,
  scope,
  track,
  paket,
  premiumUntil: premiumUntilIso,
  uppsagd = false,
  premiumSource,
  harStripePrenumeration,
  blockeringar,
  foreslagetPaket = SALD_PLAN,
}: PrenumerationClientProps) {
  const [fel, setFel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uppsagning, setUppsagning] = useState(false);
  const [bytUtfall, setBytUtfall] = useState<BytUtfall | null>(null);
  // Svarsraden står under kortet, nära knappen. Den rullas fram så att
  // svaret syns där kunden tittar.
  const bytRadRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (bytUtfall && bytUtfall.typ !== 'kassa') {
      bytRadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [bytUtfall]);
  const router = useRouter();
  const matt = useRef(false);

  const premiumUntil = premiumUntilIso ? new Date(premiumUntilIso) : null;

  // Högst tre rader, mest frekvent först.
  const rader = blockeringar.rader.slice(0, 3);

  useEffect(() => {
    if (matt.current) return;
    matt.current = true;

    capture('pricing_viewed', {
      trigger: 'nav',
      surface: 'account',
      logged_in: true,
      scope,
      track,
      state: tillstand,
    });

    if (rader.length > 0) {
      capture('upgrade_shown', {
        from_scope: scope,
        to_scope: 'allt',
        surface: 'account_blocked_list',
      });
    }
    if (tillstand === 'free') {
      capture('upgrade_shown', {
        from_scope: null,
        to_scope: PLAN_BY_KEY[foreslagetPaket].scope,
        surface: 'account_suggestion',
      });
    }
  }, [tillstand, scope, track, rader.length, foreslagetPaket]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const error = url.searchParams.get('error');
    if (error) {
      setFel(decodeURIComponent(error));
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.pathname);
    }
  }, []);

  const kop = useCallback(() => {
    capture('paywall_cta_clicked', {
      variant: 'onboarding_paket',
      surface: 'account',
      plan: SALD_PLAN,
      cta: 'primary',
    });

    // Ångerrättssamtycket kryssas på köpsteget, som bär både kryssrutan och
    // knappen. Kontosidan öppnar därför inte kassan själv.
    setBusy(true);
    window.location.href = kopstegHref(SALD_PLAN, 'prenumeration');
  }, []);

  /**
   * Bytet för en kund med CV-paketet eller Träningspaketet, till Premium per
   * månad. Priset byts på prenumerationen, den oanvända veckotiden dras av
   * och månaden räknas från i dag (KONTO.bytPrisrad). Utfallet står som en
   * rad under kortet.
   */
  const byt = useCallback(async () => {
    capture('paywall_cta_clicked', {
      variant: 'fel-spar',
      surface: 'account',
      plan: SALD_PLAN,
      cta: 'primary',
    });
    setBusy(true);
    setFel(null);
    setBytUtfall(null);
    const utfall = await bytPaket(SALD_PLAN, '/dashboard/profil/prenumeration');
    if (utfall.typ === 'kassa') {
      window.location.href = utfall.url;
      return;
    }
    setBytUtfall(utfall);
    setBusy(false);
    if (utfall.typ === 'bytt') router.refresh();
  }, [router]);

  // Uppsägningen skjuter cancel_started och öppnar enkäten, som i sin tur
  // lämnar över till Stripe-portalen. Enkäten hindrar aldrig någon: "Avsluta
  // ändå" står synlig i varje steg.
  const sagUpp = useCallback(() => {
    if (paket) capture('cancel_started', { plan: paket, surface: 'account' });
    setUppsagning(true);
  }, [paket]);

  // Väggens rad: läget, i samma ord som kvittot.
  const statusText =
    tillstand === 'free'
      ? KONTO.statusGratis
      : paket
        ? uppsagd
          ? uppsagdStatusText(paket, premiumUntil)
          : statusRadText(paket, premiumUntil)
        : PAKETRADER.paketAktivt;

  // Gratis och spår: köpet är sidans primära handling och står som lyft kort.
  const kopLage = tillstand !== 'all';

  /** Kortets props på gratisnivån och för en spårkund. */
  function kort(): PaketKortProps {
    if (tillstand === 'free') {
      return { knapp: { text: kopKnapp(), onClick: kop, disabled: busy } };
    }
    // Spår (osålt paket): byte till Premium, eller köp om det inte finns
    // någon prenumeration att byta pris på. Efter ett lyckat byte står
    // svarsraden under kortet tills sidan hämtats om.
    return {
      titel: KONTO.bytRubrik,
      text: paket ? KONTO.bytText(paket) : undefined,
      prisrad: harStripePrenumeration ? KONTO.bytPrisrad : undefined,
      knapp:
        bytUtfall?.typ === 'bytt'
          ? null
          : {
              text: kopKnapp(),
              onClick: harStripePrenumeration ? () => void byt() : kop,
              disabled: busy,
            },
    };
  }

  const felBanner = fel ? (
    <div role="alert" className="rounded-2xl border border-fel-kant bg-fel-mjuk p-4">
      <div className="flex items-start gap-3">
        <p className="flex-1 text-sm text-fel">
          {fel}
          <span className="mt-1 block text-ink-2">{KONTO.felKontakt}</span>
        </p>
        <button
          type="button"
          onClick={() => setFel(null)}
          aria-label={KONTO.stangFel}
          className="-mr-2 -mt-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-2 hover:text-ink-1"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  ) : null;

  // Hanteringslistan. Säg upp är aldrig dold och aldrig destruktiv.
  const hantera =
    tillstand !== 'free' && harStripePrenumeration ? (
      <section aria-label={KONTO.hantera} className="flex flex-col gap-4">
        <SektRubrik>{KONTO.hantera}</SektRubrik>
        <ul className={LISTA}>
          <li>
            <a href={PORTAL} className={RAD}>
              {KONTO.bytKort}
              <ChevronRight className="h-5 w-5 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
            </a>
          </li>
          <li>
            <a href={PORTAL} className={RAD}>
              {KONTO.kvitton}
              <ChevronRight className="h-5 w-5 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
            </a>
          </li>
          <li>
            {uppsagd ? (
              // Stripes kundportal visar "Förnya abonnemang" för ett
              // uppsagt paket, och det sätter cancel_at_period_end = false.
              // Webhooken speglar det tillbaka till profilen.
              <a href={PORTAL} className={RAD}>
                {KONTO.angraUppsagning}
                <ChevronRight className="h-5 w-5 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
              </a>
            ) : (
              <button type="button" onClick={sagUpp} className={`${RAD} w-full text-left`}>
                {KONTO.sagUpp}
                <ChevronRight className="h-5 w-5 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
              </button>
            )}
          </li>
        </ul>
        {uppsagd ? <p className="text-sm leading-[22px] text-ink-2">{KONTO.uppsagdNot}</p> : null}
      </section>
    ) : null;

  return (
    <>
      <RumHuvud title={RUBRIK.prenumeration} description={statusText} tat={!kopLage} />
      <Golv lyft={kopLage} className="pb-6">
        {kopLage ? (
          <>
            <section aria-label={KONTO.paketRubrik} className="max-w-[640px]">
              <PaketKort lyft {...kort()} />
            </section>

            {felBanner}

            <div ref={bytRadRef} className="scroll-mt-24 empty:hidden">
              <PaketBytesRad utfall={bytUtfall} />
            </div>

            {rader.length > 0 ? (
              <section aria-label={KONTO.stoppRubrik} className="flex flex-col gap-4">
                <SektRubrik>{KONTO.stoppRubrik}</SektRubrik>
                <ul className={LISTA}>
                  {rader.map((rad) => (
                    <li key={rad.feature} className="flex min-h-14 items-center justify-between gap-3 px-4 py-3">
                      <span className="flex min-w-0 items-center gap-3">
                        <Slash className="h-5 w-5 shrink-0 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
                        <span className="truncate text-sm text-ink-1">{FEATURE_ETIKETT[rad.feature]}</span>
                      </span>
                      <span className="shrink-0 text-meta tabular-nums text-ink-3">{gangerText(rad.antal)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {hantera}

            {tillstand === 'free' ? (
              <section aria-label={KONTO.gratisRubrik} className="flex flex-col gap-4">
                <SektRubrik>{KONTO.gratisRubrik}</SektRubrik>
                <ul className={LISTA}>
                  {FREE_HIGHLIGHTS.map((rad) => (
                    <li key={rad} className="px-4 py-3 text-sm leading-[21px] text-ink-2">
                      {rad}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        ) : harStripePrenumeration ? (
          <>
            {felBanner}
            {hantera}
            <section aria-label={PAKET_KORT.allt.listEtikett} className="flex flex-col gap-4">
              <SektRubrik>{PAKET_KORT.allt.listEtikett}</SektRubrik>
              <Rader>
                {PAKET_KORT.allt.ingar.map((rad) => (
                  <Rad key={rad} titel={rad} />
                ))}
              </Rader>
            </section>
          </>
        ) : (
          <>
            {felBanner}
            {/* Admin- och tidsbegränsad Premium: ingen prenumeration att hantera. */}
            <p className="text-sm leading-[22px] text-ink-2">
              {premiumSource === 'admin' ? KONTO.adminTilldelad : KONTO.tidsbegransad}
            </p>
          </>
        )}

        <CancelFlowModal
          open={uppsagning}
          onClose={() => setUppsagning(false)}
          paket={paket}
        />
      </Golv>
    </>
  );
}
