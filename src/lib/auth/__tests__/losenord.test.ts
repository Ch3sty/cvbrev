/**
 * Lösenordets längd (svep 4, 2026-11-22): en gräns, en hjälptext och ett fel
 * för alla ställen där ett lösenord sätts, och Supabases svar för svagt
 * lösenord känns igen så att det aldrig visas rått.
 */
import { describe, expect, it } from 'vitest'
import { LOSENORD_FEL, LOSENORD_HJALP, MIN_LOSENORD, arSvagtLosenord, losenordForKort } from '../losenord'
import { STEG2 } from '@/components/registrering/registrering-copy'

describe('lösenordets längd', () => {
  it('gränsen är 8, som Supabase Auth', () => {
    expect(MIN_LOSENORD).toBe(8)
    expect(LOSENORD_HJALP).toBe('Minst 8 tecken')
    expect(LOSENORD_FEL).toBe('Lösenordet måste vara minst 8 tecken.')
  })

  it('den vanliga registreringen har samma lydelser', () => {
    expect(STEG2.losenPlats).toBe(LOSENORD_HJALP)
    expect(STEG2.fel.losen).toBe(LOSENORD_FEL)
  })

  it('sju tecken är för kort, åtta räcker', () => {
    expect(losenordForKort('1234567')).toBe(LOSENORD_FEL)
    expect(losenordForKort('12345678')).toBeNull()
  })

  it('Supabases svar för svagt lösenord känns igen', () => {
    expect(arSvagtLosenord({ code: 'weak_password', message: 'x' })).toBe(true)
    expect(arSvagtLosenord({ name: 'AuthWeakPasswordError', message: '' })).toBe(true)
    expect(arSvagtLosenord({ message: 'Password should be at least 8 characters.' })).toBe(true)
    expect(arSvagtLosenord({ message: 'Password should contain at least one character of each: abc' })).toBe(true)
    expect(arSvagtLosenord(new Error('Password should be at least 8 characters.'))).toBe(true)
  })

  it('andra fel är inte svagt lösenord', () => {
    expect(arSvagtLosenord({ code: 'user_already_exists', message: 'User already registered' })).toBe(false)
    expect(arSvagtLosenord({ code: 'same_password', message: 'New password should be different from the old password.' })).toBe(false)
    expect(arSvagtLosenord(null)).toBe(false)
  })
})
