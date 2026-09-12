/**
 * Skapa brev laddar in i FlowShell, inte i den vanliga dashboard-sidan.
 *
 * Den gamla skelettbilden ritade en 200 px orange hero plus två block, en form
 * som sidan aldrig antar. När den riktiga sidan kom byttes alltså hela ytan
 * ut mot något helt annat, och det syntes som ett hopp. Skelettet härmar nu
 * skalet: topprad på 48 px, tunn progressrad, ett stegkort, sticky fot.
 */
export default function SkapaBrevLoading() {
  return (
    <div
      className="flex h-[100dvh] flex-col bg-white"
      role="status"
      aria-label="Laddar Personligt brev"
    >
      {/* Topp: samma 48 px och samma kant som FlowShell. */}
      <div className="flex-shrink-0 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-12 w-full max-w-3xl items-center gap-2 px-2">
          <span className="h-11 w-11 flex-shrink-0" aria-hidden="true" />
          <div
            aria-hidden="true"
            className="h-4 w-40 animate-pulse rounded bg-neutral-100"
          />
          <span className="ml-auto pr-2 text-sm tabular-nums text-transparent">1/6</span>
        </div>
        <div className="h-0.5 w-full bg-neutral-100" aria-hidden="true" />
      </div>

      {/* Mitten: ett stegkort med samma ram och rundning som stegen. */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="mx-auto w-full max-w-3xl px-4 py-4">
          <div
            aria-hidden="true"
            className="animate-pulse rounded-xl border border-orange-200/50 bg-white p-5 sm:p-7"
            style={{ minHeight: 320 }}
          />
        </div>
      </div>

      {/* Fot: samma höjd som skalets, så knappen inte flyttar när den kommer. */}
      <div
        className="flex-shrink-0 border-t border-neutral-200 bg-white"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="mx-auto w-full max-w-3xl px-4 py-3">
          <div
            aria-hidden="true"
            className="h-11 w-full animate-pulse rounded-lg bg-neutral-100 sm:w-[200px]"
          />
        </div>
      </div>
    </div>
  )
}
