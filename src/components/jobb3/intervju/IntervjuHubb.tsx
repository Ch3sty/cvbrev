/**
 * Inför intervjun i rummets form (skissen Intervju och Mobil-intervju,
 * BYGGSPEC F6). Serverkomponent: allt ritas från serverns data.
 *
 *   väggen   intervjun på gång (eller rummets namn), de sju frågorna som bana
 *            och vyns enda primärknapp (dagens Nästa handling)
 *   panelen  nästa fråga med förra svaret del för del, vit knapp
 *   golvet   Intervjuer på gång, Dina intervjuprov, personlighetsprofilen
 *            och gratisnivåns kvotrad
 *
 * Gratisgränsen (ett prov per dygn) och mätningen är dagens; texten ur
 * infor-intervjun-copy.ts.
 */

import Topprad from '@/components/rum/Topprad'
import {
  Faktorer,
  FrageBana,
  GlasKnapp,
  Golv,
  IkonKlocka,
  IkonPil,
  JobbVagg,
  Knapprad,
  Kort,
  LitenKnapp,
  LyftPanel,
  PanelHuvud,
  Prickar,
  Rutor,
  SektionsHuvud,
  SidoRad,
  Spalter,
  StarBrickor,
  StorKnapp,
  TextLank,
  TjanstRad,
  TomtLage,
  TonYta,
  VaggHero,
  VaggText,
  type Fraga,
} from '@/components/jobb3/kit'
import { FRAGA_ORDNING, FRAGOR, type FragaId } from '@/components/artiklar/intervjuprov/fragor'
import { archetypeFor } from '@/lib/recruiter/workStyle'
import { faktorUtfall, profilRubrik } from '@/lib/personlighet/smakprov-tolkning'
import { FORDJUPAT_HREF, GRUNDTEST_HREF, nyttProvHref, profilHref, provHref } from '@/lib/intervju/lankar'
import { dagEtikett, nar, rekommenderadFraga, saknadesFras, type HubbHandling, type ProvSammanfattning } from '@/lib/intervju/nasta'
import { idagSv, intervjuEtikett, klockslag, langDag, narText, senastePerFraga, tjanstHref, veckodagNamn } from '@/lib/jobbsok'
import type { IntervjuPaGang } from '@/lib/jobbsok/intervju'
import { PRISER_HREF } from '@/lib/onboarding/steps'
import type { InforIntervjunData } from '@/app/dashboard/intervju/getInforIntervjunData'
import { KVOT, LISTA, NASTA, PROFIL, SIDA, TOM } from '@/app/dashboard/intervju/infor-intervjun-copy'
import { HUBB, nivaOrd, saknadDel, starUtfall, storBokstav, talOrd } from './text'

function datum(iso: string | null): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short', timeZone: 'Europe/Stockholm' }).format(new Date(iso)).replace('.', '')
}

/** Dagens Nästa handling, ordagrant som förut. */
function handlingensCopy(h: HubbHandling, kvotKvar: boolean, utanTak: boolean, now: Date) {
  switch (h.kind) {
    case 'forstaGang':
      return { ogon: NASTA.forstaGang.eyebrow, rubrik: NASTA.forstaGang.rubrik, text: NASTA.forstaGangText(kvotKvar, utanTak), knapp: NASTA.forstaGang.knapp, href: nyttProvHref('beratta'), fraga: 'beratta' as FragaId }
    case 'omskrivning':
      return { ogon: 'Nästa fråga', rubrik: NASTA.omskrivning.rubrik(h.prov.question), text: NASTA.omskrivning.text(h.prov.level, nar(h.prov.createdAt, now), h.prov.missingKind, h.prov.question), knapp: NASTA.omskrivning.knapp, href: nyttProvHref(h.prov.question), fraga: h.prov.question }
    case 'lasIgen':
      return { ogon: 'Nästa fråga', rubrik: NASTA.omskrivning.rubrik(h.prov.question), text: `${NASTA.omskrivning.text(h.prov.level, nar(h.prov.createdAt, now), h.prov.missingKind, h.prov.question)} ${NASTA.lasIgen.tillagg}`, knapp: NASTA.lasIgen.knapp, href: provHref(h.prov.token), fraga: h.prov.question }
    case 'nyFraga':
      return { ogon: 'Nästa fråga', rubrik: NASTA.nyFraga.rubrik(h.fraga), text: NASTA.nyFraga.text(h.fraga), knapp: NASTA.nyFraga.knapp, href: nyttProvHref(h.fraga), fraga: h.fraga }
    case 'helaTestet':
      return { ogon: 'Nästa steg', rubrik: NASTA.helaTestet.rubrik, text: NASTA.helaTestet.text, knapp: NASTA.helaTestet.knapp, href: GRUNDTEST_HREF, fraga: null }
  }
}

