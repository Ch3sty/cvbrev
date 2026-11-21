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
import { kopstegHref } from '@/lib/onboarding/steps'
import { SALD_PLAN } from '@/lib/plans/plans'
import Mallyta from '../Mallyta'
import KontoArk from '../KontoArk'
import Final from '../FinalArk'
import Merforsaljning from '../MerforsaljningArk'
import { merforsaljningsUrval } from '../Merforsaljning'
import { FotoArkUtloggad } from '../FotoArk'
import { useForhandsvisning, useNedladdning, type Kalla } from '../hooks'
import type { Matning } from '../matning'
import { FOTO_ARK, KNAPP, KONTO_ARK, SKAL, UPPLADDNING } from '../texter'
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

  const forslag = useMemo(() => raknaForslag(p.katalog, p.cv, matning?.sidor ?? 1, 3, Boolean(p.cv?.personalInfo.profilePhotoUrl)), [p.katalog, p.cv, matning?.sidor])
  const gratis = p.katalog.find((m) => m.id === forslag.ids[0] && m.niva === 'gratis') ?? p.katalog.find((m) => m.niva === 'gratis')!
  const premium = p.mall.niva === 'premium'
  const tier = p.mall.niva === 'premium' ? 'premium' : 'free'
  // Köpet är premiummallen. Word i en gratismall är gratisfilen (ägarens
  // besked 2026-11-16), Word i en premiummall ingår i samma köp.
  const kop = premium
  // Premiumknappen i två avsiktliga rader (granskningen V3): handlingen och priset.
  const knappText = kop ? KNAPP.laddaNerIMall(p.format, p.mall.namn) : KNAPP.laddaNer(p.format)
  const knappUnder = kop ? KNAPP.premiumPris(p.prisNu) : undefined

  /**
   * Till köpsteget med mallen och köpreturen (affärsgranskningen B2, B3):
   * efter betalningen tillbaka till galleriet med CV:t och mallen, och
   * nedladdningen startar. Ingen extra vägg efter ett ja.
   */
  const tillKopet = (mallId: string, id: string | null, format: 'pdf' | 'docx') => {
    const q = new URLSearchParams({ ...(id ? { cv: id } : {}), mall: mallId, format })
    window.location.assign(kopstegHref(SALD_PLAN, 'mall', { mall: mallId, retur: `/dashboard/cv-mallar?${q.toString()}` }))
  }

  /** Utkastet till kontot, en gång per konto och utkast (servern återanvänder raden). */
  const hamtaUtkast = useCallback(async (): Promise<string | null> => {
    if (cvId) return cvId
    const u = lasUtkast()
    const cv = p.cv ?? u?.cv
    if (!cv) return null
    const res = await fetch('/api/cv/prova/hamta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cv, rubriker: p.val.rubriker, filnamn: u?.filnamn ?? undefined }),
    }).catch(() => null)
    const j = res ? ((await res.json().catch(() => ({}))) as { cvId?: string; ny?: boolean }) : {}
    if (!j.cvId) return null
    setCvId(j.cvId)
    if (j.ny !== false) capture('draft_claimed', { kind: 'cv_prova' })
    return j.cvId
  }, [cvId, p.cv, p.val.rubriker])
  const filnamnet = gorFilnamn(p.mall.namn, p.cv?.personalInfo.fullName || 'cv', p.format)

  /** Utkastet till kontot och sedan filen (eller kassan). */
  const hamtaHem = useCallback(
    async (viaKop: boolean, format = p.format) => {
      const u = lasUtkast()
      const cv = p.cv ?? u?.cv
      if (!cv) return
      setFel(null)
      const id = await hamtaUtkast()
      if (viaKop) {
        rensaUtkast()
        tillKopet(p.mall.id, id, format)
        return
      }
      const ut = await ladda({ mall: p.mall.id, format, val: p.val, structuredData: cv, cvId: id ?? undefined, entry: p.surface, filnamn: gorFilnamn(p.mall.namn, cv.personalInfo.fullName || 'cv', format) })
      if (ut.typ === 'klar') {
        rensaUtkast()
        setFil(ut)
      } else if (ut.typ === 'sparr') {
        // Merförsäljningen bara när gratisfilen är använd (cv_export) och det
        // finns mallar att visa; mallen eller Word i Premium går till köpet.
        if (ut.feature === 'cv_export' && merforsaljningsUrval(p.katalog, p.mall.id, 1, false).length) setMerforsaljning(true)
        else tillKopet(p.mall.id, id, format)
      } else if (ut.typ === 'namn') {
        setFel(UPPLADDNING.namnSaknas)
      } else {
        setFel(ut.text)
      }
    },
    // tillKopet läser bara argument och konstanter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [p.cv, p.val, p.mall, p.format, hamtaUtkast, ladda]
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
    capture('nedladdning_klickad', { template: p.mall.id, format: p.format, inloggad: false, surface: p.surface, tier })
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
    capture('konto_ark_visat', { template: p.mall.id, tier, format: p.format, inloggad: false, surface: p.surface, orsak: 'nedladdning' })
    setKonto('nedladdning')
  }

  // Efter uppladdningen: till arket (granskningen B1). Arkets överkant
  // hamnar under sidhuvudet (scroll-margin 72 px på arbetsytan).
  const forraLage = useRef(p.inlasning.lage)
  useEffect(() => {
    const forra = forraLage.current
    forraLage.current = p.inlasning.lage
    if (forra !== 'laddar' || p.inlasning.lage !== 'klar') return
    // Tipsraden (spåret ovanför arket) direkt under sidhuvudet, arket strax
    // under den: hon ser sitt CV och raden om rubrikerna utan att rulla.
    const el = document.querySelector<HTMLElement>('.mallyta [data-tips-spar]') ?? document.querySelector<HTMLElement>('.mallyta .dok-ark-yta')
    if (!el) return
    const huvud = document.querySelector('header')?.getBoundingClientRect()
    const kant = huvud && huvud.top <= 0 ? huvud.bottom : 0
    let reducera = false
    try {
      reducera = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {
      reducera = false
    }
    window.setTimeout(() => {
      const y = el.getBoundingClientRect().top + window.scrollY - kant - 4
      window.scrollTo({ top: y, behavior: reducera ? 'auto' : 'smooth' })
    }, 50)
  }, [p.inlasning.lage])

  const status =
    p.inlasning.lage === 'klar' && p.cv ? (
      <p className="text-meta text-ink-2" role="status">
        {p.inlasning.saknas.length && p.inlasning.hittade.length
          ? UPPLADDNING.delvis(hittadeText(p.inlasning.hittade), hittadeText(p.inlasning.saknas))
          : p.inlasning.hittade.length
            ? UPPLADDNING.klar(hittadeText(p.inlasning.hittade))
            : null}{' '}
        {p.inlasning.saknas.length ? (
          <button type="button" onClick={p.oppnaFilval} className="font-medium text-ink-1 underline decoration-kant-stark underline-offset-4">
            {UPPLADDNING.annanFil}
          </button>
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
        <button
          type="button"
          onClick={p.oppnaFilval}
          className="inline-flex min-h-11 items-center text-[13px] font-medium text-ink-1 underline decoration-kant-stark underline-offset-4"
        >
          {UPPLADDNING.bytFil}
        </button>
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
        pris={p.prisLang}
        knapp={{ text: knappText, under: knappUnder, onClick: () => void laddaNer(), framsteg }}
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
          vag={
            konto === 'foto'
              ? null
              : kop
                ? { typ: 'kop', mall: p.mall.namn, pris: p.prisLang, fotnot: p.arKampanj ? KONTO_ARK.kampanjFotnot : undefined }
                : { typ: 'gratis', mall: p.mall.namn }
          }
          knapp={konto === 'foto' ? FOTO_ARK.konto : undefined}
          onKlar={() => {
            const viaFoto = konto === 'foto'
            setKonto(null)
            if (!viaFoto) return void hamtaHem(kop)
            // Konto via fotoarket (affärsgranskningen B4): ingen nedladdning,
            // gratisfilen sparas. Utkastet hämtas hem och fotot läggs till i galleriet.
            void (async () => {
              const id = await hamtaUtkast()
              rensaUtkast()
              const q = new URLSearchParams({ ...(id ? { cv: id } : {}), mall: p.mall.id, foto: '1' })
              router.push(`/dashboard/cv-mallar?${q.toString()}`)
            })()
          }}
        />
        <FotoArkUtloggad
          open={foto}
          onClose={() => setFoto(false)}
          onKonto={() => {
            setFoto(false)
            capture('konto_ark_visat', { template: p.mall.id, tier, format: p.format, inloggad: false, surface: p.surface, orsak: 'foto' })
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
              tillKopet(m.id, cvId, p.format)
            }}
            surface={p.surface}
          />
        ) : null}
      </Mallyta>
    </>
  )
}
