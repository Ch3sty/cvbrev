// src/lib/openai/uppfoljningsmejl.ts - Uppföljningsmejlet i Jobbsöket (BYGGSPEC F5).
//
// Samma leverantör och mönster som brevKrav.ts (Gemini via @/lib/gemini). In
// går bara underlagForModellen(): tjänst, arbetsgivare, datum, hur man
// sökte, högst tre kompetenser eller roller och brevets krav. Aldrig namn,
// telefon, e-post eller adress; hälsning, avslut och namn sätts in av
// servern efteråt (sattIhop).
//
// Kastar aldrig. Svarar modellen inte inom tidsgränsen, eller håller inte
// svaret (valideraAiMejl), blir resultatet null och rutten använder mallen.
import { generateJSON, GEMINI_MODELS } from '@/lib/gemini'
import {
  underlagForModellen,
  valideraAiMejl,
  type UppfoljningUnderlag,
} from '@/lib/jobbsok/uppfoljning'
import { valideraMejlMedMarken, type Mark } from '@/lib/jobbsok/uppfoljningMarken'
import { UPPFOLJNING_MAX_ORD } from '@/lib/jobbsok/typer'

export interface AiMejlResultat {
  /** Ämne och stycken, eller null när mallen ska användas. */
  mejl: { subject: string; stycken: string[] } | null
  model: string
  tokens: { prompt: number; completion: number; total: number } | null
  /** USD, som calculateGeminiCost. */
  cost: number | null
  ms: number
  /** Varför mallen används: 'tidsgrans', 'fel' eller 'ogiltigt'. */
  orsak: 'tidsgrans' | 'fel' | 'ogiltigt' | null
}

/** Längsta väntan innan mallen tar över. */
export const AI_TIDSGRANS_MS = 8000

const SCHEMA = {
  type: 'object',
  properties: {
    amne: { type: 'string' },
    stycken: { type: 'array', items: { type: 'string' } },
  },
  required: ['amne', 'stycken'],
}

function system(sprak: 'sv' | 'en'): string {
  if (sprak === 'en') {
    return `You write a short follow-up email from a job seeker to an employer, the way a person writes it, never salesy.
Rules: a subject line and exactly three short paragraphs, at most ${UPPFOLJNING_MAX_ORD - 20} words in total.
1. When and for what she applied, and a polite question about where the recruitment stands.
2. That she is still interested, tied to at most three of the given skills or to the requirements.
3. That she is happy to send more and can be reached by email or phone.
No greeting, no sign-off, no name, no placeholders like [NAME]. Do not invent facts. No dashes. Reply only with JSON: {"amne":"...","stycken":["...","...","..."]}`
  }
  return `Du skriver ett kort uppföljningsmejl från en arbetssökande till en arbetsgivare, som en människa skriver det, aldrig säljigt.
Regler: en ämnesrad och exakt tre korta stycken, högst ${UPPFOLJNING_MAX_ORD - 20} ord sammanlagt. Svenska med svenska facktermer, du-tilltal mot arbetsgivaren som "ni".
1. När och vad hon sökte, och en artig fråga om hur långt de kommit i rekryteringen.
2. Att hon är fortfarande intresserad, kopplat till högst tre av kompetenserna eller till kraven.
3. Att hon gärna skickar mer och svarar på mejlet eller i telefon.
Skriv sakligt och vardagligt. Undvik fraser som "ser fram emot", "bidra till ert team", "mycket intresserad" och "rekryteringsprocessen"; säg "rekryteringen". Nämn kompetenserna med namn om de finns.
Ingen hälsning, inget avslut, inget namn, inga platshållare som [NAMN]. Hitta inte på något. Inga tankstreck. Svara bara med JSON: {"amne":"...","stycken":["...","...","..."]}`
}

/**
 * Instruktionen efter en genomförd intervju eller ett provjobb (Jobbsöket
 * omgång 2, byggspec 2.6). Underlaget har `moment` och `datum` men aldrig
 * intervjuns plats eller anteckningar. Inga exempel på platshållare utöver
 * förbudet: modellen hittar annars på märket ur exemplet (se systemKortare).
 * Exporterad för testerna.
 */
