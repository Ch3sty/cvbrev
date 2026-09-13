'use client';

interface CvHeroStripProps {
  fileName: string;
  uploadedAt: string;
  rolesCount: number;
  skillsCount: number;
  educationsCount: number;
  location: string | null;
  isActive: boolean;
}

/**
 * Sammanfattningen av det aktiva CV:t: filnamn, uppladdningsdatum och vad
 * vi hittade i det, som stora tal fyra i bredd. En vanlig panel, ingen hero,
 * ingen illustration bakom text.
 */
export default function CvHeroStrip({
  fileName,
  uploadedAt,
  rolesCount,
  skillsCount,
  educationsCount,
  location,
}: CvHeroStripProps) {
  return (
    <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5" aria-label="Det här hittade vi i ditt CV">
      <p className="text-sm font-medium text-ink-3">Det här hittade vi i ditt CV</p>
      <h2 className="mt-1 break-words text-kort text-ink-1">{fileName}</h2>
      <p className="mt-0.5 text-meta text-ink-3">
        Uppladdat {new Date(uploadedAt).toLocaleDateString('sv-SE')}
      </p>

      <dl className="mt-4 grid grid-cols-4 gap-3 border-t border-kant pt-4">
        <Stat label="Roller" value={rolesCount} />
        <Stat label="Kompetenser" value={skillsCount} />
        <Stat label="Utbildningar" value={educationsCount} />
        <Stat label="Plats" value={location || 'Okänd'} small />
      </dl>
    </section>
  );
}

function Stat({
  label,
  value,
  small,
}: {
  label: string;
  value: number | string;
  small?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dd
        className={
          small
            ? 'truncate pt-2 text-sm font-medium leading-5 text-ink-1'
            : 'text-tal tabular-nums text-ink-1'
        }
      >
        {value}
      </dd>
      <dt className="mt-1 text-meta text-ink-3">{label}</dt>
    </div>
  );
}
