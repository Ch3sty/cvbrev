'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { IkonBock, IkonNed } from '@/components/jobb3/kit';

/**
 * Genväg för korten som vill vara hopfällbara: sprids rakt på SectionCard,
 * `{...collapse}`. Undefined = kortet är inte hopfällbart.
 */
export interface CollapseProps {
  collapsible: true;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

/**
 * Formen kortet ritas i (Jobbsöket omgång 1, skissen Upptackt). Utan
 * kontext: rummets kort med etikett ovanför (Arbetsstil, sidokolumnen). Inom
 * en <StegKontext.Provider>: en rad i panelen "Bygg din profil", med bock när
 * steget är klart och numret annars. Innehåll och texter är desamma i båda.
 */
export const StegKontext = createContext<{ nr: number; klar: boolean } | null>(null);

interface SectionCardProps {
  title: string;
  sub?: string;
  /** Behålls för anropskompatibilitet. Rummet har ingen fördröjd intoning. */
  delay?: number;
  headerExtra?: ReactNode;
  children: ReactNode;
  /** Ankar-id så notiser/mail kan djuplänka hit (t.ex. #intressen). */
  id?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  /** Behålls för anropskompatibilitet. */
  variant?: 'default' | 'subtle';
  /** Kort sammanfattning i stället för undertexten när kortet är ihopfällt. */
  summary?: string;
  /** Behålls för anropskompatibilitet. */
  active?: boolean;
  /** Behålls för anropskompatibilitet. */
  plate?: ReactNode;
}

export default function SectionCard({
  title,
  sub,
  headerExtra,
  children,
  id,
  collapsible = false,
  collapsed = false,
  onToggleCollapse,
  summary,
}: SectionCardProps) {
  const steg = useContext(StegKontext);
  const isCollapsed = collapsible && collapsed;
  const showSummary = isCollapsed && !!summary;

  const fallKnapp = collapsible ? (
    <button
      type="button"
      onClick={onToggleCollapse}
      aria-expanded={!isCollapsed}
      aria-label={isCollapsed ? `Visa ${title}` : `Dölj ${title}`}
      className="j3c-stegknapp"
    >
      <IkonNed size={20} />
    </button>
  ) : null;

  const innehall = collapsible ? (
    <div className="j3c-steg-fall" style={{ gridTemplateRows: isCollapsed ? '0fr' : '1fr', visibility: isCollapsed ? 'hidden' : undefined }}>
      <div>
        <div className="j3c-steginnehall">{children}</div>
      </div>
    </div>
  ) : (
    <div className="j3c-steginnehall">{children}</div>
  );

  const underrad = showSummary ? (
    <p className="j3c-stegsub">{summary}</p>
  ) : sub ? (
    <p className="j3c-stegsub">{sub}</p>
  ) : null;

  if (steg) {
    return (
      <div id={id} className="j3c-stegrad scroll-mt-24">
        <span className={steg.klar ? 'j3c-stegmark' : 'j3c-stegmark tom'} aria-hidden="true">
          {steg.klar ? <IkonBock size={16} bredd={2.8} /> : steg.nr}
        </span>
        <div className="min-w-0">
          <div className="j3c-steghuvud">
            <h3>
              {title}
              <span className="sr-only">{steg.klar ? ', klart' : ''}</span>
            </h3>
            {headerExtra || fallKnapp ? (
              <div className="flex shrink-0 items-center gap-2">
                {headerExtra}
                {fallKnapp}
              </div>
            ) : null}
          </div>
          {underrad}
          {innehall}
        </div>
      </div>
    );
  }

  return (
    <div id={id} className="scroll-mt-24">
      <h2 className="j3-h2" style={{ marginBottom: 12 }}>
        {title}
      </h2>
      <section className="j3-kort luft">
        {underrad || headerExtra || fallKnapp ? (
          <div className="j3c-steghuvud">
            <div className="min-w-0">{underrad}</div>
            {headerExtra || fallKnapp ? (
              <div className="flex shrink-0 items-center gap-2">
                {headerExtra}
                {fallKnapp}
              </div>
            ) : null}
          </div>
        ) : null}
        {innehall}
      </section>
    </div>
  );
}
