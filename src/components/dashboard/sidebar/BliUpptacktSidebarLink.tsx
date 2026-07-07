'use client';

import SidebarLink from './SidebarLink';
import { UpptacktIcon } from './illustrations/MenuIcons';
import { useCandidateInterests } from '@/hooks/useCandidateInterests';

/**
 * Bli upptäckt-posten i sidomenyn, med en dynamisk undertext som skapar
 * kopplingen till meddelanden (som numera bor i headern, inte som egen post):
 *   - synlighet av → "Gör dig tillgänglig för rekryterare"
 *   - väntande intresse → "N rekryterare väntar på svar" (rött)
 *   - synlig utan ärende → NY-badge, ingen undertext
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
        <span className="text-red-600 font-bold">
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
      icon={UpptacktIcon}
      sublabel={sublabel}
      badge={
        showNy ? (
          <span
            className="text-[9px] font-bold uppercase tracking-[0.08em] text-white px-1.5 py-0.5 rounded-full"
            style={{ background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)' }}
          >
            Ny
          </span>
        ) : undefined
      }
      isMobile={isMobile}
      onClick={onClose}
    />
  );
}
