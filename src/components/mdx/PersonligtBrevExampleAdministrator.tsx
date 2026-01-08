'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Johanna Eklund
Administratörsvägen 7
118 25 Stockholm
johanna.eklund@email.se
070-567 89 01

TechNordic AB
Rekryteringsansvarig
Box 1234
111 82 Stockholm

Stockholm, 29 oktober 2026

Tjänsten som administratör på TechNordic AB

Jag söker tjänsten som administratör på TechNordic AB. Ert arbete med att skapa effektiva processer och strukturer för ett växande techbolag tilltalar mig särskilt. Med fem års erfarenhet från administration och ekonomi, samt gedigen kunskap i Office 365 och moderna affärssystem, tror jag att jag kan bidra till att hålla era administrativa rutiner i toppskick.

Under mina år på Innovate Solutions har jag arbetat som administrativ assistent och hanterat allt från fakturahantering och resebokningar till mötesbokningar och kundkorrespondens. Jag har gedigen erfarenhet av Fortnox, Visma och Officepaketet, samt god vana vid att dokumentera processer och skapa rutiner för effektivare administration. Dessutom har jag vidareutbildat mig inom projektledning och digitala verktyg som Trello och Asana.

Jag trivs med att vara den som håller ihop de administrativa trådarna och ser till att allt flyter på smidigt. Samarbetet med olika avdelningar är för mig en självklarhet – genom att lyssna på medarbetarnas behov kan jag anpassa mina arbetssätt för att ge bästa möjliga stöd. Jag är noggrann, strukturerad och har lätt för att prioritera mellan olika uppgifter även när det är högt tempo.

Det jag värdesätter mest i mitt yrke är möjligheten att skapa ordning ur kaos och se hur rätt struktur gör hela organisationen mer effektiv. Att kunna avlasta kollegor så de kan fokusera på sina kärnuppgifter, samtidigt som jag håller koll på deadlines och ser till att inget faller mellan stolarna – det är det som driver mig. Jag tror att min erfarenhet från techbranschen, kombinerat med mitt intresse för digitalisering, passar väl in på TechNordic där ni växer snabbt.

Jag ser fram emot möjligheten att bidra till TechNordics fortsatta tillväxt genom effektiv administration. Hör gärna av er om ni vill veta mer.

Med vänlig hälsning,

Johanna Eklund`;

export default function PersonligtBrevExampleAdministrator() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([EXEMPEL_BREV], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personligt-brev-administrator-exempel.txt';
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
          den specifika tjänsten du söker och företagets behov. Ett personligt brev ska alltid vara unikt!
        </p>
      </div>
    </div>
  );
}
