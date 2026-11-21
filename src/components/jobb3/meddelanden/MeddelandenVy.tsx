'use client'

/**
 * Meddelanden i rummets form (skissen Meddelanden). Logiken är dagens
 * MessageHub: listan kommer från servern, valet följer ?interest= (annars
 * första väntande, sedan första aktiva), svaren går till
 * /api/candidate/interests/respond med optimistisk uppdatering och återställning
 * vid fel. Accepterade samtal öppnas i dagens ConversationThread.
 *
 * Texterna om vad som delas när man accepterar är dagens, ordagrant.
 * Dator: listan till vänster (388) och förfrågan eller samtalet till höger.
 * Telefon: listan, och vald förfrågan i stället för listan med en tillbakaknapp.
 */

import { useCallback, useMemo, useState } from 'react'
import Topprad from '@/components/rum/Topprad'
import ConversationThread from '@/components/interests/ConversationThread'
import { type CandidateInterest } from '@/components/interests/hubTypes'
import {
  Bricka,
  Felruta,
  Golv,
  IkonLasUpp,
  IkonPerson,
  IkonTillbaka,
  JobbVagg,
  LitenKnapp,
  LyftPanel,
  Notis,
  SokFalt,
  StatusPiller,
  StorKnapp,
  TomtLage,
  VaggText,
} from '@/components/jobb3/kit'

const TILLBAKA = { href: '/dashboard/bli-upptackt', text: 'Bli upptäckt', ton: 'koppar' as const }

function valjForst(lista: CandidateInterest[], djuplank: string | null): string | null {
  if (djuplank && lista.some((i) => i.id === djuplank)) return djuplank
  const vantar = lista.find((i) => i.status === 'pending')
  const aktiv = lista.find((i) => i.status === 'accepted')
  return vantar?.id ?? aktiv?.id ?? lista[0]?.id ?? null
}

function kortDatum(iso: string): string {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return ''
  const dygn = Math.round((Date.now() - t) / 86_400_000)
  if (dygn <= 0) return 'i dag'
  if (dygn === 1) return 'i går'
  return new Date(t).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', timeZone: 'Europe/Stockholm' }).replace('.', '')
}

function langDatum(iso: string): string {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return ''
  const s = new Date(t).toLocaleString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Stockholm' })
  return s.charAt(0).toUpperCase() + s.slice(1).replace(':', '.')
}

