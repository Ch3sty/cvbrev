# Klicktest publikt v2 våg B5

Kört 2026-10-12T20:14:57.758Z mot http://localhost:8305 (lokalt produktionsbygge), Chrome via puppeteer-core.

Fel: 0

### pixel7 (412 × 915), ljust
- ok: pixel7 /om-oss: bredd 412/412, en h1 "Vi hjälper dig att nå dina karriärmål", inga mittpunkter, talstreck eller text under 12 px
- ok: pixel7 /for-rekryterare: bredd 412/412, en h1 "Kandidater med bevisade färdigheter", inga mittpunkter, talstreck eller text under 12 px
- ok: pixel7 /kontakt: bredd 412/412, en h1 "Vi svarar på dina frågor", inga mittpunkter, talstreck eller text under 12 px
- ok: pixel7 /integritetspolicy: bredd 412/412, en h1 "Integritetspolicy för jobbcoach.ai", inga mittpunkter, talstreck eller text under 12 px
- ok: pixel7 /hjalpcenter: bredd 412/412, en h1 "Hjälpcenter", inga mittpunkter, talstreck eller text under 12 px
- ok: pixel7 Om oss "Se våra verktyg": /funktioner
- ok: pixel7 rekryterare: hjältens knapp slutar på 449 px
- ok: pixel7 rekryterare "Skapa rekryterarkonto": /rekryterare/registrera
- ok: pixel7 rekryterare: sex insiktslänkar
- ok: pixel7 rekryterare första insikten: /for-rekryterare/insikter/ai-forordningen-rekrytering
- ok: pixel7 insikten har h1 "AI-förordningen för rekryterare: kraven som gäller från 2 au"
- ok: pixel7 rekryterare "Alla insikter": /for-rekryterare/insikter
- ok: pixel7 rekryterare FAQ: 11 frågor, fråga 2 öppnas och svaret syns
- ok: pixel7 sidfotens "Cookies": /integritetspolicy
- ok: pixel7 #cookies finns i integritetspolicyn
- ok: pixel7 hjälpcentrets kort "Personliga brev": /verktyg/personligt-brev

### desktop (1280 × 800), ljust
- ok: desktop /om-oss: bredd 1265/1280, en h1 "Vi hjälper dig att nå dina karriärmål", inga mittpunkter, talstreck eller text under 12 px
- ok: desktop /for-rekryterare: bredd 1265/1280, en h1 "Kandidater med bevisade färdigheter", inga mittpunkter, talstreck eller text under 12 px
- ok: desktop /kontakt: bredd 1265/1280, en h1 "Vi svarar på dina frågor", inga mittpunkter, talstreck eller text under 12 px
- ok: desktop /integritetspolicy: bredd 1265/1280, en h1 "Integritetspolicy för jobbcoach.ai", inga mittpunkter, talstreck eller text under 12 px
- ok: desktop /hjalpcenter: bredd 1265/1280, en h1 "Hjälpcenter", inga mittpunkter, talstreck eller text under 12 px
- ok: desktop Om oss "Se våra verktyg": /funktioner
- ok: desktop rekryterare "Skapa rekryterarkonto": /rekryterare/registrera
- ok: desktop rekryterare: sex insiktslänkar
- ok: desktop rekryterare första insikten: /for-rekryterare/insikter/ai-forordningen-rekrytering
- ok: desktop insikten har h1 "AI-förordningen för rekryterare: kraven som gäller från 2 au"
- ok: desktop rekryterare "Alla insikter": /for-rekryterare/insikter
- ok: desktop rekryterare FAQ: 11 frågor, fråga 2 öppnas och svaret syns
- ok: desktop textmall: innehållsförteckningen hoppar till #cookies (top 96 px)
- ok: desktop sidfotens "Cookies": /integritetspolicy
- ok: desktop #cookies finns i integritetspolicyn
- ok: desktop hjälpcentrets kort "Personliga brev": /verktyg/personligt-brev

### pixel7, mörkt
- ok: mörkt /om-oss: bredd 412/412, en h1 "Vi hjälper dig att nå dina karriärmål", inga mittpunkter, talstreck eller text under 12 px
- ok: mörkt /for-rekryterare: bredd 412/412, en h1 "Kandidater med bevisade färdigheter", inga mittpunkter, talstreck eller text under 12 px
- ok: mörkt /kontakt: bredd 412/412, en h1 "Vi svarar på dina frågor", inga mittpunkter, talstreck eller text under 12 px
- ok: mörkt /integritetspolicy: bredd 412/412, en h1 "Integritetspolicy för jobbcoach.ai", inga mittpunkter, talstreck eller text under 12 px
- ok: mörkt /hjalpcenter: bredd 412/412, en h1 "Hjälpcenter", inga mittpunkter, talstreck eller text under 12 px

### 360 × 800
- ok: 360 /om-oss: hjältens knapp slutar på 501 px
- ok: 360 /om-oss: bredd 360/360, en h1 "Vi hjälper dig att nå dina karriärmål", inga mittpunkter, talstreck eller text under 12 px
- ok: 360 /for-rekryterare: hjältens knapp slutar på 511 px
- ok: 360 /for-rekryterare: bredd 360/360, en h1 "Kandidater med bevisade färdigheter", inga mittpunkter, talstreck eller text under 12 px
- ok: 360 /kontakt: formulärets första fält börjar på 474 px

### Kontaktformuläret, inloggat testkonto (pixel7)
- ok: inloggad, landade på /dashboard
- ok: /api/contact 200, "status: Tack. Vi läser allt och svarar från support@jobbcoach.ai."
- ok: testkontot a53948c0-77a8-4b71-bcc3-f01e7e314af5 raderat med sitt id (profiler före 1, efter 0)
