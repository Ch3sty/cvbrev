'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Stockholm, 15 januari 2026

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
    const blob = new Blob([EXEMPEL_BREV], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personligt-brev-kurator-exempel.txt';
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
          <strong className="text-gray-900">Tips:</strong> Detta exempel lyfter legitimation, specifika metoder (MI, KBT) och visar både professionell kompetens och empatisk inställning – viktiga egenskaper för kuratorroller.
        </p>
      </div>
    </div>
  );
}
