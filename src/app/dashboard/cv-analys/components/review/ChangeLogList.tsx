'use client';

import ChangeLogItem from './ChangeLogItem';
import { antal } from '@/lib/rum/antal';
import { harPlatshallare } from '@/lib/cv/poang';
import { rollHarTal } from '@/lib/cv/poang/modell';

/**
 * Siffrorna i en roll efter förslaget, med poängmodellens regler.
 *
 *   kvantifierat      Rollen saknade siffror och har nu minst ett riktigt tal
 *                     (rollHarTal) i en rad utan platshållare. Rader med
 *                     [antal] räknas inte: "[antal] procent" har ordet
 *                     procent, som poängmodellen godtar som tal, men talet
 *                     är ännu inte hennes.
 *   platshallareKvar  Förslaget har [antal] som hon ska fylla i själv.
 */
export function siffrorIRoll(
  text: string,
  behovdeSiffror: boolean
): { kvantifierat: boolean; platshallareKvar: boolean } {
  const pastaenden = text
    .split('\n')
    .map((r) => r.replace(/^[-•*·]\s*/, '').trim())
    .filter((r) => r && !harPlatshallare(r));
  return {
    kvantifierat: behovdeSiffror && rollHarTal({ pastaenden }),
    platshallareKvar: harPlatshallare(text),
  };
}

export interface ChangeLogData {
  /** Personbeskrivning ändrad */
  profile?: {
    currentText: string;
    improvedText: string;
    atsImpact: number;
    changes: string[];
  };
  /** Ändrade roller (en per index) */
  roles: Array<{
    index: number;
    roleTitle: string;
    company: string;
    period?: string;
    currentText: string;
    improvedText: string;
    keywordsAdded: number;
    /** Ett riktigt tal efter förslaget, där rollen saknade siffror (siffrorIRoll). */
    quantified: boolean;
    /** [antal] står kvar i förslaget och väntar på hennes siffra. */
    platshallareKvar: boolean;
    atsImpact: number;
  }>;
  /** Tillagda färdigheter */
  skills?: {
    items: Array<{ skill: string; relevance: 'high' | 'medium' | 'low' }>;
    atsImpact: number;
  };
  /** Allmänna förbättringar (auto) */
  general?: {
    bullets: string[];
  };
}

interface ChangeLogListProps {
  data: ChangeLogData;
}

export default function ChangeLogList({ data }: ChangeLogListProps) {
  const hasAnything =
    !!data.profile ||
    data.roles.length > 0 ||
    !!data.skills ||
    !!data.general;

  if (!hasAnything) {
    return (
      <div
        className="rounded-xl border border-dashed border-kant-stark bg-papper-2 p-6 text-center "
      >
        <p className="text-sm text-ink-2">
          Du har inte valt några förbättringar att tillämpa. Gå tillbaka till
          föregående steg om du vill lägga till några.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Personbeskrivning */}
      {data.profile && (
        <ChangeLogItem
          type="profile"
          id="profile"
          title="Personbeskrivning"
          subtitle="Vi har omformulerat din inledning för starkare första intryck."
          tags={[
            // Plus visas bara när förändringen faktiskt höjer poängen.
            ...(data.profile.atsImpact > 0
              ? [{ label: `+${data.profile.atsImpact} läsbarhet`, tone: 'emerald' as const }]
              : []),
            ...(data.profile.changes.length > 0
              ? [
                  {
                    label: antal(data.profile.changes.length, 'förbättring', 'förbättringar'),
                    tone: 'orange' as const,
                  },
                ]
              : []),
          ]}
          currentText={data.profile.currentText}
          improvedText={data.profile.improvedText}
          keywords={[]}
          detectNumbers
        />
      )}

      {/* Roller */}
      {data.roles.map((role) => {
        const tags: Array<{ label: string; tone: 'emerald' | 'orange' }> = [];
        if (role.atsImpact > 0) {
          tags.push({ label: `+${role.atsImpact} läsbarhet`, tone: 'emerald' });
        }
        if (role.keywordsAdded > 0) {
          tags.push({
            label: `+${role.keywordsAdded} nyckelord`,
            tone: 'orange',
          });
        }
        if (role.quantified) {
          tags.push({ label: 'Kvantifierat', tone: 'emerald' });
        }
        if (role.platshallareKvar) {
          tags.push({ label: 'Har [antal] kvar', tone: 'orange' });
        }

        return (
          <ChangeLogItem
            key={role.index}
            type="role"
            id={`role-${role.index}`}
            title={`${role.roleTitle}${role.company ? ` - ${role.company}` : ''}`}
            subtitle={role.period}
            tags={tags}
            currentText={role.currentText}
            improvedText={role.improvedText}
            keywords={[]}
            detectNumbers
          />
        );
      })}

      {/* Skills */}
      {data.skills && data.skills.items.length > 0 && (
        <ChangeLogItem
          type="skills"
          id="skills"
          title={`${data.skills.items.length} ${data.skills.items.length === 1 ? 'färdighet tillagd' : 'färdigheter tillagda'}`}
          subtitle="Nya nyckelord som matchar din målroll och som rekryterare letar efter."
          tags={
            data.skills.atsImpact > 0
              ? [{ label: `+${data.skills.atsImpact} läsbarhet`, tone: 'emerald' }]
              : []
          }
          skills={data.skills.items}
        />
      )}

      {/* Auto */}
      {data.general && data.general.bullets.length > 0 && (
        <ChangeLogItem
          type="auto"
          id="auto"
          title="Råd att göra själv"
          subtitle="Det här ändrar vi inte åt dig. När det står i CV:t räknas det in i poängen."
          bullets={data.general.bullets}
        />
      )}
    </div>
  );
}
