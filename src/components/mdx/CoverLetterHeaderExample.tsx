'use client';

import React from 'react';

export default function CoverLetterHeaderExample() {
  const exampleContent = `Your Name
Your Address
Your Phone Number
Your Email

Date

Hiring Manager's Name (if known)
Company Name
Company Address
City, Postcode
Country

Subject: Application for [Position Title]`;

  return (
    <div className="my-8 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="p-6 bg-white border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Cover Letter Header Format
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Standard engelsk format för personligt brev / cover letter
        </p>
      </div>

      {/* Content */}
      <div className="p-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800 bg-gray-50 p-8 rounded-lg border border-gray-200">
            {exampleContent}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-blue-50 border-t border-blue-100">
        <p className="text-sm text-gray-700">
          <strong className="text-gray-900">Tips:</strong> I Storbritannien använder man ofta "Dear Sir/Madam" om man inte vet namnet. I USA är "Dear Hiring Manager" vanligare. Om du vet namnet, använd alltid det.
        </p>
      </div>
    </div>
  );
}
