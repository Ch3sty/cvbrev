'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Stockholm, 15 januari 2025

Rekryteringsansvarig
Lagerlogistik Sverige AB
Box 5678
123 45 Stockholm

Ansökan till tjänsten som lagerarbetare

Hej,

Jag söker tjänsten som lagerarbetare hos Lagerlogistik Sverige AB. Med erfarenhet från e-handel och livsmedelslogistik samt truckkort A och B är jag redo att bidra till er effektiva lagerverksamhet.

Under de senaste två åren på Nordic E-commerce Logistics har jag arbetat med orderplock, packning och varuhantering i högt tempo. Jag hanterar truckkörning dagligen och har vana av att arbeta med både WMS-system och handdatorer för orderhantering. Min noggrannhet har resulterat i 99,8% plockprecision och noll arbetsolyckor under min anställning.

Jag trivs med det fysiska arbetet och den struktur som lagerarbete innebär. Att arbeta i team, hålla högt tempo och samtidigt bibehålla ordning och säkerhet är något jag både klarar av och uppskattar. Jag är van vid skiftarbete och flexibel när det gäller arbetstider.

Era stora satsningar på automation och moderna lagersystem är mycket tilltalande. Jag ser fram emot möjligheten att utvecklas i en framåtlutad lagermiljö och bidra till era höga standarder för effektivitet och säkerhet.

Tack för att ni tar er tid att läsa min ansökan. Jag ser fram emot att höra från er.

Med vänliga hälsningar,
Erik Johansson`;

export default function PersonligtBrevExampleLagerarbetare() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([EXEMPEL_BREV], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'personligt-brev-lagerarbetare.txt';
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
                Exempel på personligt brev för lagerarbetare
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Med truckkort och erfarenhet från e-handel
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                aria-label="Kopiera exempel på personligt brev för lagerarbetare"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Kopierat!' : 'Kopiera'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                aria-label="Ladda ner exempel på personligt brev för lagerarbetare"
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
          <strong>Tips:</strong> Detta exempel lyfter konkreta certifieringar (truckkort A och B), kvantifierbara resultat (99,8% plockprecision) och visar flexibilitet gällande skiftarbete – viktiga faktorer för lagerrroller.
        </p>
      </div>
    </div>
  );
}
