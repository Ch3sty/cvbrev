'use client'

/**
 * Statistik under Sökta tjänster (skissen Sokta-statistik): tratten från
 * sökt till erbjudande (ersätter Sankey), veckostaplarna med mållinjen för
 * veckans mål, "Hur du sökte" och "Svar per CV". Svarsfrekvensen visas bara
 * här. Telefon: samma innehåll i en kolumn (BYGGSPEC 5).
 */

import { useState, type ReactNode } from 'react'
import {
  VaggHero,
  VaggText,
  VaggBrickLag,
  Golv,
  LyftPanel,
  PanelHuvud,
  Spalter,
  SektionsHuvud,
  Kort,
  Tratt,
  Veckostaplar,
  Kanaler,
  Vaxel,
  LitenKnapp,
  TextLank,
  TomtLage,
  IkonPlus,
  IkonDokument,
} from '@/components/jobb3/kit'
import { cvComparisonMissingText } from '@/lib/applications/cvComparison'
import { langDag, ordtal, type Bricka } from '@/lib/jobbsok'
import type { SoktaTjansterData } from '@/lib/jobbsok/server'
import { KANAL_NAMN, Ordtal, trattTon, uppraknat } from './text'

const brickor = (b: Bricka[]) => b.map((x) => ({ kod: x.bokstaver, ton: trattTon(x.ton) }))

export function StatistikVagg({ data }: { data: SoktaTjansterData }) {
  const { tratt } = data.statistik
  const oppna = data.tjanster.filter((t) => !t.avslutad)
  const intervju = oppna.filter((t) => t.station === 'intervju' || t.station === 'erbjudande')
  const vantar = oppna.filter((t) => t.station === 'sokt')
  const tysta = vantar.filter((t) => t.tyst)
  const avslag = data.tjanster.filter((t) => t.avslutad)

  let rubrik: ReactNode
  let ingress: string
  if (tratt.sokta.antal === 0) {
    rubrik = 'Ingen statistik än'
    ingress = 'Statistiken börjar med din första sökta tjänst. Varje bricka här är en tjänst du har sökt.'
  } else if (tratt.svar.antal === 0) {
    rubrik = tratt.sokta.antal === 1 ? 'Inget svar än' : `Inget svar än på ${ordtal(tratt.sokta.antal)}`
    ingress = 'Svar brukar dröja en till två veckor. Vi säger till när det är dags att följa upp.'
  } else {
    rubrik = (
      <>
        {Ordtal(tratt.svar.antal)} av {ordtal(tratt.sokta.antal)}
        <br />
        har svarat
      </>
    )
    const delar: string[] = []
    if (tratt.intervju.antal) delar.push(`${ordtal(tratt.intervju.antal)} ledde till intervju`)
    if (tratt.svar.avslag) delar.push(`${ordtal(tratt.svar.avslag)} blev avslag`)
    const forsta = delar.join(' och ')
    ingress = `${forsta ? forsta.charAt(0).toUpperCase() + forsta.slice(1) + '. ' : ''}${vantar.length ? `${Ordtal(vantar.length)} väntar du fortfarande på.` : 'Ingen väntar på svar just nu.'}`
  }

  const lag = [
    intervju.length ? { brickor: intervju.slice(0, 4).map((t) => ({ kod: t.bokstaver, ton: 'int' as const })), rubrik: `${intervju.length} i intervju`, text: intervju.slice(0, 2).map((t) => t.company).join(', ') } : null,
    vantar.length ? { brickor: vantar.slice(0, 4).map((t) => ({ kod: t.bokstaver, ton: t.tyst ? ('tyst' as const) : ('vit' as const) })), rubrik: `${vantar.length} väntar svar`, text: tysta.length ? (tysta.length === 1 ? `En har varit tyst i ${tysta[0].dagarTyst} dagar` : `${Ordtal(tysta.length)} har varit tysta i över tolv dagar`) : 'Ingen är tyst än' } : null,
    avslag.length ? { brickor: avslag.slice(0, 3).map((t) => ({ kod: t.bokstaver, ton: 'av' as const })), rubrik: `${avslag.length} avslag`, text: 'Räknas som svar' } : null,
  ].filter((x): x is NonNullable<typeof x> => !!x)

  return (
    <VaggHero
      spalt={420}
      glapp={40}
      bild={
        lag.length ? (
          <div className="hidden flex-wrap items-start justify-end gap-x-8 gap-y-5 xl:flex" style={{ paddingTop: 22 }}>
            {lag.map((l) => (
              <VaggBrickLag key={l.rubrik} brickor={l.brickor} rubrik={l.rubrik} text={l.text} />
            ))}
          </div>
        ) : undefined
      }
    >
      <VaggText ogon="Sökta tjänster · Statistik" rubrik={rubrik} ingress={ingress} />
    </VaggHero>
  )
}

