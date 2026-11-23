/* Kampanjklockan. Samma kod som specen ger byggaren (KLOCKA_KOD i src/lib/kampanj/klocka.ts).
   ES5, inga beroenden. Fyller alla [data-kn] en gång i sekunden. Går något fel står
   slutdatumet kvar i klartext (reservläget) och ingenting annat påverkas. */
(function (w, d) {
  if (w.__kampanjTick) return;
  var T0 = Date.now(), FORSKJUT = 0, lugn = false, slutSagt = false;
  try { var o = localStorage.getItem('kampanj_nu'); if (o) { var p = Date.parse(o); if (p) FORSKJUT = p - T0; } } catch (e) {}
  try { lugn = w.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var LAGE = ['Slutar om', 'Sista dygnet', 'Sista timmen', 'Erbjudandet har gått ut'];
  var LANG = [['dag', 'dagar'], ['timme', 'timmar'], ['minut', 'minuter'], ['sekund', 'sekunder']];
  var KORT = ['d', 'tim', 'min', 'sek'];
  function satt(n, v) { if (n && n.textContent !== v) n.textContent = v; }
  function tva(n) { return n < 10 ? '0' + n : '' + n; }
  w.__kampanjNu = function () { return Date.now() + FORSKJUT; };
  w.__kampanjTick = function () {
    var nu = w.__kampanjNu(), els = d.querySelectorAll('[data-kn]'), slut = false;
    for (var i = 0; i < els.length; i++) {
      try {
        var el = els[i], ms = Number(el.getAttribute('data-kn')) - nu;
        if (ms !== ms) continue; // inget giltigt slut: reservläget står kvar
        var s = Math.max(0, Math.floor(ms / 1000));
        var v = [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
        var steg = ms <= 0 ? 3 : s < 3600 ? 2 : s < 86400 ? 1 : 0;
        // Brickorna: dagar, timmar, minuter. Sista dygnet: timmar, minuter, sekunder.
        // Minskad rörelse: aldrig sekunder.
        var forsta = steg === 0 || lugn ? 0 : 1;
        var tal = el.querySelectorAll('[data-kn-t]'), enh = el.querySelectorAll('[data-kn-e]');
        for (var j = 0; j < tal.length; j++) {
          var x = v[forsta + j];
          satt(tal[j], forsta + j === 0 ? '' + x : tva(x));
          satt(enh[j], LANG[forsta + j][x === 1 ? 0 : 1]);
        }
        // Textformen: "6 d 17 tim", "14 tim 32 min", "43 min 07 sek".
        var txt = el.querySelector('[data-kn-text]');
        if (txt) {
          var antal = Number(txt.getAttribute('data-kn-text')) || 2, fran = steg === 0 ? 0 : steg === 1 ? 1 : 2, delar = [];
          for (var k = fran; k < fran + antal && k < (lugn ? 3 : 4); k++) delar.push((k === 3 ? tva(v[k]) : v[k]) + ' ' + KORT[k]);
          satt(txt, steg === 3 ? '' : delar.join(' '));
        }
        satt(el.querySelector('[data-kn-lage]'), LAGE[steg]);
        if (el.getAttribute('data-kn-steg') !== '' + steg) el.setAttribute('data-kn-steg', steg);
        if (!el.hasAttribute('data-kn-klar')) el.setAttribute('data-kn-klar', '');
        if (steg === 3) slut = true;
      } catch (e) {}
    }
    if (slut && !slutSagt) {
      slutSagt = true;
      setTimeout(function () {
        slutSagt = false;
        try { if (w.__kampanjValj) w.__kampanjValj(); } catch (e) {}
        try { w.dispatchEvent(new Event('kampanj-slut')); } catch (e) {}
      }, 2000);
    }
  };
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', w.__kampanjTick); else w.__kampanjTick();
  setInterval(function () { if (!d.hidden) w.__kampanjTick(); }, 1000);
  d.addEventListener('visibilitychange', function () { if (!d.hidden) w.__kampanjTick(); });
})(window, document);
