'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Sara Lindström
Björkvägen 12
582 73 Linköping
sara.lindstrom@email.se
070-123 45 67

Vårdcentralen Ekholmen
Rekryteringsansvarig
Ekholmsvägen 5
581 91 Linköping

Linköping, 29 oktober 2026

Tjänsten som undersköterska på Vårdcentralen Ekholmen

Jag söker tjänsten som undersköterska på Vårdcentralen Ekholmen. Ert arbete med närsjukvård och hembesök tilltalar mig särskilt, eftersom jag tror starkt på vikten av att möta patienter i deras hemmiljö. Med sex års erfarenhet från äldreomsorg och gedigen kunskap inom basal hygien och omvårdnad tror jag att jag kan bidra till ert team.

Under mina år på Solbackens äldreboende har jag arbetat nära äldre med både somatiska och kognitiva sjukdomar. Jag har gedigen erfarenhet av sondmatning, såromläggning, insulinadministrering och katetervård. Dessutom har jag vidareutbildat mig inom palliativ vård och demensomvårdnad, vilket har gett mig verktyg för att möta patienter med respekt och trygghet även i svåra situationer.

Jag trivs med att arbeta självständigt men är också en naturlig teamspelare. I mitt nuvarande arbete samarbetar jag dagligen med sjuksköterskor, arbetsterapeuter och anhöriga för att skapa en helhetsbild av varje patients behov. Jag dokumenterar noggrant i journalsystemet och deltar aktivt i vårdplaneringsmöten.

Det jag värdesätter mest i mitt yrke är möjligheten att göra skillnad i människors vardag. Att kunna läsa av en patients behov, skapa trygghet genom lugn och närvaro, och se till att vården blir både säker och värdig – det är det som driver mig. Jag tror att min erfarenhet från äldreomsorg, kombinerat med mitt intresse för akut omhändertagande, passar väl in i en vårdcentralsmiljö där varje dag är olika.

Jag ser fram emot möjligheten att bidra till Vårdcentralen Ekholmens arbete med god och tillgänglig vård. Hör gärna av er om ni vill veta mer.

Med vänlig hälsning,

Sara Lindström`;

export default function PersonligtBrevExample() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([EXEMPEL_BREV], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personligt-brev-underskoterska-exempel.txt';
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
          <strong className="text-gray-900">Tips:</strong> Detta är ett exempel. Anpassa innehållet efter din egen erfarenhet,
          den specifika tjänsten du söker och arbetsplatsens behov. Ett personligt brev ska alltid vara unikt!
        </p>
      </div>
    </div>
  );
}
