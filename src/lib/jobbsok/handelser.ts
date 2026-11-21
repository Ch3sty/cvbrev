/**
 * Händelselistan på tjänstens sida: händelserna med skickade uppföljningar
 * insorterade som "Följde upp" (F5), och en kommande intervju som sista rad
 * (F6). Klientsäker och ren.
 */
import { CHANNEL_META, STATUS_META } from '@/lib/applications/status'
import { dagFor, dagarMellan, idagSv, kortDag, narText } from './datum'
import { intervjuEtikett } from './bana'
import { hurGickFran } from './intervju'
import { sorteraHandelser } from './lage'
import type { HandelseListRad, TjanstLage, TjanstMedHistorik, UppfoljningVia } from './typer'

const VIA_TEXT: Record<UppfoljningVia, string> = {
  epost: 'Uppföljningsmejlet skickat från din e-post.',
  kopierat: 'Uppföljningsmejlet kopierat och skickat.',
  eget: 'Du följde upp på egen hand.',
}

function omDagar(n: number): string {
  if (n <= 0) return 'I dag'
  if (n === 1) return 'I morgon'
  return `Om ${n} dagar`
}

export function handelselista(t: TjanstMedHistorik, lage: TjanstLage, nu: Date = new Date()): HandelseListRad[] {
  const a = t.ansokan
  const idag = idagSv(nu)
  const rader: Array<HandelseListRad & { _ordning: string }> = []

  for (const h of sorteraHandelser(t.handelser)) {
    let text: string | null = h.note ?? null
    if (!text && h.event_type === 'applied') {
      text = `${CHANNEL_META[a.application_channel]?.label ?? 'Sökt'}${a.letter_id ? ', med personligt brev' : ''}.`
    }
    if (!text && h.event_type === 'interview_invited' && h.interview_place) {
      text = `Plats: ${h.interview_place}.`
    }
    const rubrik =
      h.event_type === 'interview_completed' && h.interview_round && h.interview_round > 1
        ? `${STATUS_META.interview_completed.timelineLabel}, omgång ${h.interview_round}`
        : STATUS_META[h.event_type]?.timelineLabel ?? h.event_type
    rader.push({
      typ: 'handelse',
      id: h.id,
      radId: h.id,
      datum: h.occurred_at,
      eventType: h.event_type,
      rubrik,
      text,
      tid: h.event_type === 'interview_invited' ? h.interview_at ?? null : null,
      _ordning: `${h.occurred_at}|0|${h.created_at}`,
    })
  }

  for (const u of t.uppfoljningar) {
    if (!u.sent_at) continue
    rader.push({
      typ: 'foljde_upp',
      id: `uppfoljning-${u.id}`,
      radId: u.id,
      datum: u.sent_at,
      rubrik: 'Följde upp',
      text: u.sent_via ? VIA_TEXT[u.sent_via] : null,
      _ordning: `${u.sent_at}|1|${u.created_at}`,
    })
  }

  rader.sort((x, y) => (x._ordning < y._ordning ? -1 : x._ordning > y._ordning ? 1 : 0))

  // En bokad intervju som inte hänt än står sist, med tiden.
  const i = lage.intervju
  if (i && i.lage === 'bokad' && i.tid && i.dag) {
    const fragaDag = hurGickFran(i.tid)
    rader.push({
      typ: 'kommande_intervju',
      id: `kommande-${i.handelseId ?? a.id}`,
      radId: i.handelseId ?? '',
      datum: i.dag,
      rubrik: 'Intervju',
      text: `${omDagar(dagarMellan(idag, i.dag))}.${fragaDag ? ` ${stor(narText(fragaDag, idag))} frågar vi hur det gick, så loggas den som genomförd.` : ''}${i.plats ? ` Plats: ${i.plats}.` : ''}`,
      tid: i.tid,
      _ordning: '',
    })
  }

  return rader.map(({ _ordning: _, ...r }) => r)
}

function stor(s: string): string {
  return s.charAt(0).toLocaleUpperCase('sv-SE') + s.slice(1)
}

/** Datumets etikett i listan: "2 nov", eller "tis 24 nov 10.00" för en intervju med tid. */
export function handelseEtikett(r: HandelseListRad): string {
  if (r.tid) return intervjuEtikett(r.tid) ?? r.datum
  const d = dagFor(r.datum)
  return d ? kortDag(d) : r.datum
}
