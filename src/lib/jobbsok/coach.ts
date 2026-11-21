/**
 * Jobbcoachen, "Frågor utifrån ditt läge" (F9): högst fyra förslag som
 * räknas fram ur de sökta tjänsterna, utan AI. Finns inget läge att utgå
 * från gäller dagens fasta förslag. Frågan skickas först när användaren
 * trycker. Klientsäker och ren.
 */
import { dagarMellan, idagSv } from './datum'
import type { CoachForslag, CoachForslagLista, CoachForslagTyp, TjanstLage } from './typer'

/** Dagens fasta förslag (MiniSuggestionChips), oförändrade. */
export const FASTA_FORSLAG = ['Hur skriver jag ett bra CV?', 'Vad är marknadslön i mitt yrke?', 'Tips inför intervjun'] as const

export const COACH_MAX_FORSLAG = 4
/** Ett avslag räknas som nytt i fjorton dagar. */
const NYTT_AVSLAG_DAGAR = 14

function forslag(typ: CoachForslagTyp, fraga: string, t: TjanstLage): CoachForslag {
  return { typ, fraga, bokstaver: t.bokstaver, ansokanId: t.id }
}

export function coachForslag(tjanster: readonly TjanstLage[], nu: Date = new Date()): CoachForslagLista {
  const idag = idagSv(nu)
  const ut: CoachForslag[] = []

  const erbjudande = tjanster.filter((t) => t.status === 'offer_received')
  const bokade = tjanster
    .filter((t) => t.intervju && (t.intervju.lage === 'bokad' || t.intervju.lage === 'utan_tid'))
    .sort((a, b) => {
      const ta = a.intervju?.tid ?? '~'
      const tb = b.intervju?.tid ?? '~'
      return ta < tb ? -1 : ta > tb ? 1 : 0
    })
  const tysta = tjanster.filter((t) => t.tyst).sort((a, b) => b.dagarTyst - a.dagarTyst)
  const vantarBesked = tjanster.filter((t) => t.intervju?.lage === 'vantar_besked' || t.intervju?.lage === 'hur_gick')
  const avslag = tjanster
    .filter((t) => t.status === 'rejected' && dagarMellan(t.senasteAktivitet, idag) <= NYTT_AVSLAG_DAGAR)
    .sort((a, b) => b.senasteAktivitet.localeCompare(a.senasteAktivitet))

  if (erbjudande[0]) ut.push(forslag('erbjudande', `Hur förhandlar jag lönen i erbjudandet från ${erbjudande[0].company}?`, erbjudande[0]))
  if (bokade[0]) ut.push(forslag('lonefragan', `Hur svarar jag på lönefrågan hos ${bokade[0].company}?`, bokade[0]))
  if (tysta[0]) ut.push(forslag('uppfoljning', 'Vad skriver jag i ett uppföljningsmejl?', tysta[0]))
  if (bokade[0]) ut.push(forslag('fragor_till_arbetsgivaren', 'Vad frågar jag arbetsgivaren på intervjun?', bokade[0]))
  if (vantarBesked[0]) ut.push(forslag('vanta_besked', 'Hur länge är det rimligt att vänta på besked?', vantarBesked[0]))
  if (avslag[0]) ut.push(forslag('avslag', `Hur ber jag ${avslag[0].company} om återkoppling efter avslaget?`, avslag[0]))

  if (ut.length === 0) {
    return { lage: 'fasta', forslag: FASTA_FORSLAG.map((fraga) => ({ typ: 'fast', fraga, bokstaver: null, ansokanId: null })) }
  }
  return { lage: 'fran_laget', forslag: ut.slice(0, COACH_MAX_FORSLAG) }
}
