'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Stockholm, 15 januari 2025

Rekryteringsansvarig
Digital Solutions Sweden AB
Box 7788
103 27 Stockholm

Ansökan till tjänsten som fullstack-utvecklare

Hej,

Jag söker tjänsten som fullstack-utvecklare hos Digital Solutions Sweden AB. Med fem års erfarenhet av webbutveckling, god kunskap i React, Node.js och PostgreSQL, samt passion för att bygga användarvänliga produkter, ser jag fram emot att bidra till era digitala projekt.

Under mina år på StartupTech har jag varit med och byggt tre SaaS-produkter från scratch till lansering. Min senaste projekt var en CRM-plattform för SME-företag som nu har över 2 000 aktiva användare och genererar 1,5 MSEK i ARR. Jag arbetade både med frontend (React, TypeScript, Tailwind CSS) och backend (Node.js, Express, PostgreSQL, Redis), samt DevOps-setup med GitHub Actions och AWS.

Vad jag älskar med utveckling är problemlösning och att se kod bli till verklig värde för användare. Jag trivs i agila team där feedback är snabb och där man kan iterera och förbättra produkten kontinuerligt. Min erfarenhet av startup-miljöer har lärt mig att balansera snabb leverans med kodk valitet.

Era projekt inom hållbar digitalisering och er moderna tech stack (Next.js, TypeScript, tRPC) matchar perfekt vad jag söker i min nästa roll. Jag ser fram emot att få bygga skalbara lösningar tillsammans med ert team.

Tack för att ni tar er tid att läsa min ansökan. Jag ser fram emot att höra från er.

Med vänliga hälsningar,
Viktor Andersson`;

export default function PersonligtBrevExampleIT() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([EXEMPEL_BREV], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personligt-brev-it-exempel.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(EXEMPEL_BREV);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Example Content - Always Visible */}
      <div className="p-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="whitespace-pre-wrap font-serif text-base leading-relaxed text-gray-800 bg-gray-50 p-8 rounded-lg border border-gray-200">
            {EXEMPEL_BREV}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-3 border-t border-gray-200">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
        >
          <Download className="w-5 h-5" />
          Ladda ned exempel (.txt)
        </button>
        <button
          onClick={handleCopyToClipboard}
          className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-6 rounded-lg border-2 border-blue-200 transition-colors"
        >
          <Copy className="w-5 h-5" />
          {copied ? 'Kopierat!' : 'Kopiera text'}
        </button>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-blue-50 border-t border-blue-100">
        <p className="text-sm text-gray-700">
          <strong className="text-gray-900">Tips:</strong> Detta exempel listar specifik tech stack (React, Node.js, PostgreSQL), kvantifierbara resultat (2 000 users, 1,5 MSEK ARR) och visar både teknisk kompetens och business-förståelse – viktigt för utvecklarroller.
        </p>
      </div>
    </div>
  );
}
