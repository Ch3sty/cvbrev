'use client'

/**
 * Sektion 3: "Jobbsök" (Del A). Målroll och bransch styr Jobbcoachen,
 * matchningens önskemål står som en rad med "Ändra" som öppnar fälten i ett
 * ark, och Bli upptäckt som statusrad (förut en egen sektion). Inget här
 * står i CV:t eller breven, och sektionen säger det.
 */

import { useState } from 'react'
import Link from 'next/link'
import Sheet from '@/components/shell/Sheet'
import StatusRow from '@/components/shell/StatusRow'
import JobPreferencesFields from '@/components/jobbmatchning/JobPreferencesFields'
import { useCandidateInterests } from '@/hooks/useCandidateInterests'
import type { JobPreferences } from '@/types/user.types'
import { FieldStatusLine, ProfileTextField } from './ProfileField'
import type { FieldSaveState } from './useFieldSave'
import { JOBBSOK_SEKTION } from '../profil-copy'

export interface JobbsokSectionProps {
  goalRole: string
  industry: string
  jobPreferences: JobPreferences
  /** Synligheten för Bli upptäckt, läst på servern. */
  initialVisible: boolean
  onGoalRoleChange: (v: string) => void
  onIndustryChange: (v: string) => void
  onJobPreferencesChange: (v: JobPreferences) => void
  onSaveField: (key: string) => void
  stateFor: (key: string) => FieldSaveState
}

/** Önskemålen som en rad: "Örebro, Karlstad · distans · heltid". */
export function preferensRad(p: JobPreferences): string {
  const delar: string[] = []
  if (p.locations.length) delar.push(p.locations.join(', '))
  if (p.remote) delar.push('distans går bra')
  if (p.extent) delar.push(p.extent)
  if (p.min_salary !== null) delar.push('lägsta lön satt')
  return delar.length ? delar.join(' · ') : JOBBSOK_SEKTION.ingaPreferenser
}

export default function JobbsokSection(p: JobbsokSectionProps) {
  const [ark, setArk] = useState(false)
  const { isVisible: hookVisible, loaded } = useCandidateInterests()
  const synlig = loaded ? hookVisible : p.initialVisible

  return (
    <section id="jobbsok" className="scroll-mt-24 rounded-xl border border-kant bg-panel">
      <div className="p-4 sm:p-5">
        <h2 className="text-kort text-ink-1">{JOBBSOK_SEKTION.rubrik}</h2>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">{JOBBSOK_SEKTION.under}</p>
      </div>

      <div className="grid gap-5 border-t border-kant p-4 sm:p-5">
        <ProfileTextField
          label={JOBBSOK_SEKTION.malroll.etikett}
          description={JOBBSOK_SEKTION.malroll.text}
          value={p.goalRole}
          onChange={p.onGoalRoleChange}
          onBlur={() => p.onSaveField('goal_role')}
          state={p.stateFor('goal_role')}
          placeholder={JOBBSOK_SEKTION.malroll.plats}
          autoComplete="organization-title"
          enterKeyHint="next"
          maxLength={120}
        />
        <ProfileTextField
          label={JOBBSOK_SEKTION.bransch.etikett}
          description={JOBBSOK_SEKTION.bransch.text}
          value={p.industry}
          onChange={p.onIndustryChange}
          onBlur={() => p.onSaveField('industry')}
          state={p.stateFor('industry')}
          placeholder={JOBBSOK_SEKTION.bransch.plats}
          autoComplete="off"
          enterKeyHint="done"
          maxLength={120}
        />

        <div>
          <div className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-kant px-3 py-1">
            <span className="min-w-0">
              <b className="block text-sm font-medium leading-5 text-ink-1">{JOBBSOK_SEKTION.preferenser}</b>
              <small className="block truncate text-meta text-ink-3">{preferensRad(p.jobPreferences)}</small>
            </span>
            <button
              type="button"
              onClick={() => setArk(true)}
              className="inline-flex min-h-11 shrink-0 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4"
            >
              {JOBBSOK_SEKTION.andra}
            </button>
          </div>
          <FieldStatusLine state={p.stateFor('job_preferences')} />
        </div>

        <StatusRow
          tone={synlig ? 'positive' : 'neutral'}
          showDot
          label="Synlighet för rekryterare"
          action={
            <Link
              href="/dashboard/bli-upptackt"
              className="text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
            >
              {JOBBSOK_SEKTION.bliUpptackt}
            </Link>
          }
        >
          {synlig ? JOBBSOK_SEKTION.synlig : JOBBSOK_SEKTION.inteSynlig}
        </StatusRow>
      </div>

      <Sheet
        open={ark}
        onClose={() => setArk(false)}
        title={JOBBSOK_SEKTION.preferenser}
        description={JOBBSOK_SEKTION.preferenserText}
        footer={
          <button
            type="button"
            onClick={() => setArk(false)}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white hover:bg-ink-hover"
          >
            {JOBBSOK_SEKTION.klar}
          </button>
        }
      >
        <JobPreferencesFields
          value={p.jobPreferences}
          onChange={p.onJobPreferencesChange}
          onCommit={() => p.onSaveField('job_preferences')}
          statusSlot={<FieldStatusLine state={p.stateFor('job_preferences')} />}
        />
      </Sheet>
    </section>
  )
}
