/**
 * Utan den här filen ärver /dashboard/mina-brev/[id] förälderns loading.tsx,
 * alltså listans skelett. Sidans egen laddvy är ett helt annat skelett, så
 * bytet flyttade innehållet och mätte 0,0055 i CLS.
 *
 * Skelettet nedan är exakt samma markup som sidans egen laddvy. Blocken
 * står stilla, bara tråden längs brevpanelens överkant rör sig.
 */
export default function BrevLoading() {
  return (
    <div className="space-y-4" role="status" aria-busy="true" aria-label="Laddar brev">
      <div className="h-8 w-48 rounded bg-insunken" />
      <div className="loading-thread h-[520px] rounded-xl border border-kant bg-panel" />
      <div className="h-11 w-full rounded-lg bg-insunken sm:w-64" />
    </div>
  );
}
