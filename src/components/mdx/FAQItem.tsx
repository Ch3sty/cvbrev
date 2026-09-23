import React from 'react';

/**
 * En fråga i artiklarna som details och summary: ingen klientkod, och
 * svaret står i HTML även hopfällt, alltså samma text för Google som
 * FAQPage-schemat (docs/design/analys-artiklar-2026-09-23.html, avsnitt 5).
 */
interface FAQItemProps {
  question: string;
  children: React.ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, children }) => {
  return (
    <details className="faq-item group rounded-xl border border-kant bg-panel px-4 sm:px-5">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 text-base font-semibold text-ink-1 [&::-webkit-details-marker]:hidden">
        <span className="flex-1">{question}</span>
        <span className="shrink-0 text-ink-3 group-open:hidden" aria-hidden="true">
          +
        </span>
        <span className="hidden shrink-0 text-ink-3 group-open:inline" aria-hidden="true">
          −
        </span>
      </summary>
      <div className="faq-answer prose prose-sm max-w-none pb-4 text-ink-2 prose-p:my-2 prose-p:text-ink-2 prose-ul:my-2 prose-a:text-ink-1">
        {children}
      </div>
    </details>
  );
};

export default FAQItem;
