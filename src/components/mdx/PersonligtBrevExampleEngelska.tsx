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
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = (text: string, language: 'svenska' | 'engelska') => {
    navigator.clipboard.writeText(text);
    if (language === 'svenska') {
      setCopiedSvenska(true);
      setTimeout(() => setCopiedSvenska(false), 2000);
    } else {
      setCopiedEngelska(true);
      setTimeout(() => setCopiedEngelska(false), 2000);
    }
  };

  return (
    <div className="my-8 space-y-6">
      {/* Svenska exemplet */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="p-6 bg-white border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Exempel på svenska (för svenskt företag med internationell profil)
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Personligt brev för tjänst i Sverige där engelska används i arbetet
          </p>
        </div>
        <div className="p-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="whitespace-pre-wrap font-serif text-base leading-relaxed text-gray-800 bg-gray-50 p-8 rounded-lg border border-gray-200">
              {EXEMPEL_BREV_SVENSKA}
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-3 border-t border-gray-200">
          <button
            onClick={() => handleDownload(EXEMPEL_BREV_SVENSKA, 'personligt-brev-svenska-exempel.txt')}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-5 h-5" />
            Ladda ned exempel (.txt)
          </button>
          <button
            onClick={() => handleCopy(EXEMPEL_BREV_SVENSKA, 'svenska')}
            className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-6 rounded-lg border-2 border-blue-200 transition-colors"
          >
            <Copy className="w-5 h-5" />
            {copiedSvenska ? 'Kopierat!' : 'Kopiera text'}
          </button>
        </div>
      </div>

      {/* Engelska exemplet */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="p-6 bg-white border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            English Example (for international application)
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Cover letter for position at international company
          </p>
        </div>
        <div className="p-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="whitespace-pre-wrap font-serif text-base leading-relaxed text-gray-800 bg-gray-50 p-8 rounded-lg border border-gray-200">
              {EXEMPEL_BREV_ENGELSKA}
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-3 border-t border-gray-200">
          <button
            onClick={() => handleDownload(EXEMPEL_BREV_ENGELSKA, 'cover-letter-english-example.txt')}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-5 h-5" />
            Download example (.txt)
          </button>
          <button
            onClick={() => handleCopy(EXEMPEL_BREV_ENGELSKA, 'engelska')}
            className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-6 rounded-lg border-2 border-blue-200 transition-colors"
          >
            <Copy className="w-5 h-5" />
            {copiedEngelska ? 'Copied!' : 'Copy text'}
          </button>
        </div>
      </div>

      {/* Tips section */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong className="text-gray-900">Tips:</strong> Observera skillnaderna mellan svenska och engelska format. Det engelska brevet är mer direkt i tonen och följer brittisk/amerikansk struktur med "Dear Hiring Manager" och "Kind regards".
        </p>
      </div>
    </div>
  );
}
