// Snuttar för del B (innehållssidorna). Läggs in i build.js med
//   Object.assign(snuttar, require('./innehall-snuttar.js'));
// Namnen följer build.js-regexen: VERSALER, valfritt :gemener.

// ---------- Artikelbilder i reference-stilen (1536×1024, varm diagonal gradient,
// vita kort med mjuk skugga, en fokuspunkt, text vänster, inget clipart) ----------
const INK = '#1E293B', GRA = '#CBD5E1', VIT = '#FFFFFF', AMBER = '#F59E0B', GRON = '#16A34A';
const EXPERT = [['tri','plus',false],['cirkel','minus',true],['kvadrat','prick',false],['cirkel','prick',true],['kvadrat','plus',false],['tri','minus',true],['kvadrat','minus',false],['tri','prick',true]];
function bildFig(form, sym, gra) {
  const fill = gra ? GRA : VIT;
  let kropp = '', y = 50;
  if (form === 'tri') { kropp = `<path d="M50 18 L82 80 L18 80 Z" fill="${fill}"/>`; y = 59; }
  if (form === 'cirkel') kropp = `<circle cx="50" cy="50" r="30" fill="${fill}"/>`;
  if (form === 'kvadrat') kropp = `<rect x="20" y="20" width="60" height="60" rx="4" fill="${fill}"/>`;
  const s = sym === 'plus' ? `<path d="M40 ${y} H60 M50 ${y - 10} V${y + 10}"/>` : sym === 'minus' ? `<path d="M40 ${y} H60"/>` : `<circle cx="50" cy="${y}" r="5" fill="${INK}" stroke="none"/>`;
  return `<g stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">${kropp}${s}</g>`;
}
function bildDefs(id) {
  return `<defs><linearGradient id="g-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F97316"/><stop offset=".5" stop-color="#DC2626"/><stop offset="1" stop-color="#BE185D"/></linearGradient><linearGradient id="k-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FFF7ED"/></linearGradient><filter id="s-${id}" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="28" stdDeviation="30" flood-color="#7C2D12" flood-opacity=".38"/></filter><radialGradient id="l-${id}"><stop offset="0" stop-color="#FBBF24" stop-opacity=".55"/><stop offset="1" stop-color="#FBBF24" stop-opacity="0"/></radialGradient></defs>`;
}
function bildText(pill, rad1, rad2, under) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return `<g font-family="Inter,Arial,sans-serif"><rect x="96" y="168" width="${pill.length * 19 + 56}" height="60" rx="30" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.5)" stroke-width="2"/><text x="124" y="209" font-size="28" font-weight="700" fill="#FFF7ED" letter-spacing="2">${esc(pill.toUpperCase())}</text><text x="96" y="372" font-size="88" font-weight="800" fill="#FFFFFF" letter-spacing="-2">${esc(rad1)}</text><text x="96" y="476" font-size="88" font-weight="800" fill="#FFFFFF" letter-spacing="-2">${esc(rad2)}</text><text x="98" y="560" font-size="36" font-weight="600" fill="#FDE68A">${esc(under)}</text></g>`;
}
let artNr = 0;
function artbild(variant) {
  const id = variant + (++artNr);
  let motiv = '';
  if (variant === 'matris') {
    // Expertfrågan på ett vitt kort, luckan i amber
    let celler = '';
    EXPERT.forEach((r, i) => { const x = (i % 3) * 150, y = Math.floor(i / 3) * 150; celler += `<g transform="translate(${x} ${y}) scale(1.5)">${bildFig(r[0], r[1], r[2])}</g>`; });
    motiv = `<circle cx="1180" cy="560" r="380" fill="url(#l-${id})"/>
<g transform="translate(900 236) rotate(-6 260 260)" filter="url(#s-${id})"><rect width="520" height="520" rx="36" fill="url(#k-${id})" stroke="rgba(255,255,255,.6)" stroke-width="3"/>
<g transform="translate(35 35)"><path d="M150 0v450M300 0v450M0 150h450M0 300h450" stroke="#E2E8F0" stroke-width="3"/>${celler}<rect x="312" y="312" width="126" height="126" rx="18" fill="#FEF3C7" stroke="${AMBER}" stroke-width="6" stroke-dasharray="14 10"/><text x="375" y="402" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="78" font-weight="800" fill="${AMBER}">?</text></g></g>`;
    return `<svg viewBox="0 0 1536 1024" role="img" aria-label="Matrislogik-test med rutnät av figurer">${bildDefs(id)}<rect width="1536" height="1024" fill="url(#g-${id})"/>${motiv}${bildText('Rekryteringstester', 'Matrislogik:', 'så klarar du testet', 'Regeltyper och lösta exempel')}</svg>`;
  }
  if (variant === 'alva') {
    let staplar = '';
    const h = [60, 90, 130, 190, 300, 300, 200, 130, 90, 60];
    h.forEach((v, i) => { const amber = i === 4 || i === 5; staplar += `<rect x="${i * 46}" y="${340 - v}" width="34" height="${v}" rx="12" fill="${amber ? AMBER : GRA}"/>`; });
    motiv = `<circle cx="1180" cy="560" r="360" fill="url(#l-${id})"/><g transform="translate(900 300) rotate(-5 250 200)" filter="url(#s-${id})"><rect width="520" height="420" rx="36" fill="url(#k-${id})" stroke="rgba(255,255,255,.6)" stroke-width="3"/><g transform="translate(38 36)">${staplar}<path d="M0 346h450" stroke="#E2E8F0" stroke-width="3"/></g></g>`;
    return `<svg viewBox="0 0 1536 1024" role="img" aria-label="Alva Labs logiktest, skalan 1 till 10">${bildDefs(id)}<rect width="1536" height="1024" fill="url(#g-${id})"/>${motiv}${bildText('Rekryteringstester', 'Alva Labs', 'logiktest', 'Formatet och skalan 1 till 10')}</svg>`;
  }
  if (variant === 'bakgrund') {
    motiv = `<circle cx="1180" cy="540" r="360" fill="url(#l-${id})"/><g transform="translate(940 220) rotate(5 220 280)" filter="url(#s-${id})"><rect width="440" height="560" rx="36" fill="url(#k-${id})" stroke="rgba(255,255,255,.6)" stroke-width="3"/><g transform="translate(44 56)"><rect width="200" height="22" rx="11" fill="${INK}"/><rect y="48" width="340" height="14" rx="7" fill="${GRA}"/><rect y="80" width="300" height="14" rx="7" fill="${GRA}"/>
<g transform="translate(0 150)"><rect width="40" height="40" rx="12" fill="${GRON}"/><path d="M11 21l7 7 12-14" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="60" y="12" width="240" height="16" rx="8" fill="${GRA}"/></g>
<g transform="translate(0 220)"><rect width="40" height="40" rx="12" fill="${GRON}"/><path d="M11 21l7 7 12-14" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="60" y="12" width="200" height="16" rx="8" fill="${GRA}"/></g>
<g transform="translate(0 290)"><rect width="40" height="40" rx="12" fill="${AMBER}"/><path d="M20 10v12M20 29v2" stroke="#fff" stroke-width="5" stroke-linecap="round"/><rect x="60" y="12" width="280" height="16" rx="8" fill="${GRA}"/></g>
<g transform="translate(0 360)"><rect width="40" height="40" rx="12" fill="#E2E8F0"/><rect x="60" y="12" width="220" height="16" rx="8" fill="${GRA}"/></g></g></g>`;
    return `<svg viewBox="0 0 1536 1024" role="img" aria-label="Bakgrundskontroll vid anställning">${bildDefs(id)}<rect width="1536" height="1024" fill="url(#g-${id})"/>${motiv}${bildText('Jobbsökning', 'Bakgrundskontroll', 'vid anställning', 'Vad arbetsgivaren får kolla')}</svg>`;
  }
  if (variant === 'deduktiv') {
    motiv = `<circle cx="1160" cy="560" r="360" fill="url(#l-${id})"/><g transform="translate(880 260) rotate(-4 280 220)" filter="url(#s-${id})"><rect width="560" height="440" rx="36" fill="url(#k-${id})" stroke="rgba(255,255,255,.6)" stroke-width="3"/>
<g transform="translate(50 60)"><g stroke="${INK}" stroke-width="5" fill="${VIT}" stroke-linejoin="round"><circle cx="40" cy="40" r="32"/><rect x="8" y="128" width="64" height="64" rx="6"/><path d="M40 216 L76 280 H4Z"/></g><path d="M120 40h120M120 160h120M120 248h120" stroke="${GRA}" stroke-width="6" stroke-linecap="round"/><path d="M270 40c80 0 60 120 140 120M270 160h140M270 248c80 0 60-88 140-88" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="420" y="112" width="96" height="96" rx="24" fill="${AMBER}"/><path d="M448 160l16 16 30-34" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>`;
    return `<svg viewBox="0 0 1536 1024" role="img" aria-label="Deduktivt och induktivt test">${bildDefs(id)}<rect width="1536" height="1024" fill="url(#g-${id})"/>${motiv}${bildText('Rekryteringstester', 'Deduktivt och', 'induktivt test', 'Skillnaden och sex exempel')}</svg>`;
  }
  if (variant === 'map') {
    let rader = '';
    [300, 180, 260, 220, 340].forEach((w, i) => { rader += `<rect y="${i * 72}" width="380" height="18" rx="9" fill="#E2E8F0"/><rect y="${i * 72}" width="${w}" height="18" rx="9" fill="${i === 0 ? AMBER : GRA}"/><rect y="${i * 72 + 30}" width="${90 + i * 20}" height="12" rx="6" fill="#E2E8F0"/>`; });
    motiv = `<circle cx="1160" cy="560" r="360" fill="url(#l-${id})"/><g transform="translate(900 280) rotate(-5 240 200)" filter="url(#s-${id})"><rect width="480" height="420" rx="36" fill="url(#k-${id})" stroke="rgba(255,255,255,.6)" stroke-width="3"/><g transform="translate(50 50)">${rader}</g></g>`;
    return `<svg viewBox="0 0 1536 1024" role="img" aria-label="MAP-test, Assessios personlighetstest">${bildDefs(id)}<rect width="1536" height="1024" fill="url(#g-${id})"/>${motiv}${bildText('Rekryteringstester', 'MAP-test:', 'så fungerar det', 'De fem faktorerna förklarade')}</svg>`;
  }
  if (variant === 'matchning') {
    motiv = `<circle cx="1160" cy="540" r="360" fill="url(#l-${id})"/><g filter="url(#s-${id})"><g transform="translate(860 250) rotate(-5 260 110)"><rect width="520" height="200" rx="32" fill="url(#k-${id})" stroke="rgba(255,255,255,.6)" stroke-width="3"/><rect x="44" y="50" width="250" height="22" rx="11" fill="${INK}"/><rect x="44" y="94" width="180" height="16" rx="8" fill="${GRA}"/><rect x="360" y="42" width="120" height="60" rx="30" fill="${GRON}"/><text x="420" y="84" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="34" font-weight="800" fill="#fff">92 %</text><rect x="44" y="140" width="430" height="18" rx="9" fill="#E2E8F0"/><rect x="44" y="140" width="396" height="18" rx="9" fill="${AMBER}"/></g>
<g transform="translate(940 500) rotate(4 240 100)"><rect width="480" height="190" rx="32" fill="url(#k-${id})" stroke="rgba(255,255,255,.6)" stroke-width="3"/><rect x="44" y="50" width="220" height="22" rx="11" fill="${INK}"/><rect x="44" y="94" width="160" height="16" rx="8" fill="${GRA}"/><rect x="330" y="42" width="110" height="60" rx="30" fill="#DCFCE7"/><text x="385" y="84" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="32" font-weight="800" fill="${GRON}">88 %</text></g></g>`;
    return `<svg viewBox="0 0 1536 1024" role="img" aria-label="Jobbmatchning med träffar i procent">${bildDefs(id)}<rect width="1536" height="1024" fill="url(#g-${id})"/>${motiv}${bildText('Jobbmatchning', 'Jobben som', 'hittar dig', 'Så fungerar AI-matchning')}</svg>`;
  }
  if (variant === 'cvsektion') {
    motiv = `<circle cx="1160" cy="540" r="360" fill="url(#l-${id})"/><g transform="translate(930 190) rotate(4 220 300)" filter="url(#s-${id})"><rect width="440" height="620" rx="32" fill="url(#k-${id})" stroke="rgba(255,255,255,.6)" stroke-width="3"/><g transform="translate(44 50)"><rect width="210" height="24" rx="12" fill="${INK}"/><rect y="40" width="150" height="14" rx="7" fill="${GRA}"/><rect y="96" width="352" height="150" rx="20" fill="#FEF3C7" stroke="${AMBER}" stroke-width="5"/><rect x="24" y="122" width="200" height="18" rx="9" fill="${INK}"/><rect x="24" y="158" width="290" height="12" rx="6" fill="${GRA}"/><rect x="24" y="184" width="250" height="12" rx="6" fill="${GRA}"/><rect x="24" y="210" width="270" height="12" rx="6" fill="${GRA}"/><rect y="280" width="180" height="18" rx="9" fill="${INK}"/><rect y="316" width="330" height="12" rx="6" fill="${GRA}"/><rect y="342" width="300" height="12" rx="6" fill="${GRA}"/><rect y="400" width="160" height="18" rx="9" fill="${INK}"/><rect y="436" width="320" height="12" rx="6" fill="${GRA}"/><rect y="462" width="260" height="12" rx="6" fill="${GRA}"/></g></g>`;
    return `<svg viewBox="0 0 1536 1024" role="img" aria-label="CV med arbetslivserfarenheten markerad">${bildDefs(id)}<rect width="1536" height="1024" fill="url(#g-${id})"/>${motiv}${bildText('CV', 'Erfarenheten', 'som säljer', 'Så ställer du upp varje roll')}</svg>`;
  }
  // logik: tre former i fallande kort
  motiv = `<circle cx="1160" cy="560" r="360" fill="url(#l-${id})"/>
<g filter="url(#s-${id})"><g transform="translate(880 300) rotate(-8 100 100)"><rect width="200" height="200" rx="30" fill="url(#k-${id})"/><circle cx="100" cy="100" r="54" fill="${VIT}" stroke="${INK}" stroke-width="6"/></g>
<g transform="translate(1060 380) rotate(4 100 100)"><rect width="200" height="200" rx="30" fill="url(#k-${id})"/><rect x="48" y="48" width="104" height="104" rx="8" fill="${GRA}" stroke="${INK}" stroke-width="6"/></g>
<g transform="translate(960 560) rotate(-3 100 100)"><rect width="200" height="200" rx="30" fill="${AMBER}"/><path d="M100 40 L160 150 H40Z" fill="${VIT}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/></g></g>`;
  return `<svg viewBox="0 0 1536 1024" role="img" aria-label="Logiska tester vid rekrytering">${bildDefs(id)}<rect width="1536" height="1024" fill="url(#g-${id})"/>${motiv}${bildText('Rekryteringstester', 'Logiska tester', 'vid rekrytering', 'Testtyperna och hur du övar')}</svg>`;
}

