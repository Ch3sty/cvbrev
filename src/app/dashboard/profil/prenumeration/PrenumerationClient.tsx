'use client';

/**
 * Prenumeration, tre tillstånd (docs/plan-paket-och-onboarding.md, Fas 2D).
 *
 * Den publika sidan säljer paket, den här sidan säljer nästa steg från där
 * användaren står. Därför börjar varje tillstånd med hennes läge, och först
 * därefter kommer korten.
 *
 * Orange-räkning: ett i tillstånd gratis (förslagspanelens platta), ett i
 * tillstånd spår (uppgraderingspanelens platta), noll i tillstånd Allt. En
 * nöjd betalande sida ska vara lugn.
 *
 * Allt som avgör läget kommer som props från servern. Klienten sköter
 * felbannern, köpanropen och längdvalet.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Slash, X } from 'lucide-react';

import PageHeader from '@/components/shell/PageHeader';
import StatusRow from '@/components/shell/StatusRow';
import MarginPlate from '@/components/shell/MarginPlate';
import Segment from '@/components/shell/Segment';
import PaketKort from '@/components/pricing/PaketKort';
import { IlluPlattaPremium } from '@/components/illustrations/TradenScener';
import { capture } from '@/lib/analytics/events';
import {
  PLAN_BY_KEY,
  type PlanKey,
  type PlanLength,
} from '@/lib/plans/plans';
import type { Scope } from '@/lib/access/features';
import {
  ALLT_LANGDER,
  D_PRENUMERATION,
  FEATURE_ETIKETT,
  PAKET_PUNKTER,
  besparing,
  bytLangdKnapp,
  forslagKnapp,
  forslagRubrik,
  forslagSkal,
  gangerText,
  langdPrisRad,
  mellanskillnad,
  statusRadText,
  uppgraderingSkal,
} from '@/components/pricing/paket-copy';
import { FREE_HIGHLIGHTS } from '@/app/(public)/priser/components/priser-data';
import CancelFlowModal from './components/CancelFlowModal';
import type { Blockeringar } from './blockeringar';

const PORTAL = '/api/stripe/create-portal-session';

const PRIMAR =
  'inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover disabled:opacity-40';

const TEXTLANK =
  'inline-flex h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1';

export interface PrenumerationClientProps {
  tillstand: 'free' | 'track' | 'all';
  scope: Scope | null;
  track: Scope | null;
  paket: PlanKey | null;
  premiumUntil: string | null;
  premiumSource: string | null;
  harStripePrenumeration: boolean;
  blockeringar: Blockeringar;
  foreslagetPaket: PlanKey;
}

export default function PrenumerationClient({
  tillstand,
  scope,
  track,
  paket,
  premiumUntil: premiumUntilIso,
  premiumSource,
  harStripePrenumeration,
  blockeringar,
  foreslagetPaket,
}: PrenumerationClientProps) {
  const [fel, setFel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [allaPaket, setAllaPaket] = useState(false);
  const [uppsagning, setUppsagning] = useState(false);
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

  const kop = useCallback(async (plan: PlanKey) => {
    capture('paywall_cta_clicked', {
      variant: 'onboarding_paket',
      surface: 'account',
      plan,
      cta: 'primary',
    });

    setBusy(true);
    setFel(null);
    try {
      const res = await fetch('/api/stripe/create-plan-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, source: 'account' }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setFel(data.error ?? 'Det gick inte att öppna kassan. Försök igen.');
    } catch {
      setFel('Det gick inte att öppna kassan. Försök igen.');
    } finally {
      setBusy(false);
    }
  }, []);

  /** Uppgradering och längdbyte byter pris på den befintliga prenumerationen. */
  const byt = useCallback(async (planKey: PlanKey) => {
    setBusy(true);
    setFel(null);
    try {
      const res = await fetch('/api/stripe/create-upgrade-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey }),
      });
      const data = (await res.json()) as {
        upgraded?: boolean;
        url?: string;
        error?: string;
      };
      if (data.upgraded) {
        window.location.reload();
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setFel(data.error ?? 'Det gick inte att byta paket. Försök igen.');
    } catch {
      setFel('Det gick inte att byta paket. Försök igen.');
    } finally {
      setBusy(false);
    }
  }, []);

  // Uppsägningen skjuter cancel_started och öppnar enkäten, som i sin tur
  // lämnar över till Stripe-portalen. Enkäten hindrar aldrig någon: "Avsluta
  // ändå" står synlig i varje steg.
  const sagUpp = useCallback(() => {
    if (paket) capture('cancel_started', { plan: paket, surface: 'account' });
    setUppsagning(true);
  }, [paket]);

  const statusText =
    tillstand === 'free'
      ? D_PRENUMERATION.statusGratis
      : paket
        ? statusRadText(paket, premiumUntil)
        : 'Premium aktivt';

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:space-y-6 sm:p-6">
      <PageHeader title="Prenumeration" description={D_PRENUMERATION.ingress} />

      {fel ? (
        <div className="rounded-xl border border-fel-kant bg-fel-mjuk p-4">
          <div className="flex items-start gap-3">
            <p className="flex-1 text-sm text-fel">
              {fel}
              <span className="mt-1 block text-ink-2">
                Kontakta support@jobbcoach.ai om problemet kvarstår.
              </span>
            </p>
            <button
              type="button"
              onClick={() => setFel(null)}
              aria-label="Stäng meddelande"
              className="-mr-2 -mt-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-2 hover:text-ink-1"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      <StatusRow tone="neutral" showDot label="Ditt läge" wrap>
        {statusText}
      </StatusRow>

      {/* Vad hon har. Gratisnivån får sin egen panel längst ner i stället. */}
      {tillstand !== 'free' && paket ? (
        <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
          <h2 className="text-sm font-medium text-ink-3">
            {tillstand === 'all' ? D_PRENUMERATION.alltIngar : D_PRENUMERATION.ingarRubrik}
          </h2>
          <ul className="mt-3 space-y-2">
            {PAKET_PUNKTER[paket].map((punkt) => (
              <li key={punkt} className="text-sm leading-[22px] text-ink-2">
                {punkt}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Blockeringslistan står före förslaget: inte "köp det här" utan
          "det här tog stopp, och det här löser det". */}
      {tillstand !== 'all' && rader.length > 0 ? (
        <section>
          <h2 className="text-sm font-medium text-ink-3">
            {D_PRENUMERATION.stoppRubrik}
          </h2>
          <ul className="mt-2 divide-y divide-kant rounded-xl border border-kant bg-panel">
            {rader.map((rad) => (
              <li
                key={rad.feature}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Slash
                    className="h-5 w-5 shrink-0 text-ink-3"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <span className="truncate text-sm text-ink-1">
                    {FEATURE_ETIKETT[rad.feature]}
                  </span>
                </span>
                <span className="shrink-0 text-meta tabular-nums text-ink-3">
                  {gangerText(rad.antal)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Tillstånd gratis: förslagspanelen. Vyns enda marginalplatta. */}
      {tillstand === 'free' ? (
        <>
          <section className="rounded-xl border border-kant-stark bg-panel p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <MarginPlate>
                <IlluPlattaPremium size={48} />
              </MarginPlate>
              <div className="min-w-0">
                <h2 className="text-kort text-ink-1">{forslagRubrik(foreslagetPaket)}</h2>
                <p className="mt-1 text-sm leading-[22px] text-ink-2">
                  {forslagSkal({
                    plan: foreslagetPaket,
                    antal: blockeringar.totalt,
                    badaSparen: blockeringar.badaSparen,
                    track,
                  })}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={() => kop(foreslagetPaket)}
              className={`${PRIMAR} mt-4`}
            >
              {forslagKnapp(foreslagetPaket)}
            </button>

            <div className="mt-1">
              <button
                type="button"
                onClick={() => setAllaPaket((open) => !open)}
                aria-expanded={allaPaket}
                className={TEXTLANK}
              >
                {D_PRENUMERATION.seAllaPaket}
              </button>
            </div>
          </section>

          {allaPaket ? (
            <section>
              <h2 className="text-sm font-medium text-ink-3">
                {D_PRENUMERATION.allaPaket}
              </h2>
              <div className="mt-2 grid gap-4 lg:grid-cols-3">
                <PaketKort plan="cv_week" busy={busy} onSelect={kop} />
                <PaketKort plan="test_week" busy={busy} onSelect={kop} />
                <PaketKort
                  plan="all_week"
                  lengths
                  busy={busy}
                  onSelect={kop}
                  onLengthChange={(plan) =>
                    capture('plan_length_changed', { plan, surface: 'account' })
                  }
                />
              </div>
            </section>
          ) : null}

          <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
            <h2 className="text-sm font-medium text-ink-3">
              {D_PRENUMERATION.gratisRubrik}
            </h2>
            <ul className="mt-3 space-y-2">
              {FREE_HIGHLIGHTS.map((rad) => (
                <li key={rad} className="text-sm leading-[22px] text-ink-2">
                  {rad}
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      {/* Tillstånd spår: uppgraderingspanelen, men bara när hon faktiskt
          stoppats utanför sitt spår. Att sälja Allt till en nöjd spårkund
          är att störa, och då står bara det hon har och hur hon hanterar det. */}
      {tillstand === 'track' && rader.length > 0 && paket ? (
        <section className="rounded-xl border border-kant-stark bg-panel p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <MarginPlate>
              <IlluPlattaPremium size={48} />
            </MarginPlate>
            <div className="min-w-0">
              <h2 className="text-kort text-ink-1">{D_PRENUMERATION.bytTillAllt}</h2>
              <p className="mt-1 text-sm leading-[22px] text-ink-2">
                {uppgraderingSkal(blockeringar.totalt)}
              </p>
            </div>
          </div>

          {/* Mellanskillnaden, inte hela priset: 99 kr för någon som redan
              betalar 79 läser som en dubbeldebitering. */}
          <p className="mt-4 flex items-baseline justify-between gap-3 text-meta text-ink-3">
            <span>Mellanskillnad</span>
            <span className="tabular-nums">+{mellanskillnad(paket)} kr</span>
          </p>
          <p className="text-meta text-ink-3">Påbörjad vecka räknas av</p>

          <button
            type="button"
            disabled={busy}
            onClick={() => byt('all_week')}
            className={`${PRIMAR} mt-4`}
          >
            {bytLangdKnapp('all_week')}
          </button>
        </section>
      ) : null}

      {/* Tillstånd Allt: längdvalet. Ingen platta, ingen accent. */}
      {tillstand === 'all' && paket && harStripePrenumeration ? (
        <LangdVal nuvarande={paket} busy={busy} onByt={byt} />
      ) : null}

      {/* Hanteringslistan. Säg upp är aldrig dold och aldrig destruktiv. */}
      {tillstand !== 'free' && harStripePrenumeration ? (
        <section>
          <h2 className="text-sm font-medium text-ink-3">{D_PRENUMERATION.hantera}</h2>
          <ul className="mt-2 divide-y divide-kant rounded-xl border border-kant bg-panel">
            <li>
              <Link href={PORTAL} className={RAD}>
                {D_PRENUMERATION.bytKort}
                <ChevronRight className="h-5 w-5 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link href={PORTAL} className={RAD}>
                {D_PRENUMERATION.kvitton}
                <ChevronRight className="h-5 w-5 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
              </Link>
            </li>
            <li>
              <button type="button" onClick={sagUpp} className={`${RAD} w-full text-left`}>
                {D_PRENUMERATION.sagUpp}
                <ChevronRight className="h-5 w-5 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
              </button>
            </li>
          </ul>
        </section>
      ) : null}

      {/* Admin- och tidsbegränsad premium: samma skelett, men det finns
          ingen prenumeration att hantera och inget att byta längd på. */}
      {tillstand === 'all' && !harStripePrenumeration ? (
        <p className="text-sm leading-[22px] text-ink-2">
          {premiumSource === 'admin'
            ? 'Din tillgång är tilldelad av oss och hanteras inte i ett abonnemang.'
            : 'Tillgången gäller en begränsad tid och förnyas inte av sig själv.'}
        </p>
      ) : null}

      <CancelFlowModal open={uppsagning} onClose={() => setUppsagning(false)} />
    </div>
  );
}

const RAD =
  'flex min-h-11 items-center justify-between gap-3 px-4 py-3 text-sm text-ink-1 hover:bg-insunken';

/**
 * Längdvalet på Allt.
 *
 * Dagläget är inaktivt för löpande kunder (dirigentens beslut efter
 * copyrunda 3). Ett byte nedåt till ett engångsköp vore en uppsägning plus
 * ett köp, inte ett längdbyte, och då är det ärligare att säga det rakt ut
 * än att förklara i finstilt.
 *
 * Primären är inaktiv tills en annan längd än den nuvarande är vald.
 */
function LangdVal({
  nuvarande,
  busy,
  onByt,
}: {
  nuvarande: PlanKey;
  busy: boolean;
  onByt: (plan: PlanKey) => void;
}) {
  const [langd, setLangd] = useState<PlanLength>(PLAN_BY_KEY[nuvarande].length);

  const vald = ALLT_LANGDER.find((l) => l.length === langd)?.plan ?? nuvarande;
  const oforandrad = vald === nuvarande;
  const spar = besparing(vald);

  return (
    <section>
      <h2 className="text-sm font-medium text-ink-3">{D_PRENUMERATION.bytLangd}</h2>

      <div className="mt-2 rounded-xl border border-kant bg-panel p-4 sm:p-5">
        <Segment
          label="Längd"
          value={langd}
          onChange={(ny) => {
            setLangd(ny);
            const plan = ALLT_LANGDER.find((l) => l.length === ny)?.plan;
            if (plan) capture('plan_length_changed', { plan, surface: 'account' });
          }}
          options={ALLT_LANGDER.map((l) => ({
            value: l.length,
            label: l.label,
            disabled: l.length === 'dag',
          }))}
        />

        <p className="mt-4 text-kort text-ink-1">{langdPrisRad(vald)}</p>
        {spar ? <p className="mt-1 text-meta text-ink-3">{spar}</p> : null}
        <p className="mt-1 text-meta text-ink-3">
          {langd === 'dag'
            ? D_PRENUMERATION.dagInaktiv
            : D_PRENUMERATION.byterVidFornyelse}
        </p>

        <button
          type="button"
          disabled={busy || oforandrad}
          onClick={() => onByt(vald)}
          className={`${PRIMAR} mt-4`}
        >
          {bytLangdKnapp(vald)}
        </button>
      </div>
    </section>
  );
}
