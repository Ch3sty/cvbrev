'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Stockholm, 15 januari 2026

Rekryteringsansvarig
ICA Maxi Stormarknad
Box 3344
123 45 Stockholm

Ansökan till tjänsten som butikssäljare

Hej,

Jag söker tjänsten som butikssäljare på ICA Maxi och ser detta som en perfekt möjlighet att ta mina första steg in i arbetslivet. Även om jag saknar formell arbetslivserfarenhet har jag genom studier, föreningsengagemang och praktik utvecklat de egenskaper som krävs för att lyckas inom detaljhandeln.

Under min gymnasietid har jag varit kassör i skolans elevkår där jag hanterat budget, fakturor och ekonomisk rapportering. Detta har lärt mig vikten av noggrannhet och ansvar. Jag har även gjort en tvåveckors praktik på Willys där jag arbetade med varuhyllning, kundservice och kassaarbete – något som bekräftade mitt intresse för detaljhandel.

Vad som driver mig är mötet med människor och känslan av att vara till hjälp. Jag är van vid att arbeta i högt tempo (genom mina studier och extraaktiviteter), trivs i team och är flexibel gällande arbetstider inklusive kvällar och helger.

Jag ser fram emot möjligheten att lära mig, växa och bidra till ICA Maxis framgång. Tack för att ni ger mig en chans att visa vad jag kan.

Med vänliga hälsningar,
Emil Bergström`;

export default function PersonligtBrevExampleUtanErfarenhet() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([EXEMPEL_BREV], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personligt-brev-utan-erfarenhet-exempel.txt';
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
          <strong className="text-gray-900">Tips:</strong> Detta exempel omvandlar skolaktiviteter, föreningsengagemang och praktik till relevant erfarenhet. Fokusera på potential, inlärningsförmåga och motivation istället för år av arbetslivserfarenhet.
        </p>
      </div>
    </div>
  );
}
