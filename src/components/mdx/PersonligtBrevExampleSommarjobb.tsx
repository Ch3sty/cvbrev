'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Emma Johansson
Strandvägen 34
621 45 Visby
emma.johansson@email.se
070-234 56 78

Gotlands Turistbyrå
Rekryteringsansvarig
Stora Torget 3
621 56 Visby

Visby, 29 oktober 2026

Sommarjobb som turistvärd på Gotlands Turistbyrå

Jag söker sommarjobb som turistvärd på Gotlands Turistbyrå. Att få vara med och visa upp Gotlands historia och natur för besökare från hela världen skulle vara en fantastisk möjlighet. Med goda kunskaper i engelska och tyska, samt mitt genuina intresse för Gotlands kulturarv, tror jag att jag kan bidra till att ge era gäster en minnesvärd upplevelse.

Jag studerar på gymnasiets samhällsprogram med inriktning turism och läser nu tredje året. I skolan har jag fördjupat mig i destinationsutveckling och hållbar turism, vilket gett mig förståelse för hur viktigt gott bemötande är för besöksnäringen. Under förra sommarens praktik på Visby Handelsträdgård jobbade jag i kassan och fick goda omdömen för min serviceförmåga och positiva attityd.

Jag trivs med att möta människor och har lätt för att skapa kontakt. Att kunna svara på frågor, ge tips om sevärdheter och hjälpa besökare att hitta rätt är något jag verkligen skulle uppskatta. Jag är van vid högt tempo från mitt extraarbete på café, där jag lärt mig att hålla huvudet kallt även när det är fullt och många väntar.

Det jag skulle uppskatta mest med detta sommarjobb är möjligheten att representera Gotland och få dela med mig av allt det fantastiska ön har att erbjuda. Jag växte upp här och känner till både de klassiska sevärdheterna och de mindre kända pärlorna som många turister missar. Att kunna kombinera mitt intresse för turism med praktisk erfarenhet inför framtida studier skulle vara ovärderligt.

Jag ser fram emot möjligheten att bidra till att göra sommaren 2026 minnesvärd för Gotlands besökare. Hör gärna av er om ni vill veta mer.

Med vänlig hälsning,

Emma Johansson`;

export default function PersonligtBrevExampleSommarjobb() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([EXEMPEL_BREV], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personligt-brev-sommarjobb-exempel.txt';
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
          den specifika tjänsten du söker och arbetsgivarens behov. Ett personligt brev ska alltid vara unikt!
        </p>
      </div>
    </div>
  );
}
