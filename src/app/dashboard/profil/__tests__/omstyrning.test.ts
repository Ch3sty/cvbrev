import { describe, expect, it, vi } from 'vitest'
import { OMSTYRNING_SKRIPT, installningarForAnkare } from '../omstyrning'

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

describe('OMSTYRNING_SKRIPT', () => {
  const kor = (pathname: string, hash: string) => {
    const replace = vi.fn()
    new Function('location', OMSTYRNING_SKRIPT)({ pathname, hash, replace })
    return replace
  }

  it('byter adress före målning för de flyttade ankarna', () => {
    expect(kor('/dashboard/profil', '#konto')).toHaveBeenCalledWith('/dashboard/installningar#konto')
    expect(kor('/dashboard/profil/', '#utseende')).toHaveBeenCalledWith('/dashboard/installningar#utseende')
    expect(kor('/dashboard/profil', '#hjalp')).toHaveBeenCalledWith('/dashboard/installningar#hjalp')
  })

  it('rör inte profilens egna ankare eller andra sidor', () => {
    expect(kor('/dashboard/profil', '#cv')).not.toHaveBeenCalled()
    expect(kor('/dashboard/profil', '')).not.toHaveBeenCalled()
    expect(kor('/dashboard/profil/prenumeration', '#konto')).not.toHaveBeenCalled()
    expect(kor('/dashboard', '#konto')).not.toHaveBeenCalled()
  })
})
