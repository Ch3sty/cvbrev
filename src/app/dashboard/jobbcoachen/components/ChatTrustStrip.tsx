'use client';

import StatusRow from '@/components/shell/StatusRow';
import { IkonSkold } from '@/components/illustrations/Ikoner';

/** Källraden: status är en rad, aldrig ett kort. */
export default function ChatTrustStrip() {
  return (
    <StatusRow tone="positive" label="Svar med källor">
      <IkonSkold size={20} className="mr-2 inline-block align-[-5px] text-ink-2" />
      Svar med källor från Arbetsförmedlingen, SCB och fackförbund
    </StatusRow>
  );
}
