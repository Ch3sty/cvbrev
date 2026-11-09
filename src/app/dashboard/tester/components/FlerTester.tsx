'use client';

/**
 * "Fler tester" i Alla tester när Mitt test är valt (skiss-tester-steg2,
 * fliken Alla tester): testtyperna som inte ingår i valet som korta rader,
 * symbolen, namnet och en rad om läget. Ett tryck fäller ut hela testkortet
 * under listan, så att varje nivå och provraden går att nå utan att lämna
 * sidan. Bara ett kort öppet åt gången.
 */

import { useRef, useState, type ComponentType, type ReactNode } from 'react';
import { IkonChev } from '@/components/illustrations/RumSymboler';
import type { PerTestStats, TestSlug } from '@/hooks/use-all-test-stats';
import type { TestGroup } from './testCatalog';

export interface FlerRad {
  key: string;
  titel: string;
  meta: string;
  Sym: ComponentType<{ size?: number; className?: string }>;
  kort: ReactNode;
}

/** Läget i en rad: bästa nivån som är gjord ("Grund 13 av 15"), annars "Inte gjort än". */
export function flerMeta(group: TestGroup, perTest: Record<TestSlug, PerTestStats>): string {
  const gjorda = group.cognitive.filter((t) => (perTest[t.slug]?.attempts ?? 0) > 0);
  const t = gjorda[gjorda.length - 1];
  if (!t) return 'Inte gjort än';
  return `${t.levelLabel} ${perTest[t.slug].bestScore} av ${t.questionCount}`;
}

export default function FlerTester({ rubrik, rader }: { rubrik: string; rader: FlerRad[] }) {
  const [oppen, setOppen] = useState<string | null>(null);
  const kortRef = useRef<HTMLDivElement>(null);
  if (rader.length === 0) return null;
  const vald = rader.find((r) => r.key === oppen) ?? null;
  return (
    <section aria-labelledby="fler-tester" className="flex flex-col gap-2.5" data-fler-tester>
      <h2 id="fler-tester" className="px-0.5 text-[13px] font-semibold leading-[18px] text-ink-2">
        {rubrik}
      </h2>
      <ul className="list-none overflow-hidden rounded-2xl border border-kant bg-papper p-0">
        {rader.map((r, i) => {
          const ar = r.key === oppen;
          return (
            <li key={r.key} className={i > 0 ? 'border-t border-kant' : ''}>
              <button
                type="button"
                aria-expanded={ar}
                aria-controls="fler-kort"
                onClick={() => {
                  setOppen(ar ? null : r.key);
                  if (!ar) requestAnimationFrame(() => kortRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
                }}
                className="flex min-h-[60px] w-full items-center gap-3 px-4 py-2.5 text-left"
                data-fler={r.key}
              >
                <r.Sym size={36} className="shrink-0 text-ton-ink" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold leading-[19px] text-ink-1">{r.titel}</span>
                  <span className="mt-0.5 block text-[13px] leading-[18px] text-ink-3">{r.meta}</span>
                </span>
                <IkonChev size={18} className={`shrink-0 text-ink-3 transition-transform ${ar ? 'rotate-90' : ''}`} />
              </button>
            </li>
          );
        })}
      </ul>
      {vald ? (
        <div id="fler-kort" ref={kortRef} className="scroll-mt-4">
          {vald.kort}
        </div>
      ) : null}
    </section>
  );
}
