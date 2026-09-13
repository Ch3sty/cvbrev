'use client';

import SidebarLink from './SidebarLink';
import { IkonSynlig } from '@/components/illustrations/Ikoner';
import { useCandidateInterests } from '@/hooks/useCandidateInterests';

/**
 * Bli upptäckt-posten i sidomenyn, med en dynamisk undertext som skapar
 * kopplingen till meddelanden (som bor i headern, inte som egen post):
 *   - synlighet av → "Gör dig tillgänglig för rekryterare"
 *   - väntande intresse → "N rekryterare väntar på svar" (fel-ton)
 *   - synlig utan ärende → "Ny" i metadata, ingen undertext
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
  const { pending, isVisible, loaded } = useCandidateInterests();

  let sublabel: React.ReactNode = undefined;
  let showNy = true;
  if (loaded) {
    if (pending > 0) {
      sublabel = (
        <span className="font-medium text-fel">
          {pending === 1 ? '1 rekryterare väntar på svar' : `${pending} rekryterare väntar på svar`}
        </span>
      );
      showNy = false;
    } else if (!isVisible) {
      sublabel = 'Gör dig tillgänglig för rekryterare';
    }
  }

  return (
    <SidebarLink
      href="/dashboard/bli-upptackt"
      label="Bli upptäckt"
      icon={IkonSynlig}
      highlight={loaded && pending > 0}
      sublabel={sublabel}
      badge={showNy ? <span className="text-meta text-ink-3">Ny</span> : undefined}
      isMobile={isMobile}
      onClick={onClose}
    />
  );
}