export function systemEfterMoment(sprak: 'sv' | 'en', typ: 'intervju' | 'provjobb'): string {
  const maxOrd = UPPFOLJNING_MAX_ORD - 20
  if (sprak === 'en') {
    const efter = typ === 'intervju' ? 'after a completed interview' : 'after a completed trial day'
    const tack = typ === 'intervju' ? 'for the interview' : 'for the trial day'
    const sades = typ === 'intervju' ? 'what was said in the interview' : 'what happened during the trial day'
    return `You write a short email from a job seeker to an employer ${efter}, the way a person writes it, never salesy.
Rules: a subject line and exactly three short paragraphs, at most ${maxOrd} words in total.
1. A thank you ${tack}, with the day and the role.
2. That she still wants the role, tied to at most two of the given skills or requirements.
3. A question about when she can expect a decision, and that she is happy to answer further questions.
Write plainly. Avoid phrases like "look forward to", "contribute to your team", "very interested" and "recruitment process"; say "the recruitment". Claim nothing about ${sades} or how it went. If the input has no date, mention no day.
No greeting, no sign-off, no name, no placeholders like [NAME]. Do not invent facts. No dashes. Reply only with JSON: {"amne":"...","stycken":["...","...","..."]}`
  }
  const efter = typ === 'intervju' ? 'efter en genomförd intervju' : 'efter ett genomfört provjobb'
  const tack = typ === 'intervju' ? 'Ett tack för intervjun' : 'Ett tack för provjobbet'
  const sades = typ === 'intervju' ? 'vad som sades på intervjun eller hur den gick' : 'vad som hände under provjobbet eller hur det gick'
  return `Du skriver ett kort mejl från en arbetssökande till en arbetsgivare ${efter}, som en människa skriver det, aldrig säljigt.
Regler: en ämnesrad och exakt tre korta stycken, högst ${maxOrd} ord sammanlagt. Svenska med svenska facktermer, arbetsgivaren tilltalas "ni".
1. ${tack}, med dagen och tjänsten.
2. Att hon fortfarande vill ha tjänsten, kopplat till högst två av kompetenserna eller kraven.
3. En fråga om när hon kan vänta besked, och att hon gärna svarar på fler frågor.
Skriv sakligt och vardagligt. Undvik fraser som "ser fram emot", "bidra till ert team", "mycket intresserad" och "rekryteringsprocessen"; säg "rekryteringen". Påstå inget om ${sades}. Saknas datum i underlaget nämner du ingen dag. Nämn kompetenserna med namn om de finns.
Ingen hälsning, inget avslut, inget namn, inga platshållare som [NAMN]. Hitta inte på något. Inga tankstreck. Svara bara med JSON: {"amne":"...","stycken":["...","...","..."]}`
}

/** Instruktionen för underlagets sort: efter ansökan (system) eller efter intervju eller provjobb. */
export function instruktionFor(u: Pick<UppfoljningUnderlag, 'sprak' | 'typ'>): string {
  return u.typ === 'intervju' || u.typ === 'provjobb' ? systemEfterMoment(u.sprak, u.typ) : system(u.sprak)
}

// Samma förbjudna fraser som i första utkastet (system()); slutkontrollen
// 2026-11-21 fick "mycket intresserad" i en kortad text.
const FRASER_SV =
  'Undvik fraser som "ser fram emot", "bidra till ert team", "mycket intresserad" och "rekryteringsprocessen"; säg "rekryteringen".'
const FRASER_EN =
  'Avoid phrases like "look forward to", "contribute to your team", "very interested" and "recruitment process"; say "the recruitment".'

/**
 * Märkena räknas upp ordagrant i instruktionen. Med exempel i stället för
 * uppräkning ("som [TELEFON 1] eller [E-POST 1]") hittade modellen på märket
 * ur exemplet, och svaret underkändes varje gång (prövat mot modellen
 * 2026-11-21).
 */
function systemKortare(sprak: 'sv' | 'en', marken: readonly string[]): string {
  const medMarken = marken.length > 0
  const lista = marken.join(', ')
  if (sprak === 'en') {
    return medMarken
      ? `Rewrite the follow-up email shorter: keep the meaning and the facts, cut words, keep two or three paragraphs. ${FRASER_EN} The text contains these markers in square brackets: ${lista}. They are the sender's own details: keep each of them exactly as written, at least once. Use no other markers and no other square brackets, and do not add contact details that are not in the text. No greeting, no sign-off, no name, no dashes. Reply only with JSON: {"amne":"...","stycken":["..."]}`
      : `Rewrite the follow-up email shorter: keep the meaning and the facts, cut words, keep two or three paragraphs. ${FRASER_EN} No greeting, no sign-off, no name, no dashes, no placeholders. Reply only with JSON: {"amne":"...","stycken":["..."]}`
  }
  return medMarken
    ? `Skriv om uppföljningsmejlet kortare: behåll innebörden och sakuppgifterna, stryk ord, behåll två eller tre stycken. ${FRASER_SV} Texten har de här märkena inom hakparentes: ${lista}. De är avsändarens egna uppgifter: skriv vart och ett exakt som det står, minst en gång. Använd inga andra märken och inga andra hakparenteser, och lägg inte till kontaktuppgifter som inte står i texten. Ingen hälsning, inget avslut, inget namn, inga tankstreck. Svara bara med JSON: {"amne":"...","stycken":["..."]}`
    : `Skriv om uppföljningsmejlet kortare: behåll innebörden och sakuppgifterna, stryk ord, behåll två eller tre stycken. ${FRASER_SV} Ingen hälsning, inget avslut, inget namn, inga tankstreck, inga platshållare. Svara bara med JSON: {"amne":"...","stycken":["..."]}`
}

