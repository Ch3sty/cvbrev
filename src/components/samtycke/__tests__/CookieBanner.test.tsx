/**
 * Cookie-samtycket: bannern står i server-HTML:en, huvudskriptet döljer den
 * för den som redan svarat, och kroppsskriptet sparar svaret som förut
 * (samma cookie, samma GTM-uppdatering). beslut-banners-2026-10-12, avsnitt 2.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import CookieBanner, { SamtyckeHuvud } from '../CookieBanner'

type Fonster = Window & { dataLayer?: unknown[]; gtag?: unknown }

function rensaCookies() {
  for (const c of document.cookie.split('; ')) {
    const namn = c.split('=')[0]
    if (namn) document.cookie = `${namn}=;max-age=0;path=/`
  }
}

/** Kör skripten i den ordning webbläsaren gör: huvudet, markeringen, kroppen. */
function ladda() {
  const huvud = document.createElement('div')
  huvud.innerHTML = renderToStaticMarkup(<SamtyckeHuvud />)
  new Function(huvud.querySelector('script')!.textContent!)()

  document.body.innerHTML = renderToStaticMarkup(<CookieBanner />)
  new Function(document.body.querySelector('script')!.textContent!)()
}

describe('CookieBanner', () => {
  beforeEach(() => {
    rensaCookies()
    document.documentElement.removeAttribute('data-samtycke')
    const w = window as Fonster
    w.dataLayer = []
    delete w.gtag
  })
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('står i HTML:en utan mall, utan rubrik, med två knappar', () => {
    const html = renderToStaticMarkup(<CookieBanner />)
    expect(html).toContain('id="jc-samtycke"')
    expect(html).not.toContain('<template')
    expect(html).not.toContain('cookie-banner-rubrik')
    expect(html).toContain('Vi använder cookies för att göra tjänsten bättre.')
    expect(html.match(/<button/g)).toHaveLength(2)
  })

  it('ny besökare: bannern står kvar och inget attribut sätts', () => {
    ladda()
    expect(document.getElementById('jc-samtycke')).not.toBeNull()
    expect(document.documentElement.hasAttribute('data-samtycke')).toBe(false)
    expect((window as Fonster).dataLayer).toHaveLength(0)
  })

  it('Acceptera sparar true i 180 dygn, ger GTM granted och tar bort bannern', () => {
    ladda()
    ;(document.getElementById('rcc-confirm-button') as HTMLButtonElement).click()
    expect(document.cookie).toContain('cvBrevCookieConsent=true')
    expect(document.getElementById('jc-samtycke')).toBeNull()
    expect(document.documentElement.getAttribute('data-samtycke')).toBe('svarat')
    const dl = (window as Fonster).dataLayer as unknown[][]
    expect(dl.at(-1)).toEqual(['consent', 'update', expect.objectContaining({ analytics_storage: 'granted', ad_storage: 'granted' })])
  })

  it('Avvisa sparar false och ger GTM denied', () => {
    ladda()
    ;(document.getElementById('rcc-decline-button') as HTMLButtonElement).click()
    expect(document.cookie).toContain('cvBrevCookieConsent=false')
    expect(document.getElementById('jc-samtycke')).toBeNull()
    const dl = (window as Fonster).dataLayer as unknown[][]
    expect(dl.at(-1)).toEqual(['consent', 'update', expect.objectContaining({ analytics_storage: 'denied' })])
  })

  it('den som redan accepterat: dold före målning, granted direkt', () => {
    document.cookie = 'cvBrevCookieConsent=true;path=/'
    ladda()
    expect(document.documentElement.getAttribute('data-samtycke')).toBe('svarat')
    expect(document.getElementById('jc-samtycke')).toBeNull()
    const dl = (window as Fonster).dataLayer as unknown[][]
    expect(dl).toHaveLength(1)
    expect(dl[0]).toEqual(['consent', 'update', expect.objectContaining({ analytics_storage: 'granted' })])
  })

  it('den som redan avvisat: dold, inget till GTM', () => {
    document.cookie = 'cvBrevCookieConsent=false;path=/'
    ladda()
    expect(document.documentElement.getAttribute('data-samtycke')).toBe('svarat')
    expect(document.getElementById('jc-samtycke')).toBeNull()
    expect((window as Fonster).dataLayer).toHaveLength(0)
  })
})
