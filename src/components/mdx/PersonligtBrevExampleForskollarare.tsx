'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Karin Lundström
Förskolvägen 9
582 25 Linköping
karin.lundstrom@email.se
070-789 01 23

Regnbågens Förskola
Rekryteringsansvarig
Regnbågsvägen 15
581 34 Linköping

Linköping, 29 oktober 2026

Tjänsten som förskollärare på avdelningen Solen

Jag söker tjänsten som förskollärare på Regnbågens Förskola. Ert arbete med Reggio Emilia-inspirerad pedagogik och fokus på barnens inflytande och delaktighet tilltalar mig särskilt. Med sex års erfarenhet som legitimerad förskollärare och genuint intresse för skapande verksamhet ser jag fram emot att bli en del av ert pedagogiska team.

Under mina år på Äppelgårdens förskola har jag arbetat med barn i åldern 1-5 år och utvecklat lärmiljöer där barnen får utforska, experimentera och lära genom lek. Jag har gedigen erfarenhet av att planera och genomföra pedagogiska aktiviteter utifrån läroplanen, samt att dokumentera och synliggöra barnens lärande. Dessutom har jag vidareutbildat mig inom digitala verktyg i förskolan och hållbar utveckling, vilket gett mig nya perspektiv på hur vi kan arbeta med framtidens barn.

Jag trivs med att vara närvarande i barnens utforskande och att skapa miljöer där varje barn känner sig sett och respekterat. Samarbetet med kollegor är för mig en självklarhet – genom gemensam reflektion och pedagogisk dokumentation utvecklar vi vår verksamhet och skapar bästa möjliga lärmiljö. Jag är också van vid föräldrasamverkan och värdesätter den viktiga kontakten med hemmet.

Det jag värdesätter mest i mitt yrke är möjligheten att få följa barnens nyfikenhet och lärande. Att se hur ett barn utvecklar sitt språk, testar hypoteser i sin lek eller löser problem tillsammans med kompisar – det är det som driver mig. Jag tror att min erfarenhet från förskola, kombinerat med mitt intresse för Reggio Emilia-pedagogik, passar väl in på Regnbågen där ni arbetar med barnens hundra språk och kreativitet i fokus.

Jag ser fram emot möjligheten att bidra till Regnbågens arbete med att ge barnen en trygg och lärorik förskoletid. Hör gärna av er om ni vill veta mer.

Med vänlig hälsning,

Karin Lundström`;

export default function PersonligtBrevExampleForskollarare() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([EXEMPEL_BREV], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personligt-brev-forskollarare-exempel.txt';
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
