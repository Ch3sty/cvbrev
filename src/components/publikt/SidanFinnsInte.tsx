/**
 * Sidan som visas när en adress inte finns (utseendegranskning 2,
 * 2026-11-22). Förut visades Nexts engelska standardsida på vit botten med
 * svart fot. Nu grundens skal i indigo: hjälten med matrisens tomma ruta
 * som bild, och vägarna vidare till de fyra delarna.
 *
 * Texten är ny och har inte gått genom SEO och copy (sidan indexeras inte):
 * se docs/publikt-omgang3/bygg/logg-utseende-2.md, "Ny text utan
 * godkännande". Länkarnas namn är menyns. Serverkomponent.
 */
import { Sida, Hjalte, Sektion, Rutnat, LankBricka, Knapp, TextLank, Testram } from '@/components/publikt/v3'

const VAGAR = [
  { href: '/verktyg/rekryteringstester', rubrik: 'Rekryteringstester', farg: 'tran' },
  { href: '/cv-mallar', rubrik: 'CV-mallar', farg: 'cv' },
  { href: '/verktyg/personligt-brev', rubrik: 'Personligt brev', farg: 'brev' },
  { href: '/verktyg/jobbmatchning', rubrik: 'Jobbmatchning', farg: 'jobb' },
] as const

export default function SidanFinnsInte() {
  return (
    <Sida>
      <main>
        <Hjalte
          etikett="Fel 404"
          h1="Sidan finns inte"
          varde="Adressen kan vara felskriven, eller så har sidan flyttat. Härifrån kommer du vidare."
          knappar={
            <>
              <Knapp href="/" pil>
                Till startsidan
              </Knapp>
              <TextLank href="/artiklar">Alla artiklar</TextLank>
            </>
          }
          bild={
            <div aria-hidden="true" style={{ width: '100%', maxWidth: 420, margin: '0 auto', transform: 'rotate(1.5deg)' }}>
              <Testram knapp={null} tid={null} />
            </div>
          }
        />
        <Sektion aria-label="Vägar vidare">
          <Rutnat kolumner={4}>
            {VAGAR.map((v) => (
              <LankBricka key={v.href} href={v.href} rubrik={v.rubrik} farg={v.farg} />
            ))}
          </Rutnat>
        </Sektion>
      </main>
    </Sida>
  )
}
