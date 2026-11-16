'use client'

/**
 * Tillståndet för eget CV utan konto (plan-mallar 3.2, beslut 2), delat
 * mellan uppladdningen högst upp och arbetsytan under på /cv-mallar,
 * /cv-mallar och /cv-mallar/prova.
 *
 * Före uppladdningen visar arbetsytan exempel-CV:t i gratismallen, så sidan
 * aldrig är tom. Efter uppladdningen (eller när hon skriver sitt namn) är
 * det hennes CV, i localStorage som utkast i 24 timmar. Inget sparas på
 * servern förrän kontot finns.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { capture } from '@/lib/analytics/events'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import type { Format, MallKort, MallVal } from '@/lib/cv/mallar/kontrakt'
import { lasUtkast, sparaUtkast, tomtCv, type ProvaUtkast } from '@/lib/cv/mallval/utkast'
import { lasId, valUrParams } from '@/lib/cv/mallval/val'
import { losMallId } from '@/lib/cv/mallval/katalog'
import { TURNSTILE_SITE_KEY } from '@/components/auth/TurnstileWidget'
import { UPPLADDNING, lista } from '../texter'

export type Del = 'kontakt' | 'erfarenhet' | 'utbildning' | 'kompetenser' | 'intyg' | 'sprak'

export type Inlasning =
  | { lage: 'tom' }
  | { lage: 'laddar'; filnamn: string; langsamt: boolean }
  | { lage: 'klar'; filnamn: string | null; hittade: Del[]; saknas: Del[] }
  | { lage: 'fel'; kod: 'for_stor' | 'fel_typ' | 'kvot' | 'tak' | 'bild_pdf' | 'natfel' | 'robot' | 'tom'; filnamn?: string }

export interface PrisInfo {
  ordinarie: string
  kampanjer: { nyckel: string; text: string; lang: string; ordinarieText: string }[]
}

interface Kontext {
  katalog: readonly MallKort[]
  surface: string
  cv: CVMetadata | null
  setCv: (cv: CVMetadata) => void
  mall: MallKort
  setMall: (id: string) => void
  val: MallVal
  setVal: (v: MallVal) => void
  format: Format
  setFormat: (f: Format) => void
  inlasning: Inlasning
  laddaUpp: (fil: File) => void
  skrivNamn: (namn: string, titel: string) => void
  namn: string
  titel: string
  /** Turnstile-widgeten monteras först när en fil valts. */
  behoverRobot: boolean
  setRobotToken: (t: string | null) => void
  pris: PrisInfo
  /** Yrkessidans slug ur adressen: exempel-CV:t i yrkets tappning. */
  yrke?: string
  /** Pris att visa just nu (kampanj om html[data-kampanj] säger det), kort form för knappen. */
  prisNu: string
  /** Samma pris i lång form (kampanj: "..., sedan 149 kr i månaden"), för raderna och kontoarket. */
  prisLang: string
  /** Kampanjen pågår för besökaren (kontoarkets fotnot). */
  arKampanj: boolean
  /** Filväljaren i uppladdningsytan, för "Byt fil" ovanför arket. */
  oppnaFilval: () => void
  registreraFilval: (f: (() => void) | null) => void
  kampanjNu: { pris: string; ordinarie: string } | null
}

const Ctx = createContext<Kontext | null>(null)

export function useProva(): Kontext {
  const k = useContext(Ctx)
  if (!k) throw new Error('useProva utanför ProvaProvider')
  return k
}

export function hittadeText(delar: readonly Del[]): string {
  return lista(delar.map((d) => UPPLADDNING.delar[d]))
}

const MAX = 5 * 1024 * 1024

