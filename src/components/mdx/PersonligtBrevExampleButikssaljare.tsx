'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Linda Eriksson
Galleriagatan 14
411 16 Göteborg
linda.eriksson@email.se
070-890 12 34

H&M Nordstan
Rekryteringsansvarig
Nordstadstorget 412 52
404 22 Göteborg

Göteborg, 29 oktober 2026

Tjänsten som butikssäljare på H&M Nordstan

Jag söker tjänsten som butikssäljare på H&M Nordstan. Ert fokus på hållbarhet, mode och kundupplevelse tilltalar mig särskilt. Med tre års erfarenhet från modehandeln och genuint intresse för styling och trender tror jag att jag kan bidra till att skapa fantastiska shoppingupplevelser för era kunder.

Under mina år på Gina Tricot i Frölunda Torg har jag arbetat med allt från kundservice och merförsäljning till visual merchandising och kassan. Jag har gedigen erfarenhet av att hjälpa kunder hitta rätt stil, kombinera plagg och ge personliga tips. Förra året utsågs jag till Månadens Säljare två gånger tack vare höga merförsäljningssiffror och positiv kundfeedback. Dessutom har jag vidareutbildat mig inom hållbar mode och cirkulär ekonomi, vilket gett mig insikt i hur mode kan bli mer miljövänligt.

Jag trivs med det höga tempot i butik och att möta många olika kunder varje dag. För mig är bra kundservice en självklarhet – att läsa av kundens behov, ge ärliga råd och skapa en trevlig atmosfär gör att kunden kommer tillbaka. Samarbetet med kollegor är för mig viktigt – genom att peppa varandra och dela tips skapar vi ett starkt team och når våra försäljningsmål.

Det jag värdesätter mest i mitt yrke är kombinationen av mode, människor och försäljning. Att få hjälpa någon hitta det perfekta plagget som får dem att känna sig bra, samtidigt som jag håller mig uppdaterad med senaste trenderna – det är det som driver mig. Jag tror att min erfarenhet från modehandeln, kombinerat med mitt intresse för hållbarhet, passar väl in på H&M där ni arbetar aktivt med er Conscious-kollektion och återvinningsprogram.

Jag ser fram emot möjligheten att bidra till H&M Nordstans fortsatta framgång. Hör gärna av er om ni vill veta mer.

Med vänlig hälsning,

Linda Eriksson`;

export default function PersonligtBrevExampleButikssaljare() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([EXEMPEL_BREV], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personligt-brev-butikssaljare-exempel.txt';
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
          den specifika tjänsten du söker och butikens profil. Ett personligt brev ska alltid vara unikt!
        </p>
      </div>
    </div>
  );
}
