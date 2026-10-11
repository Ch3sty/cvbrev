/**
 * Kontaktformulärets regler, utan nätverk: validering och mejlet till
 * supporten. Routen i ./route.ts skickar; den här filen går att testa utan
 * Resend och utan Supabase.
 */

export interface KontaktIn {
  name: string
  email: string
  subject: string
  message: string
}

export const GRANSER = { name: 120, email: 254, subject: 200, message: 5000 } as const

/** Mottagaren. Samma adress som KontaktInfo visar för konto och support. */
export const SUPPORT_ADRESS = 'support@jobbcoach.ai'
export const AVSANDARE = 'Jobbcoach.ai <noreply@jobbcoach.ai>'

/**
 * Mottagaren. KONTAKT_MOTTAGARE får styra om till Resends testadresser
 * (delivered@resend.dev) vid en skarp provkörning, så att ägarens inkorg inte
 * nås. Alla andra värden ignoreras, så variabeln kan aldrig skicka
 * användarnas meddelanden någon annanstans.
 */
export function mottagare(env: string | undefined = process.env.KONTAKT_MOTTAGARE): string {
  const v = env?.trim()
  return v && /^[a-z0-9._+-]+@resend\.dev$/i.test(v) ? v : SUPPORT_ADRESS
}

const EPOST = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Rensar och kontrollerar formulärets fält. Felet är en mening till användaren. */
export function validera(body: unknown): { ok: true; data: KontaktIn } | { ok: false; fel: string } {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>
  const text = (k: keyof KontaktIn) => (typeof b[k] === 'string' ? (b[k] as string).trim() : '')
  const data: KontaktIn = { name: text('name'), email: text('email'), subject: text('subject'), message: text('message') }

  if (!data.name || !data.email || !data.subject || !data.message) {
    return { ok: false, fel: 'Fyll i alla fält.' }
  }
  if (!EPOST.test(data.email) || data.email.length > GRANSER.email) {
    return { ok: false, fel: 'Kontrollera e-postadressen.' }
  }
  for (const k of ['name', 'subject', 'message'] as const) {
    if (data[k].length > GRANSER[k]) {
      return { ok: false, fel: `Texten är för lång. Högst ${GRANSER[k]} tecken.` }
    }
  }
  return { ok: true, data }
}

/** HTML-säker text: ett meddelande får aldrig bli markup i supportens inkorg. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export interface Avsandare {
  /** null på den publika vägen, där ingen är inloggad. */
  userId: string | null
  kontoEpost: string | null
  /** Har kontot en betald behörighet? Då hanteras ärendet först. */
  harPremium: boolean
  /** Skickat från /kontakt utan inloggning. Ämnet får [Publik]. */
  publik?: boolean
}

/** Honungsfältet i det publika formuläret. Människor ser det aldrig. */
export const HONUNGSFALT = 'webbplats'

/** Är honungsfältet ifyllt? Då svarar routen 200 utan att skicka något. */
export function arHonung(body: unknown): boolean {
  if (!body || typeof body !== 'object') return false
  const v = (body as Record<string, unknown>)[HONUNGSFALT]
  if (typeof v === 'string') return v.trim().length > 0
  return v != null && v !== false
}

/** Mejlet till supporten. Svar går till adressen i formuläret. */
export function byggMejl(data: KontaktIn, fran: Avsandare) {
  const publik = fran.publik ? ' [Publik]' : ''
  const prio = fran.harPremium ? ' [PREMIUM]' : ''
  // Radbrytningar i ämnet stoppas, de kan inte stå i en mejlrubrik.
  const amne = `[KONTAKT]${publik}${prio} ${data.subject.replace(/[\r\n]+/g, ' ')}`
  const rader = [
    ['Namn', data.name],
    ['Svara till', data.email],
    ['Kontots e-post', fran.kontoEpost ?? 'okänd'],
    ['Användar-id', fran.userId ?? 'inget, skickat utan inloggning'],
    ['Premium', fran.harPremium ? 'ja' : 'nej'],
  ] as const
  const kalla = fran.publik
    ? 'Skickat från kontaktformuläret på /kontakt, utan inloggning.'
    : 'Skickat från kontaktformuläret i inloggat läge.'
  const text = `${rader.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${data.message}\n\n${kalla}`
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#334155;">
${rader.map(([k, v]) => `<p style="margin:0 0 4px 0;"><strong>${k}:</strong> ${escapeHtml(v)}</p>`).join('\n')}
<p style="margin:16px 0 0 0;white-space:pre-wrap;">${escapeHtml(data.message)}</p>
<p style="margin:16px 0 0 0;color:#64748b;font-size:12px;">${kalla}</p>
</div>`
  return { from: AVSANDARE, to: [mottagare()], replyTo: data.email, subject: amne, text, html }
}

/** Svaret över gränsen på den publika vägen (spec-rummen 23.1). */
export const FEL_GRANS = 'Du har skickat flera meddelanden i dag. Maila support@jobbcoach.ai direkt.'
