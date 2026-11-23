/**
 * Kampanjmärket (docs/design/spec-kampanjmarke-2026-11-23.md, avsnitt 3):
 * plattan med kampanjens namn, nedräkningen på brickor och slutdatumet i
 * klartext. Ren markup utan hooks, så att det går att använda i både server-
 * och klientkomponenter. Klockan (KLOCKA_KOD, lagd i <head> av KampanjHuvud)
 * hittar märkena själv på data-kn och fyller dem.
 *
 * Varje element klockan skriver i bär suppressHydrationWarning, och texten i
 * dem är fast i React (platshållare), så React rör dem aldrig efter första
 * renderingen. Stilen står i kampanj.css.
 */

import { PLAN_BY_KEY, SALD_PLAN } from '@/lib/plans/plans'
import { KAMPANJ_ORD, type Kampanj } from '@/lib/kampanj/kampanj'

/** Det märket behöver. Både Kampanj (publikt) och KampanjVisning (inloggat) passar. */
type K = Pick<Kampanj, 'namn' | 'tema' | 'pris' | 'rabattKr' | 'giltigTill'> & { slut?: string; slutMs?: number }
const slutMs = (k: K) => k.slutMs ?? Date.parse(k.slut as string)

/** Rutan med nedräkningen och, under den, slutdatumet i klartext (reservläget). */
function Ur({ k }: { k: K }) {
  return (
    <span className="km-ur">
      <span className="km-ur-rad" aria-hidden="true">
        <span className="km-lage" data-kn-lage="" suppressHydrationWarning>
          {KAMPANJ_ORD.slutarOm}
        </span>
        <span className="km-brickor">
          {(['dagar', 'timmar', 'minuter'] as const).map((enhet, i) => (
            <span className="km-bricka" key={enhet}>
              <b data-kn-t="" suppressHydrationWarning>
                {i === 0 ? '0' : '00'}
              </b>
              <i data-kn-e="" suppressHydrationWarning>
                {enhet}
              </i>
            </span>
          ))}
        </span>
      </span>
      <span className="km-reserv">{KAMPANJ_ORD.galler(k)}</span>
    </span>
  )
}

/**
 * STOR och MELLAN med pris: plattan, priset, det strukna, vad man sparar, vad
 * det kostar sedan och nedräkningen. Bara span-element, så att det får stå i <p>.
 */
export function KampanjPris({ k, storlek = 'stor', utanUppsagning }: { k: K; storlek?: 'stor' | 'mellan'; utanUppsagning?: boolean }) {
  const ord = PLAN_BY_KEY[SALD_PLAN].amount
  return (
    <span className={`km km-${storlek} km-tema-${k.tema}`} data-kn={slutMs(k)} suppressHydrationWarning>
      <span className="km-huvud">
        <span className={`km-platta${storlek === 'mellan' ? ' km-platta-liten' : ''}`}>{k.namn}</span>
        <span className="km-forsta">{KAMPANJ_ORD.forsta}</span>
      </span>
      <span className="km-prisrad">
        <span className="km-belopp">{k.pris} kr</span>
        <span className="km-bredvid">
          <s>
            <span className="sr-only">{KAMPANJ_ORD.ordinarie} </span>
            {ord} kr
          </s>
          <span className="km-spar">{KAMPANJ_ORD.sparar(k)}</span>
        </span>
      </span>
      <span className="km-sedan">{KAMPANJ_ORD.sedan(ord, !utanUppsagning)}</span>
      <Ur k={k} />
    </span>
  )
}

/** STOR eller MELLAN utan pris: bara nedräkningen (köpstegets vägg ritar priset själv). */
export function KampanjUr({ k, storlek = 'stor' }: { k: K; storlek?: 'stor' | 'mellan' }) {
  return (
    <span className={`km km-${storlek} km-tema-${k.tema}`} data-kn={slutMs(k)} suppressHydrationWarning>
      <Ur k={k} />
    </span>
  )
}

/**
 * LITEN: plattan och tiden som text på en rad.
 *   enheter    2 = "6 d 16 tim", 3 = "6 d 16 tim 54 min"
 *   paPapper   bläck i stället för ljus text (inloggat, kort)
 *   utanPlatta när plattan redan står bredvid (raderna)
 *   medNamn    namnet i fet text i stället för plattan (sidomenyn)
 *   utanLage   inget "Slutar om" före, "kvar" efter (sidomenyn, där det är trångt)
 */
export function KampanjLiten({
  k,
  enheter = 2,
  paPapper,
  utanPlatta,
  medNamn,
  utanLage,
}: {
  k: K
  enheter?: 2 | 3
  paPapper?: boolean
  utanPlatta?: boolean
  medNamn?: boolean
  utanLage?: boolean
}) {
  return (
    <span
      className={`km km-liten km-tema-${k.tema}${paPapper ? ' km-pa-papper' : ''}`}
      data-kn={slutMs(k)}
      suppressHydrationWarning
    >
      {utanPlatta ? null : <span className="km-platta km-platta-liten">{k.namn}</span>}
      {medNamn ? <span className="km-meny-namn">{k.namn}</span> : null}
      <span className="km-nu">
        <span className="km-nu-rad" aria-hidden="true">
          {utanLage ? null : (
            <>
              <span data-kn-lage="" suppressHydrationWarning>
                {KAMPANJ_ORD.slutarOm}
              </span>{' '}
            </>
          )}
          <b data-kn-text={enheter} suppressHydrationWarning>
            0 d 00 tim
          </b>
          {utanLage ? <span className="km-kvar"> {KAMPANJ_ORD.kvar}</span> : null}
        </span>
        <span className="km-reserv">{KAMPANJ_ORD.till(k)}</span>
      </span>
    </span>
  )
}

/** ORDET: kampanjens namn före ett pris i löptext. Ingen nedräkning. */
export function KampanjOrd({ k }: { k: Pick<Kampanj, 'namn' | 'tema'> }) {
  return <span className={`km-ord km-tema-${k.tema}`}>{k.namn}</span>
}
