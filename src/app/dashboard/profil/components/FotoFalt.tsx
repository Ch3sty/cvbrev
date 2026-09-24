'use client'

/**
 * Fotofältet (docs/design/profil-registrering-2026-09-24.html, Del A, "Fem
 * lägen för fotot, alla i samma ruta"). Ramen är 88 px på mobil och 96 på
 * desktop och visar samma sak som CV:t kommer att visa. En sekundärknapp,
 * en textlänk när det finns något att ta bort, och en metarad.
 *
 *   tom     silhuett, "Ladda upp foto"
 *   laddar  förhandsvisningen dämpad, "Laddar upp", "Bilden förminskas till 800 px"
 *   klar    fotot, "Byt foto" och "Ta bort"
 *   google  som klar, metaraden "Hämtat från ditt Google-konto"
 *   fel     felrad under ramen med rubrik och vad man gör. Aldrig toast.
 *
 * Bilden förminskas i klienten före uppladdningen (längsta sidan 800 px,
 * JPEG 0,85), så mobilkamerans 3 till 6 MB ryms under 2 MB-gränsen. Dra och
 * släpp bara där det går att dra, alltså vid (pointer: fine).
 */

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { capture } from '@/lib/analytics/events'
import { forminskaBild, OlasbarBild } from '@/lib/profil/forminska-bild'
import type { FieldSaveState } from './useFieldSave'
import { FOTO } from '../profil-copy'

const TILLATNA = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_BYTES = 2 * 1024 * 1024

export interface FotoFaltProps {
  url: string
  franGoogle: boolean
  /** Sparar profile_photo_url. */
  onUppladdad: (url: string) => void
  onBorttagen: () => void
  state: FieldSaveState
}

type Fel = { rubrik: string; text: string }

const KNAPP =
  'inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-kant-stark bg-panel px-4 text-sm font-semibold text-ink-1 transition-colors hover:bg-insunken disabled:cursor-not-allowed disabled:opacity-60'
const LANK =
  'inline-flex min-h-11 items-center px-2 text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1 disabled:opacity-60'

