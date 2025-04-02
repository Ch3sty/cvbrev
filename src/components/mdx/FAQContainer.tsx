import React from 'react';

interface FAQContainerProps {
  children: React.ReactNode;
}

const FAQContainer: React.FC<FAQContainerProps> = ({ children }) => {
  return (
    <div className="my-8 space-y-4 faq-container">
        {/* Titel kan läggas här eller i MDX */}
         <h2 className="text-2xl font-semibold border-t border-gray-700 pt-6">Vanliga Frågor (FAQ)</h2>
        {children}
    </div>
  );
};

export default FAQContainer;