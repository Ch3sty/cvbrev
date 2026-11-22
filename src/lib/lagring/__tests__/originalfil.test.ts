import { describe, expect, it } from 'vitest'
import { originalfilHref, originalfilNamn, originalfilSokvag } from '../originalfil'

const ID = 'eaae1e54-6e46-4fdf-bc44-602d7e0867ae'
const ANNAN = '3a684b50-127b-48e5-a91d-d39bd89eddc9'

describe('originalfilen', () => {
  it('en uppladdad fil i kontots egen mapp har en väg', () => {
    expect(originalfilSokvag(`users/${ID}/test-testsson-cv__vmwrn0zla.pdf`, ID)).toBe(`users/${ID}/test-testsson-cv__vmwrn0zla.pdf`)
    expect(originalfilSokvag(`users/${ID}/cv.docx`, ID)).not.toBeNull()
  })

  it('ingen knapp för byggarens CV, provsidornas, ett annat kontos fil eller en saknad väg', () => {
    expect(originalfilSokvag(`ai-improved/${ID}/123-cv.txt`, ID)).toBeNull()
    expect(originalfilSokvag(`prova/${ID}/123.json`, ID)).toBeNull()
    expect(originalfilSokvag(`users/${ANNAN}/cv.pdf`, ID)).toBeNull()
    expect(originalfilSokvag(`users/${ID}/../${ANNAN}/cv.pdf`, ID)).toBeNull()
    expect(originalfilSokvag(`users/${ID}/.placeholder`, ID)).toBeNull()
    expect(originalfilSokvag(`users/${ID}/chat_attachments/temp/1_cv.pdf`, ID)).toBe(`users/${ID}/chat_attachments/temp/1_cv.pdf`)
    expect(originalfilSokvag(null, ID)).toBeNull()
    expect(originalfilSokvag('', ID)).toBeNull()
    expect(originalfilSokvag(`users/${ID}/cv.pdf`, null)).toBeNull()
  })

  it('adressen och filnamnet', () => {
    expect(originalfilHref(ID)).toBe(`/api/cv/originalfil?cv=${ID}`)
    expect(originalfilNamn('test-testsson-cv.pdf', `users/${ID}/test-testsson-cv__x.pdf`)).toBe('test-testsson-cv.pdf')
    expect(originalfilNamn('Mitt CV', `users/${ID}/mitt-cv.docx`)).toBe('Mitt CV.docx')
    expect(originalfilNamn('', `users/${ID}/mitt-cv.pdf`)).toBe('mitt-cv.pdf')
  })
})
