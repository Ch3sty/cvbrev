/**
 * Målgången (/dashboard/mina-brev/[id]/skickat), skissen Skickat-1440.
 * Serverkomponent: allt står i första HTML:en. Talet är antalet sökta
 * tjänster i månaden, plupparna visar hur många av användarens brev som är
 * skickade (högst sju). På telefon staplas allt i en spalt med arket och
 * banan mellan rubriken och korten.
 */
import Link from 'next/link'
import type { ReactNode } from 'react'
import { BrevMiniatyr } from '@/components/brev3/ark'
import { StorKnapp, VitKnapp, Pips, Tagg, IkonPil, IkonTillbaka, IkonBock, IkonPortfolj } from '@/components/brev3/kit'
import ArbetsRam from './ArbetsRam'
import NastaJobb from './NastaJobb'
import { SKICKAT } from './texter'

export interface MalgangProps {
  html: string
  soktDag: string
  soktDagKort: string
  foretag: string | null
  antalManad: number
  manad: string
  pips: { fyllda: number; totalt: number }
  intervjuHref: string
  jobb: { cvId: string; titel: string; foretag: string; ort: string | null; annons: string; url: string | null; sistaDag: string | null; nastaGratis: string | null } | null
  nastaGratis: string | null
}

const KORT =
  'flex min-h-[150px] flex-col gap-2 rounded-[22px] bg-white p-[18px_20px_20px] text-left text-[#1A1A1F] no-underline shadow-[0_5px_0_#1C0A18] transition-transform duration-[120ms] hover:translate-y-[2px] hover:text-[#1A1A1F] hover:shadow-[0_3px_0_#1C0A18] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[color:var(--koppar-ljus)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 xl:min-h-[172px]'
const IK = 'flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-[#F0DCE8] text-[#6E2B59]'
const RUB = "font-[family-name:var(--font-display)] text-[19px] font-extrabold leading-6"
const TXT = 'text-[14px] leading-5 text-[#4A3F46]'

function Kortinnehall({ ikon, tagg, rubrik, text }: { ikon: ReactNode; tagg?: ReactNode; rubrik: string; text: string }) {
  return (
    <>
      <span className="flex items-center justify-between gap-2">
        <span className={IK} aria-hidden="true">
          {ikon}
        </span>
        {tagg}
      </span>
      <b className={RUB}>{rubrik}</b>
      <small className={TXT}>{text}</small>
    </>
  )
}

function IkonTester() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" rx="2" />
      <rect x="13" y="4" width="7" height="7" rx="2" />
      <rect x="4" y="13" width="7" height="7" rx="2" />
      <path d="M16.5 14v5M14 16.5h5" />
    </svg>
  )
}

function IkonPratbubbla() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 5h14a2 2 0 012 2v8a2 2 0 01-2 2h-7l-5 4v-4H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
    </svg>
  )
}

