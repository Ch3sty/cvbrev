'use client'

/**
 * Klicktestytan för grunden (se page.tsx). Ingen riktig sida: den visar
 * byggstenarna så som Alla tester kommer att använda dem.
 */

import type { ComponentType } from 'react'
import {
  IlluMatris,
  IlluNumeriskt,
  IlluPersonlighet,
  IlluProvlage,
  IlluScenVagen,
  IlluTomtUtveckling,
  IlluVerbalt,
  type IlluProvbladProps,
} from '@/components/traning/illu'
import { HjalpKnapp, HjalpPanel, HjalpProvider, HjalpRad, useHjalp } from '@/components/hjalp'

const BILDER: { namn: string; K: ComponentType<IlluProvbladProps> }[] = [
  { namn: 'Matris', K: IlluMatris },
  { namn: 'Verbalt', K: IlluVerbalt },
  { namn: 'Numeriskt', K: IlluNumeriskt },
  { namn: 'Personlighet', K: IlluPersonlighet },
  { namn: 'Provläge', K: IlluProvlage },
  { namn: 'Tomt, Din utveckling', K: IlluTomtUtveckling },
]

function Etikett({ children }: { children: string }) {
  return <p className="text-ey uppercase text-ink-3">{children}</p>
}

function Kort({ id, rubrik, fraga, text, K }: { id: 'B1' | 'B3' | 'B5'; rubrik: string; fraga: string; text: string; K: ComponentType<IlluProvbladProps> }) {
  return (
    <section className="relative rounded-2xl border border-kant bg-papper p-4 sm:p-5" data-grund-kort={id}>
      <div className="flex flex-col gap-4 sm:flex-row-reverse sm:items-start">
        <div className="mx-auto h-24 max-w-[200px] sm:mx-0 sm:h-auto sm:w-40 sm:max-w-none">
          <K className="h-24 w-full sm:h-auto" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-ey uppercase text-ink-3">
            {rubrik} <HjalpKnapp id={id} etikett={`Vad mäter ${rubrik.toLowerCase()}?`} />
          </p>
          <h2 className="mt-1 font-display text-kort-t text-ink-1">{fraga}</h2>
          <p className="mt-1 text-sm leading-[21px] text-ink-2">{text}</p>
        </div>
      </div>
    </section>
  )
}

function VisaIgen() {
  const { dold, visa } = useHjalp()
  return (
    <p className="text-meta text-ink-3">
      Hjälpen är {dold ? 'dold' : 'på'}.{' '}
      {dold ? (
        <button type="button" onClick={visa} className="min-h-11 font-medium text-ink-1 underline underline-offset-4" data-visa-igen>
          Visa hjälpen igen
        </button>
      ) : null}
    </p>
  )
}

export default function GrundForhandsvisning({ forsta }: { forsta: boolean }) {
  return (
    <HjalpProvider dold={null} forsta={forsta}>
      <div className="vagg px-4 pb-8 pt-6 lg:mx-10 lg:px-10" data-grund="vagg">
        <div className="flex items-end justify-between gap-8">
          <div>
            <p className="text-ey uppercase text-vagg-mjuk">Förhandsvisning</p>
            <h1 className="mt-2 font-display text-[34px] font-extrabold leading-9 tracking-[-0.025em]">Provbladet, grunden</h1>
            <p className="mt-2 max-w-[60ch] text-[15px] leading-[22px] text-vagg-mjuk">
              Illustrationerna på vägg, golv och papper, hjälpraden, i-knappen och sidopanelen.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {BILDER.slice(0, 5).map(({ namn, K }) => (
                <div key={namn} className="w-32 illu-vagg">
                  <K title={namn} />
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:block illu-vagg">
            <IlluScenVagen size={240} title="Vägen från ansökan via test till intervju" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 lg:px-10">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
          <div className="min-w-0 space-y-4">
            <HjalpRad ids={['A1', 'A2', 'A5']} rubrik="Aldrig gjort ett rekryteringstest?" oppnasForsta={false} className="lg:hidden" />

            <Kort id="B1" rubrik="Logiktest" fraga="Vilken figur kommer härnäst?" text="Du ser en serie figurer och ska lista ut vilken som kommer härnäst." K={IlluMatris} />
            <Kort id="B3" rubrik="Verbalt test" fraga="Stämmer påståendet med texten?" text="Rutan B3 väntar på verifiering, så i-knappen syns inte här." K={IlluVerbalt} />

            <HjalpRad ids={['C5', 'B8']} rubrik="Vad betyder nivåerna?" className="lg:hidden" />

            <Kort id="B5" rubrik="Numeriskt test" fraga="Läs tabellen och räkna under tid." text="Rutan B5 väntar också på verifiering." K={IlluNumeriskt} />

            <Etikett>Bilderna på papper, 160 × 120</Etikett>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {BILDER.map(({ namn, K }) => (
                <div key={namn} className="rounded-xl border border-kant bg-papper p-3">
                  <K size={160} className="mx-auto max-w-full" />
                  <p className="mt-2 text-center text-meta text-ink-3">{namn}</p>
                </div>
              ))}
            </div>

            <Etikett>Samma bilder på golvet</Etikett>
            <div className="flex flex-wrap gap-4">
              {BILDER.map(({ namn, K }) => (
                <div key={namn} className="w-32">
                  <K />
                </div>
              ))}
            </div>

            <VisaIgen />
          </div>

          <HjalpPanel
            className="hidden lg:block lg:-mt-2"
            rader={[
              { ids: ['A1', 'A2', 'A3', 'A5'], rubrik: 'Aldrig gjort ett rekryteringstest?' },
              { ids: ['C5'], oppnasForsta: false },
              { ids: ['C4'], oppnasForsta: false },
              { ids: ['C3'], oppnasForsta: false },
            ]}
          />
        </div>
      </div>
    </HjalpProvider>
  )
}
