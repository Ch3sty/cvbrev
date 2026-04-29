'use client';

import { ReactNode } from 'react';

interface JobbcoachenLayoutProps {
  children: ReactNode;
}

export default function JobbcoachenLayout({ children }: JobbcoachenLayoutProps) {
  return (
    <div className="max-w-3xl mx-auto py-2 sm:py-6 pb-32 sm:pb-20 space-y-6 sm:space-y-8">
      {children}
    </div>
  );
}