export default function MeddelandenVy({ djuplank, start, laddfel }: { djuplank: string | null; start: CandidateInterest[]; laddfel: boolean }) {
  const [lista, setLista] = useState<CandidateInterest[]>(start)
  const [valdId, setValdId] = useState<string | null>(() => valjForst(start, djuplank))
  const [svarar, setSvarar] = useState<string | null>(null)
  const [svarsfel, setSvarsfel] = useState<string | null>(null)
  const [mobil, setMobil] = useState<'lista' | 'trad'>(() => (djuplank && valjForst(start, djuplank) === djuplank ? 'trad' : 'lista'))
  const [sok, setSok] = useState('')
  const [visaAvbojda, setVisaAvbojda] = useState(false)

  const vald = useMemo(() => lista.find((i) => i.id === valdId) ?? null, [lista, valdId])

  const valj = useCallback((id: string) => {
    setValdId(id)
    setMobil('trad')
    setLista((f) => f.map((i) => (i.id === id ? { ...i, unreadCount: 0 } : i)))
  }, [])

  const svara = useCallback(
    async (id: string, handling: 'accept' | 'decline') => {
      setSvarar(id)
      setSvarsfel(null)
      const fore = lista
      const ny = handling === 'accept' ? 'accepted' : 'declined'
      setLista((f) => f.map((i) => (i.id === id ? { ...i, status: ny, respondedAt: new Date().toISOString() } : i)))
      try {
        const res = await fetch('/api/candidate/interests/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interestId: id, action: handling }),
        })
        if (!res.ok) {
          const d = await res.json().catch(() => null)
          throw new Error(d?.error || `HTTP ${res.status}`)
        }
      } catch {
        setLista(fore)
        setSvarsfel('Det gick inte att spara ditt svar. Försök igen.')
      } finally {
        setSvarar(null)
      }
    },
    [lista],
  )

  const vagg = (ingress: string) => (
    <JobbVagg hojd={316} hojdMobil={260} flik={null} tillbaka={TILLBAKA} atgarder={<Topprad bara="atgarder" />} luft={96}>
      <div className="mt-1">
        <VaggText rubrik="Meddelanden" ingress={ingress} bredIngress />
      </div>
    </JobbVagg>
  )

  if (lista.length === 0) {
    return (
      <>
        {vagg('Här landar dina samtal med rekryterare som visat intresse.')}
        <Golv>
          <LyftPanel rubrikId="tomt-rubrik">
            {laddfel ? (
              <Felruta text="Vi kunde inte hämta dina meddelanden." forsokHref="/dashboard/meddelanden" />
            ) : (
              <TomtLage
                ikon={<IkonPerson size={22} />}
                rubrik="Inga meddelanden än"
                text="Gör dig synlig i Bli upptäckt. När en rekryterare hör av sig chattar ni direkt här."
                handling={
                  <StorKnapp golv storlek="mellan" href="/dashboard/bli-upptackt">
                    Gå till Bli upptäckt
                  </StorKnapp>
                }
              />
            )}
          </LyftPanel>
        </Golv>
      </>
    )
  }

  const q = sok.trim().toLowerCase()
  const filtrerad = q ? lista.filter((i) => i.companyName.toLowerCase().includes(q)) : lista
  const vantar = filtrerad.filter((i) => i.status === 'pending')
  const aktiva = filtrerad.filter((i) => i.status === 'accepted')
  const avbojda = filtrerad.filter((i) => i.status === 'declined')
  const antalVantar = lista.filter((i) => i.status === 'pending').length

  const rad = (i: CandidateInterest) => {
    const pending = i.status === 'pending'
    const avbojd = i.status === 'declined'
    const olast = i.unreadCount > 0
    return (
      <button key={i.id} type="button" className={`j3c-rad j3-sido${i.id === valdId ? ' vald' : ''}`} aria-current={i.id === valdId ? 'true' : undefined} aria-busy={svarar === i.id || undefined} onClick={() => valj(i.id)}>
        <Bricka ton={pending ? 'tyst' : avbojd ? 'slut' : 'standard'} mobil={44} dator={48}>
          <IkonPerson size={20} />
        </Bricka>
        <span className="j3-sido-text">
          <b>{i.companyName}</b>
          <small>{pending ? (i.message?.trim() || 'Vill komma i kontakt.') : avbojd ? 'Avböjd' : i.message?.trim() || 'Ni är i kontakt. Säg hej.'}</small>
          <span className="mt-2 flex flex-wrap items-center gap-2">
            {pending ? <StatusPiller status="folj-upp">Väntar på ditt svar</StatusPiller> : avbojd ? <StatusPiller status="avslutad">Avböjd</StatusPiller> : <StatusPiller status="intervju">Kontakten godkänd</StatusPiller>}
            <span className="j3-fin">{kortDatum(i.respondedAt ?? i.createdAt)}</span>
            {olast ? <span className="sr-only">{`${i.unreadCount} olästa`}</span> : null}
          </span>
        </span>
      </button>
    )
  }

  const hoger = vald ? (
    vald.status === 'accepted' ? (
      <ConversationThread interest={vald} />
    ) : (
      <div className="p-4 xl:px-7 xl:py-6">
        <div className="flex items-start gap-3.5 border-b-2 border-[var(--j3-linje)] pb-4">
          <Bricka ton={vald.status === 'pending' ? 'tyst' : 'slut'} mobil={48} dator={48}>
            <IkonPerson size={20} />
          </Bricka>
          <div className="min-w-0">
            <h2 className="j3-h2">{`${vald.companyName} vill komma i kontakt`}</h2>
            {vald.contactName ? (
              <div className="mt-1">
                <p className="j3-text">{vald.contactName}</p>
              </div>
            ) : null}
          </div>
        </div>
        {vald.message ? (
          <div className="mt-5 max-w-[560px]">
            <div className="j3-svar">
              <p className="whitespace-pre-line">{vald.message}</p>
            </div>
            <div className="mt-2 px-1">
              <p className="j3-fin">{langDatum(vald.createdAt)}</p>
            </div>
          </div>
        ) : null}
        {(
          <>
            <div className="mt-6">
              <Notis ikon={<IkonLasUpp size={20} />} rubrik={`Accepterar du delas ditt namn och din e-postadress med ${vald.companyName}, och chatten öppnas här.`} text="Avböjer du förblir din profil anonym." />
            </div>
            <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-4">
              <StorKnapp golv storlek="mellan" disabled={svarar === vald.id} onClick={() => svara(vald.id, 'accept')}>
                Acceptera
              </StorKnapp>
              <LitenKnapp storlek={52} disabled={svarar === vald.id} onClick={() => svara(vald.id, 'decline')}>
                Avböj
              </LitenKnapp>
              <span className="j3-fin">Du kan svara när du vill. Förfrågan ligger kvar här.</span>
            </div>
          </>
        )}
      </div>
    )
  ) : (
    <div className="p-6">
      <TomtLage inbaddad rubrik="Ingen konversation vald" text="Välj en konversation i listan." />
    </div>
  )

  return (
    <>
      {vagg('Rekryterare som vill nå dig, och era konversationer. Accepterar du delas ditt namn och din e-post, och chatten öppnas.')}
      <Golv>
        {laddfel || svarsfel ? (
          <div className="mb-4">
            <Felruta text={svarsfel ?? 'Vi kunde inte hämta dina meddelanden.'} forsokHref={svarsfel ? undefined : '/dashboard/meddelanden'} />
          </div>
        ) : null}
        <LyftPanel tat etikett="Dina meddelanden">
          <div className="j3c-hub" data-mobil={mobil}>
            <div className="j3c-hub-lista">
              <div className="p-3 xl:px-4">
                {lista.length > 4 ? <SokFalt etikett="Sök företag" placeholder="Sök företag" value={sok} onChange={(e) => setSok(e.target.value)} /> : null}
                <div className="mt-1 px-1"><p className="j3-eyebrow">{antalVantar > 0 ? `${antalVantar === 1 ? 'En' : antalVantar} väntar på ditt svar` : 'Dina samtal'}</p></div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filtrerad.length === 0 ? (
                  <div className="px-4 py-6">
                    <p className="j3-text">Inga träffar.</p>
                  </div>
                ) : null}
                {vantar.map(rad)}
                {aktiva.map(rad)}
                {avbojda.length > 0 ? (
                  <div className="px-3 py-2">
                    <LitenKnapp onClick={() => setVisaAvbojda((v) => !v)} aria-label={visaAvbojda ? 'Dölj avböjda' : 'Visa avböjda'}>
                      {`Avböjda (${avbojda.length})`}
                    </LitenKnapp>
                  </div>
                ) : null}
                {visaAvbojda ? avbojda.map(rad) : null}
              </div>
            </div>
            <div className="j3c-hub-trad">
              <div className="border-b-2 border-[var(--j3-linje)] p-2 xl:hidden">
                <button type="button" className="j3-tillbaka" style={{ color: 'var(--j3-ink)' }} onClick={() => setMobil('lista')}>
                  <IkonTillbaka />
                  Alla meddelanden
                </button>
              </div>
              {hoger}
            </div>
          </div>
        </LyftPanel>
      </Golv>
    </>
  )
}

