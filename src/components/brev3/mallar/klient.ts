/**
 * Anropen Mallar och mallväljaren gör: förhandsvisa (ingen skrivning),
 * spara mall och typsnitt (motorns PUT), och ladda ner (POST download med id).
 * Ren fetch, inga hooks.
 */

/** Brevets id i förhandsvisningen när användaren inte har något brev: exempelbrevet. */
export const EXEMPEL_ID = 'exempel'

export class MallarFel extends Error {
  constructor(
    public status: number,
    public code: string | null,
  ) {
    super(code ?? `HTTP ${status}`)
  }
}

async function felFran(res: Response): Promise<MallarFel> {
  let code: string | null = null
  try {
    const j = await res.json()
    code = (j?.code ?? j?.error ?? null) as string | null
  } catch {
    // Inget JSON.
  }
  return new MallarFel(res.status, code)
}

/** Ett ark: brevet i mallen och typsnittet. font: undefined = brevets, null = mallens eget. */
export async function forhandsvisa(brevId: string, mallId: string, fontId: string | null | undefined, signal?: AbortSignal): Promise<string> {
  const res = await fetch(`/api/letters/${encodeURIComponent(brevId)}/forhandsvisa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mall_id: mallId, ...(fontId !== undefined ? { font_id: fontId } : {}) }),
    signal,
  })
  if (!res.ok) throw await felFran(res)
  return ((await res.json()) as { html: string }).html
}

/** Flera ark i ett anrop: mallens id -> HTML. */
export async function forhandsvisaFlera(brevId: string, mallar: readonly string[], fontId: string | null | undefined, signal?: AbortSignal): Promise<Record<string, string>> {
  const res = await fetch(`/api/letters/${encodeURIComponent(brevId)}/forhandsvisa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mallar, ...(fontId !== undefined ? { font_id: fontId } : {}) }),
    signal,
  })
  if (!res.ok) throw await felFran(res)
  return ((await res.json()) as { mallar: Record<string, string> }).mallar
}

/** Så många mallar per anrop när rutnätet fylls: lika många som sidan ritar på servern. */
export const OMGANG_STORLEK = 8
/** Försök per omgång: det första plus två nya. */
export const OMGANG_FORSOK = 3
/** Väntan före nytt försök, ms (ett per nytt försök). */
export const OMGANG_VANTAN = [800, 2000] as const

/** Ett fel värt att försöka igen: nät, tidsgräns och serverfel, aldrig övriga 4xx (fel kropp, ingen inloggning, inget brev). */
export function provaIgen(e: unknown): boolean {
  if (e instanceof MallarFel) return e.status >= 500 || e.status === 408 || e.status === 429
  return (e as Error)?.name !== 'AbortError'
}

function avbrott(): Error {
  const e = new Error('Avbrutet')
  e.name = 'AbortError'
  return e
}

function vanta(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(avbrott())
    const t = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(t)
        reject(avbrott())
      },
      { once: true },
    )
  })
}

/**
 * Rutnätets mallar i omgångar om OMGANG_STORLEK, en omgång i taget, så att
 * varje anrop ryms gott i funktionens tidsgräns även för ett långt brev
 * (QA 2026-11-21: alla 32 övriga i ett anrop gav 504 och korten stod kvar
 * med katalogens CV-bilder). En omgång som faller försöks igen
 * (OMGANG_FORSOK gånger totalt, med väntan emellan) när felet är värt det.
 * Varje lyckad omgång lämnas direkt till klar(), så att korten fylls efter
 * hand. Avbrott (signal) stoppar allt och kastar AbortError. Svar: mallarna
 * som inte gick att hämta.
 */
export async function forhandsvisaIOmgangar(
  brevId: string,
  mallar: readonly string[],
  fontId: string | null | undefined,
  klar: (ut: Record<string, string>) => void,
  opt: { signal?: AbortSignal; storlek?: number; forsok?: number; vantan?: readonly number[]; hamta?: typeof forhandsvisaFlera } = {},
): Promise<string[]> {
  const storlek = Math.max(1, opt.storlek ?? OMGANG_STORLEK)
  const forsok = Math.max(1, opt.forsok ?? OMGANG_FORSOK)
  const vantan = opt.vantan ?? OMGANG_VANTAN
  const hamta = opt.hamta ?? forhandsvisaFlera
  const misslyckade: string[] = []
  for (let i = 0; i < mallar.length; i += storlek) {
    const omgang = mallar.slice(i, i + storlek)
    for (let f = 1; ; f++) {
      if (opt.signal?.aborted) throw avbrott()
      try {
        klar(await hamta(brevId, omgang, fontId, opt.signal))
        break
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') throw e
        if (f >= forsok || !provaIgen(e)) {
          misslyckade.push(...omgang)
          break
        }
        await vanta(vantan[Math.min(f - 1, vantan.length - 1)] ?? 0, opt.signal)
      }
    }
  }
  return misslyckade
}

/** Sparar brevets mall och/eller typsnitt (PUT /api/letters/[id]). Kastar MallarFel (403 letter_locked, 402 premium_required). */
export async function sparaVal(brevId: string, andring: { mall_id?: string; font_id?: string | null }): Promise<void> {
  const res = await fetch(`/api/letters/${encodeURIComponent(brevId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(andring),
  })
  if (!res.ok) throw await felFran(res)
}

export type Filformat = 'pdf' | 'docx'

/**
 * Köpreturen från spärren i Mallar: tillbaka hit med brevet, mallen och
 * formatet från knappen som öppnade spärren (PDF eller Word), som Brevet
 * gör. Med ?ladda=1 laddas just den filen ner efter köpet.
 */
export function mallarKopretur(brevId: string, mall: string, format: Filformat): string {
  return `/dashboard/mina-brev/mallar?${new URLSearchParams({ brev: brevId, mall, format }).toString()}`
}

/**
 * Laddar ner brevet i sin sparade mall och sitt typsnitt (servern läser
 * raden). Kastar MallarFel: 402 utan nedladdning, 422 name_required.
 */
export async function laddaNerBrev(brevId: string, format: Filformat, filnamn: string): Promise<void> {
  const res = await fetch('/api/letters/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: brevId, format }),
  })
  if (!res.ok) throw await felFran(res)
  const blob = await res.blob()
  if (blob.size === 0) throw new MallarFel(500, 'tom_fil')
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filnamn}.${format}`
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 4000)
}

/** Märker brevet som kopierat (steget "läs igenom" på brevets väg). Fel stoppar aldrig kopieringen. */
export async function markeraKopierat(brevId: string): Promise<void> {
  try {
    await fetch(`/api/letters/${encodeURIComponent(brevId)}/forberett`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ som: 'kopierat' }),
    })
  } catch {
    // Kopieringen är redan gjord.
  }
}
