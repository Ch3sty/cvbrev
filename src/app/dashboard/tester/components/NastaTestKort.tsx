'use client';

/**
 * Det lyfta kortet "Nästa test" (skiss Provbladet, version 3): vyns enda
 * kopparknapp, nu med testets bild och en faktarad, så att "Starta testet"
 * aldrig står utan frågor och tid. Talen står i faktaraden, inte i texten.
 *
 * Bilden 96 hög över texten på mobil, 160 × 120 till höger på dator.
 * Överlappar väggen 30 px som LyftKort. Första gången (Så går det till på
 * väggen) står bilden bara på dator: på mobil skulle den trycka ner
 * knappen under vecket, och logikkortet strax under visar samma bild.
 */

import type { ComponentType } from 'react';
import Link from 'next/link';
import { KNAPP_PRIMAR } from '@/components/shell/knappar';
import type { IlluProvbladProps } from '@/components/traning/illu';
import Fakta, { type FaktaPost } from './Fakta';

export interface NastaTest {
  eyebrow: string;
  titel: string;
  text: string;
  href: string;
  knapp: string;
  fakta: FaktaPost[];
  Bild: ComponentType<IlluProvbladProps>;
}

export default function NastaTestKort({ nasta, bildPaMobil = true }: { nasta: NastaTest; bildPaMobil?: boolean }) {
  const { Bild } = nasta;
  return (
    <section
      aria-label={nasta.titel}
      className="relative z-[2] -mt-[30px] rounded-2xl border border-[color:var(--lyft-kant)] bg-papper p-4 shadow-lyft"
      data-lyft="nasta-test"
    >
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_160px] lg:items-start lg:gap-6">
        <div className={`mx-auto w-full max-w-[200px] lg:order-2 lg:mx-0 lg:block lg:max-w-none ${bildPaMobil ? "" : "hidden"}`}>
          <Bild className="block h-24 w-full lg:h-[120px]" />
        </div>
        <div className="min-w-0">
          <p className="text-ey uppercase text-koppar-ink">{nasta.eyebrow}</p>
          <h2 className="mt-1 text-kort-t text-ink-1">{nasta.titel}</h2>
          <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{nasta.text}</p>
          <Fakta poster={nasta.fakta} className="!justify-start" />
          <div className="mt-3.5">
            <Link href={nasta.href} className={`${KNAPP_PRIMAR} lg:w-auto`}>
              {nasta.knapp}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
