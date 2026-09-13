/**
 * Skapa brev laddar in i FlowShell, inte i den vanliga dashboard-sidan.
 * Skelettet härmar skalet: topprad på 56 px i panel, tunn framstegslinje,
 * ett stegkort med tråden längs överkanten, sticky fot. Blocken står
 * stilla i insunken, bara tråden rör sig.
 */
export default function SkapaBrevLoading() {
  return (
    <div
      className="flex h-[100dvh] flex-col bg-mark"
      role="status"
      aria-busy="true"
      aria-label="Laddar Personligt brev"
    >
      <div className="flex-shrink-0 border-b border-kant bg-panel">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-1 px-2">
          <span className="h-11 w-11 flex-shrink-0" aria-hidden="true" />
          <div aria-hidden="true" className="h-4 w-40 rounded bg-insunken" />
          <span className="ml-auto pr-2 text-sm tabular-nums text-transparent">1 / 6</span>
        </div>
        <div className="h-0.5 w-full bg-kant" aria-hidden="true" />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="mx-auto w-full max-w-3xl px-4 py-4">
          <div aria-hidden="true" className="h-4 w-24 rounded bg-insunken" />
          <div aria-hidden="true" className="mt-2 h-7 w-3/4 rounded bg-insunken" />
          <div
            aria-hidden="true"
            className="loading-thread mt-4 rounded-xl border border-kant bg-panel p-4"
            style={{ minHeight: 320 }}
          />
        </div>
      </div>

      <div
        className="flex-shrink-0 border-t border-kant bg-panel"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="mx-auto w-full max-w-3xl px-4 py-3">
          <div aria-hidden="true" className="h-11 w-full rounded-lg bg-insunken sm:w-[200px]" />
        </div>
      </div>
    </div>
  )
}
