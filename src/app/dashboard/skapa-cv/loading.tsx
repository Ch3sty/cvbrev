/**
 * Arbetsläget laddar in på väggen (skisserna Redigera-1440 och Bygg-1440):
 * huvudet, bladet till vänster och det vita A4-arket till höger (telefonen:
 * arket överst), så att inget hoppar när sidan kommer. Bara linjen rör sig.
 */
export default function SkapaCvLoading() {
  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-[#113538] lg:left-[248px]"
      role="status"
      aria-busy="true"
      aria-label="Laddar ditt CV"
    >
      <div className="flex h-[72px] items-center gap-3.5 px-4 min-[900px]:h-[76px] min-[900px]:px-10">
        <span aria-hidden className="h-11 w-11 rounded-[14px] bg-white/90" />
        <span aria-hidden className="h-5 w-40 rounded bg-white/15" />
      </div>
      <div className="px-4 pt-3 min-[900px]:ml-10 min-[900px]:grid min-[900px]:max-w-[1040px] min-[900px]:grid-cols-[minmax(0,560px)_minmax(360px,440px)] min-[900px]:gap-10 min-[900px]:px-0">
        <div aria-hidden className="hidden min-[900px]:block">
          <div className="h-10 w-[460px] max-w-full rounded-[13px] bg-white/10" />
          <div className="mt-3 h-[560px] rounded-3xl bg-white/90" />
        </div>
        <div aria-hidden className="loading-thread mx-auto aspect-[794/1123] w-full max-w-[380px] rounded-md bg-white min-[900px]:max-w-none" />
      </div>
    </div>
  )
}
