'use client';

import React from 'react';

interface CVExampleProps {
  title?: string;
  children: React.ReactNode;
}

export default function CVExample({ title, children }: CVExampleProps) {
  return (
    <div className="my-6 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm not-prose">
      {title && (
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
          <p className="text-sm font-medium text-slate-700">{title}</p>
        </div>
      )}
      <div className="p-5 bg-white">
        <div className="text-sm leading-relaxed text-slate-800">
          {children}
        </div>
      </div>
    </div>
  );
}
