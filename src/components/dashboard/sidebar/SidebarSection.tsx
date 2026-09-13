import type { ReactNode } from 'react';

/**
 * En grupp i sidomenyn. Etiketten är stegetiketten: 12 px, versaler,
 * spårning 0,06em, ink-3. Ingen orange i navigationen.
 */
interface SidebarSectionProps {
  eyebrow?: string;
  children: ReactNode;
}

export default function SidebarSection({ eyebrow, children }: SidebarSectionProps) {
  return (
    <div>
      {eyebrow ? (
        <div className="px-3 pb-1.5 pt-4 text-steg uppercase text-ink-3">{eyebrow}</div>
      ) : null}
      <ul className="space-y-px">{children}</ul>
    </div>
  );
}
