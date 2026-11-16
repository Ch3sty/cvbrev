'use client'

/**
 * Fotot (trions beslut om punkt 10, skissen "Foto för den som inte har
 * konto"): fotot läggs till när kontot finns. Utloggad: arket "Foto" med
 * kontoknappen och "Fortsätt utan foto"; platsen visar initialen i mallens
 * färg under redigering (aldrig i PDF:en). Inloggad: filväljaren eller
 * kameran direkt, "Foto på" med miniatyr, sedan Byt foto eller Ta bort.
 */
import { useRef, useState } from 'react'
import { capture } from '@/lib/analytics/events'
import { forminskaBild, OlasbarBild } from '@/lib/profil/forminska-bild'
import Ark from './Ark'
import { FOTO_ARK } from './texter'

export function FotoArkUtloggad({ open, onClose, onKonto }: { open: boolean; onClose: () => void; onKonto: () => void }) {
  return (
    <Ark
      open={open}
      onClose={onClose}
      rubrik={FOTO_ARK.rubrik}
      under={FOTO_ARK.text}
      fot={
        <div className="grid gap-2">
          <button
            type="button"
            onClick={onKonto}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[linear-gradient(180deg,#E8863B,var(--koppar)_60%,var(--koppar-djup))] px-4 text-sm font-semibold text-koppar-text"
          >
            {FOTO_ARK.konto}
          </button>
          <button type="button" onClick={onClose} className="inline-flex min-h-11 items-center justify-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4">
            {FOTO_ARK.utan}
          </button>
        </div>
      }
    >
      <span />
    </Ark>
  )
}

const MAX_BYTES = 5 * 1024 * 1024

/**
 * Inloggad: knappen i verktygsraden öppnar filväljaren direkt när inget foto
 * finns; finns ett foto öppnas arket med Byt foto och Ta bort.
 */
export function useFotoInloggad(onAndrat: (url: string | null) => void) {
  const input = useRef<HTMLInputElement>(null)
  const [fel, setFel] = useState<string | null>(null)
  const [laddar, setLaddar] = useState(false)

  const valj = () => input.current?.click()

  const ladda = async (fil: File) => {
    setFel(null)
    setLaddar(true)
    try {
      let blob: Blob = fil
      try {
        blob = await forminskaBild(fil, 800, 0.85)
      } catch (e) {
        if (e instanceof OlasbarBild) throw e
      }
      if (blob.size > MAX_BYTES) throw new Error('stor')
      const skickas = blob === fil ? fil : new File([blob], 'profilbild.jpg', { type: blob.type || 'image/jpeg' })
      const data = new FormData()
      data.append('file', skickas)
      const res = await fetch('/api/profile/photo/upload', { method: 'POST', body: data })
      if (!res.ok) throw new Error('nat')
      const { photoUrl } = (await res.json()) as { photoUrl: string }
      capture('profile_photo_uploaded', { source: 'upload', resized: skickas !== fil, bytes_before: fil.size, bytes_after: skickas.size })
      onAndrat(photoUrl)
    } catch {
      capture('profile_photo_failed', { reason: 'network' })
      setFel(FOTO_ARK.fel)
    } finally {
      setLaddar(false)
    }
  }

  const taBort = async () => {
    setFel(null)
    setLaddar(true)
    try {
      const res = await fetch('/api/profile/photo/delete', { method: 'DELETE' })
      if (!res.ok) throw new Error()
      onAndrat(null)
    } catch {
      setFel(FOTO_ARK.fel)
    } finally {
      setLaddar(false)
    }
  }

  const filInput = (
    <input
      ref={input}
      type="file"
      accept="image/*"
      className="sr-only"
      tabIndex={-1}
      aria-hidden
      onChange={(e) => {
        const f = e.target.files?.[0]
        e.target.value = ''
        if (f) void ladda(f)
      }}
    />
  )
  return { valj, taBort, fel, laddar, filInput }
}

export function FotoArkInloggad({
  open,
  onClose,
  fotoUrl,
  onByt,
  onTaBort,
  fel,
}: {
  open: boolean
  onClose: () => void
  fotoUrl: string | null
  onByt: () => void
  onTaBort: () => void
  fel: string | null
}) {
  return (
    <Ark open={open} onClose={onClose} rubrik={FOTO_ARK.rubrik}>
      <div className="flex items-center gap-4 pb-2">
        {fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fotoUrl} alt="" className="h-20 w-20 rounded-full border border-kant object-cover" />
        ) : null}
        <div className="grid flex-1 gap-2">
          <button type="button" onClick={onByt} className="inline-flex h-11 items-center justify-center rounded-xl bg-ink-1 px-4 text-sm font-semibold text-papper">
            {FOTO_ARK.byt}
          </button>
          <button type="button" onClick={onTaBort} className="inline-flex h-11 items-center justify-center rounded-xl border border-kant-stark px-4 text-sm font-semibold text-ink-1">
            {FOTO_ARK.taBort}
          </button>
        </div>
      </div>
      {fel ? (
        <p role="alert" className="text-sm text-fel">
          {fel}
        </p>
      ) : null}
    </Ark>
  )
}
