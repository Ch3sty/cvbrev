/**
 * Skelettet medan serverkomponenten läser personlighetsprofilen. Höjderna
 * speglar hero plus två sektionskort, alltså samma yta som den färdiga sidan
 * börjar med, så bytet inte flyttar något.
 */
export default function ArbetsstilLoading() {
  return (
    <div className="mx-auto py-4 sm:py-6 max-w-3xl" aria-busy="true" aria-label="Laddar din arbetsstil">
      <div className="space-y-5 sm:space-y-6">
        <div className="rounded-xl bg-indigo-50/60 h-40 animate-pulse" />
        <div className="rounded-xl bg-indigo-50/40 h-56 animate-pulse" />
        <div className="rounded-xl bg-indigo-50/40 h-56 animate-pulse" />
      </div>
    </div>
  );
}
