'use client'

/**
 * Jobbcoachen i rummets form (skissen Jobbcoachen, BYGGSPEC F9).
 *
 * Samtalet, strömningen, källorna, dokumentdelningen och kvoten är dagens
 * (JobbcoachenClient): samma rutt, samma rader i localStorage, samma 402.
 * Nytt i formen:
 *   - Frågor utifrån ditt läge (motorns hamtaCoachForslag). Ett tryck lägger
 *     frågan i fältet; den skickas först när användaren trycker Skicka.
 *   - Kvoten syns som prickar från början (serverns räkning), och spärren är
 *     dagens PaywallCard i SparrRam efter ett 402, som förut.
 *   - Nytt samtal tömmer samtalet och glömmer samtalets id.
 */

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import Topprad from '@/components/rum/Topprad'
import PaywallCard from '@/components/paywall/PaywallCard'
import DocumentSelector from '@/components/jobbcoachen/DocumentSelector'
import {
  EtikettTag,
  Felruta,
  ForslagLista,
  FragaForslag,
  GlasKnapp,
  Golv,
  IkonKryss,
  IkonPil,
  IkonSkold,
  JagBubbla,
  JobbVagg,
  Kort,
  KvotPrickar,
  LitenKnapp,
  LyftPanel,
  Samtal,
  SparrRam,
  Spalter,
  StorKnapp,
  SvarBubbla,
  TILLBAKA_JOBBSOKET,
  TomtLage,
  VaggText,
  type BrickTon,
} from '@/components/jobb3/kit'
import { getSupabaseClient } from '@/lib/supabase/client-manager'
import type { CoachForslagLista } from '@/lib/jobbsok'
import { hamtaCoachFraga } from '@/lib/jobbsok/provaFraga'
import type { Message, MessageAttachment } from '@/types/jobbcoachen'
import CoachSvar from './CoachSvar'

interface Dokument {
  id: string
  file_name: string
  cv_text: string
  created_at: string
  type: 'cv' | 'letter'
}

const KONV_NYCKEL = 'jobbcoachen_conversation_id'
const PLATSHALLARE = 'Fråga vad du vill veta om jobb, lön, intervju eller arbetsrätt'

function tonFor(typ: string): BrickTon {
  if (typ === 'uppfoljning') return 'tyst'
  if (typ === 'avslag') return 'slut'
  return 'standard'
}

