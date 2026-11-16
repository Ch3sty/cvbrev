'use client'

/**
 * Uppladdningen högst upp på mallsidan (ägarens punkt 9, skissen yta 1):
 * dra och släpp eller välj fil, PDF eller Word, högst 5 MB, "eller skriv
 * ditt namn". Ankaret #ladda-upp tar emot artiklarnas "Ladda upp"-länk;
 * sidan rullar hit och ytan får en fokusram.
 */
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import TurnstileWidget from '@/components/auth/TurnstileWidget'
import { IkonBock, IkonUppladdning } from '@/components/illustrations/MallIkoner'
import { UPPLADDNING } from '../texter'
import { useProva, type Inlasning } from './ProvaKontext'

const FELTEXT: Record<Extract<Inlasning, { lage: 'fel' }>['kod'], { rubrik?: string; text: string; konto?: string }> = {
  for_stor: { text: UPPLADDNING.forStor },
  fel_typ: { text: UPPLADDNING.felTyp },
  kvot: { rubrik: UPPLADDNING.kvotRubrik, text: UPPLADDNING.kvotSlut, konto: UPPLADDNING.skapaKonto },
  tak: { rubrik: UPPLADDNING.takRubrik, text: UPPLADDNING.tak, konto: UPPLADDNING.skapaKonto },
  bild_pdf: { rubrik: UPPLADDNING.bildPdfRubrik, text: UPPLADDNING.bildPdfText, konto: UPPLADDNING.bildPdfKonto },
  tom: { rubrik: UPPLADDNING.bildPdfRubrik, text: UPPLADDNING.bildPdfText, konto: UPPLADDNING.bildPdfKonto },
  natfel: { text: UPPLADDNING.natfel },
  robot: { text: UPPLADDNING.robot },
}

