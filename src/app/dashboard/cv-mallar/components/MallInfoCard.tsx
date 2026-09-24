'use client';

import { PAKETRADER } from '@/components/paywall/paywall-copy'
import { ShieldCheck, Image as ImageIcon, Linkedin, Crown, AlertCircle } from 'lucide-react';
import type { SimpleTemplate } from '@/lib/cv/simple-templates';

interface MallInfoCardProps {
  template: SimpleTemplate | undefined;
}

/**
 * Visar rik metadata om vald mall: ATS-status, yrken den passar for,
 * varfOr den ar bra. Sitter under live-previewn pa /dashboard/cv-mallar.
 */
export default function MallInfoCard({ template }: MallInfoCardProps) {
  if (!template) {
    return null;
  }

  const isAtsSafe = template.features?.atsSafe === true;
  const supportsPhoto = template.features?.supportsPhoto === true;
  const supportsLinkedIn = template.features?.supportsLinkedIn === true;
  const suitableFor = template.metadata?.suitableFor ?? [];
  const strengths = template.metadata?.strengths ?? [];

  return (
    <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
      {/* Topp-rad: ATS + foto + LinkedIn-badges */}
      <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-kant pb-4">
        {isAtsSafe ? (
          <Badge tone="positiv" icon={<ShieldCheck className="h-4 w-4" strokeWidth={1.75} />}>
            ATS-säker
          </Badge>
        ) : (
          <Badge tone="varning" icon={<AlertCircle className="h-4 w-4" strokeWidth={1.75} />}>
            Mindre ATS-vänlig
          </Badge>
        )}

        {supportsPhoto && (
          <Badge tone="neutral" icon={<ImageIcon className="h-4 w-4" strokeWidth={1.75} />}>
            Stöd för foto
          </Badge>
        )}

        {supportsLinkedIn && (
          <Badge tone="neutral" icon={<Linkedin className="h-4 w-4" strokeWidth={1.75} />}>
            LinkedIn-badge
          </Badge>
        )}

        {template.tier === 'premium' && (
          <Badge tone="neutral" icon={<Crown className="h-4 w-4" strokeWidth={1.75} />}>
            {PAKETRADER.bricka}
          </Badge>
        )}
      </div>

      {/* Passar fOr */}
      {suitableFor.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2.5 text-steg uppercase text-ink-3">Passar för</h3>
          <ul className="flex flex-wrap gap-1.5">
            {suitableFor.map(item => (
              <li
                key={item}
                className="inline-flex items-center rounded-md border border-kant bg-insunken px-2.5 py-1 text-meta font-medium text-ink-2"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Varfor mallen ar bra */}
      {strengths.length > 0 && (
        <div>
          <h3 className="mb-2.5 text-steg uppercase text-ink-3">Varför den fungerar</h3>
          <ul className="space-y-2">
            {strengths.map((strength, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm leading-relaxed text-ink-2"
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ink-3"
                />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Badge - reusable badge with variants                                       */
/* -------------------------------------------------------------------------- */

function Badge({
  children,
  icon,
  tone,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  tone: 'positiv' | 'varning' | 'neutral';
}) {
  const ikon = {
    positiv: 'text-positiv',
    varning: 'text-varning',
    neutral: 'text-ink-3',
  }[tone];

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-kant bg-insunken px-2.5 py-1 text-meta font-medium text-ink-2">
      <span className={ikon} aria-hidden="true">
        {icon}
      </span>
      {children}
    </span>
  );
}
