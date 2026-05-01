'use client';

import ChangeLogItem from './ChangeLogItem';

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
    quantified: boolean;
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
        className="rounded-2xl p-6 text-center"
        style={{
          background:
            'linear-gradient(135deg, rgba(249, 115, 22, 0.06) 0%, rgba(220, 38, 38, 0.04) 100%)',
          border: '1px dashed rgba(249, 115, 22, 0.3)',
        }}
      >
        <p className="text-sm text-slate-700">
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
            { label: `+${data.profile.atsImpact} ATS`, tone: 'emerald' },
            ...(data.profile.changes.length > 0
              ? [
                  {
                    label: `${data.profile.changes.length} förbättringar`,
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
          tags.push({ label: `+${role.atsImpact} ATS`, tone: 'emerald' });
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
              ? [{ label: `+${data.skills.atsImpact} ATS`, tone: 'emerald' }]
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
          title="Automatiska förbättringar"
          subtitle="Strukturella justeringar som lyfter helhetsintrycket."
          bullets={data.general.bullets}
        />
      )}
    </div>
  );
}
