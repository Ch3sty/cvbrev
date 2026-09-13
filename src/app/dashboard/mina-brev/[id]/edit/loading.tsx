/**
 * Samma sak som för visningssidan: utan en egen loading.tsx ärvs listans
 * skelett, och bytet mot sidans egen laddvy blir ett layoutskifte.
 * Markupen här är identisk med sidans egen laddvy.
 */
export default function RedigeraBrevLoading() {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Laddar brev">
      <div className="h-10 w-48 rounded-lg bg-neutral-100" />
      <div className="rounded-xl border border-neutral-200 bg-white h-[520px]" />
      <div className="h-11 w-full sm:w-64 rounded-xl bg-neutral-100" />
    </div>
  );
}