/** Raden bredvid primärknappen: frågan och det som saknades. */
function knappRad(h: HubbHandling): string | null {
  if (h.kind === 'omskrivning' || h.kind === 'lasIgen') {
    const f = saknadesFras(h.prov.missingKind, h.prov.question)
    return `${FRAGOR[h.prov.question].kort}. Förra gången saknades ${f}.`
  }
  if (h.kind === 'nyFraga') return FRAGOR[h.fraga].kort
  return null
}

function intervjuKnapp(i: IntervjuPaGang) {
  if (i.lage === 'bokad') return { text: 'Förbered intervjun', href: tjanstHref(i.id, 'forbered') }
  if (i.lage === 'hur_gick') return { text: 'Hur gick det?', href: tjanstHref(i.id, 'hur-gick') }
  if (i.lage === 'utan_tid') return { text: 'Sätt tid', href: tjanstHref(i.id, 'andra-tid') }
  return { text: 'Hur gick det?', href: tjanstHref(i.id) }
}

export default function IntervjuHubb({ data, intervjuer, now }: { data: InforIntervjunData; intervjuer: IntervjuPaGang[]; now: Date }) {
  const c = handlingensCopy(data.handling, data.kvotKvar, data.utanTak, now)
  const senaste = senastePerFraga(data.prov)
  const ovade = senaste.size
  const nastaFraga: FragaId | null = c.fraga ?? (data.prov.length ? rekommenderadFraga(data.prov) : null)
  const kvotSlut = !data.utanTak && !data.kvotKvar

  // Intervjun som väggen handlar om: den närmaste bokade.
  const bokad = intervjuer.find((i) => i.lage === 'bokad' && i.dag) ?? null
  const idag = idagSv(now)
  const narDag = bokad?.dag ? narText(bokad.dag, idag) : null
  const kl = bokad ? klockslag(bokad.tid) : null

  const fragor: Fraga[] = FRAGA_ORDNING.map((f, i) => {
    const p = senaste.get(f)
    const arNasta = f === nastaFraga
    const saknas = p && p.level < 5 && p.missingKind ? saknadesFras(p.missingKind, f) : null
    return {
      nr: i + 1,
      rubrik: FRAGOR[f].kort,
      href: p && !arNasta ? provHref(p.token) : nyttProvHref(f),
      lage: arNasta ? 'nasta' : p ? 'klar' : 'ny',
      betyg: p?.level,
      betygOrd: p ? nivaOrd(p.level) : undefined,
      under: p ? (arNasta && saknas ? `${saknas} saknades` : undefined) : HUBB.inteGjord,
      underKoppar: Boolean(p && arNasta),
    }
  })

  const ogon = bokad?.dagarKvar != null
    ? `${bokad.dagarKvar === 0 ? 'Intervju i dag' : bokad.dagarKvar === 1 ? 'Intervju i morgon' : `Intervju om ${bokad.dagarKvar} dagar`} · ${talOrd(ovade)} av sju frågor övade`
    : ovade === 0 ? 'Sju frågor som nästan alltid kommer' : `${storBokstav(talOrd(ovade))} av sju frågor övade`
  const ogonMobil = bokad?.dagarKvar != null ? (bokad.dagarKvar === 0 ? 'Intervju i dag' : bokad.dagarKvar === 1 ? 'Intervju i morgon' : `Intervju om ${bokad.dagarKvar} dagar`) : undefined
  const rubrik = bokad && narDag ? `Intervju på ${bokad.company} ${narDag}` : SIDA.titel
  const narMening = bokad?.dag ? `${bokad.jobTitle}, ${veckodagNamn(bokad.dag)} ${langDag(bokad.dag)}${kl ? ` klockan ${kl}` : ''}.` : null
  const ingress = narMening
    ? `${narMening} Öva på frågorna du kommer att få, och se vad rekryteraren hör i dina svar.`
    : data.utanTak && data.scope
      ? SIDA.beskrivningUtanTak(data.scope)
      : SIDA.beskrivning
  const ingressMobil = narMening ?? undefined

  // Förra svaret på nästa fråga, del för del (bara det som är lagrat).
  const forra = nastaFraga ? senaste.get(nastaFraga) ?? null : null
  const visaForra = forra && (data.handling.kind === 'omskrivning' || data.handling.kind === 'lasIgen')

  return (
    <>
      <JobbVagg
        hojd={612}
        hojdMobil={432}
        flik="intervju"
        handling={<GlasKnapp href={nyttProvHref()}>{NASTA.sekundar}</GlasKnapp>}
        atgarder={<Topprad bara="atgarder" />}
      >
        <VaggHero spalt={480} glapp={28} bild={<FrageBana fragor={fragor} intervju={bokad?.tid ? { rubrik: 'Intervjun', under: intervjuEtikett(bokad.tid) ?? undefined } : undefined} />}>
          <VaggText
            ogon={ogon}
            ogonMobil={ogonMobil}
            ogonHoger={<span className="xl:hidden"><span className="j3-mal-kort">{HUBB.ovadeKort(ovade)}</span></span>}
            rubrik={rubrik}
            ingress={ingress}
            ingressMobil={ingressMobil}
          />
          <Knapprad rad={knappRad(data.handling)}>
            <StorKnapp href={c.href}>
              {data.handling.kind === 'omskrivning' || data.handling.kind === 'nyFraga' ? 'Öva på nästa fråga' : c.knapp}
              <IkonPil />
            </StorKnapp>
          </Knapprad>
        </VaggHero>
      </JobbVagg>

      <Golv>
        <LyftPanel rubrikId="nasta-rubrik" luft="24px 28px 28px">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_436px] xl:items-center xl:gap-8">
            <div>
              <PanelHuvud ogon={c.ogon} rubrik={c.rubrik} rubrikId="nasta-rubrik" under={c.text} />
              <div className="mt-4 hidden flex-wrap items-center gap-[18px] xl:flex">
                <LitenKnapp href={c.href}>{c.knapp}</LitenKnapp>
                <TextLank href={nyttProvHref()}>{NASTA.sekundar}</TextLank>
              </div>
            </div>
            {visaForra && forra ? (
              <TonYta>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <b className="text-[13px] leading-[18px]">{HUBB.forraDelar}</b>
                  <span className="flex items-center gap-2 text-[13px] font-semibold leading-[18px] text-[var(--j3-ink-2)]">
                    <Prickar antal={forra.level} etikett={`${forra.level} av 5`} />
                    {nivaOrd(forra.level)}
                  </span>
                </div>
                {FRAGOR[forra.question].starChips ? (
                  <StarBrickor delar={starUtfall(saknadDel(forra.missingKind))} />
                ) : (
                  <p className="j3-text">{`${storBokstav(saknadesFras(forra.missingKind, forra.question))} saknades ${nar(forra.createdAt, now)}.`}</p>
                )}
              </TonYta>
            ) : null}
            <div className="flex justify-center xl:hidden">
              <TextLank href={nyttProvHref()}>{NASTA.sekundar}</TextLank>
            </div>
          </div>
        </LyftPanel>

        <Spalter sido={400}>
          <div>
            {intervjuer.length > 0 ? (
              <section aria-labelledby="pagang-rubrik">
                <SektionsHuvud rubrik={HUBB.pagang} rubrikId="pagang-rubrik" under={HUBB.pagangUnder} />
                <div className="mt-[18px]">
                  <Kort lista>
                    {intervjuer.map((i) => {
                      const k = intervjuKnapp(i)
                      return (
                        <TjanstRad
                          key={i.id}
                          bricka={{ kod: i.bokstaver }}
                          rubrik={`${i.company}, ${i.jobTitle}`}
                          text={
                            i.lage === 'bokad' ? (
                              <>
                                {i.text}
                                <span className="mt-2 flex items-center gap-2.5">
                                  <Rutor antal={ovade} av={7} etikett={HUBB.ovade(ovade)} />
                                  <span aria-hidden="true">{HUBB.ovadeKort(ovade)}</span>
                                </span>
                              </>
                            ) : (
                              i.text
                            )
                          }
                          href={tjanstHref(i.id)}
                          handling={<LitenKnapp href={k.href}>{k.text}</LitenKnapp>}
                        />
                      )
                    })}
                  </Kort>
                </div>
              </section>
            ) : null}

            <section aria-labelledby="prov-rubrik" className={intervjuer.length > 0 ? 'mt-[30px] xl:mt-11' : ''}>
              <SektionsHuvud rubrik={LISTA.etikett} rubrikId="prov-rubrik" hoger={<span className="hidden xl:inline"><span className="j3-text">{HUBB.utanTak}</span></span>} />
              <div className="mt-[18px]">
                {data.prov.length > 0 ? (
                  <Kort lista>
                    {data.prov.map((p: ProvSammanfattning) => (
                      <SidoRad
                        key={p.token}
                        figur={<Prickar antal={Math.min(5, Math.max(1, Math.round(p.level)))} etikett={LISTA.sr(Math.min(5, Math.max(1, Math.round(p.level))))} />}
                        rubrik={FRAGOR[p.question].kort}
                        text={`${nivaOrd(p.level)}, ${dagEtikett(p.createdAt, now).toLocaleLowerCase('sv-SE')}.${p.level < 5 && p.missingKind ? ` ${storBokstav(saknadesFras(p.missingKind, p.question))} saknades.` : ''}`}
                        href={provHref(p.token)}
                        hoger={<span className="hidden xl:inline"><span className="j3-lank">{LISTA.oppna}</span></span>}
                      />
                    ))}
                  </Kort>
                ) : (
                  <TomtLage rubrik={TOM.rubrik} text={TOM.textFor(data.utanTak)} handling={<LitenKnapp href={nyttProvHref('beratta')}>{NASTA.forstaGang.knapp}</LitenKnapp>} />
                )}
              </div>
            </section>
          </div>

          <aside aria-labelledby="profil-rubrik" className="mt-[30px] xl:mt-0">
            <SektionsHuvud rubrik={PROFIL.etikett} rubrikId="profil-rubrik" under={HUBB.profilUnder} underAlltid />
            <div className="mt-[18px]">
              <ProfilKort data={data} />
            </div>
          </aside>
        </Spalter>

        {data.utanTak ? null : (
          <div className="mt-[30px] xl:mt-10">
            <Kort ton="streckad" luft>
              <p className="j3-eyebrow">{HUBB.gratis}</p>
              <div className="mt-3 flex items-start gap-3">
                <span className="j3-sido-ik" aria-hidden="true">
                  <IkonKlocka size={20} />
                </span>
                <p className="j3-text">{kvotSlut ? KVOT.slut : KVOT.kvar}</p>
              </div>
              <div className="mt-2">
                <TextLank href={PRISER_HREF}>{KVOT.lank}</TextLank>
              </div>
            </Kort>
          </div>
        )}
      </Golv>
    </>
  )
}

