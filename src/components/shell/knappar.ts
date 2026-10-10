// src/components/shell/knappar.ts
//
// Knapparna i Rummen (spec-rummen-2026-10-10 avsnitt 4.4, beslut 5).
// Ersätter INK_KNAPP och INK_LANK i inloggat.
//
// Regel: exakt ett element med KNAPP_PRIMAR per vy. Det sekundära i en
// betalvägg är alltid LANK. KNAPP_PRIMAR är koppar med mörk text
// (6,2:1), 48 px, radie 12. Toningen bor i .knapp-primar i globals.css.
//
// Knapparna är fulla i bredd som i konceptet. Där en knapp ska vara
// smalare från sm läggs `sm:w-auto` till vid anropet, aldrig en egen
// variant.

export const KNAPP_PRIMAR =
  'knapp-primar inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-[18px] text-[15px] font-semibold tracking-[-.005em] disabled:opacity-50'

export const KNAPP_SEKUNDAR =
  'inline-flex h-12 w-full items-center justify-center rounded-xl border border-kant-stark bg-papper px-[18px] text-[15px] font-semibold text-ink-1'

export const KNAPP_GLAS =
  'inline-flex h-12 w-full items-center justify-center rounded-xl border border-vagg-kant bg-white/[.08] px-[18px] text-[15px] font-semibold text-vagg-ink'

export const LANK = 'text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark'

export const LANK_VAGG = 'text-sm font-medium text-vagg-ink underline underline-offset-4 decoration-vagg-svag'

export const KNAPPRAD =
  'mt-3.5 flex flex-col items-stretch gap-2.5 [&>a.lank]:min-h-9 [&>a.lank]:inline-flex [&>a.lank]:items-center [&>a.lank]:justify-center'
