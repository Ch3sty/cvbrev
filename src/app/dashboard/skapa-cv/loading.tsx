/**
 * CV-byggaren laddar in i FlowShell, inte i den vanliga dashboard-sidan.
 *
 * Skelettet har byggarens form (skissen 2026-11-16): topprad 56 px, linjen
 * under, och det vita A4-arket i dokumentets bredd (380 px på mobil, 600 px
 * på dator), så att arket inte hoppar när sidan kommer. Ingen fot: den fasta
 * raden ligger i ytan. Bara linjen rör sig.
 */
export default function SkapaCvLoading() {
  return (
    <div className="flex h-[100dvh] flex-col bg-golv" role="status" aria-busy="true" aria-label="Laddar Bygg ditt CV">
      <div className="flex-shrink-0 border-b border-kant bg-papper">
        <div className="mx-auto flex h-14 w-full max-w-[1180px] items-center gap-1 px-2">
          <span className="h-11 w-11 flex-shrink-0" aria-hidden="true" />
          <div aria-hidden="true" className="h-4 w-40 rounded bg-papper-2" />
        </div>
        <div className="h-[3px] w-full bg-papper-2" aria-hidden="true" />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="mx-auto w-full max-w-[1180px] px-3.5 pt-3 lg:px-6">
          <div className="grid gap-4 min-[900px]:grid-cols-[minmax(0,1fr)_296px] min-[900px]:gap-6 xl:grid-cols-[minmax(0,744px)_336px] xl:justify-center">
            <div className="min-w-0">
              <div className="mx-auto w-full max-w-[600px] min-[900px]:max-w-[520px] xl:max-w-[600px]">
                <div aria-hidden="true" className="mb-1.5 h-9" />
                <div aria-hidden="true" className="loading-thread aspect-[794/1123] w-full rounded-[4px] bg-white shadow-[0_1px_0_rgba(0,0,0,.08),0_10px_24px_-14px_rgba(0,0,0,.45)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
