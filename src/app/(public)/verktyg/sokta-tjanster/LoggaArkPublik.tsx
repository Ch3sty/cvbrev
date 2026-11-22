'use client'

/**
 * Arket "Logga sökt tjänst" i lyftet på /verktyg/sokta-tjanster, publikt
 * omgång 3 ("inga genvägar"): besökaren fyller i det på riktigt. Samma fält
 * och etiketter som kontots ark (LoggaArk). Det hon fyller i sparas i
 * webbläsaren (lib/jobbsok/provaSokt.ts) och hämtas hem efter kontot av
 * valkommen-sidan, så att den sökta tjänsten finns i kontot. Redirecten bär
 * samma uppgifter, så att arket öppnas förifyllt om hon loggar in i stället.
 *
 * Importerar inte grundens barrel (serverkomponenter); klasserna p3-knapp
 * och st-* räcker. Klasserna står i sokta-tjanster.css.
 */

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { idagSv } from '@/lib/jobbsok/datum'
import { kontrolleraSokt, soktRedirect, sparaSoktUtkast, type SoktFalt, type SoktKanal } from '@/lib/jobbsok/provaSokt'

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

export default function LoggaArkPublik() {
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

  function skicka(e: FormEvent) {
    e.preventDefault()
    const u = { lage, tjanst, arbetsgivare, datum: lage === 'sokt' ? datum : sista, kanal }
    const f = kontrolleraSokt(u, idag)
    setFel(f)
    if (f) {
      document.getElementById(`st-${f}`)?.focus()
      return
    }
    setSkickar(true)
    sparaSoktUtkast(u)
    router.push(`/register?redirect=${encodeURIComponent(soktRedirect(u))}`)
  }

  const felId = (f: SoktFalt) => (fel === f ? `st-${f}-fel` : undefined)

  return (
    <form className="st-arkform" onSubmit={skicka} noValidate aria-labelledby="st-arkrubrik">
      <span className="st-arkrubrik" id="st-arkrubrik">
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
          placeholder="Företagets namn"
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
      <button type="submit" className="p3-knapp p3-knapp-bred" disabled={skickar}>
        {lage === 'sokt' ? 'Logga sökt tjänst' : 'Spara till Ska sökas'}
      </button>
      <span className="st-arkfot">Sedan skapar du ett gratis konto, så ligger tjänsten där.</span>
    </form>
  )
}
