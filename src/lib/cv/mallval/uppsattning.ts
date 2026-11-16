/**
 * Titel till rubrikuppsättning, i klienten (plan-mallar 3.2, villkor c):
 * artikelns titelfält byter rubrikerna i exempel-iframen via ?uppsattning=.
 * En liten ordlista, några hundra byte, så artikelkomponenten håller sig
 * under 3 kB. Rubrikmodellen (src/lib/cv/rubriker.ts, byggagent A) har den
 * fulla förvalslogiken med fler signaler; den här listan tar bara titeln.
 *
 * Id:na ska vara desamma som rubrikmodellens UPPSATTNINGAR. Okänt id ger
 * standardrubrikerna i rutten, så en glidning här ger aldrig fel rubriker,
 * bara standard.
 */

const ORDLISTA: readonly [string, RegExp][] = [
  ['vard', /sköterska|undersköt|vårdbiträde|läkare|vård|omsorg|barnmorska|tandhyg|fysioterap|arbetsterap|personlig assistent|stödassistent/i],
  ['skola', /lärare|förskol|pedagog|fritids|rektor|elevassistent|studie- och yrkesvägl/i],
  ['it', /utvecklare|programmer|devops|it-|systemutv|frontend|backend|data|mjukvara|tekniker|ingenjör/i],
  ['hantverk', /snickare|elektriker|rörmokare|vvs|målare|plattsättare|svetsare|mekaniker|montör|byggarbet|murare|bilmek/i],
  ['handel', /butik|säljare|kassa|försälj|key account|account manager/i],
  ['ekonomi', /ekonom|redovis|controller|revisor|lön|bokför|finans/i],
  ['offentlig', /handläggare|socionom|utredare|myndighet|kommun|jurist|administratör/i],
  ['logistik', /lager|truck|chaufför|förare|logistik|transport|terminal|distribution/i],
  ['restaurang', /kock|servitör|bartender|restaurang|kök|barista|hotell/i],
]

/** Uppsättningens id för en titel, eller undefined (standardrubrikerna). */
export function uppsattningForTitel(titel: string): string | undefined {
  const t = titel.trim()
  if (t.length < 3) return undefined
  for (const [id, re] of ORDLISTA) if (re.test(t)) return id
  return undefined
}
