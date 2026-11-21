/**
 * Listan under Sökta tjänster (Sokta): grupperna Följ upp, Intervju på gång,
 * Erbjudande, Ska sökas, Väntar svar och Avslutade, antalen i filterraden och
 * väggens rad. Klientsäker och ren.
 */
import { ordtal } from './attGora'
import { langDag } from './datum'
import type { SkaSokasRad, SoktaFilter, SoktaLista, TjanstLage } from './typer'

const stor = (s: string) => s.charAt(0).toLocaleUpperCase('sv-SE') + s.slice(1)

/** Gruppen en tjänst hamnar i. En tjänst står i exakt en grupp. */
export function gruppFor(t: TjanstLage): Exclude<keyof SoktaLista, 'ska_sokas' | 'antal'> {
  if (t.avslutad) return 'avslutade'
  if (t.station === 'erbjudande') return 'erbjudande'
  if (t.tyst) return 'folj_upp'
  if (t.station === 'intervju') return 'intervju'
  return 'vantar_svar'
}

export function soktaLista(lagen: readonly TjanstLage[], skaSokas: readonly SkaSokasRad[]): SoktaLista {
  const ut: SoktaLista = {
    folj_upp: [],
    intervju: [],
    erbjudande: [],
    ska_sokas: [...skaSokas],
    vantar_svar: [],
    avslutade: [],
    antal: { alla: 0, 'folj-upp': 0, 'ska-sokas': 0, 'vantar-svar': 0, intervju: 0, erbjudande: 0, avslutade: 0 },
  }
  for (const t of lagen) ut[gruppFor(t)].push(t)

  ut.folj_upp.sort((a, b) => b.dagarTyst - a.dagarTyst)
  const intervjuOrdning = { hur_gick: 0, bokad: 1, utan_tid: 2, vantar_besked: 3 } as const
  ut.intervju.sort((a, b) => {
    const oa = a.intervju ? intervjuOrdning[a.intervju.lage] : 4
    const ob = b.intervju ? intervjuOrdning[b.intervju.lage] : 4
    if (oa !== ob) return oa - ob
    return (a.intervju?.tid ?? a.senasteAktivitet).localeCompare(b.intervju?.tid ?? b.senasteAktivitet)
  })
  ut.erbjudande.sort((a, b) => b.senasteAktivitet.localeCompare(a.senasteAktivitet))
  // Väntar svar: längst väntan först.
  ut.vantar_svar.sort((a, b) => a.appliedAt.localeCompare(b.appliedAt))
  ut.avslutade.sort((a, b) => b.senasteAktivitet.localeCompare(a.senasteAktivitet))

  const a = ut.antal
  a['folj-upp'] = ut.folj_upp.length
  a['ska-sokas'] = skaSokas.length
  // Filtret Väntar svar räknar alla vid stationen Sökt, även de tysta.
  a['vantar-svar'] = lagen.filter((t) => t.station === 'sokt').length
  a.intervju = lagen.filter((t) => t.station === 'intervju').length
  a.erbjudande = ut.erbjudande.length
  a.avslutade = ut.avslutade.length
  a.alla = lagen.length + skaSokas.length
  return ut
}

/** Tjänsterna (och sparade) som ett filter visar, i listans ordning. */
export function filtrera(lista: SoktaLista, filter: SoktaFilter): { tjanster: TjanstLage[]; skaSokas: SkaSokasRad[] } {
  switch (filter) {
    case 'folj-upp':
      return { tjanster: lista.folj_upp, skaSokas: [] }
    case 'ska-sokas':
      return { tjanster: [], skaSokas: lista.ska_sokas }
    case 'vantar-svar':
      return { tjanster: [...lista.folj_upp.filter((t) => t.station === 'sokt'), ...lista.vantar_svar], skaSokas: [] }
    case 'intervju':
      return { tjanster: [...lista.folj_upp.filter((t) => t.station === 'intervju'), ...lista.intervju], skaSokas: [] }
    case 'erbjudande':
      return { tjanster: lista.erbjudande, skaSokas: [] }
    case 'avslutade':
      return { tjanster: lista.avslutade, skaSokas: [] }
    default:
      return {
        tjanster: [...lista.folj_upp, ...lista.intervju, ...lista.erbjudande, ...lista.vantar_svar, ...lista.avslutade],
        skaSokas: lista.ska_sokas,
      }
  }
}

/** Raden i Avslutade: "Tre avslag, det senaste 12 nov." */
export function avslutadeText(avslutade: readonly TjanstLage[]): string | null {
  if (avslutade.length === 0) return null
  const avslag = avslutade.filter((t) => t.status === 'rejected')
  const nej = avslutade.length - avslag.length
  const senaste = avslutade.reduce((m, t) => (t.senasteAktivitet > m ? t.senasteAktivitet : m), avslutade[0].senasteAktivitet)
  const delar: string[] = []
  if (avslag.length) delar.push(avslag.length === 1 ? 'Ett avslag' : `${stor(ordtal(avslag.length))} avslag`)
  if (nej) delar.push(nej === 1 ? 'ett erbjudande du tackade nej till' : `${ordtal(nej)} erbjudanden du tackade nej till`)
  return `${stor(delar.join(' och '))}, det senaste ${langDag(senaste)}.`
}

/** Väggen på Sökta tjänster: "Sex är på väg" och en rad om läget. */
export function soktaVagg(lagen: readonly TjanstLage[]): { rubrik: string; text: string } {
  const oppna = lagen.filter((t) => !t.avslutad)
  if (lagen.length === 0) {
    return { rubrik: 'Inga sökta tjänster än', text: 'Logga det du söker, så håller vi koll på svaren och påminner när det är dags att följa upp.' }
  }
  if (oppna.length === 0) {
    return { rubrik: 'Inget är på väg just nu', text: 'Alla dina sökta tjänster är avslutade. Matchade jobb har nya annonser.' }
  }
  const intervju = oppna.filter((t) => t.station === 'intervju').length
  const vantar = oppna.filter((t) => t.station === 'sokt').length
  const erbjudande = oppna.filter((t) => t.station === 'erbjudande').length
  const delar: string[] = []
  if (erbjudande) delar.push(`${ordtal(erbjudande)} har gett erbjudande`)
  if (intervju) delar.push(`${ordtal(intervju)} är i intervju`)
  if (vantar) delar.push(`${ordtal(vantar)} väntar svar`)
  const forsta = delar.length > 1 ? `${delar.slice(0, -1).join(', ')} och ${delar[delar.length - 1]}` : delar[0]
  const tystast = [...oppna].filter((t) => t.tyst).sort((a, b) => b.dagarTyst - a.dagarTyst)[0]
  const text = `${stor(forsta)}.${tystast ? ` ${tystast.company} har varit tyst i ${tystast.dagarTyst} dagar.` : ''}`
  return { rubrik: `${stor(ordtal(oppna.length))} är på väg`, text }
}