/** Personlighetsprofilen i tre lägen, som förut: riktig profil, smakprov eller ingen. */
function ProfilKort({ data }: { data: InforIntervjunData }) {
  const { profil, smakprov, harFordjupat } = data
  if (profil) {
    const grund = profil.testType === 'personlighet-grund'
    const slug = grund ? 'personlighet-grund' : 'personlighet-avancerad'
    const analysHref = profil.sessionId ? `/dashboard/tester/${slug}/test/${profil.sessionId}/results` : `/dashboard/tester/${slug}`
    const d = profil.completedAt ? datum(profil.completedAt) : ''
    return (
      <Kort luft>
        <p className="j3-eyebrow">{grund ? PROFIL.grund.meta(d) : PROFIL.avancerad.meta(d)}</p>
        <div className="mt-4">
          <Faktorer faktorer={faktorUtfall(profil.scores).map((f) => ({ namn: f.namn, niva: f.segment, ord: f.bandOrd }))} />
        </div>
        <div className="mt-4 border-t-2 border-[var(--j3-linje)] pt-3.5"><p className="j3-text">{archetypeFor(profil.scores).title}</p></div>
        <div className="mt-3.5 flex flex-col items-start gap-2.5">
          <TextLank href={analysHref}>{PROFIL.lankAnalys}</TextLank>
          <TextLank href="/dashboard/arbetsstil">{PROFIL.lankArbetsstil}</TextLank>
          {grund ? harFordjupat ? <TextLank href={FORDJUPAT_HREF}>{PROFIL.lankFordjupat}</TextLank> : <span className="j3-fin">{PROFIL.fordjupatIngar}</span> : null}
        </div>
      </Kort>
    )
  }
  if (smakprov) {
    return (
      <Kort luft>
        <p className="j3-eyebrow">{PROFIL.smakprov.meta(datum(smakprov.createdAt))}</p>
        <div className="mt-4">
          <Faktorer faktorer={faktorUtfall(smakprov.scores).map((f) => ({ namn: f.namn, niva: f.segment, ord: f.bandOrd }))} />
        </div>
        <div className="mt-4 border-t-2 border-[var(--j3-linje)] pt-3.5"><p className="j3-text">{profilRubrik(smakprov.scores)}</p></div>
        <div className="mt-3.5 flex flex-col items-start gap-2.5">
          <TextLank href={profilHref(smakprov.token)}>{PROFIL.smakprov.lankTolkning}</TextLank>
          <TextLank href={GRUNDTEST_HREF}>{PROFIL.smakprov.lankHelaTestet}</TextLank>
        </div>
      </Kort>
    )
  }
  return (
    <Kort luft>
      <b className="j3c-kortrubrik">{PROFIL.tom.rubrik}</b>
      <div className="mb-4 mt-1.5">
        <p className="j3-text">{PROFIL.tom.text}</p>
      </div>
      <LitenKnapp href={GRUNDTEST_HREF}>{PROFIL.tom.lank}</LitenKnapp>
    </Kort>
  )
}
