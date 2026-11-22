/**
 * <ManadsbladArtikel />: månadsrapporten i Sökta tjänster som ett gratiskonto
 * ser den, i artikeln om aktivitetsrapporten (saas-lead 10.3, SEO 11.2 och
 * 11.3 i docs/artiklar-2026-11/brief-aktivitetsrapport.md, byggordern K).
 *
 * Serverkomponent utan JavaScript. Antalen räknas ur artikelns exempeltabell
 * för oktober (Annons till avsnitt 1, Spontant till avsnitt 2, en intervju
 * under Händelse till avsnitt 3); testet läser tabellen i MDX-filen och
 * fäller om tabellen och bladet säger olika. Raderna står som grå streck
 * (aria-hidden), som de låsta raderna i kontots rapport, ritade om i CSS
 * utan att importera inloggad kod. Inga rubrikelement, länkar, knappar,
 * bilder eller priser.
 */
import { Chip, Ikon } from '@/components/publikt/v3'
import { paketKort } from '@/lib/plans/plans'
import '@/app/(public)/verktyg/sokta-tjanster/sokta-tjanster.css'
import './manadsblad-artikel.css'

/** Exempeltabellen "listan för oktober" i aktivitetsrapport-arbetsformedlingen.mdx. */
export const MANADSBLAD_OKTOBER = { annonserade: 4, spontana: 1, intervjuer: 1 } as const

const AVSNITT = [
  { rubrik: '1. Sökta annonserade jobb', antal: MANADSBLAD_OKTOBER.annonserade },
  { rubrik: '2. Intresseanmälningar och spontanansökningar', antal: MANADSBLAD_OKTOBER.spontana },
  { rubrik: '3. Intervjuer och provjobb', antal: MANADSBLAD_OKTOBER.intervjuer },
] as const

/** Strecken varierar i längd så att de liknar rader, inte ett mönster. */
const LANGD = ['78%', '64%', '86%', '70%']

const jobb = (n: number) => (n === 1 ? '1 sökt jobb' : `${n} sökta jobb`)
const intervjuer = (n: number) => (n === 1 ? '1 intervju' : `${n} intervjuer`)

export default function ManadsbladArtikel() {
  const premium = paketKort()
  const sokta = MANADSBLAD_OKTOBER.annonserade + MANADSBLAD_OKTOBER.spontana
  return (
    <div className="mba not-prose" role="group" aria-label="Exempel: månadsrapporten för oktober">
      <div className="st-blad mba-blad">
        <p className="st-namn">Oktober 2026</p>
        <p className="st-period">{`${jobb(sokta)} och ${intervjuer(MANADSBLAD_OKTOBER.intervjuer)} under perioden`}</p>
        {AVSNITT.map((a) => (
          <div key={a.rubrik} className="mba-avsnitt">
            <p className="st-avsnitt">
              <strong>{a.rubrik}</strong> <span>{a.antal}</span>
            </p>
            <div className="mba-streck" aria-hidden="true">
              {Array.from({ length: a.antal }, (_, k) => (
                <div key={k} className="mba-rad">
                  <i className="mba-dag" />
                  <i style={{ width: LANGD[k % LANGD.length] }} />
                </div>
              ))}
            </div>
            <p className="mba-las">
              <Ikon namn="las" />
              {`Raderna ingår i ${premium}`}
            </p>
          </div>
        ))}
      </div>
      <ul className="st-uttag mba-uttag">
        <li>
          <i aria-hidden="true">
            <Ikon namn="ner" />
          </i>
          <div>
            Skriv ut eller spara som PDF <Chip typ="premium">{premium}</Chip>
          </div>
          <span>Bladet med alla rader, som det ser ut i kontot.</span>
        </li>
        <li>
          <i aria-hidden="true">
            <Ikon namn="cv" />
          </i>
          <div>
            Kopiera som text till AF-rapporten <Chip typ="premium">{premium}</Chip>
          </div>
          <span>Rad för rad, att klistra in där du rapporterar.</span>
        </li>
        <li>
          <i aria-hidden="true">
            <Ikon namn="pil" />
          </i>
          <div>
            Dela med en länk <Chip typ="gratis">Antalen gratis</Chip>
          </div>
          <span>{`Listan i länken ingår i ${premium}.`}</span>
        </li>
      </ul>
    </div>
  )
}
