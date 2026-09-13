'use client';

// Delat skal för snabblogg och händelseloggning.
//
// Var tidigare en egen modal med framer-motion, egen overlay och eget
// scroll-lås. Den är nu ett tunt lager över skalets Sheet, så scroll-lås,
// Escape, svep, safe area och fokus sköts på ett ställe. Anropsplatserna är
// oförändrade.

import type { ReactNode } from 'react';
import Sheet from '@/components/shell/Sheet';

interface SheetShellProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function SheetShell({ open, title, onClose, children }: SheetShellProps) {
  return (
    <Sheet open={open} onClose={onClose} title={title} size="lg">
      {children}
    </Sheet>
  );
}