export function StatistikGolv({ data, vaxel, onAndraMal, onLogga }: { data: SoktaTjansterData; vaxel: ReactNode; onAndraMal: () => void; onLogga: () => void }) {
  const s = data.statistik
  const t = s.tratt
  const [per, setPer] = useState<'vecka' | 'manad'>('vecka')
  const mal = data.veckansMal

  if (t.sokta.antal === 0) {
    return (
      <Golv>
        <LyftPanel lyftMobil={28} luft="20px 28px 28px">
          {vaxel}
          <div style={{ marginTop: 18 }}>
            <TomtLage
              ikon={<IkonDokument />}
              rubrik="Ingen statistik än"
              text="Logga din första sökta tjänst, så ritar vi vägen från sökt till erbjudande här."
              handling={
                <LitenKnapp ikon={<IkonPlus />} onClick={onLogga}>
                  Logga sökt tjänst
                </LitenKnapp>
              }
            />
          </div>
        </LyftPanel>
      </Golv>
    )
  }

  const etikett = `${Ordtal(t.sokta.antal)} sökta. ${t.svar.antal} har svarat. ${t.intervju.antal} har lett till intervju. ${t.erbjudande.antal ? `${t.erbjudande.antal} erbjudande.` : 'Inget erbjudande än.'}`
  const skaSokas = data.lista.ska_sokas.filter((r) => !r.passerad).length

  const staplar =
    per === 'vecka'
      ? s.veckostaplar.map((v) => ({ etikett: `v. ${v.vecka}`, nu: v.arNu, brickor: brickor(v.brickor) }))
      : s.manadsstaplar.map((m) => ({ etikett: m.etikett.replace(', nu', '').slice(0, 3).toLowerCase(), nu: m.arNu, brickor: brickor(m.brickor) }))
  const aktiva = s.veckostaplar.filter((v) => v.brickor.length > 0).length
  const underVecka = `${Ordtal(t.sokta.antal)} sökta tjänster på ${s.veckostaplar.length} ${s.veckostaplar.length === 1 ? 'vecka' : 'veckor'}${aktiva < s.veckostaplar.length ? `, ${ordtal(aktiva)} av dem med minst en` : ''}.`

  return (
    <Golv>
      <LyftPanel lyftMobil={28} luft="20px 28px 28px" rubrikId="tratt-rubrik">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          {vaxel}
          {s.forstaSokt ? <p className="j3-text">Sedan din första sökta tjänst, {langDag(s.forstaSokt)}</p> : null}
        </div>
        <div style={{ marginTop: 26 }}>
          <PanelHuvud rubrik="Från sökt till erbjudande" rubrikId="tratt-rubrik" under="Varje bricka är en sökt tjänst. Följ dem från vänster till höger." />
        </div>
        <div style={{ marginTop: 22 }}>
          <Tratt
            etikett={etikett}
            mellan={[`${t.svar.antal} av ${t.sokta.antal}`, `${t.intervju.antal} av ${t.svar.antal}`, t.erbjudande.antal ? `${t.erbjudande.antal} av ${t.intervju.antal}` : 'väntar']}
            led={[
              { tal: t.sokta.antal, namn: 'Sökta', under: t.sokta.sedan ? `Sedan ${langDag(t.sokta.sedan)}` : undefined, brickor: brickor(t.sokta.brickor) },
              { tal: t.svar.antal, namn: 'Fått svar', under: svarUnder(t.svar.kallelser, t.svar.avslag), brickor: brickor(t.svar.brickor) },
              { tal: t.intervju.antal, namn: 'Intervju', under: intervjuUnder(t.intervju.genomforda, t.intervju.bokade, t.intervju.antal), brickor: brickor(t.intervju.brickor) },
              { tal: t.erbjudande.antal, namn: 'Erbjudande', under: t.erbjudande.antal ? undefined : 'Inget än', brickor: brickor(t.erbjudande.brickor), mal: true },
            ]}
          />
        </div>
      </LyftPanel>

      <Spalter sido={400} topp={48}>
        <section aria-labelledby="vecka-rubrik">
          <SektionsHuvud
            rubrikId="vecka-rubrik"
            rubrik={per === 'vecka' ? 'Aktivitet per vecka' : 'Aktivitet per månad'}
            under={underVecka}
            underAlltid
            hoger={<Vaxel etikett="Period" variant="liten" valt={per} onVal={(v) => setPer(v as 'vecka' | 'manad')} val={[{ id: 'vecka', text: 'Vecka' }, { id: 'manad', text: 'Månad' }]} />}
          />
          <Kort luft>
            <div className={per === 'manad' ? 'j3-b-utan-mal' : undefined}>
              <Veckostaplar
                etikett={`Sökta tjänster per ${per === 'vecka' ? 'vecka' : 'månad'}: ${staplar.map((v) => `${v.etikett} ${v.brickor.length}`).join(', ')}.${per === 'vecka' ? ` Veckans mål är ${mal.mal}.` : ''}`}
                mal={per === 'vecka' ? mal.mal : 0}
                veckor={staplar}
              />
            </div>
            <p className="j3-text j3-b-stapelfot">
              {mal.klart ? `Veckans mål klart: ${mal.sokta} av ${mal.mal}.` : `${Ordtal(mal.kvar)} till den här veckan så når du målet.`}
              {skaSokas ? ` ${Ordtal(skaSokas)} ${skaSokas === 1 ? 'sparad ligger' : 'sparade ligger'} under Ska sökas.` : ''}{' '}
              <TextLank onClick={onAndraMal}>Ändra målet</TextLank>
            </p>
          </Kort>
        </section>
        <aside className="flex flex-col gap-8">
          <section aria-labelledby="kanal-rubrik">
            <SektionsHuvud rubrikId="kanal-rubrik" rubrik="Hur du sökte" />
            <Kort luft>
              <Kanaler kanaler={s.kanaler.map((k) => ({ namn: KANAL_NAMN[k.kanal], antal: k.antal }))} />
            </Kort>
          </section>
          <section aria-labelledby="cv-rubrik">
            <SektionsHuvud rubrikId="cv-rubrik" rubrik="Svar per CV" />
            <SvarPerCv data={data} />
          </section>
        </aside>
      </Spalter>
    </Golv>
  )
}