export default function ProvaProvider({
  katalog,
  surface,
  pris,
  lasAdress = false,
  children,
}: {
  katalog: readonly MallKort[]
  surface: string
  pris: PrisInfo
  /** Provsidan: valen ur adressen (?mall=&typsnitt=&namn=&titel=). */
  lasAdress?: boolean
  children: ReactNode
}) {
  const forstaGratis = katalog.find((m) => m.niva === 'gratis') ?? katalog[0]
  const [cv, setCvState] = useState<CVMetadata | null>(null)
  const [mallId, setMallId] = useState(forstaGratis.id)
  const [val, setVal] = useState<MallVal>({})
  const [format, setFormat] = useState<Format>('pdf')
  const [inlasning, setInlasning] = useState<Inlasning>({ lage: 'tom' })
  const [filnamn, setFilnamn] = useState<string | null>(null)
  const [namn, setNamn] = useState('')
  const [titel, setTitel] = useState('')
  const [behoverRobot, setBehoverRobot] = useState(false)
  const token = useRef<string | null>(null)
  const tokenVantare = useRef<((t: string | null) => void) | null>(null)
  const [kampanjNyckel, setKampanjNyckel] = useState<string | null>(null)
  const [yrke, setYrke] = useState<string | undefined>(undefined)
  const filval = useRef<(() => void) | null>(null)

  // Utkastet och adressen vid första målningen efter hydrering.
  useEffect(() => {
    const u = lasUtkast()
    const q = lasAdress ? new URLSearchParams(window.location.search) : null
    if (u) {
      setCvState(u.cv)
      setFilnamn(u.filnamn)
      const um = losMallId(u.mall)
      if (um && katalog.some((m) => m.id === um)) setMallId(um)
      setVal(u.val ?? {})
      setNamn(u.cv.personalInfo.fullName ?? '')
      setTitel(u.cv.personalInfo.title ?? '')
      setInlasning({ lage: 'klar', filnamn: u.filnamn, hittade: (u.hittade ?? []) as Del[], saknas: [] })
    }
    if (q) {
      const m = losMallId(lasId(q.get('mall')) ?? '')
      setYrke(lasId(q.get('yrke')))
      if (m && katalog.some((k) => k.id === m)) setMallId(m)
      const v = valUrParams((n) => q.get(n))
      if (Object.keys(v).length) setVal((f) => ({ ...f, ...v }))
      const n = (q.get('namn') ?? '').slice(0, 80)
      const t = (q.get('titel') ?? '').slice(0, 80)
      if (!u && (n || t)) {
        setNamn(n)
        setTitel(t)
        setCvState(tomtCv(n, t))
      }
    }
    try {
      setKampanjNyckel(document.documentElement.getAttribute('data-kampanj'))
    } catch {
      setKampanjNyckel(null)
    }
    // Bara en gång.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Utkastet sparas när hennes CV eller valen ändras.
  useEffect(() => {
    if (!cv) return
    const forra = lasUtkast()
    sparaUtkast({
      cv,
      mall: mallId,
      val,
      filnamn,
      hittade: inlasning.lage === 'klar' ? inlasning.hittade : forra?.hittade,
      vantar: forra?.vantar ?? null,
    } satisfies Omit<ProvaUtkast, 'sparad'>)
  }, [cv, mallId, val, filnamn, inlasning])

  const vantaPaToken = (): Promise<string | null> => {
    if (!TURNSTILE_SITE_KEY) return Promise.resolve(null)
    if (token.current) return Promise.resolve(token.current)
    setBehoverRobot(true)
    return new Promise((resolve) => {
      tokenVantare.current = resolve
      window.setTimeout(() => {
        if (tokenVantare.current === resolve) {
          tokenVantare.current = null
          resolve(null)
        }
      }, 8000)
    })
  }

  const setRobotToken = useCallback((t: string | null) => {
    token.current = t
    if (t && tokenVantare.current) {
      tokenVantare.current(t)
      tokenVantare.current = null
    }
  }, [])

  const laddaUpp = useCallback(
    (fil: File) => {
      const ext = fil.name.toLowerCase().split('.').pop()
      const metod: 'pdf' | 'docx' | 'okand' = ext === 'pdf' ? 'pdf' : ext === 'docx' ? 'docx' : 'okand'
      capture('cv_eget_start', { method: metod === 'okand' ? 'pdf' : metod, surface })
      if (metod === 'okand') {
        capture('cv_eget_misslyckad', { method: 'okand', reason: 'fel_typ', surface })
        return setInlasning({ lage: 'fel', kod: 'fel_typ', filnamn: fil.name })
      }
      if (fil.size > MAX) {
        capture('cv_eget_misslyckad', { method: metod, reason: 'for_stor', surface })
        return setInlasning({ lage: 'fel', kod: 'for_stor', filnamn: fil.name })
      }
      setInlasning({ lage: 'laddar', filnamn: fil.name, langsamt: false })
      const langsam = window.setTimeout(() => setInlasning((l) => (l.lage === 'laddar' ? { ...l, langsamt: true } : l)), 5000)
      void (async () => {
        try {
          const t = await vantaPaToken()
          const data = new FormData()
          data.append('file', fil)
          if (t) data.append('turnstile', t)
          const res = await fetch('/api/public/cv/tolka', { method: 'POST', body: data })
          token.current = null
          const j = (await res.json().catch(() => ({}))) as {
            kod?: string
            cv?: CVMetadata
            hittade?: Del[]
            saknas?: Del[]
          }
          if (!res.ok || !j.cv) {
            const kod = (j.kod ?? 'natfel') as Extract<Inlasning, { lage: 'fel' }>['kod']
            capture('cv_eget_misslyckad', { method: metod, reason: kod, surface })
            setInlasning({ lage: 'fel', kod: kod === ('fel' as string) ? 'natfel' : kod, filnamn: fil.name })
            return
          }
          capture('cv_eget_inlast', { method: metod, ok: (j.saknas ?? []).length === 0, sektioner_hittade: (j.hittade ?? []).length, surface })
          setCvState(j.cv)
          setFilnamn(fil.name)
          setNamn(j.cv.personalInfo.fullName ?? '')
          setTitel(j.cv.personalInfo.title ?? '')
          setInlasning({ lage: 'klar', filnamn: fil.name, hittade: j.hittade ?? [], saknas: j.saknas ?? [] })
        } catch {
          capture('cv_eget_misslyckad', { method: metod, reason: 'natfel', surface })
          setInlasning({ lage: 'fel', kod: 'natfel', filnamn: fil.name })
        } finally {
          window.clearTimeout(langsam)
        }
      })()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [surface]
  )

  const forstaNamn = useRef(true)
  const skrivNamn = useCallback(
    (n: string, t: string) => {
      setNamn(n)
      setTitel(t)
      if (forstaNamn.current && (n.trim() || t.trim())) {
        forstaNamn.current = false
        capture('cv_eget_start', { method: 'namn', surface })
      }
      setCvState((c) => {
        const bas = c ?? tomtCv()
        return { ...bas, personalInfo: { ...bas.personalInfo, fullName: n, title: t } }
      })
    },
    [surface]
  )

  const kampanj = pris.kampanjer.find((k) => k.nyckel === kampanjNyckel) ?? null
  const mall = katalog.find((m) => m.id === mallId) ?? forstaGratis

  const varde = useMemo<Kontext>(
    () => ({
      katalog,
      surface,
      cv,
      setCv: (c) => setCvState(c),
      mall,
      setMall: setMallId,
      val,
      setVal,
      format,
      setFormat,
      inlasning,
      laddaUpp,
      skrivNamn,
      namn,
      titel,
      behoverRobot,
      setRobotToken,
      pris,
      yrke,
      prisNu: kampanj?.text ?? pris.ordinarie,
      prisLang: kampanj?.lang ?? pris.ordinarie,
      arKampanj: Boolean(kampanj),
      oppnaFilval: () => filval.current?.(),
      registreraFilval: (f) => {
        filval.current = f
      },
      kampanjNu: kampanj ? { pris: kampanj.text, ordinarie: kampanj.ordinarieText } : null,
    }),
    [katalog, surface, cv, mall, val, format, inlasning, laddaUpp, skrivNamn, namn, titel, behoverRobot, setRobotToken, pris, kampanj, yrke]
  )

  return <Ctx.Provider value={varde}>{children}</Ctx.Provider>
}
