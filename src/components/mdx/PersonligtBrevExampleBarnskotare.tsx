'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Lisa Karlsson
Blomstervägen 15
582 28 Linköping
lisa.karlsson@email.se
073-456 78 90

Solglimten Förskola
Rekryteringsansvarig
Solvägen 8
581 35 Linköping

Linköping, 29 oktober 2025

Tjänsten som barnskötare på småbarnsavdelningen

Jag söker tjänsten som barnskötare på Solglimten Förskola. Ert arbete med utomhuspedagogik och närhet till naturen tilltalar mig särskilt, eftersom jag tror på vikten av att barn får utforska och lära genom lek och rörelse i alla väder. Med fyra års erfarenhet från småbarnsavdelning och gedigen kunskap om barns utveckling ser jag fram emot att bli en del av ert arbetslag.

Under mina år på Blåklinten Förskola har jag arbetat nära barn i åldern 1-3 år och skapat trygga och stimulerande miljöer där varje barn känner sig sett. Jag har goda erfarenheter av inskolning, rutinsituationer och att skapa meningsfulla aktiviteter utifrån barnens intressen. Dessutom har jag vidareutbildat mig inom språkutveckling och tecken som stöd, vilket gett mig verktyg för att kommunicera med de allra yngsta barnen.

Jag trivs med att vara närvarande i barnens vardag och att bygga trygga relationer både med barn och föräldrar. Samarbetet med förskollärare och kollegor är för mig en självklarhet – genom gemensam planering och reflektion skapar vi bästa möjliga lärmiljö för barnen. Jag är även van vid dokumentation och att arbeta utifrån läroplanen för förskolan.

Det jag värdesätter mest i mitt yrke är möjligheten att få vara med när barn upptäcker världen. Att se ett barn ta sina första steg, säga sina första ord, eller våga testa något nytt – det är det som driver mig. Jag tror att min erfarenhet från småbarnsavdelning, kombinerat med mitt intresse för utomhuspedagogik, passar väl in på Solglimten där ni prioriterar lek och lärande i naturen.

Jag ser fram emot möjligheten att bidra till Solglimtens arbete med att ge barnen en trygg och lärorik förskoletid. Hör gärna av er om ni vill veta mer.

Med vänlig hälsning,

Lisa Karlsson`;

export default function PersonligtBrevExampleBarnskotare() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([EXEMPEL_BREV], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personligt-brev-barnskotare-exempel.txt';
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
          den specifika tjänsten du söker och förskolans pedagogiska inriktning. Ett personligt brev ska alltid vara unikt!
        </p>
      </div>
    </div>
  );
}
