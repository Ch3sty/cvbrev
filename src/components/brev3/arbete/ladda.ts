/**
 * Nedladdning av ett nytt brev: POST /api/letters/download med { id, format }.
 * Servern ritar filen ur brevets rad (mall, typsnitt, stycken) och sätter
 * forberett_at. 402 betyder att filen kräver Premium.
 */
export type LaddaUtfall = 'ok' | 'sparr' | 'namn' | 'fel'

function filnamn(svar: Response, format: 'pdf' | 'docx'): string {
  const cd = svar.headers.get('content-disposition') ?? ''
  const m = /filename\*=UTF-8''([^;]+)/i.exec(cd) ?? /filename="?([^";]+)"?/i.exec(cd)
  if (m) {
    try {
      return decodeURIComponent(m[1])
    } catch {
      return m[1]
    }
  }
  return `personligt-brev.${format}`
}

export async function laddaNerBrev(id: string, format: 'pdf' | 'docx'): Promise<LaddaUtfall> {
  let svar: Response
  try {
    svar = await fetch('/api/letters/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, format }),
    })
  } catch {
    return 'fel'
  }
  if (svar.status === 402) return 'sparr'
  if (svar.status === 422) return 'namn'
  if (!svar.ok) return 'fel'
  try {
    const blob = await svar.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filnamn(svar, format)
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    return 'ok'
  } catch {
    return 'fel'
  }
}
