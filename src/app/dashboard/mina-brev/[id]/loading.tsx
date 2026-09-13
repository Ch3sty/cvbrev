/**
 * Utan den här filen ärver /dashboard/mina-brev/[id] förälderns loading.tsx,
 * alltså hero plus sex brevkort på 150 px. Sidans egen laddvy är ett helt
 * annat skelett, så bytet flyttade innehållet och mätte 0,0055 i CLS.
 *
 * Skelettet nedan är exakt samma markup som sidans egen laddvy. Då byter
 * webbläsaren bara ut identiska rutor och ingenting rör sig.
 */
export default function BrevLoading() {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Laddar brev">
      <div className="h-10 w-48 rounded-lg bg-neutral-100" />
      <div className="rounded-xl border border-neutral-200 bg-white h-[520px]" />
      <div className="h-11 w-full sm:w-64 rounded-xl bg-neutral-100" />
    </div>
  );
}
