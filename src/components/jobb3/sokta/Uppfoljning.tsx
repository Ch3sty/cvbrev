'use client'

/**
 * Följ upp (F5, skissen Sokta-folj-upp): utkastet som papper, texten går att
 * ändra direkt och sparas, "Skriv om kortare" (högst tre), "Öppna i e-post"
 * (mailto), "Kopiera mejlet", frågan "Skickade du mejlet?", "Jag har redan
 * skickat det", "Vad som händer sedan" och ångra.
 *
 * Klientflödet följer motorns kontrakt: finns ett sparat utkast visas det
 * direkt. Är tjänsten uppföljd inom påminnelsetiden (senastSkickad och
 * nastaPaminnelse i läget från servern) visas "Följde upp" med Ångra, och
 * inget utkast skrivs. Annars POST /api/jobbsok/uppfoljning/[id] (hämtar
 * eller skapar), en gång när blocket monteras. Blocket visas bara när
 * tjänsten är tyst, har ett utkast, följdes upp i dag eller när adressen ber
 * om det (?steg=folj-upp), se TjanstVy.
 * 402 ger betalväggen i SparrRam med "Jag har redan skickat det" kvar.
 *
 * Rättat efter klicktestet 2026-11-21: hämtningen körde om när
 * router.refresh() efter "Ja, det är skickat" gav start.utkast = null, och
 * skrev då ett nytt AI-utkast. Nu körs den bara vid monteringen.
 *
 * Omgång 2: sorten (start.typ: ansökan, intervju, provjobb) styr raden medan
 * utkastet skrivs, raden "Till" och "Vad som händer sedan"; dagarna räknas
 * med start.grans (12 eller 7). Servern skickar bara ett utkast av rätt sort.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  MejlUtkast,
  StorKnapp,
  LitenKnapp,
  TextLank,
  TonYta,
  Kort,
  Kryss,
  Handelsebana,
  SparrRam,
  Skel,
  Felruta,
  IkonMejl,
  IkonKopiera,
  IkonSkicka,
  IkonKlocka,
  IkonBock,
} from '@/components/jobb3/kit'
import PaywallCard from '@/components/paywall/PaywallCard'
import {
  idagSv,
  kortDag,
  sedanText,
  langDag,
  mailtoHref,
  nastaPaminnelse,
  nyligenUppfoljd,
  ordtal,
  plusDagar,
  raknaOrdITexten,
  veckodagNamn,
  UPPFOLJNING_MAX_OMSKRIVNINGAR,
  type Uppfoljning as UppfoljningRad,
  type UppfoljningVia,
} from '@/lib/jobbsok'
import type { UppfoljningLage } from '@/lib/jobbsok/server'
import { anropa } from './SmaArk'
import { stor } from './text'

type Lage = 'laddar' | 'utkast' | 'sparr' | 'tak' | 'fel' | 'skickad'

type Skickad = { id: string; nasta: string; dag: string }

const KORTARE_FEL = 'Det gick inte att skriva om just nu. Din text är kvar.'

/** Texterna som skiljer sig per sort (byggspec 2.3, uppföljningsblocket). */
const SORT_TEXT = {
  ansokan: {
    skrivs: 'Vi skriver utkastet utifrån din ansökan',
    till: 'Mottagarens adress, står oftast under Kontakt i annonsen',
    tyst: 'Är det fortfarande tyst säger vi till, och då får du välja om du vill fråga en gång till.',
  },
  intervju: {
    skrivs: 'Vi skriver ett tack för intervjun och en fråga om besked',
    till: 'Mottagarens adress, den som kallade dig till intervjun',
    tyst: 'Har du fortfarande inte fått besked säger vi till, och då får du välja om du vill fråga en gång till.',
  },
  provjobb: {
    skrivs: 'Vi skriver ett tack för provjobbet och en fråga om besked',
    till: 'Mottagarens adress, den du hade kontakt med om provjobbet',
    tyst: 'Har du fortfarande inte fått besked säger vi till, och då får du välja om du vill fråga en gång till.',
  },
} as const

/** "tolv", "sju": ordtal räcker till tio. */
const dagarOrd = (n: number) => (n === 12 ? 'tolv' : ordtal(n))

