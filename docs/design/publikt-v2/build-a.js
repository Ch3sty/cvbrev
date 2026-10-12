// Sätter ihop publikt-v2.html av delarna i parts/ och snuttarna nedan.
const fs = require('fs');
const path = require('path');
const dir = __dirname;

const status = (ljus) => `<div class="s-status" style="color:${ljus ? '#fff' : 'var(--ink-1)'}"><span>14:05</span><svg viewBox="0 0 40 11" fill="currentColor"><rect x="0" y="6" width="3" height="5" rx="1"/><rect x="5" y="4" width="3" height="7" rx="1"/><rect x="10" y="2" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="11" rx="1"/><rect x="24" y="1" width="14" height="9" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="26" y="3" width="9" height="5" rx="1"/></svg></div>`;

const bockSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="#1A1206" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;

const SH = {
  cirkel: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="14"/></svg>`,
  kvadrat: `<svg viewBox="0 0 40 40"><rect x="7" y="7" width="26" height="26" rx="2"/></svg>`,
  triangel: `<svg viewBox="0 0 40 40"><path d="M20 6 35 33H5Z"/></svg>`,
  romb: `<svg viewBox="0 0 40 40"><path d="M20 5 35 20 20 35 5 20Z"/></svg>`,
  cirkelFylld: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="14"/><circle cx="20" cy="20" r="5" fill="currentColor" stroke="none"/></svg>`,
  lucka: `<svg viewBox="0 0 40 40"><rect x="6" y="6" width="28" height="28" rx="4"/><path d="M15.5 16.5a4.5 4.5 0 1 1 6.5 4c-1.5.8-2 1.6-2 3M20 28.5v.5" stroke-dasharray="0"/></svg>`,
};


// Expertfrågan v7e-plus-p2-17 (storyboard-v2 scen 2a): tre kopplade regler, facit C.
const P = 'var(--papper-skarm)', G = 'var(--kant-stark)', I = 'var(--ink-1)', D = 'var(--ink-3)';
const SYM = {
  plus: (y) => '<path d="M40 ' + y + ' H60 M50 ' + (y - 10) + ' V' + (y + 10) + '"/>',
  minus: (y) => '<path d="M40 ' + y + ' H60"/>',
  prick: (y) => '<circle cx="50" cy="' + y + '" r="5" fill="' + I + '" stroke="none"/>',
};
function fig(form, sym, gra, sw) {
  sw = sw || 3.6;
  const fill = gra ? G : P;
  let kropp = '', y = 50;
  if (form === 'tri') { kropp = '<path d="M50 18 L82 80 L18 80 Z" fill="' + fill + '"/>'; y = 59; }
  if (form === 'cirkel') kropp = '<circle cx="50" cy="50" r="30" fill="' + fill + '"/>';
  if (form === 'kvadrat') kropp = '<rect x="20" y="20" width="60" height="60" rx="4" fill="' + fill + '"/>';
  return '<svg viewBox="0 0 100 100" stroke="' + I + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round" fill="none">' + kropp + SYM[sym](y) + '</svg>';
}
const lucka = (k) => '<svg viewBox="0 0 100 100" fill="none" stroke="' + D + '" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="16" width="68" height="68" rx="8" stroke-width="' + (2.6 * k) + '" stroke-dasharray="5 4"/><path d="M38 40 A12 12 0 1 1 55 51 Q50 55 50 62" stroke-width="' + (5 * k) + '"/><circle cx="50" cy="73" r="3.2" fill="' + D + '" stroke="none"/></svg>';
const EXPERT_RUTOR = [['tri','plus',false],['cirkel','minus',true],['kvadrat','prick',false],['cirkel','prick',true],['kvadrat','plus',false],['tri','minus',true],['kvadrat','minus',false],['tri','prick',true]];
const EXPERT_ALT = [['A','cirkel','minus',false],['B','kvadrat','plus',true],['C','cirkel','plus',false],['D','kvadrat','minus',true],['E','cirkel','prick',false],['F','kvadrat','prick',true]];
const expertGrid = () => EXPERT_RUTOR.map(r => '<div>' + fig(...r) + '</div>').join('') + '<div class="lucka">' + lucka(1) + '</div>';
const expertAlt = () => EXPERT_ALT.map(([bok, f, s, g]) => '<div><b>' + bok + '</b>' + fig(f, s, g) + '</div>').join('');
// Samma fråga som liten bricka (svävande objekt, testtypskort)
function expertBricka() {
  const celler = [...EXPERT_RUTOR.map(r => fig(r[0], r[1], r[2], 9)), lucka(2.4)];
  let ut = '';
  celler.forEach((svg, i) => {
    const x = 6 + (i % 3) * 28, y = 6 + Math.floor(i / 3) * 28;
    ut += svg.replace('<svg viewBox="0 0 100 100"', '<svg x="' + x + '" y="' + y + '" width="28" height="28" viewBox="0 0 100 100"');
  });
  return '<svg viewBox="0 0 96 96" fill="none"><rect x="3" y="3" width="90" height="90" rx="14" fill="var(--panel)" stroke="var(--ink-1)" stroke-width="2.5"/><path d="M34 6v84M62 6v84M6 34h84M6 62h84" stroke="var(--kant-stark)" stroke-width="1.5"/>' + ut + '</svg>';
}

