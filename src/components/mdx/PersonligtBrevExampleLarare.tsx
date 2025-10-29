'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Anna Andersson
Skolvägen 23
118 45 Stockholm
anna.andersson@email.se
070-234 56 78

Ängskolan
Rekryteringsansvarig
Ängsvägen 12
120 30 Stockholm

Stockholm, 29 oktober 2025

Tjänsten som lärare i svenska och engelska, mellanstadiet

Jag söker tjänsten som lärare i svenska och engelska på Ängskolan. Ert arbetssätt med varierande undervisningsformer och fokus på läsförståelse tilltalar mig särskilt, och jag tror starkt på att möta varje elev där hen befinner sig. Med fem års erfarenhet från mellanstadiet och gedigen behörighet i svenska och engelska ser jag fram emot att bidra till ert lärarlag.

Under mina år på Backaskolan har jag undervisat i årskurs 4-6 och utvecklat varierade arbetssätt för att nå alla elever. Jag har goda erfarenheter av individualiserad undervisning, formativ bedömning och att skapa läsglädje i klassrummet. Dessutom har jag vidareutbildat mig inom läs- och skrivutveckling samt digital kompetens, vilket gett mig verktyg för att möta elever med olika förutsättningar och inlärningsstilar.

Jag trivs med att skapa trygga klassrum där eleverna vågar testa, misslyckas och växa. Samarbetet med kollegor är för mig en självklarhet – genom gemensam planering och kollegialt lärande utvecklas både undervisningen och vi som lärare. Jag har också goda erfarenheter av föräldrasamverkan och ser det som en viktig del i elevernas utveckling.

Det jag värdesätter mest i mitt yrke är möjligheten att se elever utvecklas och få uppleva den där "aha-upplevelsen" när något klickar. Att få vara den vuxna som tror på eleven, som ser potential och möjligheter – det är det som driver mig. Jag tror att min erfarenhet från mellanstadiet, kombinerat med mitt engagemang för språkutveckling, passar väl in på Ängskolan där ni arbetar målinriktat med läsförståelse.

Jag ser fram emot möjligheten att bidra till Ängskolans arbete med att ge alla elever en god grund i svenska och engelska. Hör gärna av er om ni vill veta mer.

Med vänlig hälsning,

Anna Andersson`;

export default function PersonligtBrevExampleLarare() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([EXEMPEL_BREV], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personligt-brev-larare-exempel.txt';
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
          den specifika tjänsten du söker och skolans profil. Ett personligt brev ska alltid vara unikt!
        </p>
      </div>
    </div>
  );
}
