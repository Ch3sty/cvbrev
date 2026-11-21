/**
 * Ditt intervjusvar, bedömt, i rummets form (skissen Intervju-bedomt).
 * Serverkomponent. Allt som visas är det som är lagrat på raden:
 *
 *   väggen   betyget som prickar, "upp från" bara när ett tidigare försök på
 *            samma fråga finns, och det rekryteraren hörde (STAR-delarna eller
 *            återkopplingens rubriker)
 *   panelen  Det som fungerar och Det som saknas
 *   golvet   det omskrivna svaret med hakparenteser, hela återkopplingen och
 *            svaret som det skrevs (hopfällda), nästa fråga och intervjun
 *
 * Texterna som fanns förut (COPY.sida) står kvar.
 */

import Topprad from '@/components/rum/Topprad'
import {
  Bedomning,
  Bricka,
  GlasKnapp,
  Golv,
  Hak,
  IkonNed,
  IkonPil,
  IkonPilUpp,
  JobbVagg,
  Kort,
  LinjeratSvar,
  LyftPanel,
  Prickar,
  Punkter,
  Rutor,
  SektionsHuvud,
  Spalter,
  StarBrickor,
  StorKnapp,
  TextLank,
  UppMarke,
  VaggHero,
  VaggText,
} from '@/components/jobb3/kit'
import { FRAGOR } from '@/components/artiklar/intervjuprov/fragor'
import { COPY } from '@/components/artiklar/intervjuprov/intervjuprov-copy'
import type { IntervjuRad } from '@/lib/intervju/rad'
import { klippNiva } from '@/lib/intervju/validering'
import { INFOR_INTERVJUN_HREF, nyttProvHref } from '@/lib/intervju/lankar'
import { rekommenderadFraga, type ProvSammanfattning } from '@/lib/intervju/nasta'
import { klockslag, senastePerFraga, tjanstHref, veckodagNamn } from '@/lib/jobbsok'
import type { IntervjuPaGang } from '@/lib/jobbsok/intervju'
import { BEDOMT, nivaOrd, saknadDel, starUtfall } from './text'

const S = COPY.sida

function svensktDatum(iso: string): string {
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'long', timeZone: 'Europe/Stockholm' }).format(new Date(iso))
}

/** Hakparenteserna i det omskrivna svaret markeras så att de syns. */
function medHak(text: string) {
  return text.split(/(\[[^\]]{1,80}\])/g).map((del, i) => (/^\[[^\]]+\]$/.test(del) ? <Hak key={i}>{del}</Hak> : <span key={i}>{del}</span>))
}

