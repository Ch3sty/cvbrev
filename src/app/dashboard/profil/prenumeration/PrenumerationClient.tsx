'use client';

/**
 * Prenumeration, tre tillstånd (docs/design/spec-prissida-2026-09-22.html,
 * inloggade prissidan).
 *
 * Samma tre PaketKort som på den publika prissidan, men i användarens läge:
 *
 *   gratis  alla tre med knappar, knappen bär paketet till köpsteget
 *   spår    det egna kortet visar "Du har det här paketet", det andra spåret
 *           byter vid nästa förnyelse, Allt visar mellanskillnaden
 *   Allt    spåren visar "Ingår i Hela paketet", Allt-kortet bär längdbytet där
 *           dagläget är inaktivt för en löpande kund, och Säg upp står i
 *           hanteringslistan
 *
 * Orange-räkning: noll. Allt-kortets etikett Rekommenderas står i den
 * ljusa accenttonen på ink-ytan, och räknas som kortets enda accent.
 *
 * Allt som avgör läget kommer som props från servern. Klienten sköter
 * felbannern, köpanropen och längdvalet.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Slash, X } from 'lucide-react';

import PageHeader from '@/components/shell/PageHeader';
import StatusRow from '@/components/shell/StatusRow';
import PaketKort, { type PaketKortProps } from '@/components/pricing/PaketKort';
import { capture } from '@/lib/analytics/events';
import { PLAN_BY_KEY, type PlanKey, type PlanLength } from '@/lib/plans/plans';
import type { Scope } from '@/lib/access/features';
import {
  FEATURE_ETIKETT,
  KONTO,
  PAKET_IDS,
  PAKET_PLAN,
  besparing,
  borjaKnapp,
  gangerText,
  mellanskillnad,
  paketForPlan,
  planForLangd,
  statusRadText,
  type PaketId,
} from '@/components/pricing/paket-copy';
import { FREE_HIGHLIGHTS } from '@/app/(public)/priser/components/priser-data';
import CancelFlowModal from './components/CancelFlowModal';
import type { Blockeringar } from './blockeringar';

const PORTAL = '/api/stripe/create-portal-session';

const RAD =
  'flex min-h-11 items-center justify-between gap-3 px-4 py-3 text-sm text-ink-1 hover:bg-insunken';

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
  const [uppsagning, setUppsagning] = useState(false);
  // Allt-kortets längd. För en Allt-kund börjar den på det hon har.
  const [langd, setLangd] = useState<PlanLength>(
    paket && PLAN_BY_KEY[paket].scope === 'allt' ? PLAN_BY_KEY[paket].length : 'vecka'
  );
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

  const kop = useCallback((plan: PlanKey) => {
    capture('paywall_cta_clicked', {
      variant: 'onboarding_paket',
      surface: 'account',
      plan,
      cta: 'primary',
    });

    // Ångerrättssamtycket kryssas på köpsteget, som bär både kryssrutan och
    // knappen. Kontosidan öppnar därför inte kassan själv.
    setBusy(true);
    window.location.href = `/dashboard/valj-spar?paket=${plan}`;
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
      ? KONTO.statusGratis
      : paket
        ? statusRadText(paket, premiumUntil)
        : 'Premium aktivt';

  const egetPaket: PaketId | null = paket ? paketForPlan(paket) : null;

  /** Kortets props i användarens läge. */
  function kortFor(id: PaketId): Partial<PaketKortProps> {
    // Gratis: alla tre med knappar, precis som på prissidan.
    if (tillstand === 'free' || !paket) {
      return {
        knapp: {
          text: borjaKnapp(id),
          onClick: () => kop(id === 'allt' ? planForLangd(langd) : PAKET_PLAN[id]),
          disabled: busy,
        },
      };
    }

    // Spår: det egna kortet, det andra spåret, och Hela paketet med mellanskillnaden.
    if (tillstand === 'track') {
      if (id === egetPaket) {
        return { status: KONTO.dittPaket, fotnot: null };
      }
      if (id !== 'allt') {
        return {
          knapp: {
            text: KONTO.bytSpar(PAKET_PLAN[id]),
            onClick: () => byt(PAKET_PLAN[id]),
            disabled: busy || !harStripePrenumeration,
          },
          fotnot: KONTO.byterVidFornyelse,
        };
      }
      return {
        visaLangd: false,
        pris: {
          belopp: `+${mellanskillnad(paket)} kr`,
          sub: KONTO.mellanskillnadSub(paket),
        },
        knapp: {
          text: KONTO.bytTillAllt,
          onClick: () => byt('all_week'),
          disabled: busy || !harStripePrenumeration,
        },
        fotnot: null,
      };
    }

    // Allt: spåren ingår, Allt-kortet bär längdbytet.
    if (id !== 'allt') {
      return {
        status: KONTO.ingarIAllt,
        fotnot: null,
        lank: harStripePrenumeration
          ? {
              text: `${KONTO.bytSpar(PAKET_PLAN[id])} vid nästa förnyelse`,
              onClick: () => byt(PAKET_PLAN[id]),
            }
          : undefined,
      };
    }

    if (!harStripePrenumeration) {
      return { visaLangd: false, status: KONTO.dittPaket, fotnot: null };
    }

    const vald = planForLangd(langd);
    const oforandrad = vald === paket;
    return {
      inaktivaLangder: ['dag'],
      langdNot: langd === 'dag' ? KONTO.dagInaktiv : KONTO.byterVidFornyelse,
      status: oforandrad ? KONTO.oforandrad : undefined,
      knapp: oforandrad
        ? null
        : { text: KONTO.bytLangd(vald), onClick: () => byt(vald), disabled: busy },
      fotnot: besparing(vald),
    };
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 sm:space-y-6 sm:p-6">
      <PageHeader title="Prenumeration" description={KONTO.ingress} />

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

      {/* Blockeringslistan står före korten: inte "köp det här" utan
          "det här tog stopp, och det här löser det". */}
      {tillstand !== 'all' && rader.length > 0 ? (
        <section>
          <h2 className="text-sm font-medium text-ink-3">{KONTO.stoppRubrik}</h2>
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

      {/* De tre korten i användarens läge. */}
      <section aria-labelledby="konto-paket">
        <h2 id="konto-paket" className="text-sm font-medium text-ink-3">
          {KONTO.paketRubrik}
        </h2>
        <div className="mt-2 grid gap-3 lg:grid-cols-[1fr_1fr_1.12fr] lg:items-stretch lg:gap-4">
          {PAKET_IDS.map((id, i) => (
            <PaketKort
              key={id}
              paket={id}
              nummer={i + 1}
              langd={id === 'allt' ? langd : undefined}
              onLangd={(ny, plan) => {
                setLangd(ny);
                capture('plan_length_changed', { plan, surface: 'account' });
              }}
              {...kortFor(id)}
            />
          ))}
        </div>
      </section>

      {/* Hanteringslistan. Säg upp är aldrig dold och aldrig destruktiv. */}
      {tillstand !== 'free' && harStripePrenumeration ? (
        <section>
          <h2 className="text-sm font-medium text-ink-3">{KONTO.hantera}</h2>
          <ul className="mt-2 divide-y divide-kant rounded-xl border border-kant bg-panel">
            <li>
              <Link href={PORTAL} className={RAD}>
                {KONTO.bytKort}
                <ChevronRight className="h-5 w-5 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link href={PORTAL} className={RAD}>
                {KONTO.kvitton}
                <ChevronRight className="h-5 w-5 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
              </Link>
            </li>
            <li>
              <button type="button" onClick={sagUpp} className={`${RAD} w-full text-left`}>
                {KONTO.sagUpp}
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

      {tillstand === 'free' ? (
        <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
          <h2 className="text-sm font-medium text-ink-3">{KONTO.gratisRubrik}</h2>
          <ul className="mt-3 space-y-2">
            {FREE_HIGHLIGHTS.map((rad) => (
              <li key={rad} className="text-sm leading-[22px] text-ink-2">
                {rad}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <CancelFlowModal open={uppsagning} onClose={() => setUppsagning(false)} />
    </div>
  );
}
