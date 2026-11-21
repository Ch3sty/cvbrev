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