const snuttar = {
  // ---------- Sidhuvud ----------
  HEADER: (aktiv) => `
<header class="topp">
  <div class="wrap topp-i">
    <a class="logo" href="/"><span class="logo-m">J</span><span class="logo-t">Jobbcoach<em>.ai</em></span></a>
    <nav class="meny" aria-label="Huvudmeny">
      <a href="/funktioner">Funktioner</a>
      <a href="/priser" class="${aktiv === 'priser' ? 'aktiv' : ''}">Priser</a>
      <details class="drop"><summary>Vad vi erbjuder <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg></summary>
        <div class="drop-p">
          <div><h4>Träna</h4><a href="/verktyg/rekryteringstester">Rekryteringstester</a><a href="/verktyg/personlighetstest">Personlighetstest</a><a href="/verktyg/jobbcoachen">Jobbcoachen</a><a href="/rakna-ut">Räkna ut lön och skatt</a></div>
          <div><h4>Skriv och förbättra</h4><a href="/verktyg/personligt-brev">Personligt brev</a><a href="/verktyg/cv-analys">CV-analys</a><a href="/verktyg/skapa-cv">Skapa CV</a><a href="/verktyg/cv-mallar">CV-mallar</a><a href="/verktyg/linkedin-optimering">LinkedIn-profilen</a></div>
          <div><h4>Hitta jobb</h4><a href="/verktyg/jobbmatchning">Jobbmatchning</a><a href="/verktyg/bli-upptackt">Bli upptäckt</a></div>
          <div class="prem"><div><b>Jobbcoach Premium, 149 kr i månaden</b><br><span>Rekryteringstester, CV, personliga brev, jobbmatchning och Jobbcoachen. Säg upp med ett klick.</span></div><a href="/priser">Se vad som ingår</a></div>
          <div style="grid-column:1/-1;display:flex;gap:20px;font-size:14px"><a href="/funktioner">Alla funktioner</a><a href="/for-rekryterare">För rekryterare</a></div>
        </div>
      </details>
      <a href="/artiklar">Artiklar</a>
      <a href="/om-oss">Om oss</a>
    </nav>
    <div class="topp-h"><a href="/login">Logga in</a><a class="knapp knapp-s" href="/register">Skapa konto</a></div>
    <details class="burg"><summary aria-label="Meny"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></summary>
      <div class="burg-p">
        <a href="/funktioner">Funktioner</a><a href="/priser">Priser</a><a href="/artiklar">Artiklar</a><a href="/om-oss">Om oss</a>
        <h4>Träna</h4><a href="/verktyg/rekryteringstester">Rekryteringstester</a><a href="/verktyg/personlighetstest">Personlighetstest</a><a href="/verktyg/jobbcoachen">Jobbcoachen</a><a href="/rakna-ut">Räkna ut lön och skatt</a>
        <h4>Skriv och förbättra</h4><a href="/verktyg/personligt-brev">Personligt brev</a><a href="/verktyg/cv-analys">CV-analys</a><a href="/verktyg/skapa-cv">Skapa CV</a><a href="/verktyg/cv-mallar">CV-mallar</a><a href="/verktyg/linkedin-optimering">LinkedIn-profilen</a>
        <h4>Hitta jobb</h4><a href="/verktyg/jobbmatchning">Jobbmatchning</a><a href="/verktyg/bli-upptackt">Bli upptäckt</a>
        <h4>Konto</h4><a href="/login">Logga in</a><a href="/for-rekryterare">För rekryterare</a>
        <a class="knapp" href="/register">Skapa konto</a>
      </div>
    </details>
  </div>
</header>`,

  // ---------- Sidfot ----------
  FOOTER: () => `
<footer class="fot">
  <div class="wrap">
    <h2 class="sr">Sidfot</h2>
    <div class="fot-g">
      <div>
        <a class="logo" href="/"><span class="logo-m">J</span><span class="logo-t">Jobbcoach<em>.ai</em></span></a>
        <p class="liten">Rekryteringstester, CV, personligt brev och matchning för svensk arbetsmarknad. Byggt i Sverige, med svenska källor.</p>
        <div style="margin-top:18px"><a href="/om-oss">Om oss</a><a href="/funktioner">Funktioner</a><a href="/kontakt">Kontakt</a><a href="/hjalpcenter">Hjälpcenter</a><a href="/for-rekryterare">För rekryterare</a><a href="https://www.facebook.com/jobbcoach.ai">Facebook</a><a href="https://www.instagram.com/jobbcoach.ai">Instagram</a><a href="mailto:info@jobbcoach.ai">info@jobbcoach.ai</a></div>
      </div>
      <div><h4>Träna och hitta</h4><a href="/verktyg/rekryteringstester">Rekryteringstester</a><a href="/verktyg/personlighetstest">Personlighetstest</a><a href="/verktyg/jobbcoachen">Jobbcoachen</a><a href="/verktyg/jobbmatchning">Jobbmatchning</a><a href="/verktyg/bli-upptackt">Bli upptäckt</a><a href="/rakna-ut">Räkna ut lön och skatt</a></div>
      <div><h4>Skriv och förbättra</h4><a href="/verktyg/personligt-brev">Personligt brev</a><a href="/verktyg/cv-analys">CV-analys</a><a href="/verktyg/skapa-cv">Skapa CV</a><a href="/verktyg/cv-mallar">CV-mallar</a><a href="/verktyg/linkedin-optimering">LinkedIn-profilen</a></div>
      <div><h4>Läs</h4><a href="/artiklar">Artiklar</a><a href="/cv-exempel">CV-exempel</a><a href="/personligt-brev-exempel">Personligt brev-exempel</a><a href="/cv-mallar">CV-mallar per yrke</a><a href="/exempel">Exempel och mallar</a><a href="/for-rekryterare/insikter">Insikter för rekryterare</a><a href="/priser">Priser</a></div>
    </div>
    <div class="fot-b"><span>© 2026 Jobbcoach.ai</span><a href="/integritetspolicy">Integritetspolicy</a><a href="/anvandarvillkor">Användarvillkor</a><a href="/cookies">Cookies</a><span style="margin-left:auto">Byggt i Sverige</span></div>
  </div>
</footer>`,

  // ---------- Telefonskärmar ----------
  'TEL:bana': () => `
<div class="tel glid rum-jobb" aria-hidden="true"><div class="skarm">
  ${status(true)}
  <div class="s-vagg"><div class="s-kick">Mitt jobbsök</div><div class="s-rub">Vägen till intervjun</div><div class="s-sub">Tre av fem stationer klara. Nu: Rekryteringstester.</div></div>
  <div class="s-golv">
    <div class="s-kort bana">
      <div class="st nu"><div class="st-n"></div><div><b>Rekryteringstester</b><span>Nivåkollen klar, dagens pass väntar. Personlighetsprofilen sparad.</span><span class="s-pill">Nu</span></div></div>
      <div class="st klar"><div class="st-n">${bockSvg}</div><div><b>CV-analysen</b><span>Poäng 74 av 100, två fynd åtgärdade</span></div></div>
      <div class="st klar"><div class="st-n">${bockSvg}</div><div><b>Matchade jobb</b><span>25 träffar i natt, bästa 92 procent</span></div></div>
      <div class="st klar"><div class="st-n">${bockSvg}</div><div><b>Personligt brev</b><span>Skrivet på annonsen, nedladdat som PDF</span></div></div>
      <div class="st"><div class="st-n"></div><div><b>Jobbcoachen</b><span>Lönefrågan inför intervjun</span></div></div>
    </div>
  </div>
  <div class="s-fot"><div class="s-knapp">Starta dagens pass</div><div class="s-hem"></div></div>
</div></div>`,

  'TEL:cv': () => `
<div class="tel glid rum-cv" aria-hidden="true"><div class="skarm">
  ${status(true)}
  <div class="s-vagg">
    <div class="s-kick">CV-analysen</div>
    <div class="s-rad" style="margin-top:8px;align-items:center">
      <div class="ring vilar" data-ring><svg viewBox="0 0 96 96"><circle class="bak" cx="48" cy="48" r="42"/><circle class="fram" cx="48" cy="48" r="42"/></svg><div class="siffra"><span data-rakna="74">0</span><small>AV 100</small></div></div>
      <div style="flex:1;min-width:0;padding-left:12px"><div class="s-rub" style="font-size:17px">Läsbart för systemen</div><div class="s-sub">Tre fynd drar ned poängen. Det tyngsta står först.</div></div>
    </div>
  </div>
  <div class="s-golv">
    <div class="s-kort">
      <div class="s-kick2">Poäng per område</div>
      <div class="s-rad"><span>Tydlighet och struktur</span><b>8</b></div><div class="s-mät"><i style="width:80%"></i></div>
      <div class="s-rad" style="margin-top:8px"><span>Innehåll</span><b>7</b></div><div class="s-mät"><i style="width:70%"></i></div>
      <div class="s-rad" style="margin-top:8px"><span>Resultat</span><b>5</b></div><div class="s-mät"><i style="width:50%"></i></div>
      <div class="s-rad" style="margin-top:8px"><span>Nyckelord</span><b>9</b></div><div class="s-mät"><i style="width:90%"></i></div>
    </div>
    <div class="s-kort">
      <div class="s-kick2">Tyngsta fyndet</div>
      <b style="font-size:13px">Resultaten saknar siffror</b>
      <p class="s-dim" style="margin-top:3px">Tre av fyra roller beskriver ansvar, inte utfall. Lägg till en siffra per roll: budget, antal, procent.</p>
      <span class="s-pill" style="display:inline-block;margin-top:8px">Åtgärd: 4 minuter</span>
    </div>
  </div>
  <div class="s-fot"><div class="s-knapp">Rätta och kör om</div><div class="s-hem"></div></div>
</div></div>`,

  'TEL:brev': () => `
<div class="tel glid rum-brev" aria-hidden="true"><div class="skarm">
  ${status(true)}
  <div class="s-vagg"><div class="s-kick">Personligt brev</div><div class="s-rub">Projektledare, Sweco Göteborg</div><div class="s-sub">Skrivet på annonsen, utifrån ditt CV. Ton: saklig.</div></div>
  <div class="s-golv">
    <div class="papper">
      <b>Hej Sweco,</b>
      När ni söker en projektledare som <mark>håller ihop upphandling och tidplan</mark> känner jag igen mina senaste tre år på NCC, där jag ledde ombyggnaden av Lindholmen Science Park inom <mark>budget på 42 miljoner</mark> och två veckor före plan.
      <br><br>Ni skriver att rollen kräver vana vid <mark>offentlig upphandling enligt LOU</mark>. Jag har drivit fyra sådana från förfrågningsunderlag till tilldelning<span class="markor"></span>
    </div>
    <div class="s-rad s-dim" style="font-size:11px;padding:0 4px"><span>Krav i annonsen: 6 av 7 täckta</span><span class="s-pill gron">Redigerbart</span></div>
  </div>
  <div class="s-fot"><div class="s-knapp">Ladda ner som PDF</div><div class="s-hem"></div></div>
</div></div>`,

  'TEL:match': () => `
<div class="tel glid rum-jobb" aria-hidden="true"><div class="skarm">
  ${status(true)}
  <div class="s-vagg"><div class="s-kick">Dina matchningar</div><div class="s-rub">25 nya i natt</div><div class="s-sub">Kompetens mot alla annonser i Platsbanken. Skälen står under varje träff.</div></div>
  <div class="s-golv">
    <div class="s-kort">
      <div class="s-rad"><b style="font-size:13px">Projektledare, bygg</b><span class="s-pill gron">92 %</span></div>
      <p class="s-dim">Sweco, Göteborg</p>
      <p style="margin-top:6px"><b style="color:var(--positiv)">Du täcker:</b> projektledning, LOU, budgetansvar, AMA</p>
      <p><b style="color:var(--varning)">Saknas:</b> PMP-certifiering</p>
    </div>
    <div class="s-kort">
      <div class="s-rad"><b style="font-size:13px">Uppdragsledare, infrastruktur</b><span class="s-pill gron">88 %</span></div>
      <p class="s-dim">Trafikverket, Mölndal</p>
      <p style="margin-top:6px"><b style="color:var(--positiv)">Du täcker:</b> tidplan, entreprenadjuridik, BAS-P</p>
    </div>
    <div class="s-kort" style="opacity:.75">
      <div class="s-rad"><b style="font-size:13px">Byggledare</b><span class="s-pill gron">81 %</span></div>
      <p class="s-dim">Peab, Borås</p>
    </div>
  </div>
  <div class="s-fot"><div class="s-knapp">Skriv brev från träffen</div><div class="s-hem"></div></div>
</div></div>`,

  'TEL:matris': () => `
<div class="tel glid rum-tran" aria-hidden="true"><div class="skarm">
  ${status(true)}
  <div class="s-vagg"><div class="s-rad"><div class="s-kick">Matrislogik, expertnivå</div><div class="s-kick" style="color:var(--vagg-mjuk)">04:12</div></div><div class="s-rub">Fråga 9 av 15</div><div class="s-sub">Vilken figur hör hemma i den tomma rutan?</div></div>
  <div class="s-golv">
    <div class="matris"><div class="matris-g">${expertGrid()}</div></div>
    <div class="alt">${expertAlt()}</div>
  </div>
  <div class="s-fot"><div class="s-knapp">Svara och gå vidare</div><div class="s-hem"></div></div>
</div></div>`,

  // Personlighetstestet, resultatvyn. Alla rader finns i produkten: profilMening och
  // kravUtfall ur src/lib/personlighet/smakprov-tolkning.ts, dimensionsnamnen ur FAKTORER,
  // banden ur bandFor (låg under 40, hög från 70). Persona: projektledaren från brevet.
  'TEL:person': () => `
<div class="tel glid rum-brev" aria-hidden="true"><div class="skarm">
  ${status(true)}
  <div class="s-vagg"><div class="s-kick">Personlighetstestet</div><div class="s-rub">Din profil</div><div class="s-sub">Det rekryteraren lägger märke till först: hög samvetsgrannhet och låg utåtriktning.</div></div>
  <div class="s-golv">
    <div class="s-kort">
      <div class="s-kick2">Dina fem dimensioner</div>
      <div class="s-rad"><span>Samvetsgrannhet</span><em class="band hog">Hög</em></div><div class="s-mät"><i style="width:88%"></i></div>
      <div class="s-rad" style="margin-top:5px"><span>Utåtriktning</span><em class="band lag">Låg</em></div><div class="s-mät"><i style="width:34%"></i></div>
      <div class="s-rad" style="margin-top:5px"><span>Stabilitet</span><em class="band hog">Hög</em></div><div class="s-mät"><i style="width:76%"></i></div>
      <div class="s-rad" style="margin-top:5px"><span>Vänlighet</span><em class="band">Mitt emellan</em></div><div class="s-mät"><i style="width:58%"></i></div>
      <div class="s-rad" style="margin-top:5px"><span>Öppenhet</span><em class="band">Mitt emellan</em></div><div class="s-mät"><i style="width:52%"></i></div>
    </div>
    <div class="s-kort">
      <div class="s-kick2">Så läses profilen mot kravprofiler</div>
      <div class="krav"><b>Ledarskap och projektledning</b><span>Räkna med en fråga om utåtriktning</span></div>
      <div class="krav"><b>Ekonomi och administration</b><span class="ok">Passar profilen</span></div>
    </div>
  </div>
  <div class="s-fot"><div class="s-knapp">Det du kan säga på intervjun</div><div class="s-hem"></div></div>
</div></div>`,

  // Inför intervjun: frågorna ur LASNING ("kommer att fråga ...") och svaren ur INTERVJU i
  // smakprov-tolkning.ts. Tredje frågan ur STAR_INTERVIEW_BANK (c5_self_discipline) i
  // src/lib/recruiter/workStyle.ts, som bara det fördjupade testet ger.
  'TEL:fragor': () => `
<div class="tel glid rum-brev" aria-hidden="true"><div class="skarm">
  ${status(true)}
  <div class="s-vagg"><div class="s-kick">Inför intervjun</div><div class="s-rub">Frågor rekryteraren lär ställa</div><div class="s-sub">Utifrån din profil.</div></div>
  <div class="s-golv">
    <div class="s-kort fraga">
      <div class="s-kick2">Fråga 1, hög samvetsgrannhet</div>
      <b>När kostade strukturen dig flexibilitet?</b>
      <p><strong>Så svarar du:</strong> säg att du håller det du lovar, och ge ett exempel där det räknades. Visa också när du släppte planen för att nå målet.</p>
    </div>
    <div class="s-kort fraga">
      <div class="s-kick2">Fråga 2, låg utåtriktning</div>
      <b>Hur gör du dig hörd i en grupp?</b>
      <p><strong>Så svarar du:</strong> förbered ett exempel där du fick gehör för ett förslag. Säg att du tänker innan du talar, och visa vad det gav.</p>
    </div>
    <div class="s-kort fraga">
      <div class="s-rad"><div class="s-kick2" style="margin:0">Fråga 3, STAR</div><span class="s-pill">Fördjupade testet</span></div>
      <b style="margin-top:6px">Ett långt projekt utan yttre press, hur höll du igång?</b>
    </div>
  </div>
  <div class="s-fot"><div class="s-knapp">Öva på svaret</div><div class="s-hem"></div></div>
</div></div>`,

  'TEL:coach': () => `
<div class="tel glid rum-neu" aria-hidden="true"><div class="skarm">
  ${status(true)}
  <div class="s-vagg"><div class="s-kick">Jobbcoachen</div><div class="s-rub">Inför intervjun på torsdag</div><div class="s-sub">Svaren utgår från svensk arbetsmarknad och ditt CV.</div></div>
  <div class="s-golv">
    <div class="bubbla jag">Vad är rimlig lön för en projektledare i Göteborg med sex års erfarenhet?</div>
    <div class="bubbla coach">Med din bakgrund från NCC och LOU-upphandlingarna ligger spannet i Göteborg runt <b>48 000 till 56 000 kr</b> i månaden. Begär 54 000 och motivera med budgetansvaret på 42 miljoner.</div>
    <div class="bubbla coach">Vill du att vi övar på frågan om varför du lämnade NCC?</div>
    <div class="bubbla jag">Ja, ta den.</div>
  </div>
  <div class="s-fot"><div class="s-input"><span>Skriv en fråga</span><i></i></div><div class="s-hem"></div></div>
</div></div>`,

  // ---------- Svävande objekt i hjälten (egna SVG:er) ----------
  FLYT: () => `
<div class="flyt flyt-cv" style="--rot:-8deg"><svg viewBox="0 0 112 136" fill="none"><rect x="6" y="10" width="92" height="118" rx="12" fill="var(--panel)" stroke="var(--ink-1)" stroke-width="2.5"/><circle cx="30" cy="36" r="10" fill="var(--insunken)" stroke="var(--ink-1)" stroke-width="2.5"/><path d="M48 31h34M48 41h24M22 62h60M22 74h60M22 86h44M22 98h60M22 110h36" stroke="var(--ink-1)" stroke-width="2.5" stroke-linecap="round"/><circle cx="86" cy="22" r="18" fill="var(--panel)" stroke="var(--ink-1)" stroke-width="2.5"/><path d="M86 6.5a15.5 15.5 0 1 1-13.4 7.7" stroke="var(--koppar)" stroke-width="4" stroke-linecap="round"/></svg></div>
<div class="flyt flyt-match" style="--rot:6deg"><svg viewBox="0 0 150 86" fill="none"><rect x="3" y="3" width="144" height="80" rx="16" fill="var(--panel)" stroke="var(--ink-1)" stroke-width="2.5"/><path d="M20 26h58M20 40h40" stroke="var(--ink-1)" stroke-width="2.5" stroke-linecap="round"/><rect x="96" y="18" width="38" height="22" rx="11" fill="var(--jobb-ton)"/><path d="M107 29l4 4 8-9" stroke="var(--jobb-ink)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="20" y="56" width="110" height="8" rx="4" fill="var(--insunken)"/><rect x="20" y="56" width="101" height="8" rx="4" fill="var(--koppar)"/></svg></div>
<div class="flyt flyt-matris" style="--rot:10deg">${expertBricka()}</div>
<div class="flyt flyt-brev" style="--rot:-5deg"><svg viewBox="0 0 92 112" fill="none"><path d="M8 4h52l24 24v76a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z" fill="var(--panel)" stroke="var(--ink-1)" stroke-width="2.5" stroke-linejoin="round"/><path d="M60 4v24h24" stroke="var(--ink-1)" stroke-width="2.5" stroke-linejoin="round"/><path d="M18 40h44M18 52h52M18 64h52M18 88h30" stroke="var(--ink-1)" stroke-width="2.5" stroke-linecap="round"/><rect x="18" y="72" width="52" height="8" rx="4" fill="var(--koppar)"/></svg></div>
<div class="flyt flyt-chat" style="--rot:4deg"><svg viewBox="0 0 104 84" fill="none"><path d="M6 10a8 8 0 0 1 8-8h50a8 8 0 0 1 8 8v22a8 8 0 0 1-8 8H30l-14 12V40h-2a8 8 0 0 1-8-8z" fill="var(--panel)" stroke="var(--ink-1)" stroke-width="2.5" stroke-linejoin="round"/><path d="M20 16h32M20 26h22" stroke="var(--ink-1)" stroke-width="2.5" stroke-linecap="round"/><path d="M98 48a8 8 0 0 0-8-8H48a8 8 0 0 0-8 8v16a8 8 0 0 0 8 8h32l10 10V72a8 8 0 0 0 8-8z" fill="var(--ink-1)" stroke="var(--ink-1)" stroke-width="2.5" stroke-linejoin="round"/><path d="M52 52h30M52 62h18" stroke="var(--koppar-ljus)" stroke-width="2.5" stroke-linecap="round"/></svg></div>
<div class="flyt flyt-bock" style="--rot:0deg"><svg viewBox="0 0 46 46" fill="none"><circle cx="23" cy="23" r="21" fill="var(--koppar)"/><path d="M13 24l7 7 13-14" stroke="#1A1206" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`,

  // ---------- Sektionsobjekt (ikonstorlek, currentColor) ----------
  MATRISBRICKA: () => expertBricka(),
  'OBJ:cv': () => `<div class="obj"><svg viewBox="0 0 64 64"><rect x="10" y="6" width="40" height="52" rx="6"/><circle cx="22" cy="19" r="4"/><path d="M31 17h12M18 31h28M18 39h28M18 47h18"/><circle cx="50" cy="12" r="9" fill="var(--panel)"/><path d="M50 4a8 8 0 1 1-7 4" stroke="var(--koppar)" stroke-width="3"/></svg></div>`,
  'OBJ:brev': () => `<div class="obj"><svg viewBox="0 0 64 64"><path d="M12 6h26l14 14v36a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><path d="M38 6v14h14M18 30h24M18 38h28M18 46h28"/><rect x="18" y="51" width="18" height="4" rx="2" fill="var(--koppar)" stroke="none"/></svg></div>`,
  'OBJ:match': () => `<div class="obj"><svg viewBox="0 0 64 64"><rect x="6" y="10" width="52" height="18" rx="6"/><rect x="6" y="36" width="52" height="18" rx="6"/><path d="M14 19h20M14 45h14"/><circle cx="48" cy="19" r="4" fill="var(--koppar)" stroke="none"/><circle cx="48" cy="45" r="4"/></svg></div>`,
  'OBJ:matris': () => `<div class="obj"><svg viewBox="0 0 64 64"><rect x="6" y="6" width="52" height="52" rx="8"/><path d="M23 6v52M41 6v52M6 23h52M6 41h52" opacity=".45"/><circle cx="14.5" cy="14.5" r="3.5"/><path d="M28 18h8v-7"/><path d="M49.5 11l4 7h-8z"/><path d="M49.5 29l4 7h-8z"/><circle cx="32" cy="32" r="3.5"/><rect x="44" y="44" width="10" height="10" rx="2" fill="var(--koppar)" stroke="none"/></svg></div>`,
  'OBJ:chat': () => `<div class="obj"><svg viewBox="0 0 64 64"><path d="M8 12a6 6 0 0 1 6-6h26a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6H24l-10 8V32h0a6 6 0 0 1-6-6z"/><path d="M56 34a6 6 0 0 0-6-6H30a6 6 0 0 0-6 6v12a6 6 0 0 0 6 6h18l8 7V52a6 6 0 0 0 0 0z" fill="currentColor" stroke="none" opacity=".9"/><path d="M32 38h16M32 44h10" stroke="var(--koppar)"/></svg></div>`,
  'OBJ:linkedin': () => `<div class="obj"><svg viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="8"/><circle cx="22" cy="24" r="4"/><path d="M22 32v14M34 46V32M34 38a6 6 0 0 1 12 0v8"/></svg></div>`,
  'OBJ:mallar': () => `<div class="obj"><svg viewBox="0 0 64 64"><rect x="6" y="12" width="34" height="44" rx="5"/><rect x="24" y="6" width="34" height="44" rx="5" fill="var(--panel)"/><path d="M32 18h18M32 26h18M32 34h12"/><rect x="32" y="40" width="10" height="4" rx="2" fill="var(--koppar)" stroke="none"/></svg></div>`,
  'OBJ:upptackt': () => `<div class="obj"><svg viewBox="0 0 64 64"><circle cx="30" cy="26" r="10"/><path d="M12 54c2-10 9-16 18-16s16 6 18 16"/><circle cx="48" cy="18" r="9" fill="var(--panel)"/><path d="M48 13v10M43 18h10" stroke="var(--koppar)"/></svg></div>`,
  'OBJ:exempel': () => `<div class="obj"><svg viewBox="0 0 64 64"><path d="M8 14h20a6 6 0 0 1 6 6v34a4 4 0 0 0-4-4H8z"/><path d="M56 14H36a6 6 0 0 0-6 6v34a4 4 0 0 1 4-4h22z"/><path d="M14 24h10M14 32h10M40 24h10M40 32h10"/></svg></div>`,
  'OBJ:sokta': () => `<div class="obj"><svg viewBox="0 0 64 64"><path d="M8 20h48M8 32h48M8 44h48" opacity=".5"/><circle cx="16" cy="20" r="4" fill="var(--koppar)" stroke="none"/><circle cx="32" cy="32" r="4" fill="var(--koppar)" stroke="none"/><circle cx="48" cy="44" r="4"/><path d="M16 20l16 12 16 12"/></svg></div>`,
  'OBJ:person': () => `<div class="obj"><svg viewBox="0 0 64 64"><circle cx="20" cy="18" r="8"/><path d="M8 40c2-8 7-12 12-12s10 4 12 12"/><path d="M40 14h16M40 24h12M40 34h16M40 44h8" /><rect x="40" y="52" width="14" height="4" rx="2" fill="var(--koppar)" stroke="none"/></svg></div>`,
  'OBJ:klocka': () => `<div class="obj"><svg viewBox="0 0 64 64"><circle cx="32" cy="34" r="22"/><path d="M32 20v14l9 6M26 8h12M32 8v4"/><path d="M32 12a22 22 0 0 1 19 11" stroke="var(--koppar)" stroke-width="3"/></svg></div>`,
};