// ---------- Papperet: CV och brev för projektledare (ur exampleData) ----------
const cvPapper = () => `
<div class="ib-papper ib-papper-hel" aria-label="CV-exemplet som dokument">
  <p class="ark-namn">Sara Lindström</p>
  <p class="ark-titel">Senior Projektledare med 10+ års erfarenhet inom IT och digitalisering</p>
  <p class="ark-kontakt"><span>070-123 45 67</span><span>sara.lindstrom@exempel.se</span><span>Stockholm</span><span>linkedin.com/in/saralindstrom</span></p>
  <p class="ark-h">Profil<span class="ark-m">1</span></p>
  <p class="ark-p">Erfaren projektledare med över 10 års erfarenhet av att driva komplexa IT-projekt från koncept till leverans. Specialist på agila metoder och digitala transformationsprojekt med gedigen track record av att leverera projekt i tid, inom budget och med högt affärsvärde. Certifierad inom PRINCE2 och Scrum Master med bevisad förmåga att leda tvärfunktionella team om upp till 25 personer. Driven av att skapa struktur i komplexitet och bygga starka relationer med både interna och externa stakeholders.</p>
  <p class="ark-h">Certifieringar<span class="ark-m">2</span></p>
  <ul class="ark-kol"><li>PRINCE2 Practitioner (2023)</li><li>SAFe 5 Agilist (2022)</li><li>Certified Scrum Master, Scrum Alliance (2021)</li></ul>
  <p class="ark-h">Erfarenhet</p>
  <div class="ark-rad"><b>Senior Projektledare<span class="ark-m">3</span></b><span>2020 – Nuvarande</span></div>
  <p class="ark-ag">TechNova AB</p>
  <ul class="ark-ul">
    <li>Leder strategiska digitaliseringsprojekt med budgetar på 15-40 MSEK och team om 15-25 personer från IT, verksamhet och externa leverantörer</li>
    <li>Levererade företagets största CRM-implementation (28 MSEK) 3 veckor före deadline och 8% under budget genom proaktiv riskhantering</li>
    <li>Mentor för 4 junior projektledare som alla befordrats till projektledarroller inom 18 månader</li>
  </ul>
  <div class="ark-rad"><b>Projektledare</b><span>2017 – 2020</span></div>
  <p class="ark-ag">Digital Solutions Sweden</p>
  <ul class="ark-ul">
    <li>Drev 8-12 parallella IT-projekt med budgetar på 2-12 MSEK inom e-handel, webb och mobilapplikationer</li>
    <li>Införde Scrum och Agile across 5 utvecklingsteam vilket förbättrade velocity med 40% och minskade buggar i produktion med 55%</li>
    <li>Uppnådde 89% on-time delivery rate över 3 år, jämfört med branschsnitt på 64%</li>
  </ul>
  <div class="ark-rad"><b>IT-Konsult / Junior Projektledare</b><span>2014 – 2017</span></div>
  <p class="ark-ag">Consult Partner Group</p>
  <ul class="ark-ul"><li>Assisterade senior projektledare i projekt med budgetar på 5-20 MSEK inom finans och telekom</li><li>Koordinerade releasehantering och deployment för 15+ applikationer med 99,7% uptime</li></ul>
  <p class="ark-h">Kompetenser<span class="ark-m">4</span></p>
  <ul class="ark-kol"><li>Agile &amp; Scrum (Expert, 8+ år)</li><li>PRINCE2 &amp; SAFe (Avancerad, 6+ år)</li><li>Jira &amp; Confluence (Expert, 9+ år)</li><li>Stakeholder Management</li><li>Budget- och resursplanering</li><li>Riskhantering</li></ul>
  <p class="ark-h">Utbildning</p>
  <div class="ark-rad"><b>Civilingenjör, Datateknik</b><span>2009 – 2014</span></div>
  <p class="ark-ag">Kungliga Tekniska Högskolan (KTH)</p>
</div>`;

