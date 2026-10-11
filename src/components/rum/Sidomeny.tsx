'use client'

/**
 * Sidomenyn på dator (spec-rummen 4.3, konceptets .sidomeny, ramarna W1 och J2).
 *
 * 248 px papper. Logotypen, de fyra rummen som tunga rader (dörrikonen i
 * rummets färg på vitt när raden är aktiv), gruppen "I <rummet>" med
 * rummets undersidor (kopparlinje på den aktiva), Kom igång, och längst ner
 * kontot med avatar och paketnamn, Admin, Hjälp och Rapportera ett fel.
 * Pakethuvudet är borta: paketet står vid kontot.
 *
 * Låsta undersidor bär ett låschip och öppnar betalväggen (GraValSheet,
 * surface "sidomeny") i stället för sidan, som de gråa raderna gjorde förut.
 * Talen kommer ur den delade summeringen. Realtidskanalerna som håller
 * talen levande öppnas först när sidan är ledig, aldrig i kritisk väg.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import { getSupabaseClient } from '@/lib/supabase/client-manager'
import { scheduleIdle } from '@/lib/scheduleIdle'
import { scopeHasFeature, type Feature } from '@/lib/access/features'
import { menyFot, menyRad, paketNamn, type PaketLage } from '@/lib/onboarding/paket-rader'
import { SALD_PLAN, paketKort, prisPeriod } from '@/lib/plans/plans'
import type { PaywallVariant } from '@/components/paywall/paywall-copy'
import GraValSheet from '@/components/paywall/GraValSheet'
import KomIgangRad from '@/components/dashboard/KomIgangRad'
import SidebarLogo from '@/components/dashboard/sidebar/SidebarLogo'
import SidebarFooter from '@/components/dashboard/sidebar/SidebarFooter'
import { Avatar, initialer } from '@/components/dashboard/ProfileMenu'
import { useCandidateInterests } from '@/hooks/useCandidateInterests'
import { TEST_GROUPS } from '@/app/dashboard/tester/components/testCatalog'
import { aktivUndersida, DORRAR, rumForPath, type Rum } from '@/lib/rum/rum'
import { CHIP, GRUPP_RUBRIK, KONTORAD, NAV, UNDERSIDA, provlageFormat } from '@/lib/rum/copy'
import { getTestConfig } from '@/app/dashboard/tester/testConfig'
import Chip from './Chip'
import { DORR_IKON } from './Dorrnav'
import { useRum } from './RumKontext'
import { markeraRumYta } from './rumMatning'
import { KURVAN_HREF } from '@/lib/traning/rutter'

/** Nyhet-etiketten på Inför intervjun tas bort 2026-10-22, svensk midnatt. */
const NYHET_INFOR_INTERVJUN_TILL = Date.parse('2026-10-22T00:00:00+02:00')

/**
 * Provlägets format i klartext på den låsta raden (spec 16.2 fråga 2). När
 * våg 2 inför provdatum visas raden inte alls på provdagen, för någon.
 */
const PROV = getTestConfig('matrislogik-prov')
const PROV_FORMAT = PROV ? provlageFormat(PROV.totalQuestions, PROV.examMinutes ?? PROV.minutes) : undefined

/** Gratisnivån innan summeringen hunnit fram. */
const TOM_PAKET: PaketLage = {
  scope: null,
  track: null,
  planKey: null,
  fornyasAt: null,
  dayPassOnly: false,
  chatUsed: 0,
  chatLimit: null,
  lettersUsed: 0,
  lettersLimit: null,
}

export interface Undersida {
  href: string
  etikett: string
  chip?: ReactNode
  exact?: boolean
  /** Låst: trycket öppnar betalväggen. */
  last?: { feature: Feature; variant: PaywallVariant; text: string; format?: string }
}

/**
 * Kort status bredvid Prenumeration (copy-premium avsnitt 3): "Premium" för
 * den som betalar, "5 dagar kvar" för en tidsbegränsad period och "149 kr i
 * månaden" på gratisnivån. En befintlig spårkund ser sitt paket.
 */