let html = '';
Object.assign(snuttar, require('./verktyg-snuttar.js'));
for (const f of ['00-head.html','06-css-verktyg.html','60-brev.html','61-matchning.html','62-funktioner.html','90-skript.html']) {
  html += fs.readFileSync(path.join(dir, 'parts', f), 'utf8') + '\n';
}
html = html.replace(/\{\{([A-Z]+)(?::([a-z]+))?\}\}/g, (m, k, arg) => {
  const key = arg && snuttar[`${k}:${arg}`] ? `${k}:${arg}` : k;
  if (!snuttar[key]) throw new Error('Okänd snutt ' + m);
  return snuttar[key](arg);
});
html = html.replace(/<a href="#start" class="flik aktiv"[\s\S]*?(?=<div class="hoger">)/, `<a href="#brev" class="flik aktiv" data-sida="brev">Personligt brev</a>
    <a href="#matchning" class="flik" data-sida="matchning">Jobbmatchning</a>
    <a href="#funktioner" class="flik" data-sida="funktioner">Funktioner</a>
    `);
html = html.replace('<b>Jobbcoach publikt v2</b>', '<b>Jobbcoach publikt v2, del A</b>');
html = html.replace("(location.hash || '#start')", "(location.hash || '#brev')").replace("? h : 'start';", "? h : 'brev';");
fs.writeFileSync(path.join(dir, 'preview-a.html'), html);
const kb = Math.round(Buffer.byteLength(html) / 1024);
console.log('preview-a.html', kb, 'kB');
// Husregler
const text = html.replace(/<style[\s\S]*?<\/style>/, '').replace(/<script[\s\S]*?<\/script>/g, '');
if (text.includes('—')) console.log('VARNING: talstreck finns i texten');
if (/\d\s*·\s*\d/.test(text)) console.log('VARNING: tal uppradade med mittpunkt');
if (/provläge/i.test(text)) console.log('VARNING: provläge');
if (/nivåmätning/i.test(text)) console.log('VARNING: nivåmätning');
const kvar = html.match(/\{\{[^}]*\}\}/g);
if (kvar) console.log('VARNING: platshållare kvar', kvar);
for (const [re, namn] of [[/·/, 'mittpunkt'], [/\d,0\b/, 'decimal ,0'], [/generalrepetition|mätning|familjer/i, 'förbjudet ord'], [/sparkles/i, 'Sparkles']]) {
  const m = text.match(re); if (m) console.log('VARNING:', namn, JSON.stringify(text.slice(Math.max(0, m.index - 60), m.index + 40)));
}
