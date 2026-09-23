/**
 * Användaren som proxyn redan verifierat, vidarebefordrad till serverns
 * rendering i en signerad request-header.
 *
 * Proxyn (src/proxy.ts, updateSession) gör auth.getUser() mot Supabase Auth
 * på varje sidladdning; det är den enda platsen som förnyar sessionen
 * (docs, memory reference_auth_cookie_refresh). Dashboard-layouten och
 * sidan gjorde sedan varsin egen auth.getUser(), alltså två rundturer till
 * Supabase Auth för ett svar proxyn redan hade. Projektets JWT är HS256
 * utan publika nycklar, så getClaims() kan inte verifiera lokalt; det enda
 * sättet att slippa rundturen är att bära proxyns svar vidare.
 *
 * Headern är signerad med HMAC-SHA256. Proxyn tar alltid bort en inkommande
 * header med samma namn, men alla adresser går inte genom proxyn (matchern
 * hoppar över filändelser), och en osignerad header skulle då gå att
 * förfalska. Utan giltig signatur faller läsaren tillbaka på auth.getUser().
 *
 * Web Crypto, så filen kör både i proxyn och i Node.
 */
import type { User } from '@supabase/supabase-js'

export const ANVANDARE_HEADER = 'x-jc-anvandare'

/** Fälten serverrenderingen läser. identities och factors lämnas utanför. */
const FALT = [
  'id',
  'aud',
  'role',
  'email',
  'phone',
  'email_confirmed_at',
  'phone_confirmed_at',
  'confirmed_at',
  'last_sign_in_at',
  'created_at',
  'updated_at',
  'is_anonymous',
  'app_metadata',
  'user_metadata',
] as const

function nyckelMaterial(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || null
}

const kodare = new TextEncoder()

function base64url(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function franBase64url(s: string): Uint8Array {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  const ut = new Uint8Array(b.length)
  for (let i = 0; i < b.length; i++) ut[i] = b.charCodeAt(i)
  return ut
}

let nyckelLofte: Promise<CryptoKey> | null = null

function hmacNyckel(material: string): Promise<CryptoKey> {
  if (!nyckelLofte) {
    nyckelLofte = crypto.subtle.importKey(
      'raw',
      kodare.encode('jc-anvandare-header:' + material),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    )
  }
  return nyckelLofte
}

/** Kodar och signerar användaren. Null om nyckeln saknas. */
export async function signeraAnvandare(user: User): Promise<string | null> {
  const material = nyckelMaterial()
  if (!material) return null
  const utdrag: Record<string, unknown> = {}
  for (const f of FALT) {
    const v = (user as unknown as Record<string, unknown>)[f]
    if (v !== undefined) utdrag[f] = v
  }
  const kropp = base64url(kodare.encode(JSON.stringify(utdrag)))
  const sig = await crypto.subtle.sign('HMAC', await hmacNyckel(material), kodare.encode(kropp))
  return `${kropp}.${base64url(new Uint8Array(sig))}`
}

/** Verifierar signaturen och returnerar användaren, annars null. */
export async function lasSigneradAnvandare(varde: string | null | undefined): Promise<User | null> {
  if (!varde) return null
  const material = nyckelMaterial()
  if (!material) return null
  const punkt = varde.indexOf('.')
  if (punkt <= 0) return null
  const kropp = varde.slice(0, punkt)
  try {
    const ok = await crypto.subtle.verify(
      'HMAC',
      await hmacNyckel(material),
      franBase64url(varde.slice(punkt + 1)),
      kodare.encode(kropp)
    )
    if (!ok) return null
    const user = JSON.parse(new TextDecoder().decode(franBase64url(kropp))) as User
    return user && typeof user.id === 'string' ? user : null
  } catch {
    return null
  }
}
