// src/components/ui/InfoPopover.tsx
// Husets förklaringsmönster: en diskret info-glyf som öppnar en ljus popover.
//
// Regler (delade för hela produkten):
// - Klick/tryck öppnar på ALLA enheter, aldrig hover: mobil och desktop
//   beter sig likadant och touch-hybridenheter öppnar inget av misstag.
// - 44x44 px tryckyta (padding runt en 18 px glyf), kryss för touch,
//   Escape och klick utanför stänger (Headless UI sköter det).
// - Glyfen väger lätt (outline i vila, accentfärg vid hover/fokus) så den
//   aldrig konkurrerar med radens riktiga CTA.
// - accent='warm' är standard; 'indigo' används ENBART på rekryterarytan.

'use client';

import { Popover, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';

interface InfoPopoverProps {
  /** Begreppet som förklaras, t.ex. "Dina CV". Blir aria-label och rubrik. */
  title: string;
  children: ReactNode;
  /** Valfri illustration som visas överst i panelen (dekorativ, aldrig bärande). */
  illustration?: ReactNode;
  accent?: 'warm' | 'indigo';
}

/** Egen info-glyf i husstil: cirkel + "i", ärver currentColor. */
function IconInfo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="8.2" r="1.3" fill="currentColor" />
      <path d="M12 11.4 V 16.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function InfoPopover({
  title,
  children,
  illustration,
  accent = 'warm',
}: InfoPopoverProps) {
  const buttonAccent =
    accent === 'indigo'
      ? 'text-slate-300 hover:text-indigo-600 focus-visible:text-indigo-600'
      : 'text-slate-300 hover:text-orange-600 focus-visible:text-orange-600';
  const panelBorder = accent === 'indigo' ? 'border-indigo-100' : 'border-orange-100';

  return (
    <Popover className="relative inline-flex">
      {({ close }) => (
        <>
          <Popover.Button
            className={`inline-flex items-center justify-center w-8 h-8 -my-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 ${buttonAccent}`}
            aria-label={`Vad betyder ${title}?`}
          >
            <IconInfo className="w-[17px] h-[17px]" />
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute z-40 top-full left-0 mt-2 w-72 max-w-[calc(100vw-2rem)]">
              <div className={`overflow-hidden rounded-2xl bg-white border ${panelBorder} shadow-xl`}>
                {illustration && (
                  <div className={`px-4 pt-4 ${accent === 'indigo' ? 'bg-indigo-50/40' : 'bg-orange-50/40'}`}>
                    {illustration}
                  </div>
                )}
                <div className="relative p-4">
                  <button
                    type="button"
                    onClick={() => close()}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    aria-label="Stäng förklaringen"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </button>
                  <h4 className="text-sm font-black text-slate-900 mb-1.5 pr-7">{title}</h4>
                  <div className="text-xs text-slate-600 leading-relaxed space-y-1.5">
                    {children}
                  </div>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