export default function Uppfoljning({
  ansokanId,
  start,
  jobAdUrl,
  onAndrat,
  onSkickad,
  onAngrad,
}: {
  ansokanId: string
  start: UppfoljningLage
  jobAdUrl: string | null
  onAndrat: () => void
  /** Uppföljningen är loggad; vyn visar raden direkt, innan serverdatan är tillbaka. */
  onSkickad?: (rad: UppfoljningRad) => void
  /** Uppföljningen är ångrad. */
  onAngrad?: (id: string) => void
}) {
  const idag = idagSv()
  // Sorten och gränsen ur serverns läge; utan sort (ska inte hända när blocket visas) som efter en ansökan.
  const typ = start.typ ?? 'ansokan'
  const grans = start.grans
  const sortText = SORT_TEXT[typ]
  const [forsta] = useState(() => nyligenUppfoljd(start, idag))
  const [lage, setLage] = useState<Lage>(start.utkast ? 'utkast' : forsta ? 'skickad' : 'laddar')
  const [utkast, setUtkast] = useState<UppfoljningRad | null>(start.utkast)
  const [text, setText] = useState(start.utkast?.body ?? '')
  const [kvar, setKvar] = useState(start.omskrivningarKvar)
  const [kortar, setKortar] = useState(false)
  const [meddelande, setMeddelande] = useState<string | null>(null)
  const [fraga, setFraga] = useState<UppfoljningVia | null>(null)
  const [skickad, setSkickad] = useState<Skickad | null>(forsta)
  const [arbetar, setArbetar] = useState(false)
  const [kopierad, setKopierad] = useState(false)
  const sparat = useRef(start.utkast?.body ?? '')
  const startad = useRef(false)
  /** Läget före "Följde upp", dit Ångra går tillbaka utan nytt anrop. */
  const fore = useRef<Lage | null>(null)
  const lageNu = useRef(lage)
  lageNu.current = lage

  const hamta = useCallback(async () => {
    setLage('laddar')
    setMeddelande(null)
    try {
      const json = await anropa(`/api/jobbsok/uppfoljning/${ansokanId}`, 'POST')
      // "Jag har redan skickat det" medan utkastet skrevs: bekräftelsen står kvar.
      if (lageNu.current === 'skickad') return
      const u = json.data as UppfoljningRad
      setUtkast(u)
      setText(u.body ?? '')
      sparat.current = u.body ?? ''
      setKvar(Math.max(0, UPPFOLJNING_MAX_OMSKRIVNINGAR - (u.rewrites ?? 0)))
      setLage('utkast')
    } catch (e) {
      if (lageNu.current === 'skickad') return
      const status = (e as { status?: number }).status
      if (status === 402) setLage('sparr')
      else if (status === 429) setLage('tak')
      else setLage('fel')
    }
  }, [ansokanId])

  // Bara vid monteringen. `start` byts vid varje router.refresh(); att läsa
  // den här igen var det som skrev ett nytt utkast direkt efter "Ja".
  const startLage = useRef(lage)
  useEffect(() => {
    if (startad.current) return
    startad.current = true
    if (startLage.current === 'laddar') hamta()
  }, [hamta])

  /** Efter Ångra utan sparat läge: läs läget (GET) och skapa bara när inget utkast finns och spärren tillåter. */
  const lasOm = useCallback(async () => {
    setLage('laddar')
    try {
      const json = await anropa(`/api/jobbsok/uppfoljning/${ansokanId}`, 'GET')
      const d = json.data as UppfoljningLage
      if (d.utkast?.body) {
        setUtkast(d.utkast)
        setText(d.utkast.body)
        sparat.current = d.utkast.body
        setKvar(d.omskrivningarKvar)
        setLage('utkast')
      } else if (d.sparr?.lage === 'premium_required') setLage('sparr')
      else if (d.sparr?.lage === 'dygnstak') setLage('tak')
      else hamta()
    } catch {
      setLage('fel')
    }
  }, [ansokanId, hamta])

  const spara = useCallback(async () => {
    if (!utkast || text === sparat.current || !text.trim()) return
    try {
      const json = await anropa(`/api/jobbsok/uppfoljning/${ansokanId}`, 'PUT', { subject: utkast.subject, body: text })
      sparat.current = text
      setUtkast(json.data as UppfoljningRad)
    } catch {
      setMeddelande('Det gick inte att spara din ändring just nu. Texten står kvar här.')
    }
  }, [ansokanId, text, utkast])

  const kortare = async () => {
    if (kortar || kvar <= 0) return
    await spara()
    setKortar(true)
    setMeddelande(null)
    try {
      const json = await anropa(`/api/jobbsok/uppfoljning/${ansokanId}/kortare`, 'POST')
      const u = json.data as UppfoljningRad
      setUtkast(u)
      setText(u.body ?? '')
      sparat.current = u.body ?? ''
      setKvar(typeof json.omskrivningarKvar === 'number' ? json.omskrivningarKvar : Math.max(0, kvar - 1))
    } catch (e) {
      const code = (e as { json?: { code?: string } }).json?.code
      if (code === 'tak') {
        setKvar(0)
        setMeddelande('Du har skrivit om tre gånger. Ändra resten direkt i texten.')
      } else setMeddelande(KORTARE_FEL)
    } finally {
      setKortar(false)
    }
  }

  const loggaSkickad = async (via?: UppfoljningVia) => {
    setArbetar(true)
    setMeddelande(null)
    try {
      if (via) await spara()
      const json = await anropa(`/api/jobbsok/uppfoljning/${ansokanId}/skickad`, 'POST', via ? { via } : {})
      const rad = json.data as UppfoljningRad
      fore.current = lage
      setSkickad({ id: rad.id, nasta: json.nastaPaminnelse ?? nastaPaminnelse(idag, typ), dag: rad.sent_at ?? idag })
      setFraga(null)
      setLage('skickad')
      onSkickad?.(rad)
      onAndrat()
    } catch {
      setMeddelande('Det gick inte att logga uppföljningen just nu. Försök igen.')
    } finally {
      setArbetar(false)
    }
  }

  const angra = async () => {
    if (!skickad) return
    setArbetar(true)
    try {
      await anropa(`/api/jobbsok/uppfoljning/${ansokanId}/skickad?uppfoljning=${skickad.id}`, 'DELETE')
      const id = skickad.id
      const forra = fore.current
      setSkickad(null)
      fore.current = null
      onAngrad?.(id)
      onAndrat()
      if (forra === 'utkast' && utkast?.body) setLage('utkast')
      else if (forra === 'sparr' || forra === 'tak') setLage(forra)
      else lasOm()
    } catch {
      setMeddelande('Det gick inte att ångra just nu. Försök igen.')
    } finally {
      setArbetar(false)
    }
  }

  const kopiera = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setKopierad(true)
      setTimeout(() => setKopierad(false), 2500)
      setFraga('kopierat')
    } catch {
      setMeddelande('Det gick inte att kopiera. Markera texten och kopiera den själv.')
    }
  }

  const nasta = plusDagar(idag, grans)
  const vadSedan = (
    <TonYta>
      <p className="j3-eyebrow" style={{ marginBottom: 12 }}>
        Vad som händer sedan
      </p>
      <Handelsebana
        liten
        handelser={[
          { rubrik: 'Du skickar mejlet', text: `När du har skickat det loggar vi Följde upp i dag, ${veckodagNamn(idag)} ${kortDag(idag)}.`, lage: 'snart', ikon: <IkonSkicka size={18} /> },
          { rubrik: 'Påminnelsen flyttas fram', text: `Tjänsten lämnar Följ upp. Ingen ny påminnelse på ${dagarOrd(grans)} dagar.`, lage: 'sen', ikon: <IkonKlocka size={18} /> },
          { rubrik: `${stor(veckodagNamn(nasta))} ${langDag(nasta)}`, text: sortText.tyst, lage: 'sen', ikon: `${Number(nasta.slice(8))}/${Number(nasta.slice(5, 7))}` },
        ]}
      />
    </TonYta>
  )

  const redanSkickat = (
    <Kort ton="streckad" luft>
      <Kryss checked={false} onChange={() => loggaSkickad()}>
        Jag har redan skickat det
      </Kryss>
    </Kort>
  )

  const fel = meddelande ? (
    <p className="j3-falt-fel" role="status">
      {meddelande}
    </p>
  ) : null

  /* --------------------------------------------------------- lägena */

  if (lage === 'skickad' && skickad) {
    return (
      <div className="mt-[18px] xl:mt-[22px]">
        <TonYta>
          <div className="flex items-start gap-3">
            <span className="j3-b-bock" aria-hidden="true">
              <IkonBock size={18} />
            </span>
            <div>
              <p className="j3-h3">Följde upp {sedanText(skickad.dag, idag)}</p>
              <p className="j3-text" style={{ marginTop: 4 }}>
                Tjänsten lämnar Följ upp. Är det fortfarande tyst {langDag(skickad.nasta)} säger vi till igen.
              </p>
              <div style={{ marginTop: 10 }}>
                <TextLank onClick={angra} disabled={arbetar}>
                  Ångra
                </TextLank>
              </div>
            </div>
          </div>
        </TonYta>
        {fel}
      </div>
    )
  }

  if (lage === 'sparr' || lage === 'tak') {
    return (
      <div className="mt-[18px] grid gap-6 xl:mt-[22px] xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        {lage === 'sparr' ? (
          <SparrRam etikett="Uppföljningsmejlet ingår i Premium">
            {/* Egen variant: rubrik, text, pris, köpknapp och mätning (plats uppfoljning) som de andra väggarna. */}
            <PaywallCard variant="uppfoljning" bare />
          </SparrRam>
        ) : (
          <TonYta>
            <p className="j3-h3">Dagens utkast är skrivna</p>
            <p className="j3-text" style={{ marginTop: 6 }}>
              Du har skrivit 30 utkast i dag. Nästa går att skriva i morgon. Har du redan följt upp kan du logga det här.
            </p>
          </TonYta>
        )}
        <div className="flex flex-col gap-4">
          {redanSkickat}
          {fel}
        </div>
      </div>
    )
  }

  if (lage === 'fel') {
    return (
      <div className="mt-[18px] flex flex-col gap-4 xl:mt-[22px]">
        <Felruta text="Vi kunde inte hämta utkastet just nu." onForsok={() => hamta()} />
        {redanSkickat}
      </div>
    )
  }

  const ord = raknaOrdITexten(text)
  return (
    <div className="mt-[18px] grid gap-6 xl:mt-[22px] xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
      {lage === 'laddar' || !utkast ? (
        <div role="status" aria-live="polite">
          <MejlUtkast till={sortText.till} amne={<span className="j3-b-skrivs">{sortText.skrivs}</span>} fotVanster="Det tar några sekunder.">
            <div className="flex flex-col gap-3" aria-hidden="true">
              <Skel b="22%" h={16} />
              <Skel h={16} />
              <Skel b="86%" h={16} />
              <Skel h={16} />
              <Skel b="74%" h={16} />
              <Skel b="40%" h={16} />
            </div>
          </MejlUtkast>
        </div>
      ) : (
        <MejlUtkast
          till={sortText.till}
          amne={utkast.subject}
          fotVanster={ord <= 90 ? `${ord} ord. Kort nog att läsas på en gång.` : `${ord} ord.`}
          fotHoger={
            <>
              {kvar > 0 ? (
                <TextLank liten onClick={kortare} disabled={kortar}>
                  {kortar ? 'Skriver om' : 'Skriv om kortare'}
                </TextLank>
              ) : null}
              {jobAdUrl ? (
                <TextLank liten href={jobAdUrl} extern>
                  Till annonsen
                </TextLank>
              ) : null}
            </>
          }
        >
          <textarea
            className="j3-b-mejltext"
            aria-label="Mejlets text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={spara}
            maxLength={4000}
            rows={Math.max(10, text.split('\n').length + 2)}
            disabled={kortar}
          />
        </MejlUtkast>
      )}
      <div className="flex flex-col gap-4">
        {fraga ? (
          <TonYta>
            <p className="j3-h3">Skickade du mejlet?</p>
            <p className="j3-text" style={{ margin: '4px 0 12px' }}>
              Då loggar vi Följde upp i dag och flyttar fram påminnelsen.
            </p>
            <div className="flex flex-wrap gap-2">
              <LitenKnapp storlek={48} ikon={<IkonBock />} onClick={() => loggaSkickad(fraga)} disabled={arbetar}>
                {arbetar ? 'Sparar' : 'Ja, det är skickat'}
              </LitenKnapp>
              <LitenKnapp storlek={48} variant="streckad" onClick={() => setFraga(null)}>
                Inte än
              </LitenKnapp>
            </div>
          </TonYta>
        ) : null}
        <StorKnapp
          bred
          golv
          storlek="mellan"
          href={utkast ? mailtoHref({ subject: utkast.subject ?? '', body: text }) : undefined}
          disabled={!utkast}
          onClick={() => {
            spara()
            setFraga('epost')
          }}
        >
          <IkonMejl size={20} />
          Öppna i e-post
        </StorKnapp>
        <LitenKnapp storlek={48} bred ikon={<IkonKopiera />} onClick={kopiera} disabled={!utkast}>
          {kopierad ? 'Kopierat' : 'Kopiera mejlet'}
        </LitenKnapp>
        {fel}
        {vadSedan}
        {redanSkickat}
      </div>
    </div>
  )
}
