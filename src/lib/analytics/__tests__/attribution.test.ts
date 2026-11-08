/**
 * jc_attr läses rätt både på servern och i webbläsaren (analysen 2026-11-08,
 * punkt 5c). Proxyn kodar JSON:en och response.cookies.set kodar en gång
 * till, så document.cookie ger ett dubbelkodat värde. Läsaren avkodade bara
 * en gång, och inget konto som registrerades med e-post fick någon källa.
 */

import { describe, expect, it } from 'vitest'
import { buildAttribution, direktAttribution, parseAttribution, serializeAttribution } from '../attribution'

const attr = buildAttribution({
  pathname: '/artiklar/logiska-tester',
  searchParams: new URLSearchParams(),
  referrer: 'https://www.google.com/',
  now: new Date('2026-11-08T22:00:00Z'),
})

describe('parseAttribution', () => {
  it('läser enkelkodat (servern, efter Nexts avkodning)', () => {
    expect(parseAttribution(serializeAttribution(attr))).toEqual(attr)
  })

  it('läser dubbelkodat (document.cookie, som cookien ser ut i produktion)', () => {
    const dubbel = encodeURIComponent(serializeAttribution(attr))
    expect(parseAttribution(dubbel)).toEqual(attr)
  })

  it('läser okodad JSON och tål skräp', () => {
    expect(parseAttribution(JSON.stringify(attr))).toEqual(attr)
    expect(parseAttribution('%E0%A4%A')).toBeNull()
    expect(parseAttribution('inte json')).toBeNull()
    expect(parseAttribution(encodeURIComponent('[1,2]'))).toBeNull()
    expect(parseAttribution(null)).toBeNull()
  })
})

describe('direktAttribution', () => {
  it('ger en källa som adminens lasKalla läser', () => {
    expect(direktAttribution(new Date('2026-11-08T22:00:00Z'))).toEqual({ kalla: 'direkt', first_seen: '2026-11-08T22:00:00.000Z' })
  })
})
