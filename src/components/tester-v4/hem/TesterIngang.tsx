/**
 * Ingångskortet Tester på Hem (skissen Hem A): minikatalogen med alla
 * synliga testtyper och personligheten. Varje kort har symbolen, namnet,
 * en statusrad (Ingår i provet, Tränat i går, Nivåkoll 8 nov eller vad
 * testet kallas) och ett litet nivåband. Planens delar är markerade.
 * Knappen Öppna Tester. Gratis: rubriken och foten säger grundnivån.
 *
 * Det lilla bandet är HTML (LitetBand), ett element per kort som följer
 * kortets bredd, så att knoppens tal står läsbart både på mobil och dator.
 * Server component.
 */

import Link from 'next/link'
import { IkonChev, IkonPil } from '@/components/illustrations/RumSymboler'
import { nivabandEtikett, talText } from '@/components/tester-v4/Nivaband'
import TypSymbol from '@/components/tester-v4/tester/TypSymbol'
import { GRUND_GRATISRAD } from '@/lib/tester/v4/copy'
import { TESTER_HREF, menyHref, omattMeta } from '@/lib/tester/v4/rutter'
import { type NivaLage, type TesterV4Data, type TesttypKort } from '@/lib/tester/v4/typer'
import { HEM_V4, talOrd } from './copy'
import { antalTesttyper, delarText, katalogStatus } from './hemData'
import { KNAPP_MORK } from './UtvecklingIngang'

const T = HEM_V4.ingangTester

/**
 * Det lilla nivåbandet i HTML i stället för svg: ett element som följer
 * kortets bredd, så att mobil och dator inte behöver var sin ritning.
 * Zonerna, osäkerheten, fyllningen och knoppen med talet; omätt streckat.
 */
function LitetBand({ lage, ton, text }: { lage: NivaLage; ton: 'koppar' | 'neutral'; text: string }) {
  const matt = lage.status === 'matt' && lage.niva != null
  const pos = (v: number) => `${((Math.min(10, Math.max(1, v)) - 1) / 9) * 100}%`
  const farg = ton === 'koppar' ? 'var(--koppar)' : 'var(--ink-3)'
  const mjuk = ton === 'koppar' ? 'var(--koppar-mjuk)' : 'color-mix(in srgb, var(--ink-3) 18%, transparent)'
  const zon = matt ? 'bg-kant' : 'bg-[repeating-linear-gradient(90deg,var(--kant)_0_3px,transparent_3px_7px)]'
  return (
    <span aria-hidden="true" className="relative mt-auto block h-5 w-full">
      <span className="absolute inset-x-1 top-1/2 flex h-[5px] -translate-y-1/2 gap-[3px] sm:h-1.5">
        {ZONER.map((z) => (
          <span key={z} className={`h-full flex-1 rounded-full ${zon}`} />
        ))}
      </span>
      {matt ? (
        <span className="absolute inset-x-1 top-0 h-full" data-niva={talText(lage.niva as number)}>
          <span
            className="absolute top-1/2 h-[9px] -translate-y-1/2 rounded-full sm:h-2.5"
            style={{ left: pos((lage.niva as number) - lage.osakerhet), width: `calc(${pos((lage.niva as number) + lage.osakerhet)} - ${pos((lage.niva as number) - lage.osakerhet)})`, background: mjuk }}
          />
          <span className="absolute left-0 top-1/2 h-[5px] -translate-y-1/2 rounded-full sm:h-1.5" style={{ width: pos(lage.niva as number), background: farg }} />
          <span
            className="absolute top-1/2 grid h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[9px] font-bold leading-none [font-variant-numeric:tabular-nums]"
            style={{ left: pos(lage.niva as number), background: farg, color: ton === 'koppar' ? 'var(--koppar-text)' : 'var(--papper)' }}
          >
            {talText(lage.niva as number)}
          </span>
        </span>
      ) : (
        <span className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-papper px-2 text-[9.5px] font-semibold leading-[18px] text-ink-3 sm:block">
          {text}
        </span>
      )}
    </span>
  )
}

const ZONER = ['grund', 'avancerad', 'expert'] as const

