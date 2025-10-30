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
    const element = document.createElement('a');
    const file = new Blob([EXEMPEL_BREV], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'personligt-brev-it.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EXEMPEL_BREV);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Kunde inte kopiera texten:', err);
    }
  };

  return (
    <div className="my-8">
      <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Exempel på personligt brev för IT/utvecklare
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Fullstack-utvecklare med startup-erfarenhet
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                aria-label="Kopiera exempel på personligt brev för IT"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Kopierat!' : 'Kopiera'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                aria-label="Ladda ner exempel på personligt brev för IT"
              >
                <Download className="w-4 h-4" />
                Ladda ner
              </button>
            </div>
          </div>
        </div>
        <div className="px-6 py-6">
          <pre className="whitespace-pre-wrap font-serif text-gray-800 leading-relaxed text-base">
            {EXEMPEL_BREV}
          </pre>
        </div>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tips:</strong> Detta exempel listar specifik tech stack (React, Node.js, PostgreSQL), kvantifierbara resultat (2 000 users, 1,5 MSEK ARR) och visar både teknisk kompetens och business-förståelse – viktigt för utvecklarroller.
        </p>
      </div>
    </div>
  );
}
