'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Stockholm, 15 januari 2026

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
    const blob = new Blob([EXEMPEL_BREV], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personligt-brev-lagerarbetare-exempel.txt';
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
          <strong className="text-gray-900">Tips:</strong> Detta exempel lyfter konkreta certifieringar (truckkort A och B), kvantifierbara resultat (99,8% plockprecision) och visar flexibilitet gällande skiftarbete – viktiga faktorer för lagerrroller.
        </p>
      </div>
    </div>
  );
}
