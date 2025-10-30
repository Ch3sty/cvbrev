'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV_SVENSKA = `Stockholm, 15 januari 2025

Recruiting Manager
Nordic Tech Solutions AB
Box 12345
111 22 Stockholm

Ansökan till tjänsten som Senior Developer

Hej,

Med stor entusiasm söker jag tjänsten som Senior Developer hos Nordic Tech Solutions. Era internationella projekt och fokus på innovation matchar perfekt min erfarenhet och ambition att arbeta i en global tech-miljö.

Under mina fem år på TechStart Sweden har jag lett utvecklingen av molnbaserade lösningar för kunder i Norden och Storbritannien. Jag har arbetat tätt med internationella team, kommunicerat på engelska dagligen och levererat projekt som krävt både teknisk expertis och kulturell förståelse.

Att kombinera svensk arbetskultur med internationell kommunikation är något jag trivs med. Jag ser fram emot att bidra till Nordic Tech Solutions expansion och fortsätta utvecklas i en miljö där både svenska och engelska är arbetsspråk.

Tack för att ni tar er tid att läsa min ansökan. Jag ser fram emot att höra från er.

Med vänliga hälsningar,
Anna Bergström`;

const EXEMPEL_BREV_ENGELSKA = `Stockholm, January 15, 2025

Hiring Manager
Global Tech Innovations Ltd
123 Innovation Street
London EC2A 4BX
United Kingdom

Application for Senior Software Engineer Position

Dear Hiring Manager,

I am writing to express my strong interest in the Senior Software Engineer position at Global Tech Innovations. With five years of experience in full-stack development and a proven track record of delivering scalable cloud solutions, I am excited about the opportunity to contribute to your team's innovative projects.

In my current role at TechStart Sweden, I have successfully led the development of microservices architecture for international clients across Europe and North America. My work has involved close collaboration with cross-functional teams in different time zones, utilizing agile methodologies and modern tech stacks including React, Node.js, and AWS.

What particularly attracts me to Global Tech Innovations is your commitment to sustainable technology and your diverse, international work environment. I am confident that my technical skills, combined with my experience in international collaboration, would make me a valuable addition to your team.

I would welcome the opportunity to discuss how my background and skills align with your needs. Thank you for considering my application.

Kind regards,
Anna Bergström`;

export default function PersonligtBrevExampleEngelska() {
  const [copiedSvenska, setCopiedSvenska] = useState(false);
  const [copiedEngelska, setCopiedEngelska] = useState(false);

  const handleDownload = (text: string, filename: string) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = async (text: string, language: 'svenska' | 'engelska') => {
    try {
      await navigator.clipboard.writeText(text);
      if (language === 'svenska') {
        setCopiedSvenska(true);
        setTimeout(() => setCopiedSvenska(false), 2000);
      } else {
        setCopiedEngelska(true);
        setTimeout(() => setCopiedEngelska(false), 2000);
      }
    } catch (err) {
      console.error('Kunde inte kopiera texten:', err);
    }
  };

  return (
    <div className="my-8 space-y-6">
      {/* Svenska exemplet */}
      <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Exempel på svenska (för svenskt företag med internationell profil)
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Personligt brev för tjänst i Sverige där engelska används i arbetet
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(EXEMPEL_BREV_SVENSKA, 'svenska')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                aria-label="Kopiera svenskt exempel"
              >
                <Copy className="w-4 h-4" />
                {copiedSvenska ? 'Kopierat!' : 'Kopiera'}
              </button>
              <button
                onClick={() => handleDownload(EXEMPEL_BREV_SVENSKA, 'personligt-brev-svenska.txt')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                aria-label="Ladda ner svenskt exempel"
              >
                <Download className="w-4 h-4" />
                Ladda ner
              </button>
            </div>
          </div>
        </div>
        <div className="px-6 py-6">
          <pre className="whitespace-pre-wrap font-serif text-gray-800 leading-relaxed text-base">
            {EXEMPEL_BREV_SVENSKA}
          </pre>
        </div>
      </div>

      {/* Engelska exemplet */}
      <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                English Example (for international application)
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Cover letter for position at international company
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(EXEMPEL_BREV_ENGELSKA, 'engelska')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                aria-label="Copy English example"
              >
                <Copy className="w-4 h-4" />
                {copiedEngelska ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={() => handleDownload(EXEMPEL_BREV_ENGELSKA, 'cover-letter-english.txt')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                aria-label="Download English example"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>
        <div className="px-6 py-6">
          <pre className="whitespace-pre-wrap font-serif text-gray-800 leading-relaxed text-base">
            {EXEMPEL_BREV_ENGELSKA}
          </pre>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tips:</strong> Observera skillnaderna mellan svenska och engelska format. Det engelska brevet är mer direkt i tonen och följer brittisk/amerikansk struktur med &quot;Dear Hiring Manager&quot; och &quot;Kind regards&quot;.
        </p>
      </div>
    </div>
  );
}