export default function BedomtVy({ rad, prov, intervjuer }: { rad: IntervjuRad; prov: ProvSammanfattning[]; intervjuer: IntervjuPaGang[] }) {
  const fraga = FRAGOR[rad.question]
  const niva = klippNiva(rad.level)
  const punkter = rad.full?.points ?? []

  // Förra försöket på samma fråga: bara när det finns ett äldre prov.
  const forra = prov.find((p) => p.question === rad.question && p.token !== rad.token && p.createdAt < rad.created_at) ?? null
  // Nästa fråga räknas med det här provet inräknat (det kan saknas i listan om det är nytt).
  const medDetta: ProvSammanfattning[] = prov.some((p) => p.token === rad.token)
    ? prov
    : [{ token: rad.token, question: rad.question, level: rad.level, missingKind: rad.missing_kind, createdAt: rad.created_at }, ...prov]
  const nasta = rekommenderadFraga(medDetta)
  const ovade = senastePerFraga(medDetta).size
  const bokad = intervjuer.find((i) => i.lage === 'bokad') ?? null
  const infor = bokad?.dag ? veckodagNamn(bokad.dag) : null
  const kl = bokad ? klockslag(bokad.tid) : null
  const saknas = niva < 5 ? saknadDel(rad.missing_kind) : null

  const hordes = (
    <div className="w-full xl:w-[520px]">
      <p className="j3-vaggtext-rad">{BEDOMT.hordes}</p>
      {fraga.starChips ? (
        <div className="mt-5 xl:mt-[22px]">
          <StarBrickor pa="vagg" delar={starUtfall(saknas)} />
        </div>
      ) : (
        <Punkter vagg punkter={punkter.slice(0, 4).map((p, i) => ({ ikon: <b>{i + 1}</b>, text: p.title }))} />
      )}
    </div>
  )

  return (
    <>
      <JobbVagg
        hojd={460}
        hojdMobil={420}
        flik={false}
        tillbaka={{ href: INFOR_INTERVJUN_HREF, text: S.eyebrow }}
        handling={<GlasKnapp href={nyttProvHref(rad.question)}>{BEDOMT.igen}</GlasKnapp>}
        atgarder={<Topprad bara="atgarder" />}
      >
        <VaggHero spalt={560} glapp={40} topp={26} bild={hordes}>
          <VaggText
            ogon={BEDOMT.ogon(fraga.kort)}
            rubrik={
              <span className="flex flex-col gap-3 xl:gap-[18px]">
                <span className="flex flex-wrap items-center gap-4 xl:gap-[22px]">
                  <Prickar antal={niva} variant="stor" etikett={`${niva} av 5`} />
                  {forra ? (
                    <UppMarke>
                      {forra.level < niva ? <IkonPilUpp size={14} /> : null}
                      {forra.level < niva ? BEDOMT.upp(forra.level) : `förra gången ${forra.level} av 5`}
                    </UppMarke>
                  ) : null}
                </span>
                {`${nivaOrd(niva)}, ${niva} av 5`}
              </span>
            }
            ingress={rad.summary}
          />
        </VaggHero>
      </JobbVagg>

      <Golv>
        <Spalter sido={360} tat>
          <div>
            <LyftPanel etikett="Återkopplingen" luft="22px">
              <div className="grid gap-3.5 xl:grid-cols-2">
                <Bedomning rubrik={COPY.punkt.fungerar} punkter={[rad.works]} />
                <Bedomning saknas rubrik={COPY.punkt.saknas} punkter={[rad.missing]} />
              </div>
            </LyftPanel>

            <section className="mt-[30px] xl:mt-11" aria-labelledby="omskrivet-rubrik">
              <SektionsHuvud rubrik={S.omskrivet} rubrikId="omskrivet-rubrik" under={rad.improved_why ?? undefined} underAlltid hoger={rad.expires_at ? <span className="j3-text">{S.sparasTill(svensktDatum(rad.expires_at))}</span> : undefined} />
              <div className="mt-[18px]">
                <LinjeratSvar>
                  <p className="whitespace-pre-line">{medHak(rad.improved_answer)}</p>
                </LinjeratSvar>
              </div>
              <p className="j3c-hakrad">
                <span className="j3-hak" aria-hidden="true">
                  {BEDOMT.hak}
                </span>
                {S.platshallare}
              </p>
            </section>

            <div className="mt-7">
              <Kort lista>
                <details className="j3c-fall">
                  <summary>
                    {fraga.starChips ? S.aterkopplingStar : S.aterkoppling}
                    <IkonNed size={22} />
                  </summary>
                  <div className="j3c-fall-inre">
                    <ol>
                      {punkter.map((p, i) => (
                        <li key={i}>
                          <b>{`${i + 1}. ${p.title}`}</b>
                          <p>{p.text}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </details>
                <details className="j3c-fall">
                  <summary>
                    {BEDOMT.somDuSkrev}
                    <IkonNed size={22} />
                  </summary>
                  <div className="j3c-fall-inre">
                    <p>{rad.answer}</p>
                  </div>
                </details>
              </Kort>
            </div>
          </div>

          <aside className="mt-[30px] flex flex-col gap-4 xl:mt-7" aria-label="Nästa steg">
            <div className="j3c-nasta">
              <p className="j3-ogon">{BEDOMT.nastaOgon}</p>
              <b className="rubrik">{FRAGOR[nasta].kort}</b>
              <p>{FRAGOR[nasta].beskrivning}</p>
              <div className="mt-4">
                <Rutor antal={ovade} av={7} variant="morkt" etikett={`${ovade} av sju övade`} />
              </div>
              <p className="stark">{BEDOMT.ovade(ovade, infor)}</p>
              <div className="mt-[18px]">
                <StorKnapp bred href={nyttProvHref(nasta)}>
                  {S.knapp}
                  <IkonPil />
                </StorKnapp>
              </div>
            </div>
            {bokad ? (
              <Kort luft>
                <div className="flex items-center gap-3.5">
                  <Bricka kod={bokad.bokstaver} />
                  <span className="min-w-0">
                    <b className="block text-[15px] leading-5">{`${bokad.company}${infor ? `, ${infor}${kl ? ` ${kl}` : ''}` : ''}`}</b>
                    <TextLank href={tjanstHref(bokad.id, 'forbered')}>{BEDOMT.forberedelsen}</TextLank>
                  </span>
                </div>
              </Kort>
            ) : null}
            <div className="flex flex-wrap items-center gap-x-2 px-1">
              <p className="j3-fin">{S.rad}</p>
              <TextLank liten href={INFOR_INTERVJUN_HREF}>
                {S.radLank}
              </TextLank>
            </div>
          </aside>
        </Spalter>
      </Golv>
    </>
  )
}
