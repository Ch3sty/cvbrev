/**
 * Samma sak som för visningssidan: utan en egen loading.tsx ärvs listans
 * skelett, och bytet mot sidans egen laddvy blir ett layoutskifte.
 * Markupen här är identisk med sidans egen laddvy.
 */
export default function RedigeraBrevLoading() {
  return (
    <div className="space-y-4" role="status" aria-busy="true" aria-label="Laddar brev">
      <div className="h-8 w-48 rounded bg-insunken" />
      <div className="loading-thread h-[520px] rounded-xl border border-kant bg-panel" />
      <div className="h-11 w-full rounded-lg bg-insunken sm:w-64" />
    </div>
  );
}
