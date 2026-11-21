/**
 * "Nya jobb som passar dig" på Översikt (Main). Egen serverkomponent i en
 * egen Suspense-gräns: hamtaToppTraffar läser sammanfattningen av senaste
 * körningen (aldrig hela körningen), så väggen och Att göra nu väntar aldrig
 * på den.
 * Gratisnivån får aldrig fler än de tre som visas i klartext (laddaren).
 */
import { hamtaToppTraffar } from '@/lib/jobbsok/server'
import { JOBB_HREF, SISTA_DAG_INOM_DAGAR, jobbHref, plusDagar } from '@/lib/jobbsok'
import { Avsnitt, LitenKnapp, SektionsHuvud, Skel, TomtLage, TraffKort, Traffar, IkonSok } from '@/components/jobb3/kit'
import { traffUnderMedSedan } from './oversikt'
import { traffRubrikNya } from '@/lib/rum/nyaTraffar'

export async function NyaTraffar({ userId, idag }: { userId: string; idag: string }) {
  const t = await hamtaToppTraffar(userId, 3).catch((err) => {
    console.error('[oversikt] Toppträffarna kunde inte läsas:', err)
    return null
  })

  if (!t || t.traffar.length === 0) {
    return (
      <Avsnitt rubrikId="nya-rubrik">
        <SektionsHuvud rubrikId="nya-rubrik" rubrik="Jobb som passar dig" />
        <TomtLage
          ikon={<IkonSok />}
          rubrik={t && t.lasta > 0 ? 'Inget passade i senaste sökningen' : 'Vi har inte letat än'}
          text={
            t && t.lasta > 0
              ? 'Vidga orterna eller rätta det vi läste ur ditt CV, så söker vi igen.'
              : 'Vi läser ditt CV mot Arbetsförmedlingens annonser och säger varför varje träff passar.'
          }
          handling={<LitenKnapp href={JOBB_HREF}>{t && t.lasta > 0 ? 'Till Matchade jobb' : 'Hitta jobb som passar'}</LitenKnapp>}
        />
      </Avsnitt>
    )
  }

  return (
    <Avsnitt rubrikId="nya-rubrik">
      <SektionsHuvud
        rubrikId="nya-rubrik"
        rubrik={traffRubrikNya({ basta: t.basta, nya: t.nya })}
        under={traffUnderMedSedan(t.lasta, t.kordAt, idag, t.nya, t.seddaAt)}
        lank={{ href: JOBB_HREF, text: t.basta === 1 ? '1 träff' : `Alla ${t.basta} träffar`, textMobil: t.basta === 1 ? '1 träff' : `Alla ${t.basta}` }}
      />
      <Traffar>
        {t.traffar.map((x) => {
          const plats = [x.company, x.distans ? 'distans' : x.ort].filter(Boolean).join(', ')
          return (
            <TraffKort
              key={x.id}
              procent={x.score}
              titel={x.jobTitle}
              var={plats}
              ny={x.ny}
              skal={x.skal}
              dag={x.sistaDagText ?? undefined}
              snart={x.sistaDag ? x.sistaDag <= plusDagar(idag, SISTA_DAG_INOM_DAGAR) : false}
              href={jobbHref(x.id)}
              knapp={{ text: 'Skriv brev', href: `${jobbHref(x.id)}&skriv=1` }}
            />
          )
        })}
      </Traffar>
    </Avsnitt>
  )
}

/** Platsen medan träffarna läses: rubrikraden och tre kort i samma höjd. */
export function NyaTraffarSkelett() {
  return (
    <Avsnitt etikett="Läser jobb som passar dig">
      <div aria-hidden="true">
        <Skel b={280} h={28} />
        <Skel b="60%" h={16} stil={{ marginTop: 8 }} />
        <div className="j3-traffar mt-[18px]">
          {[0, 1, 2].map((i) => (
            <Skel key={i} h={232} stil={{ borderRadius: 20 }} />
          ))}
        </div>
      </div>
    </Avsnitt>
  )
}
