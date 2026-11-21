'use client'

/**
 * Dina brevs små klientöar: annonsfältet i Hem-ny, "Skriv brev" på
 * jobbkorten, exponeringen av de låsta korten och listan som fälls ut.
 * Annonsen går till Skriv med samma förifyllning som jobbmatchningen
 * använder (cover-letter-store), så att användaren landar med annonsen ifylld.
 */
import { Fragment, useId, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { coverLetterPrefill } from '@/store/cover-letter-store'
import { useBetalvaggVisad } from '@/hooks/useBetalvaggVisad'
import { capture } from '@/lib/analytics/events'
import { StorKnapp, LitenKnapp, IkonPil } from '@/components/brev3/kit'

/** Annonsfältet och "Skriv brevet" (Hem-ny). Tomt fält: knappen går till Skriv utan annons. */
export function AnnonsFalt({ cvId, skrivHref, hint }: { cvId: string | null; skrivHref: string; hint?: ReactNode }) {
  const router = useRouter()
  const id = useId()
  const [text, setText] = useState('')
  const skriv = () => {
    const annons = text.trim()
    if (annons) {
      coverLetterPrefill.set({ cvId: cvId ?? '', jobDescription: annons, jobTitle: '', company: '' })
    }
    router.push(skrivHref)
  }
  return (
    <form
      className="rounded-[22px] bg-[color:var(--b3-papper)] p-4 pb-3.5 text-[color:var(--b3-ink)] shadow-[0_6px_0_var(--b3-djupast),0_26px_48px_rgba(0,0,0,.34)] xl:w-[540px]"
      onSubmit={(e) => {
        e.preventDefault()
        skriv()
      }}
    >
      <label htmlFor={id} className="b3-eyebrow mx-0.5 mb-2 block">
        Annonsen
      </label>
      <textarea
        id={id}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Klistra in hela annonsen. Vi läser ut kravprofilen, skall-krav och meriterande, och skriver brevet mot den."
        className="block h-[112px] w-full resize-none rounded-[14px] border-2 border-[color:var(--b3-kant)] bg-[color:var(--b3-ljus)] px-3.5 py-3 text-[15px] font-medium leading-[22px] text-[color:var(--b3-ink)] placeholder:text-[color:var(--b3-ink-3)] focus:border-[color:var(--b3-ink-3)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--koppar-ink)]"
      />
      <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-4">
        <StorKnapp type="submit" className="xl:!h-14 xl:!px-[26px] xl:!text-[17px] xl:![box-shadow:0_5px_0_var(--b3-koppar-kant)]">
          Skriv brevet
          <IkonPil />
        </StorKnapp>
        {hint ? <span className="text-[13px] leading-[19px] text-[color:var(--b3-ink-2)]">{hint}</span> : null}
      </div>
    </form>
  )
}

export interface JobbForSkriv {
  id: string
  titel: string
  foretag: string
  annons: string
  annonsUrl: string | null
}

/** "Skriv brev" på ett jobb ur matchningarna: annonsen följer med till Skriv. */
export function SkrivBrevKnapp({ jobb, cvId, skrivHref }: { jobb: JobbForSkriv; cvId: string | null; skrivHref: string }) {
  const router = useRouter()
  return (
    <LitenKnapp
      onClick={() => {
        coverLetterPrefill.set({
          cvId: cvId ?? '',
          jobTitle: jobb.titel,
          company: jobb.foretag,
          jobDescription: jobb.annons,
          jobAdUrl: jobb.annonsUrl ?? undefined,
        })
        capture('match_letter_started', { job_id: jobb.id })
        router.push(skrivHref)
      }}
      aria-label={`Skriv brev till ${jobb.foretag}: ${jobb.titel}`}
    >
      Skriv brev
    </LitenKnapp>
  )
}

/** De låsta brevkorten länkar till köpsteget: en exponering per lista, som förut. */
export function KvotMatning({ aktiv }: { aktiv: boolean }) {
  useBetalvaggVisad('kvot', aktiv)
  return null
}

export interface ListPost {
  id: string
  /** Företag och tjänst, för sökfältet. */
  sok: string
  kort: ReactNode
}

/** Dator: så många brev står före "Skriv nytt brev" på första raden. */
const DATOR_FORSTA_RADEN = 3

/**
 * Remsan med breven. Telefon: högst sju kort, resten under "Visa alla brev".
 * Dator: de tre senaste plus "Skriv nytt brev", resten under "Visa alla
 * brev" i hela rader. Sökfältet visas bara när breven är fler än sju.
 */
export function BrevListaKlient({ poster, nytt, max = 7 }: { poster: readonly ListPost[]; nytt: ReactNode; max?: number }) {
  const [alla, setAlla] = useState(false)
  const [sok, setSok] = useState('')
  const sokId = useId()
  const visaSok = poster.length > max
  const traffar = useMemo(() => {
    const s = sok.trim().toLowerCase()
    return s ? poster.filter((p) => p.sok.toLowerCase().includes(s)) : poster
  }, [poster, sok])
  const fritt = alla || !!sok.trim()
  const synliga = fritt ? traffar : traffar.slice(0, max)
  // Dator: första raden är de tre senaste breven plus "Skriv nytt brev"
  // (fyra spalter, som skissen Main); resten fälls ut i hela rader under
  // "Visa alla brev". Telefon: remsan med högst sju, kortet under remsan.
  const forsta = synliga.slice(0, DATOR_FORSTA_RADEN)
  const ovriga = synliga.slice(DATOR_FORSTA_RADEN)
  return (
    <>
      {visaSok ? (
        <div className="mb-4">
          <label htmlFor={sokId} className="sr-only">
            Sök bland dina brev
          </label>
          <input
            id={sokId}
            type="search"
            value={sok}
            onChange={(e) => setSok(e.target.value)}
            placeholder="Sök på företag eller tjänst"
            className="h-11 w-full rounded-[13px] border-2 border-[color:var(--b3-kant)] bg-[color:var(--b3-papper)] px-3.5 text-sm text-[color:var(--b3-ink)] placeholder:text-[color:var(--b3-ink-3)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--koppar-ink)] xl:max-w-md"
          />
        </div>
      ) : null}
      <div className="b3-remsa">
        {forsta.map((p) => (
          <Fragment key={p.id}>{p.kort}</Fragment>
        ))}
        <div className="hidden xl:contents">{nytt}</div>
        {ovriga.length ? (
          <div className={fritt ? 'contents' : 'contents xl:hidden'}>
            {ovriga.map((p) => (
              <Fragment key={p.id}>{p.kort}</Fragment>
            ))}
          </div>
        ) : null}
      </div>
      {sok.trim() && traffar.length === 0 ? <p className="b3-under mt-3">Inget brev matchar sökningen.</p> : null}
      {!fritt && traffar.length > max ? (
        <div className="mt-4 xl:hidden">
          <LitenKnapp onClick={() => setAlla(true)}>{`Visa alla brev (${traffar.length})`}</LitenKnapp>
        </div>
      ) : null}
      {!fritt && traffar.length > DATOR_FORSTA_RADEN ? (
        <div className="mt-4 hidden xl:block">
          <LitenKnapp onClick={() => setAlla(true)}>{`Visa alla brev (${traffar.length})`}</LitenKnapp>
        </div>
      ) : null}
    </>
  )
}
