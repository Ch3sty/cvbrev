'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Stockholm, 15 januari 2026

Rekryteringsansvarig
Vårdföretagen Stockholm AB
Box 3456
112 34 Stockholm

Ansökan till tjänsten som vårdpersonal

Hej,

Jag söker tjänsten som vårdpersonal hos Vårdföretagen Stockholm AB. Med sju års erfarenhet från både äldreomsorg och hemtjänst, samt gedigen kompetens inom personcentrerad vård, är jag redo att bidra till er omsorgsverksamhet.

Under mina år inom vården har jag arbetat med allt från basal omvårdnad och ADL-stöd till demenssjukvård och palliativ vård. Jag har erfarenhet av att arbeta både på boende och i brukares hem, vilket gett mig förståelse för vikten av trygghet, värdighet och individanpassad omsorg. Min kunskap om basal hygien, läkemedelshantering och dokumentation i journalsystem (VAS, Procapita) är gedigen.

Det som driver mig i vårdyrket är möjligheten att göra verklig skillnad i människors vardag. Att se ett leende hos en dement brukare efter en lugn pratstund, eller att en anhörig känner sig trygg när de lämnar sin förälder i våra händer – det är det som gör vårdarbete meningsfullt.

Era värderingar kring personcentrerad vård och er satsning på kompetensutveckling tilltalar mig starkt. Jag ser fram emot möjligheten att utvecklas vidare inom vården tillsammans med ert team.

Tack för att ni tar er tid att läsa min ansökan. Jag ser fram emot att höra från er.

Med vänliga hälsningar,
Maria Andersson`;

export default function PersonligtBrevExampleVardOmsorg() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([EXEMPEL_BREV], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personligt-brev-vard-omsorg-exempel.txt';
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
          <strong className="text-gray-900">Tips:</strong> Detta generella exempel kan anpassas till specifika vårdyrken som undersköterska, vårdbiträde, personlig assistent eller sjuksköterska. Fokusera på personcentrerad vård, empati och konkreta erfarenheter.
        </p>
      </div>
    </div>
  );
}
