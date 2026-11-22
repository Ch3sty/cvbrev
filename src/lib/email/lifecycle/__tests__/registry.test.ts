// Registret (beslut-mejl-och-radering 1c): kampanjen "Vi ändrar gratisnivån" är
// pensionerad, så en kvarglömd rad i email_schedule hittar ingen mall.
import { describe, expect, it } from 'vitest'

import { resolveLifecycleEmail } from '../registry'

describe('resolveLifecycleEmail', () => {
  it('känner inte längre till gratisnivåns kampanj', () => {
    expect(resolveLifecycleEmail('campaign_gratisniva_andras')).toBeNull()
  })

  it('hittar fortfarande förnyelsebeskedet med datumsuffix', () => {
    expect(resolveLifecycleEmail('paket_fornyas_2026-11-23')?.type).toBe('paket_fornyas')
  })
})
