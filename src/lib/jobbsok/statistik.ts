/**
 * Statistik under Sökta tjänster (Sokta-statistik): tratten från sökt till
 * erbjudande, veckostaplarna med mållinje och fördelningen per kanal. Allt
 * räknas ur listan med historik, så siffrorna stämmer med brickorna.
 * Ska sökas räknas aldrig. Klientsäker och ren.
 */
import { CHANNEL_META, type ApplicationChannel } from '@/lib/applications/status'
import { idagSv, isoVecka, manadEtikett, plusDagar, veckaStart } from './datum'
import { brickaFor } from './bana'
import { harFattSvar } from './lage'
import type { Bricka, KanalRad, ManadsStapel, TjanstLage, TjanstMedHistorik, Tratt, VeckoStapel } from './typer'

const INTERVJU_HANDELSER = new Set(['interview_invited', 'interview_completed', 'trial_work_completed'])
const ERBJUDANDE = new Set(['offer_received', 'accepted', 'declined'])

function parVis(historik: readonly TjanstMedHistorik[], lagen: readonly TjanstLage[]) {
  const perId = new Map(lagen.map((l) => [l.id, l]))
  return historik
    .map((h) => ({ h, l: perId.get(h.ansokan.id) }))
    .filter((p): p is { h: TjanstMedHistorik; l: TjanstLage } => !!p.l)
}

/** Tratten: sökta, fått svar, intervju, erbjudande. */
export function tratt(historik: readonly TjanstMedHistorik[], lagen: readonly TjanstLage[]): Tratt {
  const par = parVis(historik, lagen).sort((a, b) => a.l.appliedAt.localeCompare(b.l.appliedAt))
  const nadde = (h: TjanstMedHistorik, typer: Set<string>, status: Set<string>) =>
    h.handelser.some((e) => typer.has(e.event_type)) || status.has(h.ansokan.current_status ?? '')

  const svar = par.filter((p) => harFattSvar(p.h))
  const intervju = par.filter((p) =>
    nadde(p.h, INTERVJU_HANDELSER, new Set(['interview_invited', 'interview_completed', 'trial_work_completed']))
  )
  const erbjudande = par.filter((p) => nadde(p.h, ERBJUDANDE, ERBJUDANDE))
  const genomforda = intervju.filter((p) =>
    p.h.handelser.some((e) => e.event_type === 'interview_completed' || e.event_type === 'trial_work_completed') ||
    p.h.ansokan.current_status === 'interview_completed' ||
    p.h.ansokan.current_status === 'trial_work_completed'
  ).length
  const bokade = intervju.filter((p) => p.l.intervju?.lage === 'bokad').length
  const avslag = svar.filter((p) => p.h.ansokan.current_status === 'rejected').length
  const kallelser = svar.filter((p) => nadde(p.h, INTERVJU_HANDELSER, ERBJUDANDE)).length
  const b = (lista: typeof par): Bricka[] => lista.map((p) => brickaFor(p.l))

  return {
    sokta: { antal: par.length, sedan: par[0]?.l.appliedAt ?? null, brickor: b(par) },
    svar: { antal: svar.length, kallelser, avslag, brickor: b(svar) },
    intervju: { antal: intervju.length, genomforda, bokade, brickor: b(intervju) },
    erbjudande: { antal: erbjudande.length, brickor: b(erbjudande) },
  }
}

/**
 * Veckostaplarna: en stapel per vecka från första sökta tjänstens vecka till
 * den här, högst `max` veckor bakåt. Varje bricka i sin ton. Mållinjen är
 * veckans mål (veckansMal().mal).
 */
export function veckostaplar(lagen: readonly TjanstLage[], nu: Date = new Date(), max = 12): VeckoStapel[] {
  if (lagen.length === 0) return []
  const idag = idagSv(nu)
  const nuStart = veckaStart(idag)
  const forsta = lagen.reduce((m, l) => (l.appliedAt < m ? l.appliedAt : m), lagen[0].appliedAt)
  let start = veckaStart(forsta)
  const tidigast = plusDagar(nuStart, -7 * (max - 1))
  if (start < tidigast) start = tidigast
  const staplar: VeckoStapel[] = []
  for (let s = start; s <= nuStart; s = plusDagar(s, 7)) {
    const slut = plusDagar(s, 6)
    const vecka = isoVecka(s)
    const arNu = s === nuStart
    staplar.push({
      vecka,
      start: s,
      etikett: arNu ? `v. ${vecka}, nu` : `v. ${vecka}`,
      arNu,
      brickor: lagen
        .filter((l) => l.appliedAt >= s && l.appliedAt <= slut)
        .sort((a, b) => a.appliedAt.localeCompare(b.appliedAt))
        .map(brickaFor),
    })
  }
  return staplar
}

/** Månadsstaplarna (växeln Vecka, Månad): från första månaden, högst `max` bakåt. */
export function manadsstaplar(lagen: readonly TjanstLage[], nu: Date = new Date(), max = 12): ManadsStapel[] {
  if (lagen.length === 0) return []
  const idag = idagSv(nu)
  const nuManad = idag.slice(0, 7)
  const forsta = lagen.reduce((m, l) => (l.appliedAt < m ? l.appliedAt : m), lagen[0].appliedAt).slice(0, 7)
  const manader: string[] = []
  let [y, m] = nuManad.split('-').map(Number)
  for (let i = 0; i < max; i++) {
    const nyckel = `${y}-${String(m).padStart(2, '0')}`
    manader.unshift(nyckel)
    if (nyckel <= forsta) break
    m -= 1
    if (m === 0) {
      m = 12
      y -= 1
    }
  }
  return manader.map((manad) => ({
    manad,
    etikett: manad === nuManad ? `${manadEtikett(manad)}, nu` : manadEtikett(manad),
    arNu: manad === nuManad,
    brickor: lagen
      .filter((l) => l.appliedAt.startsWith(manad))
      .sort((a, b) => a.appliedAt.localeCompare(b.appliedAt))
      .map(brickaFor),
  }))
}

/** "Hur du sökte": antal per kanal, alla tre kanaler även när de är noll. */
export function kanaler(lagen: readonly TjanstLage[]): KanalRad[] {
  const ordning: ApplicationChannel[] = ['ad', 'unsolicited', 'network']
  return ordning.map((kanal) => ({
    kanal,
    etikett: CHANNEL_META[kanal].label,
    antal: lagen.filter((l) => l.kanal === kanal).length,
  }))
}
