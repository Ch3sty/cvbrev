import React from 'react';

interface FAQContainerProps {
  children: React.ReactNode;
}

const FAQContainer: React.FC<FAQContainerProps> = ({ children }) => {
  return (
    // --- VIKTIGT: Lägg till "not-prose" för att isolera från artikelns prose-stilar ---
    <div className="my-12 not-prose faq-container">
      {/* --- ÄNDRING: Justerat titelns styling --- */}
      <h2 className="text-2xl font-semibold mb-6 text-white">Vanliga Frågor (FAQ)</h2>
      {/* flow-root är fortfarande bra för att hantera sista border */}
      <div className="flow-root">
         {children}
      </div>
    </div>
  );
};

export default FAQContainer;