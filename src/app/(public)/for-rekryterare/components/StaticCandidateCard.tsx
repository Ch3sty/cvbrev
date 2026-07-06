/**
 * Statiskt, avidentifierat kandidatkort för den publika rekryterarsidan.
 * Utseendet är en kopia av träffkortet i
 * src/app/dashboard/bli-upptackt/components/RecruiterPreviewCard.tsx —
 * samma avatar-gradient, orange testbadges, indigo styrkechips,
 * slate kompetenschips och villkorsfot. Ändra inte stilen här utan att
 * ändra förlagan.
 */

export interface StaticCandidateData {
  role: string
  region: string
  /** Seniorotetsfakta, första faktat betonas: ["8 års erfarenhet", "Senast: …", "Civilekonom"]. */
  seniorityFacts?: string[]
  /** Kandidatens egna ord, kursiv citatrad. */
  pitch?: string
  testBadges: string[]
  strengths: string[]
  skills: string[]
  conditions: string[]
}

export default function StaticCandidateCard({
  candidate,
}: {
  candidate: StaticCandidateData
}) {
  const { role, region, seniorityFacts, pitch, testBadges, strengths, skills, conditions } =
    candidate
  const avatarInitial = role.charAt(0).toUpperCase()

  return (
    <div
      className="rounded-2xl border border-orange-100 bg-white p-4 sm:p-5"
      style={{ boxShadow: '0 4px 14px -10px rgba(2, 6, 23, 0.18)' }}
    >
      {/* Huvud */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
          }}
          aria-hidden="true"
        >
          {avatarInitial}
        </div>
        <div className="min-w-0">
          <div className="text-[15px] font-bold text-slate-900 leading-tight truncate">
            {role}
          </div>
          <div className="text-[12.5px] text-slate-500 truncate">
            {region} · Anonym
          </div>
        </div>
      </div>

      {/* Senioritet: första faktat (erfarenhetsåren) bär mest vikt */}
      {seniorityFacts && seniorityFacts.length > 0 && (
        <p className="text-[12px] text-slate-600 leading-relaxed -mt-1 mb-2.5">
          <span className="font-bold text-slate-900">{seniorityFacts[0]}</span>
          {seniorityFacts.slice(1).map((fact) => (
            <span key={fact}>
              {' · '}
              {fact}
            </span>
          ))}
        </p>
      )}

      {/* Pitch: kandidatens egna ord */}
      {pitch && (
        <p className="mb-2.5 text-[12.5px] italic text-slate-600 leading-relaxed line-clamp-2">
          &rdquo;{pitch}&rdquo;
        </p>
      )}

      {/* Rad 1: verifierat (testresultat + styrkor) — det ingen annan kan visa */}
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {testBadges.map((badge) => (
          <span
            key={badge}
            className="inline-flex items-center gap-1.5 text-[11.5px] font-bold rounded-full px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-900"
          >
            <span
              className="w-1.5 h-1.5 rounded-sm bg-orange-500 rotate-45"
              aria-hidden="true"
            />
            {badge}
          </span>
        ))}
        {strengths.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-1.5 text-[11.5px] font-bold rounded-full px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800"
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-indigo-500"
              aria-hidden="true"
            />
            {chip}
          </span>
        ))}
      </div>

      {/* Rad 2: kompetenser ur CV:t, medvetet nedtonade */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {skills.map((skill) => (
          <span
            key={skill}
            className="text-[11.5px] font-semibold rounded-full px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Fot: villkor + knapp (dekorativ på den publika sidan) */}
      <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2 pt-3 border-t border-orange-50">
        <span className="text-[12px] text-slate-500 leading-relaxed min-w-0 flex-1 basis-52">
          {conditions.join(' · ')}
        </span>
        <button
          type="button"
          disabled
          title="Exempel"
          className="flex-shrink-0 min-h-[36px] px-3.5 rounded-lg text-[12.5px] font-bold text-white cursor-default"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
          }}
        >
          Visa intresse
        </button>
      </div>
    </div>
  )
}
