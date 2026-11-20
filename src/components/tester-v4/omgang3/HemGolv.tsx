/**
 * Hems golv i omgång 3 (skissens Hem, Hem-ny, Mobil-hem, Mobil-hem-ny):
 *
 *   Så ligger du till   tre mått i panelen som överlappar väggen
 *   Vägen till provet   ett förslag per dag (eller Vägen framåt utan plan)
 *   Så här går det till för den som inte har gjort något än
 *   Nederst             påbörjad Nivåkoll och senaste träningen, eller raden
 *                       med alla testtyper för den nya
 *   Gratisraden         som förut, när dagens grundnivåtest är gjort
 *
 * Server component; Vägen och gratisraden är klientöar.
 */

import Link from 'next/link'
import type { TesterV4Data, TestTypId } from '@/lib/tester/v4/typer'
import { nivakollHrefV4, PLAN_HREF, TESTER_HREF } from '@/lib/tester/v4/rutter'
import { nivakollOmfang } from '@/lib/nivakoll/omfang'
import { typNamnSmall } from '@/lib/tester/v4/copy'
import TypSymbol from '@/components/tester-v4/tester/TypSymbol'
import GratisRad from '@/components/tester-v4/hem/GratisRad'
import { IngangarMedMatning } from '@/components/tester-v4/hem/HemMatning'
import TreMatt from './TreMatt'
import Vagen from './Vagen'
import { Ikon3, Pips } from './delar'
import { narText, nivaPunkter, tal1 } from './matt'

const ORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv']
const versal = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function SaHarGarDetTill({ data }: { data: TesterV4Data }) {
  const typ = data.dagens.typ
  const o = nivakollOmfang(typ)
  const steg = [
    {
      nr: 'Steg 1',
      nar: 'nu',
      ikon: 'kurva' as const,
      rubrik: 'Gör Nivåkollen',
      text: `${o ? `${versal(ORD[o.uppgifter] ?? String(o.uppgifter))} uppgifter` : 'Några uppgifter'} i ${typNamnSmall(typ)}. Du får din nivå på skalan 1 till 10.`,
      kort: `${o ? `${versal(ORD[o.uppgifter] ?? String(o.uppgifter))} uppgifter` : 'Några uppgifter'}. Du får din nivå på skalan 1 till 10.`,
      href: data.dagens.knapp.href,
      slag: 'nu',
    },
    { nr: 'Steg 2', nar: 'sedan', ikon: 'spela' as const, rubrik: 'Träna på din nivå', text: 'Uppgifterna väljs efter din nivå, och varje svar får en förklaring.', kort: 'Uppgifter efter din nivå, förklaring efter varje svar.', href: null, slag: 'sedan' },
    { nr: 'Steg 3', nar: 'efter en vecka', ikon: 'nivatest' as const, rubrik: 'Mät igen och se kurvan', text: 'En ny Nivåkoll visar om nivån har rört sig. Kurvan finns i Din utveckling.', kort: 'En ny Nivåkoll visar om nivån har rört sig.', href: null, slag: 'sedan' },
  ]
  return (
    <section className="t3-sektion" aria-labelledby="t3-sa-gar" data-sa-gar-det-till>
      <div className="t3-sektion-huvud">
        <h2 id="t3-sa-gar" className="t3-h2">
          Så här går det till
        </h2>
        <p className="t3-sektion-rad">
          Tre steg. Alla andra tester är öppna också<span className="hidden xl:inline">, du hittar dem under Tester</span>
          <span className="xl:hidden">, under Tester</span>.
        </p>
      </div>
      <ol className="t3-vagen" style={{ ['--t3-dagar' as string]: data.plan ? 3 : 4 }}>
        {steg.map((s) => {
          const inne = (
            <>
              <span className="t3-dag-nar">
                {s.nr}
                <small>{s.nar}</small>
              </span>
              <span className="t3-dag-ik">
                <Ikon3 ikon={s.ikon} size={22} />
              </span>
              <span className="t3-dag-text">
                <b>{s.rubrik}</b>
                <span className="t3-dag-skal">
                  <span className="hidden xl:inline">{s.text}</span>
                  <span className="xl:hidden">{s.kort}</span>
                </span>
              </span>
            </>
          )
          return (
            <li key={s.nr} className="contents">
              {s.href ? (
                <Link href={s.href} className="t3-dag" data-dag="idag">
                  {inne}
                </Link>
              ) : (
                <div className="t3-dag" data-dag="forslag" data-stilla>
                  {inne}
                </div>
              )}
            </li>
          )
        })}
        {data.plan ? null : (
          <li className="contents">
            <div className="t3-dag" data-dag="valfritt">
              <span className="t3-dag-nar">
                <span className="hidden xl:inline">Har du ett prov?</span>
                <span className="xl:hidden">Prov?</span>
                <small>valfritt</small>
              </span>
              <span className="t3-dag-ik">
                <Ikon3 ikon="flagga" size={22} />
              </span>
              <span className="t3-dag-text">
                <b>Vet du vilket test du ska göra?</b>
                <span className="t3-dag-skal">Välj, så föreslår vi vad du övar fram till provdagen.</span>
              </span>
              <Link href={PLAN_HREF} className="t3-dag-ja">
                <span className="hidden xl:inline">Ja, jag vet</span>
                <span className="xl:hidden">Välj</span>
              </Link>
            </div>
          </li>
        )}
      </ol>
    </section>
  )
}

