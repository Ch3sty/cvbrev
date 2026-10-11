'use client'

/**
 * Nästa handling: Jobbsökets lyfta kort (Rummen våg 1b, konceptets J1):
 * etikett, rubrik, en mening, vyns kopparknapp och "Senare" som textlänk.
 * Ersätter InkPanel, som var hemskärmens enda bläckyta i Tråden.
 *
 * Rankningen kommer från useNextBestAction och rörs inte: uppföljning först,
 * sedan AF-fönstret, sedan exakt en oprövad funktion i taget.
 */

import { useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { capture } from '@/lib/analytics/events'
import { GRUNDTEST_HREF, nyttProvHref } from '@/lib/intervju/lankar'
import { getTestConfig, testPaths } from '@/app/dashboard/tester/testConfig'
import { nar } from '@/lib/intervju/nasta'
import { HEM } from '@/app/dashboard/intervju/infor-intervjun-copy'
import type { NextBestAction } from '@/hooks/useNextBestAction'
import { featureUtanforVal } from '@/hooks/useUnusedFeatures'
import type { SignupIntent } from '@/components/registrering/intent'
import LyftKort from '@/components/rum/LyftKort'
import { KNAPP_PRIMAR, LANK } from '@/components/shell/knappar'
import { NASTA_FOLJ_UPP } from '@/lib/rum/copy'
import type { SoktTjanst } from '@/lib/rum/jobbsok'

interface NastaHandlingProps {
  action: NextBestAction
  onDismiss: () => void
  /** Ersätter "Senare", till exempel CV-länken i träningsfokus. */
  secondary?: ReactNode
  /** Valet i registreringen, för mätningen outside_intent (bredden). */
  intent?: SignupIntent | null
  /** Kortet står inte direkt under väggen (eller en förälder överlappar). */
  utanOverlapp?: boolean
  /** Hemmets sökta tjänster (spåret), så att en ensam tyst tjänst kan namnges. */
  tjanster?: SoktTjanst[]
}

/** Dagar sedan tjänsten söktes, i svensk tid; annars dagar sedan senaste händelsen. */
function dagarSedanSokt(t: SoktTjanst): number {
  if (!t.appliedAt) return t.days
  const dag = (d: Date) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(d)
  const ms = Date.parse(dag(new Date())) - Date.parse(dag(new Date(t.appliedAt)))
  return Number.isFinite(ms) ? Math.max(0, Math.round(ms / 86400000)) : t.days
}

function copyFor(action: NonNullable<NextBestAction>, tjanster: SoktTjanst[] = []) {
  switch (action.kind) {
    case 'follow-up': {
      // En tyst tjänst som spåret redan ritar namnges (J2, 21.3 punkt 5).
      const tyst = action.count === 1 ? tjanster.filter((t) => t.needsFollowUp) : []
      if (tyst.length === 1) {
        return {
          title: NASTA_FOLJ_UPP.namnTitel(tyst[0].company),
          text: NASTA_FOLJ_UPP.namnText(dagarSedanSokt(tyst[0])),
          href: `/dashboard/sokta-tjanster/${tyst[0].id}`,
          cta: NASTA_FOLJ_UPP.knapp,
        }
      }
      return {
        title: NASTA_FOLJ_UPP.titel(action.count),
        text: action.count === 1 ? NASTA_FOLJ_UPP.textEn : NASTA_FOLJ_UPP.textFlera,
        href: '/dashboard/sokta-tjanster?filter=uppfoljning',
        cta: NASTA_FOLJ_UPP.knapp,
      }
    }
    case 'af-report':
      return {
        title: `Rapporten för ${action.monthLabel}`,
        text: `${action.count} sökta jobb att rapportera till Arbetsförmedlingen. Vi har redan fyllt i dem åt dig.`,
        href: '/dashboard/sokta-tjanster?rapport=1',
        cta: 'Öppna rapporten',
      }
    case 'interview-rewrite':
      return {
        title: HEM.omskrivning.rubrik(action.prov.question),
        text: HEM.omskrivning.text(action.prov.level, nar(action.prov.createdAt), action.prov.missingKind, action.prov.question),
        href: nyttProvHref(action.prov.question),
        cta: HEM.omskrivning.knapp,
      }
    case 'personality-full':
      return {
        title: HEM.helaTestet.rubrik,
        text: HEM.helaTestet.text,
        href: GRUNDTEST_HREF,
        cta: HEM.helaTestet.knapp,
      }
    case 'interview-new':
      return {
        title: HEM.traning.nyFraga.rubrik(action.fraga),
        text: HEM.traning.nyFraga.text(action.fraga),
        href: nyttProvHref(action.fraga),
        cta: HEM.traning.nyFraga.knapp,
      }
    case 'test-next': {
      const titel = getTestConfig(action.slug)?.title ?? ''
      return {
        title: action.forsta ? HEM.traning.test.forstaRubrik : HEM.traning.test.rubrik(titel),
        text: action.forsta ? HEM.traning.test.forstaText : HEM.traning.test.text,
        href: testPaths.hub(action.slug),
        cta: HEM.traning.test.knapp,
      }
    }
    case 'feature':
      return {
        title: action.feature.cta,
        text: action.feature.description,
        href: action.feature.href,
        cta: action.feature.cta,
      }
  }
}

export default function NastaHandling({ action, onDismiss, secondary, intent = null, utanOverlapp, tjanster }: NastaHandlingProps) {
  const kind = action?.kind ?? null
  // Mätningen av de nya stegen (docs/design/rod-trad-prov-spec-2026-09-24.md, avsnitt 4).
  useEffect(() => {
    if (kind) capture('next_action_shown', { kind, surface: 'hem' })
  }, [kind])
  if (!action) return null
  const copy = copyFor(action, tjanster)
  return (
    <LyftKort
      utanOverlapp={utanOverlapp}
      label="Nästa handling"
      eyebrow="Nästa handling"
      titel={copy.title}
      text={copy.text}
      handling={
        <Link
          href={copy.href}
          className={`${KNAPP_PRIMAR} sm:w-auto`}
          onClick={() =>
            capture('next_action_clicked', {
              kind: action.kind,
              surface: 'hem',
              ...(action.kind === 'feature' ? { slug: action.feature.slug } : {}),
              outside_intent: action.kind === 'feature' ? featureUtanforVal(action.feature.slug, intent) : false,
            })
          }
        >
          {copy.cta}
        </Link>
      }
      sekundar={
        secondary ?? (
          <button type="button" onClick={onDismiss} className={`${LANK} inline-flex min-h-11 items-center justify-center sm:justify-start`}>
            Senare
          </button>
        )
      }
    />
  )
}
