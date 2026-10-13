/**
 * Produktfilmen i testartiklarna, i avsnittet om hur man övar. Klicka för att
 * spela: ingen fil hämtas och inget rör sig förrän besökaren vill, så filmen
 * konkurrerar inte med artikelns text eller med testkorten (ägarens beslut
 * 2026-10-13). Ingen rubrik och inget schema; VideoObject finns bara på
 * /verktyg/rekryteringstester.
 */
import Produktfilm from '@/components/publikt/Produktfilm'

export default function ArtikelFilm({ slug }: { slug: string }) {
  return (
    <figure className="artikel-film" style={{ margin: '32px 0' }}>
      <Produktfilm page={`/artiklar/${slug}`} position="artikel" knappHref="/verktyg/rekryteringstester/prova" start="klick" />
      <figcaption style={{ marginTop: 10, fontSize: 14, lineHeight: '20px', color: 'var(--ink-3, #65656E)' }}>
        Så ser träningen ut hos oss: uppgiften, facit, regeln bakom frågan och din nivå fram till provdagen. 20 sekunder.
      </figcaption>
    </figure>
  )
}
