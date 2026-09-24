/**
 * Klientförminskningen av profilfoton (profil-registrering 2026-09-24,
 * Del A, beslut 5) och statusraden för saknade CV-uppgifter.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { forminskaBild, malStorlek, OlasbarBild } from '../forminska-bild'
import { saknasText } from '@/app/dashboard/profil/components/SaknasRad'

describe('malStorlek', () => {
  it('längsta sidan blir 800 px och proportionerna står kvar', () => {
    expect(malStorlek(4032, 3024)).toEqual({ bredd: 800, hojd: 600 })
    expect(malStorlek(3024, 4032)).toEqual({ bredd: 600, hojd: 800 })
  })
  it('skalar aldrig upp', () => {
    expect(malStorlek(640, 480)).toEqual({ bredd: 640, hojd: 480 })
    expect(malStorlek(800, 800)).toEqual({ bredd: 800, hojd: 800 })
  })
})

describe('forminskaBild', () => {
  const orig = { createImageBitmap: (globalThis as any).createImageBitmap }
  afterEach(() => {
    ;(globalThis as any).createImageBitmap = orig.createImageBitmap
    vi.restoreAllMocks()
  })

  function mockaCanvas(utBytes: number) {
    const ritat: unknown[] = []
    const ctx = { fillStyle: '', fillRect: () => {}, drawImage: (...a: unknown[]) => ritat.push(a), imageSmoothingQuality: '' }
    const skapa = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag !== 'canvas') return skapa(tag)
      const c = skapa('canvas') as HTMLCanvasElement
      ;(c as any).getContext = () => ctx
      ;(c as any).toBlob = (cb: (b: Blob) => void, typ: string, kvalitet: number) =>
        cb(Object.assign(new Blob([new Uint8Array(utBytes)], { type: typ }), { kvalitet }))
      return c
    })
    return { ritat, ctx }
  }

  it('ett 5 MB-foto från mobilkameran blir en JPEG under 2 MB med längsta sidan 800', async () => {
    const stangd = vi.fn()
    ;(globalThis as any).createImageBitmap = vi.fn(async (_f: Blob, opt: any) => {
      expect(opt).toEqual({ imageOrientation: 'from-image' })
      return { width: 4032, height: 3024, close: stangd }
    })
    const { ritat } = mockaCanvas(180_000)
    const fil = new File([new Uint8Array(5 * 1024 * 1024)], 'IMG_1234.jpg', { type: 'image/jpeg' })
    const ut = await forminskaBild(fil)
    expect(ut.type).toBe('image/jpeg')
    expect(ut.size).toBeLessThan(2 * 1024 * 1024)
    expect((ut as any).kvalitet).toBe(0.85)
    expect(ritat[0]).toEqual([expect.anything(), 0, 0, 800, 600])
    expect(stangd).toHaveBeenCalled()
  })

  it('en liten bild skickas som den är', async () => {
    ;(globalThis as any).createImageBitmap = vi.fn(async () => ({ width: 600, height: 600, close: () => {} }))
    const fil = new File([new Uint8Array(40_000)], 'a.png', { type: 'image/png' })
    expect(await forminskaBild(fil)).toBe(fil)
  })

  it('en fil som inte går att avkoda ger OlasbarBild (felraden "Filen går inte att läsa")', async () => {
    ;(globalThis as any).createImageBitmap = vi.fn(async () => {
      throw new Error('decode')
    })
    const fil = new File([new Uint8Array(10)], 'a.jpg', { type: 'image/jpeg' })
    await expect(forminskaBild(fil)).rejects.toBeInstanceOf(OlasbarBild)
  })

  it('utan createImageBitmap returneras originalet', async () => {
    ;(globalThis as any).createImageBitmap = undefined
    const fil = new File([new Uint8Array(10)], 'a.jpg', { type: 'image/jpeg' })
    expect(await forminskaBild(fil)).toBe(fil)
  })
})

describe('statusraden räknar namn och ort, aldrig foto', () => {
  it('namn saknas ger varm rad', () => {
    expect(saknasText({ namn: false, ort: false })).toEqual({
      ton: 'warm',
      text: 'Namnet saknas. Utan det kan vi inte skapa ditt CV.',
    })
  })
  it('bara ort saknas ger neutral rad', () => {
    expect(saknasText({ namn: true, ort: false })).toEqual({ ton: 'neutral', text: 'Ort saknas i ditt CV' })
  })
  it('namn och ort ifyllda ger ingen rad, och ordet foto förekommer aldrig', () => {
    expect(saknasText({ namn: true, ort: true })).toBeNull()
    for (const namn of [true, false])
      for (const ort of [true, false]) expect(saknasText({ namn, ort })?.text ?? '').not.toMatch(/foto/i)
  })
})