type Validering = (raw: unknown, maxOrd: number) => { subject: string; stycken: string[] } | null

async function anropa(
  systemInstruction: string,
  prompt: string,
  maxOrd: number,
  validera: Validering = valideraAiMejl
): Promise<AiMejlResultat> {
  const model = GEMINI_MODELS.fast
  const start = Date.now()
  let timer: ReturnType<typeof setTimeout> | null = null
  try {
    const svar = await Promise.race([
      generateJSON<unknown>({
        model,
        systemInstruction,
        prompt,
        schema: SCHEMA,
        temperature: 0.4,
        maxOutputTokens: 700,
        thinkingBudget: 0,
      }),
      new Promise<never>((_, nej) => {
        timer = setTimeout(() => nej(new Error('tidsgrans')), AI_TIDSGRANS_MS)
      }),
    ])
    const tokens = svar.usage ? { prompt: svar.usage.prompt, completion: svar.usage.completion, total: svar.usage.total } : null
    const mejl = validera(svar.data, maxOrd)
    return { mejl, model, tokens, cost: svar.cost, ms: Date.now() - start, orsak: mejl ? null : 'ogiltigt' }
  } catch (error: any) {
    const tid = error?.message === 'tidsgrans'
    if (!tid) console.error('[uppfoljningsmejl] AI-anropet gick fel:', error?.message ?? error)
    return { mejl: null, model, tokens: null, cost: null, ms: Date.now() - start, orsak: tid ? 'tidsgrans' : 'fel' }
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/** Första utkastet. Instruktionen väljs efter sorten (u.typ). */
export async function skrivUppfoljningsmejl(u: UppfoljningUnderlag): Promise<AiMejlResultat> {
  const prompt = `Underlag (JSON):\n${JSON.stringify(underlagForModellen(u))}`
  return anropa(instruktionFor(u), prompt, UPPFOLJNING_MAX_ORD)
}

/**
 * "Skriv om kortare". `stycken` är mejlets brödtext utan hälsning, avslut och
 * namn, och redan maskad av rutten (maskaMedMarken) eftersom användaren kan ha
 * skrivit in egna uppgifter. Svaret måste bli kortare än förut; `ordForut`
 * räknas på samma brödtext (forberedKortning) som svaret prövas mot.
 *
 * `marken` är märkena i styckena ([TELEFON 1] och så vidare) med användarens
 * uppgifter. Bara märkena går till AI:n; uppgifterna sätts tillbaka i det
 * godkända svaret (valideraMejlMedMarken), så `mejl.stycken` är färdig text.
 * Utan märken valideras svaret som förut.
 */
export async function skrivKortare(
  amne: string,
  stycken: readonly string[],
  sprak: 'sv' | 'en',
  ordForut: number,
  marken: readonly Mark[] = []
): Promise<AiMejlResultat> {
  const ut = stycken.slice(0, 6).map((s) => s.slice(0, 1200))
  // Ett avklippt stycke kan ha tappat ett märke: då går det inte att återställa.
  if (marken.length > 0 && (stycken.length > 6 || stycken.some((s) => s.length > 1200))) {
    return { mejl: null, model: GEMINI_MODELS.fast, tokens: null, cost: null, ms: 0, orsak: 'ogiltigt' }
  }
  const prompt = `Mejlet (JSON):\n${JSON.stringify({ amne: amne.slice(0, 200), stycken: ut })}\nNu ${ordForut} ord. Sikta på högst ${Math.max(25, Math.round(ordForut * 0.75))}.`
  const maxOrd = Math.max(20, ordForut - 1)
  if (marken.length === 0) return anropa(systemKortare(sprak, []), prompt, maxOrd)
  return anropa(
    systemKortare(sprak, marken.map((m) => m.mark)),
    prompt,
    maxOrd,
    (raw, max) => valideraMejlMedMarken(raw, max, marken)
  )
}