/** Brevets väg, klar till flaggan, med arket och stämpeln (skissens högra halva). */
function Banan({ html, stampel }: { html: string; stampel: string }) {
  const bock = (x: number, y: number) => (
    <g key={`${x}`}>
      <circle cx={x} cy={y} r="13" fill="#E07A2F" />
      <path d={`M${x - 5.5} ${y + 0.5}l3.6 3.6 7.4-8`} fill="none" stroke="#1A1206" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  )
  return (
    <div role="img" aria-label={SKICKAT.arkEtikett} className="relative mx-auto h-[300px] w-full max-w-[380px] xl:mx-0 xl:h-[480px] xl:w-[560px] xl:max-w-none">
      <svg viewBox="0 0 560 480" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <g className="motion-safe:animate-[b3-skickat-dala_.7s_ease-out_both]">
          <circle cx="70" cy="60" r="6" fill="#E07A2F" />
          <circle cx="130" cy="20" r="4" fill="#E29DCB" />
          <rect x="26" y="130" width="12" height="12" rx="3" fill="#F4B98A" transform="rotate(20 32 136)" />
          <circle cx="500" cy="40" r="5" fill="#F4B98A" />
          <rect x="520" y="150" width="12" height="12" rx="3" fill="#E29DCB" transform="rotate(-18 526 156)" />
          <circle cx="470" cy="110" r="4" fill="#E07A2F" />
          <rect x="180" y="6" width="10" height="10" rx="2.5" fill="#E07A2F" transform="rotate(30 185 11)" />
        </g>
        <path d="M40 440C100 440 150 432 200 420S300 396 350 376S440 344 500 320" fill="none" stroke="#E07A2F" strokeWidth="6" strokeLinecap="round" />
        {bock(40, 440)}
        {bock(200, 420)}
        {bock(350, 376)}
        <path d="M500 320V236" stroke="#FBF3F8" strokeWidth="4" strokeLinecap="round" />
        <path d="M502 238h46l-12 16 12 16h-46z" fill="#E07A2F" />
        <circle cx="500" cy="320" r="15" fill="#FBF3F8" />
        <path d="M493.5 320.5l4.2 4.2 8.6-9.2" fill="none" stroke="#3A1930" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <g fontSize="13" fontWeight="600" fill="#D6AFC8" textAnchor="middle" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          <text x="40" y="474">annonsen</text>
          <text x="200" y="456">brevet</text>
          <text x="350" y="412">läst igenom</text>
          <text x="500" y="356" fill="#FBF3F8" fontWeight="700">
            skickat
          </text>
        </g>
      </svg>
      <div className="absolute left-[27%] top-[2%] w-[45%] -rotate-[5deg] xl:left-[150px] xl:top-[10px] xl:w-[250px]">
        <div className="overflow-hidden rounded-md bg-white shadow-[0_4px_0_#1C0A18,0_26px_50px_rgba(0,0,0,.45)]">
          <span className="block xl:hidden">
            <BrevMiniatyr html={html} bredd={170} />
          </span>
          <span className="hidden xl:block">
            <BrevMiniatyr html={html} bredd={250} />
          </span>
        </div>
      </div>
      <span className="absolute left-[50%] top-[50%] inline-flex h-10 -rotate-12 items-center gap-2 rounded-[14px] border-[3px] border-[#2F7D5B] bg-white px-3.5 font-[family-name:var(--font-display)] text-[17px] font-extrabold leading-6 text-[#1F5C42] shadow-[0_4px_0_rgba(0,0,0,.25)] xl:left-[286px] xl:top-[250px] xl:h-12 xl:px-4 xl:text-[20px]">
        <IkonBock size={20} strokeWidth={3.4} />
        {stampel}
      </span>
    </div>
  )
}

