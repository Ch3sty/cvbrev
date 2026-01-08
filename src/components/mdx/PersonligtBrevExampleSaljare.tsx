'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Marcus Svensson
Säljvägen 22
211 38 Malmö
marcus.svensson@email.se
070-678 90 12

SalesForce Nordic
Rekryteringsansvarig
Box 567
211 20 Malmö

Malmö, 29 oktober 2026

Tjänsten som säljare inom B2B-försäljning

Jag söker tjänsten som säljare inom B2B-försäljning på SalesForce Nordic. Ert fokus på långsiktiga kundrelationer och konsultativ försäljning tilltalar mig särskilt. Med fyra års erfarenhet från B2B-försäljning och dokumenterad track record av att överträffa säljmål tror jag att jag kan bidra till att öka er omsättning och bygga starka kundrelationer.

Under mina år på TechSolutions AB har jag arbetat med försäljning av mjukvarulösningar till företagskunder. Jag har gedigen erfarenhet av hela säljprocessen – från prospektering och behovsanalys till förhandling och avslut. Förra året överträffade jag mitt säljmål med 135% och blev utsedd till Årets Säljare på företaget. Dessutom har jag vidareutbildat mig inom SPIN-selling och Challenger Sales, vilket gett mig verktyg för mer effektiv behovsdriven försäljning.

Jag trivs med att bygga relationer och att verkligen förstå kundens utmaningar innan jag presenterar lösningar. För mig handlar försäljning inte om att sälja produkter, utan om att lösa problem och skapa värde för kunden. Jag är driven av resultat men lika mycket av att se kunden lyckas med våra lösningar. Samarbetet med marknad, produktutveckling och kundservice är för mig en självklarhet – genom att arbeta tvärfunktionellt skapar vi bästa kundupplevelsen.

Det jag värdesätter mest i mitt yrke är kombinationen av strategi och relation. Att få identifiera nya affärsmöjligheter, bygga förtroende hos beslutsfattare och sedan se hur våra lösningar bidrar till kundens tillväxt – det är det som driver mig. Jag tror att min erfarenhet från SaaS-försäljning, kombinerat med mitt intresse för CRM-system, passar väl in på SalesForce Nordic där ni erbjuder ledande lösningar inom området.

Jag ser fram emot möjligheten att bidra till SalesForce Nordics fortsatta tillväxt. Hör gärna av er om ni vill veta mer.

Med vänlig hälsning,

Marcus Svensson`;

export default function PersonligtBrevExampleSaljare() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([EXEMPEL_BREV], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personligt-brev-saljare-exempel.txt';
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
      <div className="p-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="whitespace-pre-wrap font-serif text-base leading-relaxed text-gray-800 bg-gray-50 p-8 rounded-lg border border-gray-200">
            {EXEMPEL_BREV}
          </div>
        </div>
      </div>

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

      <div className="p-4 bg-blue-50 border-t border-blue-100">
        <p className="text-sm text-gray-700">
          <strong className="text-gray-900">Tips:</strong> Detta är ett exempel. Anpassa innehållet efter din egen erfarenhet,
          den specifika tjänsten du söker och företagets produkter. Ett personligt brev ska alltid vara unikt!
        </p>
      </div>
    </div>
  );
}
