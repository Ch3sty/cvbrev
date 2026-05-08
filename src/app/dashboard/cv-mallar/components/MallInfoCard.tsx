'use client';

import { ShieldCheck, Image as ImageIcon, Linkedin, Sparkles, AlertCircle } from 'lucide-react';
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
    <div
      className="rounded-2xl bg-white border border-orange-100 p-5 sm:p-6"
      style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
    >
      {/* Topp-rad: ATS + foto + LinkedIn-badges */}
      <div className="flex items-center gap-2 flex-wrap mb-5 pb-5 border-b border-orange-100/70">
        {isAtsSafe ? (
          <Badge variant="success" icon={<ShieldCheck className="w-3.5 h-3.5" strokeWidth={2.5} />}>
            ATS-säker
          </Badge>
        ) : (
          <Badge variant="warning" icon={<AlertCircle className="w-3.5 h-3.5" strokeWidth={2.5} />}>
            Mindre ATS-vänlig
          </Badge>
        )}

        {supportsPhoto && (
          <Badge variant="neutral" icon={<ImageIcon className="w-3.5 h-3.5" strokeWidth={2.5} />}>
            Stöd för foto
          </Badge>
        )}

        {supportsLinkedIn && (
          <Badge variant="neutral" icon={<Linkedin className="w-3.5 h-3.5" strokeWidth={2.5} />}>
            LinkedIn-badge
          </Badge>
        )}

        {template.tier === 'premium' && (
          <Badge variant="premium" icon={<Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />}>
            Premium
          </Badge>
        )}
      </div>

      {/* Passar fOr */}
      {suitableFor.length > 0 && (
        <div className="mb-5">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-700 mb-2.5">
            Passar för
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {suitableFor.map(item => (
              <span
                key={item}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-slate-700 bg-orange-50 border border-orange-100"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Varfor mallen ar bra */}
      {strengths.length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-700 mb-2.5">
            Varför den fungerar
          </h3>
          <ul className="space-y-2">
            {strengths.map((strength, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed"
              >
                <span
                  aria-hidden="true"
                  className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #F97316, #DC2626)',
                  }}
                />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Badge - reusable badge with variants                                       */
/* -------------------------------------------------------------------------- */

function Badge({
  children,
  icon,
  variant,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  variant: 'success' | 'warning' | 'neutral' | 'premium';
}) {
  const styles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    neutral: 'bg-slate-50 text-slate-700 border-slate-200',
    premium:
      'text-white border-transparent',
  };

  const isPremiumStyle = variant === 'premium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${styles[variant]}`}
      style={
        isPremiumStyle
          ? {
              background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            }
          : undefined
      }
    >
      <span className={isPremiumStyle ? 'text-white' : ''}>{icon}</span>
      {children}
    </span>
  );
}
