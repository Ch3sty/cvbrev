'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Stockholm, 15 januari 2025

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
    const element = document.createElement('a');
    const file = new Blob([EXEMPEL_BREV], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'personligt-brev-utan-erfarenhet.txt';
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
                Exempel på personligt brev utan erfarenhet
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                För första jobbet med fokus på potential
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                aria-label="Kopiera exempel på personligt brev utan erfarenhet"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Kopierat!' : 'Kopiera'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                aria-label="Ladda ner exempel på personligt brev utan erfarenhet"
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
          <strong>Tips:</strong> Detta exempel omvandlar skolaktiviteter, föreningsengagemang och praktik till relevant erfarenhet. Fokusera på potential, inlärningsförmåga och motivation istället för år av arbetslivserfarenhet.
        </p>
      </div>
    </div>
  );
}
