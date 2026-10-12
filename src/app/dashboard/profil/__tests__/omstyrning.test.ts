import { describe, expect, it } from 'vitest'
import { installningarForAnkare } from '../omstyrning'

describe('installningarForAnkare', () => {
  it('styr om konto, utseende och hjälpen till Inställningar med samma ankare', () => {
    expect(installningarForAnkare('#konto')).toBe('/dashboard/installningar#konto')
    expect(installningarForAnkare('#utseende')).toBe('/dashboard/installningar#utseende')
    expect(installningarForAnkare('hjalp')).toBe('/dashboard/installningar#hjalp')
  })

  it('låter profilens egna ankare och ett tomt ankare stå kvar', () => {
    expect(installningarForAnkare('#cv')).toBeNull()
    expect(installningarForAnkare('#personliga-brev')).toBeNull()
    expect(installningarForAnkare('#jobbsok')).toBeNull()
    expect(installningarForAnkare('')).toBeNull()
    expect(installningarForAnkare(null)).toBeNull()
  })
})
