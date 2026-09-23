import React from 'react';

/**
 * Frågorna i artiklarna (docs/design/analys-artiklar-2026-09-23.html,
 * avsnitt 5). Rubriken är oförändrad, eftersom den står i rubrikträdet som
 * Google läser (SEO-spärrlistan punkt 3). Serverkomponent.
 */
interface FAQContainerProps {
  children: React.ReactNode;
}

const FAQContainer: React.FC<FAQContainerProps> = ({ children }) => {
  return (
    <div className="not-prose faq-container my-12">
      <h2 className="font-display text-[26px] font-bold leading-[31px] tracking-[-0.02em] text-ink-1">
        Vanliga Frågor (FAQ)
      </h2>
      <div className="mt-4 space-y-2">{children}</div>
    </div>
  );
};

export default FAQContainer;