const brevPapper = () => `
<div class="ib-papper ib-papper-hel ark-brev" aria-label="Brevexemplet som dokument">
  <div class="ark-topp"><span><b style="color:var(--ark-ink)">Lisa Andersson</b><br>Storgatan 12, 111 23 Stockholm<br>073-456 78 90<br>lisa.andersson@email.se</span><span style="text-align:right">TechFlow Sweden AB<br>Senior Projektledare<br>2026-10-12</span></div>
  <p><b>Hej,</b></p>
  <p>Jag söker tjänsten som projektledare på TechFlow Sweden AB. Med sju års erfarenhet av att leda både agila och traditionella IT-projekt känner jag mig redo att bidra till era digitaliseringsprojekt inom fintech. Er satsning på AI-driven kundanalys och moderna utvecklingsmetoder passar perfekt med min bakgrund.</p>
  <p>Under min nuvarande roll som projektledare på Digital Innovations har jag framgångsrikt lett åtta större projekt med budgetar mellan 2 och 8 miljoner kronor. Ett konkret exempel är när jag koordinerade lanseringen av en ny mobilbank-app med ett team på 15 utvecklare, vilket <mark>levererades två veckor före deadline och 12 procent under budget</mark>.<span class="ark-m">1</span> Projektet ökade kundens dagliga aktiva användare med 40 procent under första kvartalet. <mark>Jag arbetar strukturerat med Scrum och Kanban</mark>,<span class="ark-m">2</span> faciliterar dagliga stand-ups och retrospectives, och säkerställer att teamet har tydliga sprintmål.</p>
  <p><mark>Jag är certifierad PMP sedan 2021 och Scrum Master sedan 2019</mark>,<span class="ark-m">3</span> vilket gett mig verktyg för både traditionell och agil projektledning. Min styrka ligger i stakeholder management. Jag har regelbundet navigerat komplexa projekt där affärssidan, utvecklingsteamet och externa partners haft olika prioriteringar. Genom att hålla veckovisa avstämningar och transparent kommunikation i Jira och Confluence har jag lyckats hålla alla parter engagerade och informerade. <mark>Jag trivs med att coacha teammedlemmar och ser min roll som att ta bort blockerare snarare än att mikromanagera.</mark><span class="ark-m">4</span></p>
  <p>Det som verkligen tilltalar mig med TechFlow är er kultur kring kontinuerlig förbättring och innovation. Jag har själv drivit införandet av retrospectives och blameless postmortems i min nuvarande organisation, vilket minskat incidenter med 30 procent. Er satsning på AI och machine learning inom fintech är något jag gärna vill vara del av. Jag har tidigare lett projekt inom riskanalys och betalningslösningar och ser stora möjligheter i skärningspunkten mellan AI och finansiella tjänster.</p>
  <p>Jag är övertygad om att min erfarenhet av att leverera tekniska projekt i tid och budget, kombinerat med min förmåga att bygga och leda team, skulle göra mig till ett värdefullt tillskott. Jag ser fram emot att diskutera hur jag kan bidra till era mål.</p>
  <p>Varma hälsningar,<br><b>Lisa Andersson</b></p>
</div>`;

