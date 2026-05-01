import type { ReactNode } from 'react';

interface SidebarSectionProps {
  eyebrow?: string;
  children: ReactNode;
}

export default function SidebarSection({ eyebrow, children }: SidebarSectionProps) {
  return (
    <div className="space-y-1">
      {eyebrow && (
        <div className="px-3 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700">
          {eyebrow}
        </div>
      )}
      <ul className="space-y-0.5">{children}</ul>
    </div>
  );
}
