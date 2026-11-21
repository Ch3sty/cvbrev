/**
 * Köpreturen i CV-rummets Mallar: tillbaka från kassan med
 * ?cv=&mall=&format=&ladda=1&premium_activated=true (create-plan-session
 * lägger på de två sista efter returFor). Samma styrning som brevrummet
 * (brev3/kit/kopretur): hinner Stripe-webhooken inte före returen hämtas
 * serverns data om tills tillgången syns, och filen laddas ner en gång.
 *
 * Här bor bara det som skiljer CV:t: vad "har tillgången" betyder, att
 * nedladdningen väntar på mätningen och CV:t, och att adressens format
 * hör till valen (format=docx står kvar när köpreturen städas).
 */
import type { Format } from '@/lib/cv/mallar/kontrakt'
import type { KopreturIn } from '@/components/brev3/kit/kopretur'

export interface CvTillgangIn {
  premiumMall: boolean
  isPremium: boolean
  harWord: boolean
  gratisAnvand: boolean
  format: Format
}

/**
 * Kontot kan ladda ner filen i mallen och formatet, i samma ordning som
 * laddaNer prövar: Word i en premiummall, mallen, gratisnedladdningen.
 */
export function cvHarTillgang(t: CvTillgangIn): boolean {
  if (t.format === 'docx' && t.premiumMall && !t.harWord) return false
  if (t.premiumMall && !t.isPremium) return false
  return !t.gratisAnvand
}

export interface CvKopreturLage extends CvTillgangIn {
  /** ?ladda=1 */
  ladda: boolean
  /** ?premium_activated=true */
  kopRetur: boolean
  /** Dokumentet är mätt (onMatt) och CV:t finns: först då startar filen, som förut. */
  redo: boolean
  /** Mallen har Word. */
  mallHarWord: boolean
}

/**
 * Styrningens in-data. Utan mätt dokument och CV begärs ingenting ännu.
 *
 * En gammal länk med bara ladda=1 (utan premium_activated) beter sig som
 * före köpreturen: laddaNer anropas en gång om inte premiummallen saknar
 * Premium, och laddaNer öppnar själv Word-spärren eller merförsäljningen.
 * Styrningen kör då ingen väntan och anropar laddaNer högst en gång.
 */
export function cvKopreturIn(l: CvKopreturLage): KopreturIn {
  const gammalLank = !l.kopRetur
  return {
    begart: l.ladda && l.redo ? l.format : null,
    kopRetur: l.kopRetur,
    kanLaddaNer: gammalLank ? !(l.premiumMall && !l.isPremium) : cvHarTillgang(l),
    formatFinns: gammalLank || l.format === 'pdf' || l.mallHarWord,
  }
}

/**
 * Adresseffekten låter köpreturens parametrar stå kvar medan tillgången
 * väntas in och när försöken tagit slut (router.refresh och omladdningen
 * läser dem). I alla andra fall stryks de som förut.
 */
export function behallKopreturParametrar(l: Pick<CvKopreturLage, 'ladda' | 'kopRetur'> & CvTillgangIn): boolean {
  return l.ladda && l.kopRetur && !cvHarTillgang(l)
}

export const CV_KOPRETUR_PARAMETRAR = ['ladda', 'premium_activated'] as const

/** Stryker köpreturens parametrar ur en sökdel; formatet hör till valen och står kvar. */
export function utanKopretur(sok: string): string {
  const q = new URLSearchParams(sok)
  for (const k of CV_KOPRETUR_PARAMETRAR) q.delete(k)
  return q.toString()
}

/** Städar adressen utan att ladda om sidan. */
export function stadaCvKopreturAdress(): void {
  const q = utanKopretur(window.location.search)
  window.history.replaceState(window.history.state, '', `${window.location.pathname}${q ? `?${q}` : ''}`)
}
