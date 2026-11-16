'use client'

/**
 * Arbetsytan utan konto (skissen yta 1): exempel-CV:t i gratismallen tills
 * hon laddat upp eller skrivit sitt namn, sedan hennes CV. Ladda ner öppnar
 * kontoarket; efter kontot i samma flik postas utkastet till cv_texts och
 * nedladdningen startar (finalen). Premiummall vald: köpet står i knappen
 * och gratisvägen som bild före kontot (villkor a); efter kontot går hon
 * till kassan i galleriet med CV:t och mallen valda.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { capture } from '@/lib/analytics/events'
import { createClient } from '@/lib/supabase/client'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import type { MallKort, Sektion } from '@/lib/cv/mallar/kontrakt'
import { foreslagna as raknaForslag } from '@/lib/cv/mallval/forslag'
import { lasUtkast, rensaUtkast, sparaUtkast } from '@/lib/cv/mallval/utkast'
import { filnamn as gorFilnamn } from '@/lib/cv/mallval/val'
import { IkonBock } from '@/components/illustrations/MallIkoner'
import Mallyta from '../Mallyta'
import KontoArk from '../KontoArk'
import Final from '../Final'
import Merforsaljning, { merforsaljningsUrval } from '../Merforsaljning'
import { FotoArkUtloggad } from '../FotoArk'
import { useForhandsvisning, useNedladdning, type Kalla } from '../hooks'
import type { Matning } from '../matning'
import { FOTO_ARK, KNAPP, SKAL, UPPLADDNING } from '../texter'
import { hittadeText, useProva } from './ProvaKontext'

const PROVA = '/cv-mallar/prova?hamta=1'

function tommaAvsnitt(cv: CVMetadata | null): Sektion[] {
  if (!cv) return []
  const ut: Sektion[] = []
  if (!cv.summary) ut.push('profil')
  if (!cv.experience.length) ut.push('erfarenhet')
  if (!cv.education.length) ut.push('utbildning')
  if (!cv.skills.length) ut.push('kompetenser')
  return ut
}

export default function ProvaArbetsyta() {
  const p = useProva()
  const router = useRouter()
  const { framsteg, ladda } = useNedladdning()
  const [matning, setMatning] = useState<Matning | null>(null)
  const [konto, setKonto] = useState<null | 'nedladdning' | 'foto'>(null)
  const [foto, setFoto] = useState(false)
  const [fel, setFel] = useState<string | null>(null)
  const [fil, setFil] = useState<{ blob: Blob; url: string; filnamn: string } | null>(null)
  const [merforsaljning, setMerforsaljning] = useState(false)
  const [cvId, setCvId] = useState<string | null>(null)
  const startad = useRef(false)

  const kalla: Kalla = p.cv
    ? { typ: 'publik', cv: p.cv, mall: p.mall.id, val: p.val }
    : { typ: 'exempel', mall: p.mall.id, val: p.val, yrke: p.yrke }
  const fv = useForhandsvisning(kalla)

  const forslag = useMemo(() => raknaForslag(p.katalog, p.cv, matning?.sidor ?? 1), [p.katalog, p.cv, matning?.sidor])
  const gratis = p.katalog.find((m) => m.id === forslag.ids[0] && m.niva === 'gratis') ?? p.katalog.find((m) => m.niva === 'gratis')!
  const premium = p.mall.niva === 'premium'
  const tier = p.mall.niva === 'premium' ? 'premium' : 'free'
  // Köpet är premiummallen. Word i en gratismall är gratisfilen (ägarens
  // besked 2026-11-16), Word i en premiummall ingår i samma köp.
  const kop = premium
  const knappText = kop
    ? KNAPP.laddaNerIPremium(p.format, p.mall.namn, p.prisNu)
    : KNAPP.laddaNer(p.format)
  const filnamnet = gorFilnamn(p.mall.namn, p.cv?.personalInfo.fullName || 'cv', p.format)

  /** Utkastet till kontot och sedan filen (eller kassan). */
  const hamtaHem = useCallback(
    async (viaKop: boolean, format = p.format) => {
      const u = lasUtkast()
      const cv = p.cv ?? u?.cv
      if (!cv) return
      setFel(null)
      let id: string | null = cvId
      if (!id) {
        const res = await fetch('/api/cv/prova/hamta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cv, rubriker: p.val.rubriker, filnamn: u?.filnamn ?? undefined }),
        }).catch(() => null)
        const j = res ? ((await res.json().catch(() => ({}))) as { cvId?: string }) : {}
        if (j.cvId) {
          id = j.cvId
          setCvId(id)
          capture('draft_claimed', { kind: 'cv_prova' })
        }
      }
      if (viaKop) {
        rensaUtkast()
        const q = new URLSearchParams({ mall: p.mall.id, kop: '1' })
        if (id) q.set('cv', id)
        if (format === 'docx') q.set('format', 'docx')
        router.push(`/dashboard/cv-mallar?${q.toString()}`)
        return
      }
      const ut = await ladda({ mall: p.mall.id, format, val: p.val, structuredData: cv, cvId: id ?? undefined, filnamn: gorFilnamn(p.mall.namn, cv.personalInfo.fullName || 'cv', format) })
      if (ut.typ === 'klar') {
        rensaUtkast()
        setFil(ut)
      } else if (ut.typ === 'sparr') {
        // Inga andra mallar att visa: till kassan i galleriet med CV:t valt.
        if (merforsaljningsUrval(p.katalog, p.mall.id, 1, false).length) setMerforsaljning(true)
        else router.push(`/dashboard/cv-mallar?${new URLSearchParams({ mall: p.mall.id, kop: '1', ...(id ? { cv: id } : {}) }).toString()}`)
      } else if (ut.typ === 'namn') {
        setFel(UPPLADDNING.namnSaknas)
      } else {
        setFel(ut.text)
      }
    },
    [p.cv, p.val, p.mall, p.format, cvId, ladda, router]
  )

  // Tillbaka från Google: utkastet väntar på att hämtas hem.
  useEffect(() => {
    if (startad.current) return
    if (!new URLSearchParams(window.location.search).has('hamta')) return
    const u = lasUtkast()
    if (!u?.vantar || !p.cv) return
    startad.current = true
    void hamtaHem(u.vantar.kop, u.vantar.format)
  }, [p.cv, hamtaHem])

  const laddaNer = async () => {
    capture('nedladdning_klickad', { mall: p.mall.id, format: p.format, inloggad: false, surface: p.surface, tier })
    if (!p.cv) {
      document.getElementById('ladda-upp')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    let inloggad = false
    try {
      const { data } = await createClient().auth.getSession()
      inloggad = Boolean(data.session)
    } catch {
      inloggad = false
    }
    if (inloggad) return void hamtaHem(kop)
    const u = lasUtkast()
    if (u) sparaUtkast({ ...u, vantar: { format: p.format, kop } })
    capture('konto_ark_visat', { mall: p.mall.id, tier, format: p.format, inloggad: false, surface: p.surface, orsak: 'nedladdning' })
    setKonto('nedladdning')
  }

  const status =
    p.inlasning.lage === 'klar' && p.cv ? (
      <p className="text-meta text-ink-2" role="status">
        {p.inlasning.saknas.length && p.inlasning.hittade.length
          ? UPPLADDNING.delvis(hittadeText(p.inlasning.hittade), hittadeText(p.inlasning.saknas))
          : p.inlasning.hittade.length
            ? UPPLADDNING.klar(hittadeText(p.inlasning.hittade))
            : null}{' '}
        {p.inlasning.saknas.length ? (
          <a href="#ladda-upp" className="font-medium text-ink-1 underline decoration-kant-stark underline-offset-4">
            {UPPLADDNING.annanFil}
          </a>
        ) : null}
      </p>
    ) : null

  const topp =
    p.inlasning.lage === 'klar' && p.inlasning.filnamn ? (
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex h-9 min-w-0 items-center gap-1.5 rounded-full border border-kant-stark bg-papper px-3 text-[13px] font-semibold text-ink-1">
          <IkonBock size={14} className="shrink-0 text-positiv" />
          <span className="truncate">{p.inlasning.filnamn}</span>
        </span>
        <a href="#ladda-upp" className="inline-flex min-h-11 items-center text-[13px] font-medium text-ink-1 underline decoration-kant-stark underline-offset-4">
          {UPPLADDNING.bytFil}
        </a>
      </div>
    ) : null

  const egenRubrik = (s: Sektion) => Boolean(p.val.rubriker?.[s])

  return (
    <>
      <Mallyta
        surface={p.surface}
        katalog={p.katalog}
        mall={p.mall}
        onMall={(id) => p.setMall(id)}
        val={p.val}
        onVal={(v) => p.setVal(v)}
        format={p.format}
        onFormat={p.setFormat}
        forhandsvisning={fv}
        titel={p.cv ? `Ditt CV i mallen ${p.mall.namn}` : `Exempel-CV i mallen ${p.mall.namn}`}
        foreslagna={forslag.ids}
        skal={p.cv ? SKAL[forslag.skal] : undefined}
        topp={topp}
        status={status}
        kanWord={!premium}
        pris={p.prisNu}
        knapp={{ text: knappText, onClick: () => void laddaNer(), framsteg }}
        gratisVag={premium ? { mall: gratis, onClick: () => p.setMall(gratis.id) } : null}
        fel={fel ? <p role="alert" className="text-sm text-fel">{fel}</p> : null}
        rubriker={
          p.cv
            ? {
                egen: egenRubrik,
                onVal: (s, r) => {
                  const ny = { ...(p.val.rubriker ?? {}) }
                  if (r === null) delete ny[s]
                  else ny[s] = r
                  p.setVal({ ...p.val, rubriker: ny })
                },
              }
            : undefined
        }
        avsnitt={p.cv ? { cv: p.cv, onSpara: p.setCv, tomma: tommaAvsnitt(p.cv) } : undefined}
        onFoto={() => setFoto(true)}
        last={framsteg !== null}
        lyft={framsteg !== null}
        onMatt={setMatning}
      >
        <KontoArk
          open={konto !== null}
          onClose={() => setKonto(null)}
          nasta={PROVA}
          vag={kop ? { typ: 'kop', mall: p.mall.namn, pris: p.prisNu } : { typ: 'gratis', mall: p.mall.namn }}
          rubrik={konto === 'foto' ? FOTO_ARK.konto : undefined}
          onKlar={() => {
            setKonto(null)
            void hamtaHem(konto === 'foto' ? false : kop)
          }}
        />
        <FotoArkUtloggad
          open={foto}
          onClose={() => setFoto(false)}
          onKonto={() => {
            setFoto(false)
            capture('konto_ark_visat', { mall: p.mall.id, tier, format: p.format, inloggad: false, surface: p.surface, orsak: 'foto' })
            setKonto('foto')
          }}
        />
        {fil ? (
          <Final
            open
            onClose={() => setFil(null)}
            fil={fil}
            mall={p.mall}
            format={p.format}
            sidor={matning?.sidor ?? 1}
            cvId={cvId}
            titel={p.cv?.personalInfo.title || p.cv?.experience[0]?.position}
            ort={p.cv?.personalInfo.address || p.cv?.personalInfo.location}
            surface={p.surface}
          />
        ) : null}
        {merforsaljning && p.cv ? (
          <Merforsaljning
            open
            onClose={() => setMerforsaljning(false)}
            katalog={p.katalog}
            nuvarande={p.mall}
            filnamn={filnamnet}
            sidor={matning?.sidor ?? 1}
            harFoto={Boolean(p.cv.personalInfo.profilePhotoUrl)}
            kalla={(mall) => ({ typ: 'publik', cv: p.cv!, mall, val: p.val })}
            pris={p.prisNu}
            kampanj={p.kampanjNu}
            onKop={(m: MallKort) => {
              p.setMall(m.id)
              const q = new URLSearchParams({ mall: m.id, kop: '1' })
              if (cvId) q.set('cv', cvId)
              router.push(`/dashboard/cv-mallar?${q.toString()}`)
            }}
            surface={p.surface}
          />
        ) : null}
      </Mallyta>
    </>
  )
}