export default function Malgang(p: MalgangProps) {
  const jobbText = p.jobb
    ? [p.jobb.foretag + (p.jobb.ort ? `, ${p.jobb.ort}` : '') + '.', p.jobb.nastaGratis ? SKICKAT.nastaGratis(p.jobb.nastaGratis) : null].filter(Boolean).join(' ')
    : null
  return (
    <ArbetsRam>
      <style>{'@keyframes b3-skickat-dala{0%{transform:translateY(-14px);opacity:0}30%{opacity:1}100%{transform:translateY(0);opacity:1}}'}</style>
      <div className="relative min-h-[100dvh] overflow-hidden bg-[color:var(--vagg)] text-[color:var(--vagg-ink)]">
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
          <circle cx="1290" cy="-60" r="330" fill="#46213B" />
          <path d="M0 900V560C260 520 520 600 800 530S1240 430 1440 460V900Z" fill="#45203A" />
          <path d="M0 900V690C300 660 620 720 900 670S1300 600 1440 620V900Z" fill="#4F2644" />
        </svg>
        <div className="relative mx-auto max-w-[1120px] px-4 pb-10 pt-3 xl:px-0 xl:pb-16 xl:pt-4">
          <Link href="/dashboard/mina-brev" className="b3-kryss" aria-label="Tillbaka till dina brev">
            <IkonTillbaka />
          </Link>
          <div className="xl:grid xl:grid-cols-[560px_minmax(0,1fr)] xl:gap-10">
            <div className="mt-6 xl:mt-[54px]">
              <p className="b3-ogon">{SKICKAT.ogon(p.soktDag, p.foretag)}</p>
              <h1 className="m-0 mt-3 font-[family-name:var(--font-display)] text-[40px] font-extrabold leading-[44px] tracking-[-.03em] xl:text-[64px] xl:leading-[66px]">
                {SKICKAT.rubrik}
              </h1>
              <p className="m-0 mt-4 max-w-[470px] text-[16px] leading-6 text-[color:var(--vagg-mjuk)] xl:text-[18px] xl:leading-[27px]">{SKICKAT.ingress}</p>
              <div className="xl:hidden">
                <Banan html={p.html} stampel={SKICKAT.stampel(p.soktDagKort)} />
              </div>
              <div className="mt-7 flex flex-col gap-3 xl:flex-row xl:items-center">
                <StorKnapp href="/dashboard/skapa-brev">
                  {SKICKAT.skrivNasta}
                  <IkonPil />
                </StorKnapp>
                <VitKnapp href="/dashboard/sokta-tjanster">{SKICKAT.oppnaSokta}</VitKnapp>
              </div>
              <div className="mt-9 flex items-end gap-3.5 xl:mt-11">
                <span className="font-[family-name:var(--font-display)] text-[72px] font-extrabold leading-[60px] tracking-[-.04em] xl:text-[88px] xl:leading-[72px]">{p.antalManad}</span>
                <span className="pb-0.5 text-[15px] leading-5 text-[color:var(--vagg-mjuk)]">
                  {SKICKAT.ansokningar(p.antalManad)}
                  <br />
                  <b className="font-semibold text-[color:var(--vagg-ink)]">{SKICKAT.manad(p.manad)}</b>
                </span>
                <span className="ml-2.5 pb-1">
                  <Pips storlek="stor" fyllda={p.pips.fyllda} totalt={p.pips.totalt} etikett={SKICKAT.pipsEtikett(p.pips.fyllda, p.pips.totalt)} />
                </span>
              </div>
            </div>
            <div className="hidden xl:block xl:pt-[54px]">
              <Banan html={p.html} stampel={SKICKAT.stampel(p.soktDagKort)} />
            </div>
          </div>
          <section className="mt-10 xl:mt-[40px]" aria-labelledby="medan-du-vantar">
            <p id="medan-du-vantar" className="m-0 mb-3 text-[11px] font-semibold uppercase leading-4 tracking-[.08em] text-[color:var(--vagg-mjuk)]">
              {SKICKAT.vantar}
            </p>
            <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-3">
              <Link href="/dashboard/tester" className={KORT}>
                <Kortinnehall ikon={<IkonTester />} rubrik={SKICKAT.tester.rubrik} text={SKICKAT.tester.text} />
              </Link>
              <Link href={p.intervjuHref} className={KORT}>
                <Kortinnehall ikon={<IkonPratbubbla />} rubrik={SKICKAT.intervju.rubrik} text={SKICKAT.intervju.text} />
              </Link>
              {p.jobb && jobbText ? (
                <NastaJobb className={KORT} jobb={p.jobb}>
                  <Kortinnehall
                    ikon={<IkonPortfolj size={24} />}
                    tagg={p.jobb.sistaDag ? <Tagg ton="p">{`Sista dag ${p.jobb.sistaDag}`}</Tagg> : undefined}
                    rubrik={p.jobb.titel}
                    text={jobbText}
                  />
                </NastaJobb>
              ) : (
                <Link href="/dashboard/skapa-brev" className={KORT}>
                  <Kortinnehall
                    ikon={<IkonPil size={22} />}
                    rubrik={SKICKAT.nastaBrev.rubrik}
                    text={p.nastaGratis ? `${SKICKAT.nastaBrev.text} ${SKICKAT.nastaGratis(p.nastaGratis)}` : SKICKAT.nastaBrev.text}
                  />
                </Link>
              )}
            </div>
          </section>
        </div>
      </div>
    </ArbetsRam>
  )
}
