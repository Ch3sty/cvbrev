'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Stockholm, 15 januari 2025

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
    const element = document.createElement('a');
    const file = new Blob([EXEMPEL_BREV], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'personligt-brev-vard-omsorg.txt';
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
                Exempel på personligt brev för vård och omsorg
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Generellt exempel för alla vårdyrken
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                aria-label="Kopiera exempel på personligt brev för vård och omsorg"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Kopierat!' : 'Kopiera'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                aria-label="Ladda ner exempel på personligt brev för vård och omsorg"
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
          <strong>Tips:</strong> Detta generella exempel kan anpassas till specifika vårdyrken som undersköterska, vårdbiträde, personlig assistent eller sjuksköterska. Fokusera på personcentrerad vård, empati och konkreta erfarenheter.
        </p>
      </div>
    </div>
  );
}