function svarUnder(kallelser: number, avslag: number): string {
  const d: string[] = []
  if (kallelser) d.push(kallelser === 1 ? '1 kallelse' : `${kallelser} kallelser`)
  if (avslag) d.push(`${avslag} avslag`)
  return d.length ? d.join(', ') : 'Inget svar än'
}

function intervjuUnder(genomforda: number, bokade: number, antal: number): string {
  if (!antal) return 'Ingen än'
  const d: string[] = []
  if (genomforda) d.push(`${genomforda} genomförd${genomforda === 1 ? '' : 'a'}`)
  if (bokade) d.push(`${bokade} bokad${bokade === 1 ? '' : 'e'}`)
  return d.length ? d.join(', ') : `${antal} kallad${antal === 1 ? '' : 'e'}`
}

/** Svar per CV (dagens CV-jämförelse) med sitt tomma läge. */
function SvarPerCv({ data }: { data: SoktaTjansterData }) {
  const j = data.statistik.cvJamforelse
  if (!j.hasEnoughData) {
    return (
      <Kort ton="streckad" luft>
        <div className="j3-b-cvtom" aria-hidden="true">
          <span className="j3-b-cvtom-ark">
            <i />
            <i />
            <i />
          </span>
          <span className="j3-b-cvtom-fraga">?</span>
        </div>
        <p className="j3-h3" style={{ marginTop: 14 }}>
          Vilket CV ger flest svar?
        </p>
        <p className="j3-text" style={{ marginTop: 6 }}>
          {cvComparisonMissingText(j)}
        </p>
        <div style={{ marginTop: 14 }}>
          <LitenKnapp href="/dashboard/skapa-cv">Till ditt CV</LitenKnapp>
        </div>
      </Kort>
    )
  }
  return (
    <Kort luft>
      <p className="j3-text">Så många av de sökta tjänsterna med varje CV som har fått svar.</p>
      <ul className="j3-b-cv">
        {j.rows.map((r, i) => (
          <li key={r.cvId}>
            <div className="j3-b-cv-topp">
              <b>{r.name}</b>
              <span>{r.replyRate} %</span>
            </div>
            <div className="j3-b-cv-spar" aria-hidden="true">
              <i className={i === 0 ? 'basta' : undefined} style={{ width: `${Math.max(r.replyRate, 2)}%` }} />
            </div>
            <small>
              {r.replies} svar på {r.applications} {r.applications === 1 ? 'sökt tjänst' : 'sökta tjänster'}
            </small>
          </li>
        ))}
      </ul>
      {j.unknownCvCount > 0 ? (
        <p className="j3-text j3-b-stapelfot">
          {j.unknownCvCount === 1 ? '1 sökt tjänst saknar valt CV och räknas inte här.' : `${j.unknownCvCount} sökta tjänster saknar valt CV och räknas inte här.`}
        </p>
      ) : null}
    </Kort>
  )
}