export default function CoachVy({
  cvAntal,
  brevAntal,
  forslag,
  kvot,
  hamtaFraga,
}: {
  cvAntal: number
  brevAntal: number
  forslag: CoachForslagLista
  /** Gratisnivåns kvot ur servern; null med Premium. */
  kvot: { kvar: number; av: number } | null
  /**
   * Adressen bär flaggan ?fraga=1: besökaren skrev en fråga på
   * /verktyg/jobbcoachen före kontot (publikt omgång 3). Frågan hämtas ur
   * webbläsarens lagring (lib/jobbsok/provaFraga.ts), aldrig ur adressen,
   * ställs i fältet och skickas först när hon själv vill.
   */
  hamtaFraga?: boolean
}) {
  const [meddelanden, setMeddelanden] = useState<Message[]>([])
  const [laddar, setLaddar] = useState(false)
  const [konvId, setKonvId] = useState<string | null>(null)
  const [fel, setFel] = useState<string | null>(null)
  const [sparr, setSparr] = useState(false)
  const [kvar, setKvar] = useState<number | null>(kvot ? kvot.kvar : null)
  const [text, setText] = useState('')
  const [valda, setValda] = useState<Dokument[]>([])
  const [visaVal, setVisaVal] = useState(false)
  const slutRef = useRef<HTMLDivElement>(null)
  const faltRef = useRef<HTMLTextAreaElement>(null)
  const supabase = getSupabaseClient()
  const totalt = cvAntal + brevAntal

  useEffect(() => {
    try {
      const sparat = localStorage.getItem(KONV_NYCKEL)
      if (sparat) setKonvId(sparat)
    } catch {
      // Ingen lagring: samtalet börjar om.
    }
  }, [])

  // Frågan från den publika sidan: läses en gång och tas sedan bort ur lagringen.
  useEffect(() => {
    if (!hamtaFraga) return
    const fraga = hamtaCoachFraga()
    if (fraga) setText((nu) => nu || fraga)
  }, [hamtaFraga])

  useEffect(() => {
    if (meddelanden.length === 0) return
    slutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [meddelanden, laddar])

  function nyttSamtal() {
    setMeddelanden([])
    setKonvId(null)
    setFel(null)
    try {
      localStorage.removeItem(KONV_NYCKEL)
    } catch {
      // ingen lagring
    }
    faltRef.current?.focus()
  }

  async function skicka(meddelande: string, bilagor?: MessageAttachment[]) {
    setMeddelanden((f) => [...f, { role: 'user', content: meddelande, ...(bilagor && { attachments: bilagor }) }])
    setLaddar(true)
    setFel(null)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error('Du måste vara inloggad')

      const svar = await fetch('/api/jobbcoachen/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ message: meddelande, conversationId: konvId, ...(bilagor && { attachments: bilagor }) }),
      })

      if (svar.status === 402 || svar.status === 429) {
        // Kvoten är slut: spärren, och det optimistiska meddelandet bort (det sparades aldrig).
        setSparr(true)
        setKvar(0)
        setMeddelanden((f) => f.slice(0, -1))
        setLaddar(false)
        return
      }
      if (!svar.ok) throw new Error('Kunde inte skicka meddelande')

      const lasare = svar.body?.getReader()
      const avkodare = new TextDecoder()
      let innehall = ''
      let kallor: any[] = []
      if (lasare) {
        while (true) {
          const { done, value } = await lasare.read()
          if (done) break
          for (const rad of avkodare.decode(value).split('\n')) {
            if (!rad.startsWith('data: ')) continue
            try {
              const d = JSON.parse(rad.substring(6))
              if (d.type === 'conversation_id') {
                setKonvId(d.conversationId)
                try {
                  localStorage.setItem(KONV_NYCKEL, d.conversationId)
                } catch {
                  // ingen lagring
                }
              } else if (d.type === 'quota') {
                setKvar(d.isPremium ? null : typeof d.remaining === 'number' ? d.remaining : null)
              } else if (d.type === 'sources') {
                kallor = d.sources
              } else if (d.type === 'text') {
                innehall += d.content
                setMeddelanden((f) => {
                  const sist = f[f.length - 1]
                  if (sist && sist.role === 'assistant') return [...f.slice(0, -1), { ...sist, content: innehall }]
                  return [...f, { role: 'assistant', content: innehall, sources: kallor }]
                })
              } else if (d.type === 'done') {
                setMeddelanden((f) => {
                  const sist = f[f.length - 1]
                  if (sist && sist.role === 'assistant') return [...f.slice(0, -1), { ...sist, sources: kallor }]
                  return f
                })
              } else if (d.type === 'error') {
                throw new Error(d.error)
              }
            } catch (e) {
              console.error('Parse error:', e)
            }
          }
        }
      }
      setLaddar(false)
    } catch (e: any) {
      console.error('Send message error:', e)
      setFel(e?.message || 'Ett fel uppstod')
      setLaddar(false)
      setMeddelanden((f) => f.slice(0, -1))
    }
  }

  function skickaFormular(e?: FormEvent) {
    e?.preventDefault()
    if (laddar || sparr || (!text.trim() && valda.length === 0)) return
    const bilagor: MessageAttachment[] | undefined = valda.length
      ? valda.map((d) => ({
          file_name: d.file_name,
          file_type: d.type === 'cv' ? 'cv' : 'letter',
          file_size: new Blob([d.cv_text]).size,
          storage_path: '',
          public_url: '',
          extracted_text: d.cv_text,
          uploaded_at: d.created_at,
        }))
      : undefined
    void skicka(text.trim(), bilagor)
    setText('')
    setValda([])
  }

  function tangent(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      skickaFormular()
    }
  }

  function valjDokument(d: Dokument) {
    setValda((f) => (f.some((x) => x.id === d.id && x.type === d.type) ? f.filter((x) => !(x.id === d.id && x.type === d.type)) : [...f, d]))
  }

  function laggIFaltet(fraga: string) {
    setText(fraga)
    requestAnimationFrame(() => faltRef.current?.focus())
  }

  const kanSkicka = !laddar && !sparr && (text.trim().length > 0 || valda.length > 0)
  const fran = forslag.lage === 'fran_laget'

  return (
    <>
      <JobbVagg hojd={330} hojdMobil={260} flik={null} tillbaka={{ ...TILLBAKA_JOBBSOKET, ton: 'koppar' }} handling={<GlasKnapp onClick={nyttSamtal}>Nytt samtal</GlasKnapp>} atgarder={<Topprad bara="atgarder" />} luft={96}>
        <div className="mt-1">
          <VaggText rubrik="Jobbcoachen" ingress="Fråga om lön, intervjuer, arbetsrätt eller ditt CV. Vi svarar med källor du kan kolla själv." bredIngress />
        </div>
      </JobbVagg>

      <Golv>
        <Spalter sido={360} tat>
          <LyftPanel tat etikett="Samtalet">
            <div className="flex items-center gap-2.5 border-b-2 border-[var(--j3-linje)] bg-[var(--j3-mjuk)] px-4 py-3.5 xl:px-6">
              <span className="text-[var(--j3-bock)]" aria-hidden="true">
                <IkonSkold size={18} />
              </span>
              <span className="text-[13px] font-semibold leading-[18px] text-[var(--j3-ink-2)]">Svar med källor från Arbetsförmedlingen, SCB och fackförbund</span>
            </div>

            <div className="px-4 pb-6 pt-5 xl:px-6 xl:pb-7 xl:pt-[26px]" aria-live="polite">
              {meddelanden.length === 0 ? (
                <TomtLage inbaddad rubrik="Fråga vad du vill" text="Skriv din fråga nedan, eller tryck på en av frågorna utifrån ditt läge. Inget skickas förrän du trycker Skicka." />
              ) : (
                <Samtal>
                  {meddelanden.map((m, i) =>
                    m.role === 'user' ? (
                      <div key={i} className="flex flex-col items-end gap-2">
                        {m.attachments?.length ? (
                          <div className="flex flex-wrap justify-end gap-2">
                            {m.attachments.map((a, j) => (
                              <EtikettTag key={j} ton="kant">
                                {a.file_name}
                              </EtikettTag>
                            ))}
                          </div>
                        ) : null}
                        {m.content ? <JagBubbla>{m.content}</JagBubbla> : null}
                      </div>
                    ) : (
                      <CoachSvar key={i} innehall={m.content} kallor={m.sources} strommar={laddar && i === meddelanden.length - 1} />
                    ),
                  )}
                  {laddar && meddelanden[meddelanden.length - 1]?.role === 'user' ? <SvarBubbla skriver /> : null}
                </Samtal>
              )}
              {fel ? (
                <div className="mt-4">
                  <Felruta text={`Meddelandet gick inte fram. ${fel}`} />
                </div>
              ) : null}
              <div ref={slutRef} />
            </div>

            {sparr ? (
              <div className="px-4 pb-4 xl:px-6">
                {/* PW7. Kontokvot, alltså ingen påminnelse om i morgon. */}
                <SparrRam etikett="Ingår i Premium">
                  <PaywallCard variant="chatt" feature="chat_unlimited" bare />
                </SparrRam>
              </div>
            ) : null}

            <form className="border-t-2 border-[var(--j3-linje)] px-4 pb-5 pt-4 xl:px-6" onSubmit={skickaFormular}>
              {valda.length ? (
                <div className="mb-3 flex flex-wrap gap-2">
                  {valda.map((d) => (
                    <EtikettTag key={`${d.type}-${d.id}`} ton="kant">
                      {d.file_name}
                      <button type="button" onClick={() => valjDokument(d)} aria-label={`Ta bort ${d.file_name}`} className="-mr-1 inline-flex h-7 w-7 items-center justify-center">
                        <IkonKryss size={14} />
                      </button>
                    </EtikettTag>
                  ))}
                </div>
              ) : null}
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
                <label className="sr-only" htmlFor="j3c-fraga">
                  Din fråga till Jobbcoachen
                </label>
                <span className="min-w-0 flex-1">
                  <textarea
                    id="j3c-fraga"
                    ref={faltRef}
                    className="j3-inp"
                    rows={1}
                    enterKeyHint="send"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={tangent}
                    disabled={sparr}
                    placeholder={sparr ? 'Dina tio gratis meddelanden är använda' : PLATSHALLARE}
                    style={{ resize: 'none', minHeight: 52, maxHeight: 120, fieldSizing: 'content', paddingTop: 13, paddingBottom: 13, paddingRight: 14, borderRadius: 15 } as React.CSSProperties}
                  />
                </span>
                <StorKnapp storlek="lag" type="submit" disabled={!kanSkicka}>
                  Skicka
                  <IkonPil size={18} />
                </StorKnapp>
              </div>
            </form>
          </LyftPanel>

          <aside className="mt-[30px] flex flex-col gap-3 xl:mt-7" aria-label="Förslag och dokument">
            <h2 className="j3-h2">{fran ? 'Frågor utifrån ditt läge' : 'Förslag'}</h2>
            {fran ? (
              <div className="-mt-1.5 mb-1">
                <p className="j3-fin">Hämtade ur dina sökta tjänster. Tryck på en, så står den i fältet.</p>
              </div>
            ) : null}
            <ForslagLista>
              {forslag.forslag.map((f) => (
                <FragaForslag key={f.fraga} kod={f.bokstaver ?? undefined} ton={tonFor(f.typ)} onClick={() => laggIFaltet(f.fraga)}>
                  {f.fraga}
                </FragaForslag>
              ))}
            </ForslagLista>

            <div className="mt-3">
              <Kort luft>
                <b className="j3c-kortrubrik">Dela ditt CV eller brev</b>
                <div className="mb-3.5 mt-1.5">
                  <p className="j3-text">
                    {totalt > 0
                      ? `Då kan vi prata om just dina texter. Just nu har du ${totalt} dokument att dela.`
                      : 'Dela CV och personliga brev, så blir svaren kopplade till just ditt yrkesliv. Skapa något först, så kan vi prata om det.'}
                  </p>
                </div>
                {totalt > 0 ? <LitenKnapp onClick={() => setVisaVal(true)} disabled={sparr}>Välj dokument att dela</LitenKnapp> : null}
              </Kort>
            </div>

            {kvot && kvar !== null ? (
              <div className="mt-3">
                <Kort ton="streckad" luft>
                  <p className="j3-eyebrow">Så ser det ut på gratisnivån</p>
                  <div className="mt-3">
                    <KvotPrickar kvar={kvar} av={kvot.av} />
                  </div>
                  <div className="mt-2.5">
                    <p className="j3-text">
                      <b>{`${kvar} ${kvar === 1 ? 'gratis meddelande' : 'gratis meddelanden'} kvar på kontot`}</b>
                    </p>
                  </div>
                </Kort>
              </div>
            ) : null}
          </aside>
        </Spalter>
      </Golv>

      {visaVal ? <DocumentSelector onSelect={valjDokument} onClose={() => setVisaVal(false)} selectedDocs={valda} /> : null}
    </>
  )
}