function KatalogKort({ t, data }: { t: TesttypKort; data: TesterV4Data }) {
  const plan = data.plan
  const status = katalogStatus(t, data.idag)
  const ton = !plan || t.ingarIPlan ? 'koppar' : 'neutral'
  const omattText = t.niva.status === 'paborjad' ? 'Påbörjad' : omattMeta(t.id)
  const iPlan = !!plan && t.ingarIPlan
  return (
    <Link
      href={menyHref(t.id)}
      aria-label={`${t.namn}. ${iPlan && plan ? `${T.ingar(plan.namn)}. ` : status ? `${status.text}. ` : ''}${nivabandEtikett({ namn: t.namn, lage: t.niva }).replace(`${t.namn}: `, '')}`}
      className={`flex min-h-[118px] min-w-0 flex-col items-center gap-1.5 rounded-xl px-2 pb-[9px] pt-2.5 text-center sm:min-h-[120px] sm:items-stretch sm:gap-2 sm:rounded-[14px] sm:p-3 sm:text-left ${
        iPlan ? 'border-[1.5px] border-koppar bg-[color-mix(in_srgb,var(--koppar-mjuk)_45%,var(--papper))] shadow-[inset_0_0_0_1px_var(--koppar)]' : 'border border-kant bg-papper hover:border-kant-stark'
      }`}
      data-katalog={t.id}
      data-i-plan={iPlan ? '' : undefined}
    >
      <span className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-2.5">
        <TypSymbol typ={t.id} size={32} />
        <b className="text-[12px] font-semibold leading-[15px] text-ink-1 sm:text-[13px] sm:leading-[17px]">{t.namn}</b>
      </span>
      {iPlan && plan ? (
        <span className="text-[10.5px] font-semibold leading-[13px] text-koppar-ink sm:inline-flex sm:h-5 sm:items-center sm:self-start sm:rounded-md sm:bg-koppar-mjuk sm:px-[7px] sm:text-[11px]">
          {T.ingar(plan.namn)}
        </span>
      ) : status ? (
        <span className={`text-[10.5px] leading-[13px] sm:text-xs sm:leading-4 ${status.ton === 'positiv' ? 'font-semibold text-positiv' : 'text-ink-3'}`}>
          {status.text === t.kallas ? (
            <>
              {/* Mobilen har inte plats för "kallas även": där står vägen till nivån, som i skissen. */}
              <span className="sm:hidden">{omattText}</span>
              <span className="hidden sm:inline">{status.text}</span>
            </>
          ) : (
            status.text
          )}
        </span>
      ) : null}
      <LitetBand lage={t.niva} ton={ton} text={omattText} />
    </Link>
  )
}

function PersonlighetKort({ gjord, href }: { gjord: boolean; href: string }) {
  return (
    <Link
      href={href}
      className="flex min-h-[118px] min-w-0 flex-col items-center gap-1.5 rounded-xl border border-kant bg-papper px-2 pb-[9px] pt-2.5 text-center hover:border-kant-stark sm:min-h-[120px] sm:items-stretch sm:gap-2 sm:rounded-[14px] sm:p-3 sm:text-left"
      data-katalog="personlighet"
    >
      <span className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-2.5">
        <TypSymbol typ="personlighet" size={32} />
        <b className="text-[12px] font-semibold leading-[15px] text-ink-1 sm:text-[13px] sm:leading-[17px]">{T.personlighet}</b>
      </span>
      <span className="text-[10.5px] leading-[13px] text-ink-3 sm:text-xs sm:leading-4">
        <span className="sm:hidden">{T.personlighetKort}</span>
        <span className="hidden sm:inline">{T.personlighetRad}</span>
      </span>
      <span className="mt-auto inline-flex items-center gap-1 text-[11px] font-semibold text-ink-2 sm:text-xs">
        {gjord ? T.personlighetGjord : T.personlighetGor}
        <IkonChev size={14} className="hidden sm:block" />
      </span>
    </Link>
  )
}

export default function TesterIngang({ data }: { data: TesterV4Data }) {
  const plan = data.plan
  const synliga = data.typer.filter((t) => t.synlig)
  const antal = talOrd(antalTesttyper(data))
  const premium = data.gratis.premium
  const iPlan = synliga.filter((t) => t.ingarIPlan)
  const text = plan && iPlan.length ? T.medPlan(delarText(iPlan.map((t) => t.namn)), plan.namn) : T.utanPlan
  const fot = premium ? T.fot : data.gratis.grundKvarIdag > 0 ? GRUND_GRATISRAD : T.fotGratisSlut
  return (
    <section aria-labelledby="ingang-tester" className="flex min-w-0 flex-col gap-3 rounded-2xl border border-kant bg-papper p-4 sm:gap-3.5 sm:px-5 sm:pb-5 sm:pt-[18px]" data-ingang="tester">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-1">
          <p className="text-ey text-ink-3">{T.eyebrow}</p>
          <h2 id="ingang-tester" className="font-display text-[20px] font-bold leading-6 tracking-[-.02em] text-ink-1 sm:text-[21px] sm:leading-[25px]">
            {premium ? T.rubrik(antal) : T.rubrikGratis(antal)}
          </h2>
        </div>
        <Link href={TESTER_HREF} className="-my-1 inline-flex min-h-11 shrink-0 items-center gap-1 whitespace-nowrap text-[13px] font-semibold text-ink-2">
          <span className="sm:hidden">{T.allaKort}</span>
          <span className="hidden sm:inline">{T.alla}</span>
          <IkonChev size={16} />
        </Link>
      </div>
      <p className="text-[13.5px] leading-[19px] text-ink-2 sm:text-sm sm:leading-5">{text}</p>
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {synliga.map((t) => (
          <KatalogKort key={t.id} t={t} data={data} />
        ))}
        <PersonlighetKort gjord={data.personlighet.gjord} href={data.personlighet.href} />
      </div>
      <div className="mt-auto flex flex-col gap-2.5 pt-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3.5">
        <Link href={TESTER_HREF} className={`${KNAPP_MORK} w-full sm:w-auto`}>
          {T.knapp}
          <IkonPil size={16} />
        </Link>
        <span className="text-center text-[12.5px] leading-[17px] text-ink-3 sm:text-left sm:text-meta" data-tester-fot>
          {fot}
        </span>
      </div>
    </section>
  )
}