const TYP_ORDNING: readonly TestTypId[] = ['matris', 'figurserie', 'deduktiv', 'verbal', 'numerisk', 'talserie', 'spatial', 'ordforrad']

function AllaTyperRad({ data }: { data: TesterV4Data }) {
  const synliga = TYP_ORDNING.filter((t) => data.typer.some((k) => k.id === t && k.synlig))
  return (
    <div className="t3-radk t3-radk-typer">
      <span className="t3-typikoner" aria-hidden="true">
        {synliga.map((t) => (
          <span key={t} className="t3-typikon">
            <TypSymbol typ={t} size={24} />
          </span>
        ))}
      </span>
      <span className="t3-radk-text">
        <b>{`${versal(ORD[synliga.length] ?? String(synliga.length))} testtyper och personlighetstestet`}</b>
        <small>
          <span className="hidden xl:inline">Figurer, logik, ord och siffror. Du väljer själv under Tester.</span>
          <span className="xl:hidden">Du väljer själv under Tester.</span>
        </small>
      </span>
      <Link href={TESTER_HREF} className="t3-liten" data-ingang="tester">
        <span className="hidden xl:inline">Se alla tester</span>
        <span className="xl:hidden">Se alla</span>
      </Link>
    </div>
  )
}

function Nederst({ data }: { data: TesterV4Data }) {
  const paborjad = data.typer.find((t) => t.synlig && t.niva.status === 'paborjad' && t.niva.svar && t.id !== data.dagens.typ) ?? null
  const f = data.fortsatt
  const p = f?.punkt ?? null
  const harSenaste = !!p && !!p.resultat && !!p.href
  if (!paborjad && !harSenaste) return null

  let senasteRubrik = ''
  if (p && p.resultat) {
    const fore = nivaPunkter(data.kurva, p.typ).filter((x) => x.dag < p.dag || (x.dag === p.dag && x.id !== p.id)).at(-1)?.niva ?? null
    const nivaDel =
      p.niva != null && p.slag !== 'ovningsprov'
        ? fore != null && fore < p.niva
          ? `, nivån steg till ${tal1(p.niva)}`
          : fore != null && fore > p.niva
            ? `, nivån ${tal1(p.niva)}`
            : `, nivån ${tal1(p.niva)}`
        : ''
    senasteRubrik = `${p.resultat.ratt} av ${p.resultat.antal} rätt${nivaDel}`
  }
  const slagText = p?.slag === 'trana' ? 'träningen' : p?.slag === 'nivakoll' ? 'Nivåkollen' : 'övningsprovet'
  const iPlan = (t: TestTypId) => !!data.plan && data.plan.typer.includes(t)
  const nkHref = paborjad ? nivakollHrefV4(paborjad.id) : null

  return (
    <div className="t3-nederst">
      {paborjad && paborjad.niva.svar && nkHref ? (
        <div className="t3-radk">
          <span className="t3-radk-ik" aria-hidden="true">
            <TypSymbol typ={paborjad.id} size={36} />
          </span>
          <span className="t3-radk-text">
            <span className="t3-ogon-matt">Påbörjad</span>
            <b>Nivåkollen i {typNamnSmall(paborjad.id)}</b>
            <small>
              {paborjad.niva.svar.besvarade} av {paborjad.niva.svar.antal} svar, sparade
              <span className="hidden xl:inline">{data.plan && !iPlan(paborjad.id) ? `. Ingår inte i ${data.plan.namn}.` : '.'}</span>
            </small>
          </span>
          <Link href={nkHref} className="t3-liten">
            Fortsätt
          </Link>
        </div>
      ) : null}
      {harSenaste && p && p.resultat && p.href ? (
        <div className="t3-radk">
          <span className="hidden xl:block">
            <Pips ratt={p.resultat.ratt} antal={Math.min(p.resultat.antal, 12)} storlek="stor" />
          </span>
          <span className="t3-radk-text">
            <span className="t3-ogon-matt">
              Senaste {slagText}, {narText(p.dag, data.idag)}
            </span>
            <b>{senasteRubrik}</b>
            <small>{p.slag === 'ovningsprov' ? p.provNamn ?? 'Övningsprov' : `${p.slag === 'trana' ? 'Träning' : 'Nivåkoll'} i ${typNamnSmall(p.typ)}.`}</small>
          </span>
          <Link href={p.href} className="t3-liten">
            <span className="hidden xl:inline">Se uppgifterna</span>
            <span className="xl:hidden">Se</span>
          </Link>
        </div>
      ) : null}
    </div>
  )
}

export default function HemGolv({ data }: { data: TesterV4Data }) {
  const kontext = { planTest: data.plan?.mittTest ?? null, planTyper: data.plan?.typer ?? [] }
  const ny = data.dagens.forstaSteget
  return (
    <IngangarMedMatning className="t3-golv" data-golv="hem">
      <TreMatt data={data} />
      {ny ? <SaHarGarDetTill data={data} /> : <Vagen vagen={data.vagen} idag={data.idag} kontext={kontext} harPlan={!!data.plan} />}
      <GratisRad gratis={data.gratis} planTest={data.plan?.mittTest ?? null} />
      {ny ? <AllaTyperRad data={data} /> : <Nederst data={data} />}
    </IngangarMedMatning>
  )
}
