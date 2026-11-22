'use client'

/**
 * Arket "Logga sökt tjänst" i lyftet på /verktyg/sokta-tjanster, publikt
 * omgång 3 ("inga genvägar"): besökaren fyller i det på riktigt. Samma fält
 * och etiketter som kontots ark (LoggaArk). Det hon fyller i sparas i
 * webbläsaren (lib/jobbsok/provaSokt.ts) och hämtas hem efter kontot av
 * valkommen-sidan, så att den sökta tjänsten finns i kontot. Loggar hon in i
 * stället fyller kontots ark i sig ur samma utkast.
 *
 * SEO:s villkor (seo-slutbesked.md, Del 3 punkt 1): knappen är en vanlig
 * länk till K1:s adress och fungerar utan JavaScript, fälten är tomma från
 * början, och tjänst och arbetsgivare står aldrig i adressen eller i en
 * händelse, så att de inte når PostHog. Med JavaScript kontrolleras fälten
 * och utkastet sparas innan länken följs.
 *
 * Importerar inte grundens barrel (serverkomponenter); klasserna p3-knapp
 * och st-* räcker. Klasserna står i sokta-tjanster.css.
 */

import { useState, type FormEvent, type MouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import { idagSv } from '@/lib/jobbsok/datum'
import { capture } from '@/lib/analytics/events'
import { SOKT_KONTO_HREF, kontrolleraSokt, soktRedirect, sparaSoktUtkast, type SoktFalt, type SoktKanal } from '@/lib/jobbsok/provaSokt'

const KANALER: { varde: SoktKanal; namn: string }[] = [
  { varde: 'ad', namn: 'Annons' },
  { varde: 'unsolicited', namn: 'Spontan' },
  { varde: 'network', namn: 'Via kontakt' },
]

const FEL: Record<SoktFalt, string> = {
  tjanst: 'Skriv vilken tjänst det gäller.',
  arbetsgivare: 'Skriv arbetsgivarens namn.',
  datum: 'Välj ett datum, högst i dag.',
}

/**
 * surface och slug följer med till händelsen sample_completed (kind sokt), aldrig
 * fältens innehåll. I artikeln om aktivitetsrapporten står arket i <LoggaSoktJobb />.
 */
export default function LoggaArkPublik({ surface = 'verktyg', slug }: { surface?: 'artikel' | 'verktyg'; slug?: string } = {}) {
  const router = useRouter()
  const idag = idagSv()
  const [lage, setLage] = useState<'sokt' | 'ska-soka'>('sokt')
  const [tjanst, setTjanst] = useState('')
  const [arbetsgivare, setArbetsgivare] = useState('')
  const [datum, setDatum] = useState(idag)
  const [sista, setSista] = useState('')
  const [kanal, setKanal] = useState<SoktKanal>('ad')
  const [fel, setFel] = useState<SoktFalt | null>(null)
  const [skickar, setSkickar] = useState(false)

  function skicka(e: FormEvent | MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    if (skickar) return
    const u = { lage, tjanst, arbetsgivare, datum: lage === 'sokt' ? datum : sista, kanal }
    const f = kontrolleraSokt(u, idag)
    setFel(f)
    if (f) {
      document.getElementById(`st-${f}`)?.focus()
      return
    }
    setSkickar(true)
    sparaSoktUtkast(u)
    // Bara var arket skickades, aldrig tjänst, arbetsgivare eller datum (saas-lead 10.2, SEO 11.3).
    capture('sample_completed', { kind: 'sokt', surface, ...(slug ? { slug } : {}) })
    // Bara läget i adressen, aldrig tjänst eller arbetsgivare (PostHog läser adressen).
    router.push(lage === 'sokt' ? SOKT_KONTO_HREF : `/register?redirect=${encodeURIComponent(soktRedirect({ lage }))}`)
  }

  const felId = (f: SoktFalt) => (fel === f ? `st-${f}-fel` : undefined)

  return (
    // Utan JavaScript skickas formuläret med GET till kontovägen (SEO 11.3): /register med
    // redirect som dolt fält, eftersom en GET-sändning ersätter frågesträngen i action.
    // Då landar hon på samma adress som SOKT_KONTO_HREF, och artikeln laddas aldrig om
    // med ?lage=sokt. Textfälten har inga name, så tjänst och arbetsgivare kommer aldrig
    // med i adressen. Med JavaScript gör onSubmit som förut.
    <form className="st-arkform" action="/register" method="get" onSubmit={skicka} noValidate aria-label="Logga sökt tjänst">
      <input type="hidden" name="redirect" value={soktRedirect({ lage: 'sokt' })} />
      <span className="st-arkrubrik" aria-hidden="true">
        Logga sökt tjänst
      </span>
      <fieldset className="st-faltgrupp">
        <legend className="st-etik">Har du sökt eller ska du söka?</legend>
        <div className="st-vaxel">
          <label className={lage === 'sokt' ? 'st-pa' : undefined}>
            <input type="radio" name="lage" value="sokt" checked={lage === 'sokt'} onChange={() => setLage('sokt')} />
            Jag har sökt
          </label>
          <label className={lage === 'ska-soka' ? 'st-pa' : undefined}>
            <input type="radio" name="lage" value="ska-soka" checked={lage === 'ska-soka'} onChange={() => setLage('ska-soka')} />
            Jag ska söka
          </label>
        </div>
      </fieldset>
      <div>
        <label className="st-etik" htmlFor="st-tjanst">
          Tjänst
        </label>
        <input
          id="st-tjanst"
          className="st-falt"
          value={tjanst}
          onChange={(e) => setTjanst(e.target.value)}
          placeholder="Till exempel projektledare"
          maxLength={200}
          autoComplete="off"
          aria-invalid={fel === 'tjanst' || undefined}
          aria-describedby={felId('tjanst')}
        />
        {fel === 'tjanst' ? (
          <span className="st-fel" id="st-tjanst-fel">
            {FEL.tjanst}
          </span>
        ) : null}
      </div>
      <div>
        <label className="st-etik" htmlFor="st-arbetsgivare">
          Arbetsgivare
        </label>
        <input
          id="st-arbetsgivare"
          className="st-falt"
          value={arbetsgivare}
          onChange={(e) => setArbetsgivare(e.target.value)}
          placeholder="Arbetsgivarens namn"
          maxLength={200}
          autoComplete="organization"
          aria-invalid={fel === 'arbetsgivare' || undefined}
          aria-describedby={felId('arbetsgivare')}
        />
        {fel === 'arbetsgivare' ? (
          <span className="st-fel" id="st-arbetsgivare-fel">
            {FEL.arbetsgivare}
          </span>
        ) : null}
      </div>
      {lage === 'sokt' ? (
        <div className="st-faltpar">
          <div>
            <label className="st-etik" htmlFor="st-datum">
              Datum sökt
            </label>
            <input
              id="st-datum"
              type="date"
              className="st-falt"
              value={datum}
              max={idag}
              onChange={(e) => setDatum(e.target.value)}
              aria-invalid={fel === 'datum' || undefined}
              aria-describedby={felId('datum')}
            />
            {fel === 'datum' ? (
              <span className="st-fel" id="st-datum-fel">
                {FEL.datum}
              </span>
            ) : null}
          </div>
          <div>
            <label className="st-etik" htmlFor="st-kanal">
              Hur sökte du?
            </label>
            <select id="st-kanal" className="st-falt" value={kanal} onChange={(e) => setKanal(e.target.value as SoktKanal)}>
              {KANALER.map((k) => (
                <option key={k.varde} value={k.varde}>
                  {k.namn}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div>
          <label className="st-etik" htmlFor="st-datum">
            Sista ansökningsdag
          </label>
          <input
            id="st-datum"
            type="date"
            className="st-falt"
            value={sista}
            min={idag}
            onChange={(e) => setSista(e.target.value)}
            aria-invalid={fel === 'datum' || undefined}
            aria-describedby={felId('datum')}
          />
          {fel === 'datum' ? (
            <span className="st-fel" id="st-datum-fel">
              {FEL.datum}
            </span>
          ) : null}
        </div>
      )}
      {/* K3: kopparknapp i telefonen, vit på datorn där hjältens kopparknapp syns samtidigt (sokta-tjanster.css). */}
      <a href={SOKT_KONTO_HREF} className="p3-knapp p3-knapp-bred st-arkknapp" onClick={skicka} aria-disabled={skickar || undefined}>
        {lage === 'sokt' ? 'Logga sökt tjänst' : 'Spara till Ska sökas'}
      </a>
      <span className="st-arkfot">Sedan skapar du ett gratis konto, så ligger tjänsten där.</span>
    </form>
  )
}