export default function FotoFalt({ url, franGoogle, onUppladdad, onBorttagen, state }: FotoFaltProps) {
  const input = useRef<HTMLInputElement>(null)
  const [laddar, setLaddar] = useState(false)
  const [forhand, setForhand] = useState<string | null>(null)
  const [fel, setFel] = useState<Fel | null>(null)
  const [dra, setDra] = useState(false)
  const [kanDra, setKanDra] = useState(false)

  useEffect(() => {
    try {
      setKanDra(window.matchMedia('(pointer: fine)').matches)
    } catch {
      setKanDra(false)
    }
  }, [])

  useEffect(() => () => {
    if (forhand) URL.revokeObjectURL(forhand)
  }, [forhand])

  const misslyckas = (reason: 'too_large' | 'type' | 'network', f: Fel) => {
    setFel(f)
    capture('profile_photo_failed', { reason })
  }

  const ladda = async (fil: File) => {
    setFel(null)
    if (!TILLATNA.includes(fil.type.toLowerCase())) {
      misslyckas('type', FOTO.fel.typ)
      return
    }
    setLaddar(true)
    const lokal = URL.createObjectURL(fil)
    setForhand(lokal)
    try {
      let blob: Blob
      try {
        blob = await forminskaBild(fil, 800, 0.85)
      } catch (e) {
        if (e instanceof OlasbarBild) {
          misslyckas('type', FOTO.fel.typ)
          return
        }
        blob = fil
      }
      if (blob.size > MAX_BYTES) {
        const mb = (blob.size / (1024 * 1024)).toFixed(1).replace('.', ',')
        misslyckas('too_large', { rubrik: FOTO.fel.stor.rubrik, text: FOTO.fel.stor.text(mb) })
        return
      }
      const skickas =
        blob === fil ? fil : new File([blob], 'profilbild.jpg', { type: blob.type || 'image/jpeg' })
      const data = new FormData()
      data.append('file', skickas)
      let res: Response
      try {
        res = await fetch('/api/profile/photo/upload', { method: 'POST', body: data })
      } catch {
        misslyckas('network', FOTO.fel.nat)
        return
      }
      if (!res.ok) {
        misslyckas(res.status === 413 ? 'too_large' : res.status === 400 ? 'type' : 'network', res.status === 400 ? FOTO.fel.typ : FOTO.fel.nat)
        return
      }
      const { photoUrl } = (await res.json()) as { photoUrl: string }
      capture('profile_photo_uploaded', {
        source: 'upload',
        resized: skickas !== fil,
        bytes_before: fil.size,
        bytes_after: skickas.size,
      })
      onUppladdad(photoUrl)
    } finally {
      setLaddar(false)
      setForhand(null)
    }
  }

  const taBort = async () => {
    setFel(null)
    setLaddar(true)
    try {
      const res = await fetch('/api/profile/photo/delete', { method: 'DELETE' })
      if (!res.ok) throw new Error()
      onBorttagen()
    } catch {
      setFel(FOTO.fel.nat)
    } finally {
      setLaddar(false)
    }
  }

  const visad = forhand ?? url
  const meta = laddar ? FOTO.metaLaddar : url && franGoogle ? FOTO.metaGoogle : FOTO.meta

  return (
    <div
      onDragOver={
        kanDra
          ? (e) => {
              e.preventDefault()
              setDra(true)
            }
          : undefined
      }
      onDragLeave={kanDra ? () => setDra(false) : undefined}
      onDrop={
        kanDra
          ? (e) => {
              e.preventDefault()
              setDra(false)
              const f = e.dataTransfer.files?.[0]
              if (f) void ladda(f)
            }
          : undefined
      }
    >
      <p className="flex items-baseline gap-2 text-sm font-medium leading-5 text-ink-1">
        {FOTO.etikett}
        <span className="text-meta font-normal text-ink-3">Valfritt</span>
      </p>

      <div className="mt-2 flex items-center gap-4" data-foto-falt>
        <div
          className={`relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl border sm:h-24 sm:w-24 ${
            dra ? 'border-ink-1' : visad ? 'border-kant' : 'border-kant bg-insunken'
          }`}
        >
          {visad ? (
            forhand ? (
              // Förhandsvisningen är en lokal blob, därför vanlig img.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={forhand} alt="" className="h-full w-full object-cover opacity-60" />
            ) : (
              <Image src={visad} alt="" width={96} height={96} className="h-full w-full object-cover" />
            )
          ) : (
            <svg viewBox="0 0 40 40" className="absolute inset-0 m-auto h-10 w-10 text-ink-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <circle cx="20" cy="15" r="7" />
              <path d="M7 35a13 13 0 0 1 26 0" />
            </svg>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1">
            <button type="button" disabled={laddar} onClick={() => input.current?.click()} className={KNAPP}>
              {laddar ? (
                FOTO.laddar
              ) : url ? (
                FOTO.byt
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                    <circle cx="12" cy="13" r="3.5" />
                  </svg>
                  {FOTO.ladda}
                </>
              )}
            </button>
            {url && !laddar ? (
              <button type="button" onClick={taBort} className={LANK}>
                {FOTO.taBort}
              </button>
            ) : null}
          </div>
          <p className="mt-1 text-meta text-ink-3">{meta}</p>
        </div>
      </div>

      {fel ? (
        <div role="alert" className="mt-2 flex items-start gap-2.5 rounded-lg border border-fel-kant bg-fel-mjuk p-3 text-fel">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="mt-px shrink-0" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
          </svg>
          <div>
            <p className="text-sm font-semibold leading-5">{fel.rubrik}</p>
            <p className="mt-0.5 text-sm leading-[22px] text-fel-morker">{fel.text}</p>
          </div>
        </div>
      ) : state.status !== 'idle' ? (
        <p
          className={`mt-1.5 text-meta ${state.status === 'error' ? 'text-fel' : state.status === 'saved' ? 'text-positiv' : 'text-ink-3'}`}
          aria-live="polite"
        >
          {state.status === 'error' ? state.message : state.status === 'saved' ? 'Sparat' : 'Sparar'}
        </p>
      ) : null}

      <p className="mt-2 text-sm leading-[22px] text-ink-2">{FOTO.forklaring}</p>

      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void ladda(f)
          e.target.value = ''
        }}
        className="hidden"
        data-foto-input
      />
    </div>
  )
}