export default function Uppladdning({ ton = 'vagg' }: { ton?: 'vagg' | 'papper' }) {
  const { laddaUpp, inlasning, skrivNamn, namn, titel, behoverRobot, setRobotToken } = useProva()
  const input = useRef<HTMLInputElement>(null)
  const namnRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const [markerad, setMarkerad] = useState(false)

  // Artiklarnas länk till #ladda-upp: rulla hit och visa fokusramen.
  useEffect(() => {
    const kolla = () => {
      if (window.location.hash === '#ladda-upp') {
        setMarkerad(true)
        window.setTimeout(() => setMarkerad(false), 2400)
      }
    }
    kolla()
    window.addEventListener('hashchange', kolla)
    return () => window.removeEventListener('hashchange', kolla)
  }, [])

  const laddar = inlasning.lage === 'laddar'
  const fel = inlasning.lage === 'fel' ? FELTEXT[inlasning.kod] : null
  const morkt = ton === 'vagg'

  return (
    <div id="ladda-upp" className="scroll-mt-24">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          const f = e.dataTransfer.files?.[0]
          if (f) laddaUpp(f)
        }}
        className={`grid justify-items-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-5 text-center transition-colors ${
          over ? 'border-koppar bg-koppar-mjuk' : 'border-kant-stark bg-papper'
        } ${markerad ? 'outline outline-[3px] outline-offset-2 outline-koppar' : ''}`}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ton text-ton-ink">
          {inlasning.lage === 'klar' ? <IkonBock size={22} /> : <IkonUppladdning size={22} />}
        </span>
        {laddar ? (
          <>
            <b className="font-display text-base text-ink-1" role="status">
              {UPPLADDNING.laddar}
            </b>
            <span className="text-meta text-ink-2">{inlasning.filnamn}</span>
            {inlasning.langsamt ? <span className="text-meta text-ink-3">{UPPLADDNING.laddarLangsamt}</span> : null}
            <span aria-hidden className="mt-1 h-1 w-40 overflow-hidden rounded-full bg-papper-2">
              <span className="block h-full w-1/3 animate-[dokLaddar_1.2s_ease-in-out_infinite] rounded-full bg-koppar motion-reduce:animate-none" />
            </span>
          </>
        ) : inlasning.lage === 'klar' && inlasning.filnamn ? (
          <>
            <b className="font-display text-base text-ink-1">{inlasning.filnamn}</b>
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="mt-1 inline-flex h-11 items-center rounded-xl border border-kant-stark bg-papper px-4 text-sm font-semibold text-ink-1"
            >
              {UPPLADDNING.bytFil}
            </button>
          </>
        ) : (
          <>
            <b className="font-display text-base text-ink-1">
              {over ? UPPLADDNING.slapp : <><span className="min-[900px]:hidden">{UPPLADDNING.rubrikMobil}</span><span className="hidden min-[900px]:inline">{UPPLADDNING.rubrikDator}</span></>}
            </b>
            <span className="text-meta text-ink-2">
              <span className="min-[900px]:hidden">{UPPLADDNING.underMobil}</span>
              <span className="hidden min-[900px]:inline">{UPPLADDNING.underDator}</span>
            </span>
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="mt-1 inline-flex h-11 items-center rounded-xl border border-kant-stark bg-papper px-5 text-sm font-semibold text-ink-1 hover:border-ink-1"
            >
              {UPPLADDNING.valjFil}
            </button>
          </>
        )}
        <input
          ref={input}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          tabIndex={-1}
          aria-label={UPPLADDNING.valjFil}
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            if (f) laddaUpp(f)
          }}
        />
      </div>

      {behoverRobot ? (
        <div className="mt-2">
          <TurnstileWidget onToken={setRobotToken} />
        </div>
      ) : null}

      {fel ? (
        <div role="alert" className="mt-2.5 rounded-xl border border-fel/30 bg-fel-mjuk px-3 py-2.5 text-left text-[13px] leading-5 text-ink-1">
          {fel.rubrik ? <b className="block">{fel.rubrik}</b> : null}
          <span>{fel.text}</span>
          <span className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
            <button type="button" onClick={() => namnRef.current?.focus()} className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">
              {UPPLADDNING.bildPdfFyll}
            </button>
            {fel.konto ? (
              <Link href="/register?borja=cv" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">
                {fel.konto}
              </Link>
            ) : (
              <button type="button" onClick={() => input.current?.click()} className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">
                {UPPLADDNING.forsokIgen}
              </button>
            )}
          </span>
        </div>
      ) : null}

      <div className={`my-2.5 flex items-center gap-2.5 text-xs ${morkt ? 'text-vagg-mjuk' : 'text-ink-3'} before:flex-1 before:border-t before:border-current before:opacity-30 after:flex-1 after:border-t after:border-current after:opacity-30`}>
        <span className="min-[900px]:hidden">{UPPLADDNING.ellerNamn}</span>
        <span className="hidden min-[900px]:inline">{UPPLADDNING.ellerNamnKort}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="sr-only">{UPPLADDNING.namn}</span>
          <input
            ref={namnRef}
            value={namn}
            onChange={(e) => skrivNamn(e.target.value, titel)}
            placeholder={UPPLADDNING.namn}
            autoComplete="name"
            className="h-12 w-full rounded-[10px] border border-kant-stark bg-papper px-3 text-sm text-ink-1 outline-none placeholder:text-ink-3 focus:border-ink-1"
          />
        </label>
        <label className="block">
          <span className="sr-only">{UPPLADDNING.titel}</span>
          <input
            value={titel}
            onChange={(e) => skrivNamn(namn, e.target.value)}
            placeholder={UPPLADDNING.titel}
            autoComplete="organization-title"
            className="h-12 w-full rounded-[10px] border border-kant-stark bg-papper px-3 text-sm text-ink-1 outline-none placeholder:text-ink-3 focus:border-ink-1"
          />
        </label>
      </div>
    </div>
  )
}
