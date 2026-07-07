'use client';

import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import SidebarLink from './SidebarLink';

/**
 * Sidomenypost för kandidatens meddelande-hub, med olästräknare. Self-fetchar
 * /api/candidate/interests och summerar väntande + olästa så badgen speglar
 * det som kräver uppmärksamhet. Döljer räknaren när det inte finns något.
 */
export default function MessagesSidebarLink({
  isMobile,
  onClose,
}: {
  isMobile?: boolean;
  onClose?: () => void;
}) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/candidate/interests');
        if (!res.ok) return;
        const data = await res.json();
        const interests = (data.interests ?? []) as Array<{
          status: string;
          unreadCount?: number;
        }>;
        if (cancelled) return;
        const pending = interests.filter((i) => i.status === 'pending').length;
        const unread = interests.reduce((s, i) => s + (i.unreadCount ?? 0), 0);
        setCount(pending + unread);
      } catch {
        // Badgen är ren bekvämlighet: tyst vid fel.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SidebarLink
      href="/dashboard/meddelanden"
      label="Meddelanden"
      icon={MessageSquare}
      count={count}
      isMobile={isMobile}
      onClick={onClose}
    />
  );
}
