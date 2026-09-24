/**
 * Fordelnings segmentrad för en faktor (docs/design/rod-trad-prov-spec-2026-09-24.md):
 * fem segment, 8 px, fyllda i bläck, tomma i insunken med kant-stark
 * innerkant. role="img" med "n av 5". Ingen hook: används i provet, på
 * tolkningssidan och i hubbens profilpanel.
 */

export default function Segmentrad({ n, className = 'mt-2' }: { n: number; className?: string }) {
  return (
    <div role="img" aria-label={`${n} av 5`} className={`flex h-2 w-full gap-0.5 overflow-hidden rounded-full ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-full flex-1 first:rounded-l-full last:rounded-r-full ${
            i <= n ? 'bg-ink-1' : 'bg-insunken shadow-[inset_0_0_0_1px_var(--kant-stark)]'
          }`}
        />
      ))}
    </div>
  )
}
