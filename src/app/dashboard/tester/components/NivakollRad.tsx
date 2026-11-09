/**
 * Nivåkollens rad på testkortet i Alla tester (testplanen steg 1): samma rad
 * som provraden (ProvCard), med planens symbol. Nivåkollen är gratis första
 * gången i varje test, så raden är aldrig låst; en ny nivåkoll spärras i
 * flödet för gratis.
 */

import Link from 'next/link';
import { IkonChev, SymPlan } from '@/components/illustrations/RumSymboler';

const RAD = 'mt-3 flex min-h-14 w-full items-center gap-3 border-t border-kant pt-3 text-left no-underline';

export default function NivakollRad({ href, titel, text }: { href: string; titel: string; text: string }) {
  return (
    <Link href={href} aria-label={`${titel}. ${text}`} className={RAD} data-nivakollrad>
      <SymPlan size={36} className="shrink-0 text-ton-ink" />
      <span className="min-w-0 flex-1">
        <b className="block text-sm font-semibold leading-[19px] text-ink-1">{titel}</b>
        <span className="block text-meta text-ink-3">{text}</span>
      </span>
      <IkonChev size={20} className="shrink-0 text-ink-3" />
    </Link>
  );
}
