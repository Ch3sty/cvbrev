'use client';

/**
 * Idags öar: länkarna som mäter tryck och händelserna när vyn visas. Vyn
 * själv (IdagVy) är serverrenderad; öarna lägger bara till onClick och
 * effekter, så första målningen är densamma med eller utan JS.
 *
 * Hintarnas händelser går genom webbens HintSparning (hint_visad en gång
 * per hint och dag, hint_klickad vid tryck) med plattform 'app'.
 */
import { useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { capture } from '@/lib/analytics/events';
import { SALD_PLAN } from '@/lib/plans/plans';
import type { Hint } from '@/lib/tester/v4/typer';
import { hintKlickad, type HintKontext } from '@/components/tester-v4/hem/HintSparning';

type HintId = Pick<Hint, 'id' | 'typ' | 'testtyp'>;

export function HintLank({
  hint,
  plats,
  kontext,
  href,
  className,
  style,
  ariaLabel,
  children,
}: {
  hint: HintId;
  plats: number;
  kontext: HintKontext;
  href: string;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={className} style={style} aria-label={ariaLabel} data-hint={hint.typ} onClick={() => hintKlickad(hint, kontext, plats)}>
      {children}
    </Link>
  );
}

/** Gratisradens köpknapp: kvot_slut_visad en gång per montering, paywall_cta_clicked vid tryck. */
export function KvotKop({ href, planTest, className, style, children }: { href: string; planTest: string | null; className?: string; style?: React.CSSProperties; children: ReactNode }) {
  const skickad = useRef(false);
  useEffect(() => {
    if (skickad.current) return;
    skickad.current = true;
    capture('kvot_slut_visad', { surface: 'idag', plan_test: planTest, plattform: 'app' });
  }, [planTest]);
  return (
    <Link
      href={href}
      className={className}
      style={style}
      onClick={() => capture('paywall_cta_clicked', { variant: 'testniva', surface: '/app', cta: 'primary', plan: SALD_PLAN, plats: 'kvot' })}
    >
      {children}
    </Link>
  );
}
