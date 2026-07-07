'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { useCandidateInterests } from '@/hooks/useCandidateInterests';

/**
 * Meddelande-ikon i dashboardheadern, bredvid notisklockan. Indigo för att
 * tydligt skilja sig från klockans orange, den sköter BARA konversationer med
 * rekryterare (klockan sköter händelser). Villkorad synlighet: visas när
 * profilen är synlig i poolen eller när det finns intressen/historik, annars
 * dold så den inte skapar brus för dem som inte använder funktionen.
 */
export default function MessagesHeaderButton() {
  const { pending, unread, total, isVisible, loaded } = useCandidateInterests();

  // Dold tills vi vet, och dold för den som varken är synlig eller haft intresse.
  if (!loaded) return null;
  if (!isVisible && total === 0) return null;

  const badge = pending + unread;

  return (
    <Link
      href="/dashboard/meddelanden"
      aria-label={
        badge > 0
          ? `Meddelanden från rekryterare, ${badge} olästa`
          : 'Meddelanden från rekryterare'
      }
      title="Meddelanden från rekryterare"
      className="relative touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50/60 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-200 transition-all"
    >
      <MessageSquare className="w-[18px] h-[18px]" strokeWidth={2.25} />
      {badge > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-black flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}
        >
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  );
}
