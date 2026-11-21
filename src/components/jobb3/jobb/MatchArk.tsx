'use client'

/**
 * Arken i Matchade jobb: Byt CV, Rätta, Så söker vi åt dig och Filter, i
 * rummets ark (botten på telefon, mitten på dator). Funktionen är dagens;
 * bara ramen är ny. Fälten i Så söker vi åt dig och Filter är dagens
 * komponenter (JobPreferencesFields, JobFilterPanel).
 */

import JobPreferencesFields from '@/components/jobbmatchning/JobPreferencesFields'
import JobFilterPanel from '@/app/dashboard/jobbmatchning/components/JobFilterPanel'
import type { JobFilters } from '@/app/dashboard/jobbmatchning/data/filter-standard'
import type { JobbmatchningCv } from '@/app/dashboard/jobbmatchning/getJobbmatchningData'
import type { JobPreferences } from '@/types/user.types'
import { Ark, GruppEtikett, IkonKryss, LitenKnapp, StorKnapp, TextLank, ValKnapp } from '@/components/jobb3/kit'

export function ByttCvArk({
  open,
  onClose,
  cvs,
  activeCVId,
  activatingCVId,
  lockedCvIds,
  onValj,
}: {
  open: boolean
  onClose: () => void
  cvs: JobbmatchningCv[]
  activeCVId: string | null
  activatingCVId: string | null
  lockedCvIds: Set<string>
  onValj: (id: string) => void
}) {
  return (
    <Ark open={open} onClose={onClose} rubrik="Byt CV" text="Matchningen utgår från det CV du väljer här.">
      <div role="radiogroup" aria-label="Välj CV" className="flex flex-col gap-2">
        {cvs.map((cv) => {
          const last = lockedCvIds.has(cv.id)
          return (
            <ValKnapp
              key={cv.id}
              form="rad"
              vald={cv.id === activeCVId}
              onClick={() => {
                if (last || activatingCVId) return
                onValj(cv.id)
              }}
            >
              <span className="flex min-w-0 flex-col text-left">
                <span className="truncate">{cv.file_name}</span>
                <small className="j3-fin">
                  {last ? 'Låst av CV-kvoten' : activatingCVId === cv.id ? 'Läser CV:t' : new Date(cv.created_at).toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' })}
                </small>
              </span>
            </ValKnapp>
          )
        })}
      </div>
    </Ark>
  )
}

export function RattaArk({
  open,
  onClose,
  roles,
  skills,
  harAndrat,
  onTaBortRoll,
  onTaBortKompetens,
  onAngra,
}: {
  open: boolean
  onClose: () => void
  roles: string[]
  skills: string[]
  harAndrat: boolean
  onTaBortRoll: (r: string) => void
  onTaBortKompetens: (s: string) => void
  onAngra: () => void
}) {
  return (
    <Ark
      open={open}
      onClose={onClose}
      rubrik="Rätta det vi läste ut"
      text="Ta bort det som inte stämmer, så söker vi inte på det. Ändringarna gäller den här sökningen."
    >
      <div className="flex flex-col gap-5">
        <div>
          <GruppEtikett>Roller</GruppEtikett>
          {roles.length === 0 ? (
            <p className="j3-fin mt-1">Inga roller kvar. Byt CV om det blev fel.</p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-2">
              {roles.map((r) => (
                <li key={r}>
                  <LitenKnapp onClick={() => onTaBortRoll(r)} aria-label={`Ta bort ${r}`}>
                    {r}
                    <IkonKryss size={16} />
                  </LitenKnapp>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <GruppEtikett>Kompetenser</GruppEtikett>
          {skills.length === 0 ? (
            <p className="j3-fin mt-1">Inga kompetenser kvar. Byt CV om det blev fel.</p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-2">
              {skills.map((s) => (
                <li key={s}>
                  <LitenKnapp onClick={() => onTaBortKompetens(s)} aria-label={`Ta bort ${s}`}>
                    {s}
                    <IkonKryss size={16} />
                  </LitenKnapp>
                </li>
              ))}
            </ul>
          )}
        </div>
        {harAndrat ? <TextLank onClick={onAngra}>Ångra alla borttagningar</TextLank> : null}
      </div>
    </Ark>
  )
}

export function PrefsArk({
  open,
  onClose,
  value,
  onChange,
  onSpara,
  sparar,
}: {
  open: boolean
  onClose: () => void
  value: JobPreferences
  onChange: (v: JobPreferences) => void
  onSpara: () => void
  sparar: boolean
}) {
  return (
    <Ark
      open={open}
      onClose={onClose}
      rubrik="Så söker vi åt dig"
      text="Sparas på din profil och används i varje sökning."
      bredd={640}
      fot={
        <StorKnapp bred onClick={onSpara} disabled={sparar}>
          {sparar ? 'Sparar' : 'Spara'}
        </StorKnapp>
      }
    >
      <JobPreferencesFields value={value} onChange={onChange} />
    </Ark>
  )
}

export function FilterArk({
  open,
  onClose,
  filters,
  onChange,
  userLocation,
  jobs,
}: {
  open: boolean
  onClose: () => void
  filters: JobFilters
  onChange: (f: JobFilters) => void
  userLocation: string | null | undefined
  jobs: any[]
}) {
  return (
    <Ark open={open} onClose={onClose} rubrik="Filter" text="Gäller de träffar vi redan hämtat, ingen ny sökning." bredd={640}>
      <JobFilterPanel filters={filters} onChange={onChange} userLocation={userLocation} jobs={jobs} />
    </Ark>
  )
}
