// src/components/shell/knappar.ts
//
// Knapparna i Rummen (spec-rummen-2026-10-10 avsnitt 4.4, beslut 5).
// Ersätter INK_KNAPP och INK_LANK i inloggat.
//
// Regel: exakt ett element med KNAPP_PRIMAR per vy, och aldrig på väggen
// (spec 16.3.1): väggen säger var du är, det lyfta kortet vad du gör.
// Det sekundära i en betalvägg är alltid LANK. KNAPP_PRIMAR är koppar med
// mörk text (6,2:1), 48 px, radie 12. Toningen bor i .knapp-primar i
// globals.css.
//
// Knapparna är fulla i bredd som i konceptet. Där en knapp ska vara
// smalare från sm läggs `sm:w-auto` till vid anropet, aldrig en egen
// variant. Undantaget är KNAPP_GLAS, väggens sekundära handling, som alltid
// har automatisk bredd (full bredd på glas finns bara i Kvitto och i ark).

export const KNAPP_PRIMAR =
  'knapp-primar inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-[18px] text-[15px] font-semibold tracking-[-.005em] disabled:opacity-50'

export const KNAPP_SEKUNDAR =
  'inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-kant-stark bg-papper px-[18px] text-[15px] font-semibold text-ink-1'

/**
 * Samma knappar utan full bredd, för knappar som står i en rad bredvid
 * text eller en annan knapp (förr inline-knappar i bläck).
 */
export const KNAPP_PRIMAR_SMAL = KNAPP_PRIMAR.replace(' w-full', '')
export const KNAPP_SEKUNDAR_SMAL = KNAPP_SEKUNDAR.replace(' w-full', '')

/**
 * Sekundärknappen i en rad eller ett rutnät med två eller fler sekundära
 * (spec 16.2 fråga 17): 40 px och 14 px text. Ensam sekundärknapp är 48.
 */
export const KNAPP_SEKUNDAR_LAG = KNAPP_SEKUNDAR_SMAL.replace(' h-12', ' h-10').replace(' text-[15px]', ' text-sm')

/** Väggens sekundära handling: glas, automatisk bredd (spec 16.3.1 punkt 2). */
export const KNAPP_GLAS =
  'inline-flex h-12 w-auto self-start items-center justify-center gap-2 rounded-xl border border-vagg-kant bg-white/[.08] px-[18px] text-[15px] font-semibold text-vagg-ink'

export const LANK = 'text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark'

export const LANK_VAGG = 'text-sm font-medium text-vagg-ink underline underline-offset-4 decoration-vagg-svag'

export const KNAPPRAD =
  'mt-3.5 flex flex-col items-stretch gap-2.5 [&>a.lank]:min-h-9 [&>a.lank]:inline-flex [&>a.lank]:items-center [&>a.lank]:justify-center'
