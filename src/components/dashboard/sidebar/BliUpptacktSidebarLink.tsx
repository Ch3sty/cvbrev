'use client';

import SidebarLink from './SidebarLink';
import { IkonSynlig } from '@/components/illustrations/Ikoner';
import { useCandidateInterests } from '@/hooks/useCandidateInterests';

/**
 * Bli upptäckt-posten i sidomenyn. Menyn har inga underrader längre
 * (regel 8), så läget står till höger på raden:
 *   - väntande intresse → "N väntar" i fel-ton, och raden får kant
 *   - annars → "Ny" i metadata
 * Delar datakälla (useCandidateInterests) med header-ikonen så siffrorna
 * aldrig hamnar i otakt.
 */
export default function BliUpptacktSidebarLink({
  isMobile,
  onClose,
}: {
  isMobile?: boolean;
  onClose?: () => void;
}) {
  const { pending, loaded } = useCandidateInterests();

  const vantar = loaded && pending > 0;
  const badge = vantar ? (
    <span
      className="text-meta font-medium text-fel"
      aria-label={pending === 1 ? '1 rekryterare väntar på svar' : `${pending} rekryterare väntar på svar`}
    >
      {pending} väntar
    </span>
  ) : (
    <span className="text-meta text-ink-3">Ny</span>
  );

  return (
    <SidebarLink
      href="/dashboard/bli-upptackt"
      label="Bli upptäckt"
      icon={IkonSynlig}
      highlight={vantar}
      badge={badge}
      isMobile={isMobile}
      onClick={onClose}
    />
  );
}
