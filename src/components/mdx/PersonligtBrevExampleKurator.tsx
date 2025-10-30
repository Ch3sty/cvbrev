'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Stockholm, 15 januari 2025

Rekryteringsansvarig
Kunskapsgymnasiet Stockholm
Box 9900
114 56 Stockholm

Ansökan till tjänsten som skolkurator

Hej,

Jag söker tjänsten som skolkurator på Kunskapsgymnasiet Stockholm. Med min socionom-examen, legitimation som kurator och fem års erfarenhet från ungdomsmottagning och skola, ser jag fram emot att stötta era elever i deras personliga utveckling och välmående.

Under mina år på Norrmalms ungdomsmottagning och Södra gymnasiet har jag arbetat med individuella samtal, krisintervention, gruppsamtal om stress och psykisk hälsa, samt samverkan med vårdnadshavare och BUP. Jag har särskilt god erfarenhet av att arbeta med ungdomar som upplever stress, ångest och skolrelaterade svårigheter. Min arbetstmetodik bygger på Motiverande samtal (MI) och kognitiv beteendeterapi (KBT).

Vad som driver mig som kurator är att se ungdomar växa och hitta strategier för att hantera livets utmaningar. Att vara den som lyssnar utan att döma, och hjälpa till att hitta vägar framåt – det är meningsfullt arbete.

Era satsningar på elevhälsa och förebyggande arbete kring psykisk ohälsa matchar min egen syn på skolkuratorns roll. Jag ser fram emot möjligheten att bidra till en trygg och utvecklande skolmiljö för era elever.

Tack för att ni tar er tid att läsa min ansökan. Jag ser fram emot att höra från er.

Med vänliga hälsningar,
Sara Johansson`;

export default function PersonligtBrevExampleKurator() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([EXEMPEL_BREV], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'personligt-brev-kurator.txt';
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
                Exempel på personligt brev för kurator
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Skolkurator med MI och KBT-kompetens
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                aria-label="Kopiera exempel på personligt brev för kurator"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Kopierat!' : 'Kopiera'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                aria-label="Ladda ner exempel på personligt brev för kurator"
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
          <strong>Tips:</strong> Detta exempel lyfter legitimation, specifika metoder (MI, KBT) och visar både professionell kompetens och empatisk inställning – viktiga egenskaper för kuratorroller.
        </p>
      </div>
    </div>
  );
}
