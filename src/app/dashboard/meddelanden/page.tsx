'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import MessageHub from '@/components/interests/MessageHub';

/**
 * Meddelande-hub för kandidater. Egen destination i dashboarden (ej inbäddad
 * i Bli upptäckt). Läser ?interest=<id> för djuplänkning från notiser.
 */
function MeddelandenInner() {
  const supabase = getSupabaseClient();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!cancelled) setUserId(user?.id ?? null);
      } catch {
        if (!cancelled) setUserId(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const deepLinkId = searchParams.get('interest');

  if (!ready) {
    return (
      <div className="h-[640px] rounded-3xl bg-white/60 border border-slate-100 animate-pulse" aria-hidden="true" />
    );
  }

  return <MessageHub userId={userId} deepLinkId={deepLinkId} />;
}

export default function MeddelandenPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[640px] rounded-3xl bg-white/60 border border-slate-100 animate-pulse" aria-hidden="true" />
      }
    >
      <MeddelandenInner />
    </Suspense>
  );
}