function prenumerationsEtikett(profil: Record<string, unknown> | null, paket: PaketLage): string | null {
  if (!profil) return null
  const until = profil.premium_until as string | null | undefined
  const tier = profil.subscription_tier as string | null | undefined
  const subId = profil.subscription_id as string | null | undefined
  const status = (profil.subscription_status as string | null | undefined) ?? ''
  const harUntil = Boolean(until) && new Date(until as string) > new Date()
  const liveSub =
    !!subId && !String(subId).startsWith('sub_test') && ['active', 'trialing', 'past_due', 'unpaid'].includes(status)
  const namn = paket.planKey ? paketNamn(paket.planKey) : paketKort()
  if (liveSub) return namn
  if (tier === 'premium' && harUntil) {
    const dagar = Math.max(1, Math.ceil((new Date(until as string).getTime() - Date.now()) / 86400000))
    return `${dagar} ${dagar === 1 ? 'dag' : 'dagar'} kvar`
  }
  if (tier === 'premium') return namn
  return prisPeriod(SALD_PLAN)
}

export default function Sidomeny() {
  const pathname = usePathname() ?? '/dashboard'
  const rum: Rum = rumForPath(pathname)
  const { user } = useRum()
  const { summary, refresh } = useDashboardData()
  const { pending, loaded: intressenLaddade } = useCandidateInterests()
  const paket: PaketLage = summary?.paket ?? TOM_PAKET
  const profil = (summary?.profile ?? null) as Record<string, unknown> | null
  const [sparr, setSparr] = useState<{ feature: Feature; variant: PaywallVariant } | null>(null)

  const isAdmin = Boolean(summary?.arAdmin)
  const cvAntal = summary?.sidomeny?.cv ?? summary?.cv.count ?? null
  const brevAntal = summary?.sidomeny?.brev ?? null
  const ansokningar = summary?.sidomeny?.ansokningar ?? null
  // "N nya" på Matchade jobb (spec 16.2 fråga 3): bara när funktionen
  // matchningar_nya() finns och svarar mer än noll.
  const nyaMatchningar = summary?.jobbsok?.matchningarNya ?? null

  // Talen hålls levande: ändras CV, brev eller ansökningar i en annan flik
  // eller i ett flöde hämtas summeringen om, en gång per skur. Kanalerna
  // öppnas först när sidan är ledig.
  const userId = user?.id ?? null
  useEffect(() => {
    if (!userId) return
    const supabase = getSupabaseClient()
    const channels: ReturnType<typeof supabase.channel>[] = []
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null
    const hamtaOm = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => void refresh(), 800)
    }
    const oppna = () => {
      if (cancelled) return
      for (const table of ['cv_texts', 'letters', 'job_applications']) {
        channels.push(
          supabase
            .channel(`sidomeny_${table}_changes`)
            .on('postgres_changes', { event: '*', schema: 'public', table, filter: `user_id=eq.${userId}` }, hamtaOm)
            .subscribe()
        )
      }
    }
    const avbryt = scheduleIdle(oppna, 3000)
    return () => {
      cancelled = true
      avbryt?.()
      if (timer) clearTimeout(timer)
      channels.forEach((ch) => supabase.removeChannel(ch))
    }
  }, [userId, refresh])

  const lasFor = (val: 'linkedin' | 'bli_upptackt'): Undersida['last'] => {
    const r = menyRad(val, paket)
    if (r.ingar || !r.feature || !r.variant) return undefined
    return { feature: r.feature, variant: r.variant, text: r.text }
  }
  const antalChip = (n: number | null) => (typeof n === 'number' && n > 0 ? <Chip liten>{n}</Chip> : undefined)

  const undersidor: Record<Rum, Undersida[]> = {
    // Våg 2: hemvyn (Dagens pass), Kurvan, katalogen på Alla tester,
    // Provläget och Test och datum (spec 4.3).
    tran: [
      { href: '/dashboard/tester', etikett: UNDERSIDA.dagensPass, exact: true },
      { href: KURVAN_HREF, etikett: UNDERSIDA.kurvan },
      { href: '/dashboard/tester/alla', etikett: UNDERSIDA.allaTester, chip: <Chip liten>{TEST_GROUPS.length}</Chip> },
      {
        href: '/dashboard/tester/matrislogik-prov',
        etikett: UNDERSIDA.provlaget,
        last: scopeHasFeature(paket.scope, 'test_exam_mode')
          ? undefined
          : { feature: 'test_exam_mode', variant: 'testniva', text: CHIP.lastEtikett, format: PROV_FORMAT },
      },
      { href: '/dashboard/tester/installningar', etikett: UNDERSIDA.testOchDatum },
    ],
    cv: [
      { href: '/dashboard/profil/cv', etikett: UNDERSIDA.minaCv, chip: antalChip(cvAntal) },
      { href: '/dashboard/cv-analys', etikett: UNDERSIDA.analyseraCv },
      { href: '/dashboard/cv-mallar', etikett: UNDERSIDA.cvMallar },
      { href: '/dashboard/linkedin-optimizer', etikett: UNDERSIDA.linkedin, last: lasFor('linkedin') },
    ],
    brev: [
      { href: '/dashboard/mina-brev', etikett: UNDERSIDA.minaBrev, chip: antalChip(brevAntal) },
      { href: '/dashboard/skapa-brev', etikett: UNDERSIDA.skrivNyttBrev },
    ],
    jobb: [
      { href: '/dashboard', etikett: UNDERSIDA.oversikt, exact: true },
      { href: '/dashboard/sokta-tjanster', etikett: UNDERSIDA.soktaTjanster, chip: antalChip(ansokningar) },
      {
        href: '/dashboard/intervju',
        etikett: UNDERSIDA.inforIntervjun,
        chip: Date.now() < NYHET_INFOR_INTERVJUN_TILL ? <Chip liten ton>{CHIP.nyhet}</Chip> : undefined,
      },
      {
        href: '/dashboard/jobbmatchning',
        etikett: UNDERSIDA.matchadeJobb,
        chip: nyaMatchningar !== null && nyaMatchningar > 0 ? <Chip liten ton>{CHIP.nya(nyaMatchningar)}</Chip> : undefined,
      },
      { href: '/dashboard/jobbcoachen', etikett: UNDERSIDA.jobbcoachen },
      {
        href: '/dashboard/bli-upptackt',
        etikett: UNDERSIDA.bliUpptackt,
        last: lasFor('bli_upptackt'),
        chip: intressenLaddade && pending > 0 ? <Chip liten ton>{CHIP.vantar(pending)}</Chip> : undefined,
      },
    ],
    neutral: [
      { href: '/dashboard/profil', etikett: UNDERSIDA.profil, exact: true },
      {
        href: '/dashboard/profil/prenumeration',
        etikett: UNDERSIDA.prenumeration,
        chip: prenumerationsEtikett(profil, paket) ? <Chip liten>{prenumerationsEtikett(profil, paket)}</Chip> : undefined,
      },
      { href: '/dashboard/profil#utseende', etikett: UNDERSIDA.utseende },
    ],
  }

  const rader = undersidor[rum]
  const aktiv = aktivUndersida(pathname, rader.filter((u) => !u.href.includes('#')))
  const fot = menyFot(paket)

  const metaNamn = (user?.user_metadata?.full_name ?? user?.user_metadata?.name) as string | undefined
  const fullName = (profil?.full_name as string | null | undefined) ?? null
  const namn =
    fullName && fullName.trim() && fullName.trim().toLowerCase() !== 'ej angivet'
      ? fullName
      : metaNamn || (user?.email ? String(user.email).split('@')[0] : 'Användare')
  const paketText = paket.planKey ? paketNamn(paket.planKey) : KONTORAD.utanPaket
  const avatarUrl = (profil?.profile_photo_url as string | null | undefined) || null

  return (
    <div
      className="flex h-full w-[248px] flex-col gap-1 overflow-y-auto border-r border-kant bg-papper p-3"
    >
      <SidebarLogo />

      <nav aria-label={NAV.sidomeny} className="flex flex-col gap-1">
        {DORRAR.map((d) => {
          const pa = d.rum === rum
          const Ikon = DORR_IKON[d.rum]
          return (
            <Link
              key={d.rum}
              href={d.href}
              prefetch
              onClick={() => markeraRumYta('sidomeny')}
              aria-current={pa && aktiv?.href === d.href ? 'page' : undefined}
              className={`flex h-12 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold ${
                pa ? 'bg-ton text-ton-ink' : 'text-ink-1 hover:bg-papper-2'
              }`}
            >
              <span
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] ${
                  pa ? 'bg-rum text-white' : 'bg-papper-2 text-ink-3'
                }`}
              >
                <Ikon size={20} />
              </span>
              {d.etikettDator}
            </Link>
          )
        })}

        <p className="px-3 pb-1.5 pt-5 text-ey text-ink-3">{GRUPP_RUBRIK[rum]}</p>
        {rader.map((u) => {
          if (u.last) {
            const last = u.last
            return (
              <button
                key={u.href}
                type="button"
                onClick={() => setSparr({ feature: last.feature, variant: last.variant })}
                aria-label={[u.etikett, last.format, last.text].filter(Boolean).join('. ')}
                className={`flex items-center justify-between gap-2 rounded-[10px] px-3 text-left text-sm text-ink-3 hover:bg-papper-2 ${
                  last.format ? 'min-h-10 py-1.5' : 'h-10'
                }`}
              >
                {last.format ? (
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-ink-2">{u.etikett}</span>
                    <span className="text-xs leading-4 text-ink-3">{last.format}</span>
                  </span>
                ) : (
                  <span className="truncate">{u.etikett}</span>
                )}
                <Chip liten las label={last.text} />
              </button>
            )
          }
          const pa = aktiv?.href === u.href
          return (
            <Link
              key={u.href}
              href={u.href}
              prefetch
              onClick={() => markeraRumYta('sidomeny')}
              aria-current={pa ? 'page' : undefined}
              className={`flex h-10 items-center justify-between gap-2 px-3 text-sm ${
                pa
                  ? 'rounded-r-[10px] font-medium text-ink-1 shadow-[inset_3px_0_0_var(--koppar)]'
                  : 'rounded-[10px] text-ink-2 hover:bg-papper-2 hover:text-ink-1'
              }`}
            >
              <span className="truncate">{u.etikett}</span>
              {u.chip ?? null}
            </Link>
          )
        })}
        {fot ? <p className="px-3 pt-3 text-xs leading-4 text-ink-3">{fot}</p> : null}
      </nav>

      <div className="pt-3 empty:hidden">
        <KomIgangRad variant="sidomeny" />
      </div>

      <Link
        href="/dashboard/profil"
        className="mt-auto flex min-h-11 items-center gap-2.5 rounded-[10px] px-3 py-2 hover:bg-papper-2"
      >
        <Avatar avatarUrl={avatarUrl} initialer={initialer(namn, user?.email ?? '')} pa="meny" storlek={28} />
        <span className="flex min-w-0 flex-col">
          <span className="break-words text-[13px] font-medium leading-[18px] text-ink-1">{namn}</span>
          <span className="text-xs leading-4 text-ink-3">{paketText}</span>
        </span>
      </Link>

      <SidebarFooter isAdmin={isAdmin} />

      {sparr ? (
        <GraValSheet
          open
          onClose={() => setSparr(null)}
          feature={sparr.feature}
          variant={sparr.variant}
          scope={paket.scope}
          track={paket.track}
          planKey={paket.planKey}
          surface="sidomeny"
          plats="sidomeny"
        />
      ) : null}
    </div>
  )
}
