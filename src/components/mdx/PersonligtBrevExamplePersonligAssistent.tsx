'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Sofie Nilsson
Lindevägen 18
621 42 Visby
sofie.nilsson@email.se
070-345 67 89

Gotlands Kommun
LSS-handläggare
621 81 Visby

Visby, 29 oktober 2025

Tjänsten som personlig assistent

Jag söker tjänsten som personlig assistent genom Gotlands Kommun. Att få arbeta nära en annan människa och bidra till att hen lever ett självständigt liv med egna val och drömmar är något jag värdesätter högt. Med tre års erfarenhet från funktionshinderområdet och utbildning som undersköterska tror jag att jag kan vara en trygg och engagerad assistent.

Under mina år på Solrosens gruppboende har jag arbetat nära personer med utvecklingsstörning och autism. Jag har gedigen erfarenhet av personlig omvårdnad, medicindelning, aktivitetsplanering och att skapa meningsfulla dagar utifrån varje persons intressen och förmågor. Dessutom har jag vidareutbildat mig inom kommunikation och bemötande genom Askurs-modellen, vilket gett mig verktyg för att förstå och möta olika uttryckssätt.

Jag trivs med att vara en naturlig del av någons vardag – att tillsammans laga mat, gå på bio, träffa vänner eller bara umgås hemma. För mig är det viktigt att brukaren alltid är den som bestämmer och att jag som assistent är där för att möjliggöra, inte bestämma. Jag är flexibel med arbetstider, tar gärna helgpass och är van vid att arbeta både dag, kväll och natt.

Det jag värdesätter mest i mitt yrke är de nära relationerna och förtroendet som byggs över tid. Att få vara den som brukaren känner trygghet med, som förstår både det sagda och osagda, och som finns där i både vardag och fest – det är det som driver mig. Jag tror att min erfarenhet från gruppboende, kombinerat med mitt genuina intresse för LSS-arbete, gör att jag snabbt kan bli en pålitlig assistent.

Jag ser fram emot möjligheten att bidra till att brukaren får leva sitt liv på sina egna villkor. Hör gärna av er om ni vill veta mer.

Med vänlig hälsning,

Sofie Nilsson`;

export default function PersonligtBrevExamplePersonligAssistent() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([EXEMPEL_BREV], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personligt-brev-personlig-assistent-exempel.txt';
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
          <strong className="text-gray-900">Tips:</strong> Detta är ett exempel. Anpassa innehållet efter din egen erfarenhet
          och den specifika brukarens behov. Ett personligt brev ska alltid vara unikt!
        </p>
      </div>
    </div>
  );
}