// ---------- Rekryterarportalen som webbläsarram, och träffkorten ----------
const sokIkon = `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>`;
const portal = () => `
<div class="ib-webb rum-neu" aria-hidden="true">
  <div class="ib-webb-topp"><i></i><i></i><i></i><span>jobbcoach.ai/rekryterare</span></div>
  <div class="ib-webb-i">
    <div class="ib-sok">${sokIkon}redovisningsekonom koncernredovisning<span class="markor"></span></div>
    <div class="ib-rad-k vald"><i>R</i><div><b>Redovisningsekonom, Stockholm</b><span>8 år. Senast: Redovisningsansvarig. Matchar "koncernredovisning" i kompetenser</span></div><em>Topp 10 % matrislogik</em></div>
    <div class="ib-rad-k"><i>K</i><div><b>Kundtjänstchef, Malmö</b><span>11 år. Senast: Kundtjänstchef. Matchar "kundtjänstchef" i roll</span></div><em>Topp 10 % verbalt</em></div>
    <div class="ib-rad-k"><i>F</i><div><b>Frontendutvecklare, Göteborg</b><span>6 år. Senast: Frontendutvecklare. Matchar "react" i kompetenser</span></div><em>Topp 5 % matrislogik</em></div>
  </div>
</div>`;

const kandkort = (vem) => {
  if (vem === 'frontend') return `
<div class="ib-kand rum-neu" aria-label="Exempel på träffkort">
  <div class="ib-kand-h"><i>F</i><div><b>Frontendutvecklare</b><span>Göteborg. Anonym tills kandidaten tackar ja</span></div></div>
  <q>Frontendutvecklare som brinner för tillgänglighet och snabba gränssnitt. Söker ett produktbolag med höga krav.</q>
  <div class="ib-pills"><span class="v">Matrislogik, topp 5 %</span><span class="v">Verbalt, topp 20 %</span><span>Nyfiken</span><span>Samarbetsinriktad</span><span>React</span><span>TypeScript</span><span>Tillgänglighet</span></div>
  <div class="ib-skala"><span>Jämnt, uthålligt tempo</span><i style="--p:70%"></i><span>Högt tempo, många bollar</span></div>
  <div class="ib-kand-fot"><span>3 månader. Distans eller hybrid. Heltid</span><span class="ib-kand-knapp">Visa intresse</span></div>
</div>`;
  return `
<div class="ib-kand rum-neu" aria-label="Exempel på träffkort">
  <div class="ib-kand-h"><i>R</i><div><b>Redovisningsekonom</b><span>Stockholm. Anonym tills kandidaten tackar ja</span></div></div>
  <q>Redovisningsekonom med åtta år i byggbranschen. Trivs bäst där struktur saknas och behöver byggas upp.</q>
  <div class="ib-pills"><span class="v">Matrislogik, expertnivå, topp 10 %</span><span class="v">Numeriskt, topp 15 %</span><span>Strukturerad</span><span>Analytisk</span><span>Bokslut</span><span>Koncernredovisning</span><span>Fortnox</span></div>
  <div class="ib-skala"><span>Improviserar och anpassar</span><i style="--p:78%"></i><span>Planerar och strukturerar</span></div>
  <div class="ib-skala"><span>Får energi av eget fokusarbete</span><i style="--p:30%"></i><span>Får energi av samarbete i grupp</span></div>
  <div class="ib-kand-fot"><span>Omgående. Hybrid eller på plats. Heltid. B-körkort</span><span class="ib-kand-knapp">Visa intresse</span></div>
</div>`;
};

// ---------- Objekt: miniatyrpapper till exempelhubben ----------
const minipapper = () => `<div class="ib-minipapper" aria-hidden="true"><i class="n"></i><i style="width:45%"></i><i class="k"></i><i></i><i style="width:85%"></i><i style="width:70%"></i><i class="k" style="width:30%"></i><i></i><i style="width:80%"></i></div>`;

module.exports = {
  'ARTBILD:matris': () => artbild('matris'),
  'ARTBILD:alva': () => artbild('alva'),
  'ARTBILD:bakgrund': () => artbild('bakgrund'),
  'ARTBILD:deduktiv': () => artbild('deduktiv'),
  'ARTBILD:map': () => artbild('map'),
  'ARTBILD:logik': () => artbild('logik'),
  'ARTBILD:matchning': () => artbild('matchning'),
  'ARTBILD:cvsektion': () => artbild('cvsektion'),
  'PAPPER:cv': cvPapper,
  'PAPPER:brev': brevPapper,
  'PORTAL': portal,
  'KANDKORT:redovisning': () => kandkort('redovisning'),
  'KANDKORT:frontend': () => kandkort('frontend'),
  'MINIPAPPER': minipapper,
};
