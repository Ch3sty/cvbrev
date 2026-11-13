import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Appskalet (docs/plan-app.md, avsnitt 2.4). Appen laddar testerna från
 * jobbcoach.ai; proxyn känner igen markeringen i user agent och visar dem i
 * appens egen ram under /app. Webben påverkas inte.
 *
 * Utveckling mot lokal server i Android-emulatorn:
 *   JOBBCOACH_URL=http://10.0.2.2:3000 npx cap sync android
 * Release (produktion): JOBBCOACH_URL tom eller osatt, alltså https://www.jobbcoach.ai.
 *
 * VERSION följer versionName i android/app/build.gradle. Höj båda (och
 * versionCode) när skalet eller de inbyggda delarna ändras.
 */
const VERSION = '1.0.0';
const bas = process.env.JOBBCOACH_URL || 'https://www.jobbcoach.ai';
const lokal = bas.startsWith('http://');

/** Nattens färg ur appikonen (konceptet, Ikon och butik). */
const NATT = '#121325';

const config: CapacitorConfig = {
  appId: 'ai.jobbcoach.testklar',
  appName: 'Testklar',
  webDir: 'www',
  // Webbvyns egen bakgrund syns mellan startskärmen och första ritningen.
  backgroundColor: NATT,
  server: {
    // Appen öppnar i Idag (konceptet); proxyn skriver om /dashboard till /app.
    url: `${bas}/dashboard`,
    cleartext: lokal,
    // Visas när sidan inte går att ladda, till exempel utan nät.
    errorPath: 'fel.html',
  },
  android: {
    appendUserAgent: `JobbcoachApp/${VERSION} (android)`,
    allowMixedContent: false,
    webContentsDebuggingEnabled: lokal,
  },
  plugins: {
    // Väggen bakom statusfältet är mörk, så ikonerna ska vara ljusa.
    // Appens ljusa vyer byter stil via skal.ts (statusfalt).
    SystemBars: { insetsHandling: 'css', style: 'DARK', initialViewportFitValueHint: 'cover' },

    // Startskärmen (konceptet): märket på natt, Android 12+ via systemets
    // startskärm (ikonen i res/drawable/splash_ikon.xml, temat i styles.xml).
    // Sidan döljer den när första vyn är målad (skal.ts, doljStartskarm).
    // launchShowDuration är bara en säkerhetsgräns om sidan aldrig svarar,
    // till exempel när felvyn utan nät visas.
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 3000,
      launchFadeOutDuration: 200,
      backgroundColor: NATT,
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: false,
      splashImmersive: false,
    },

    // Notiser som kommer medan appen är öppen visas ändå i systemfältet.
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },

    // Inbyggd Google-inloggning (plan 2.5). Bara Google buntas på Android.
    // Klient-id anges inte här: sidan anropar SocialLogin.initialize med
    // webbklientens id (Google Cloud, OAuth-klient "Web application", samma
    // som Supabase Google-leverantören använder), i Next som env-variabeln
    // NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID. Android-klienten i Google Cloud
    // registreras med paket-id ai.jobbcoach.testklar och SHA-1 för
    // upload-nyckeln, debug-nyckeln och Plays appsigneringsnyckel.
    // Apple slås på när iOS läggs till.
    //
    // Platshållare (pluginet läser inte klient-id ur den här filen):
    //   webbklient:    NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID, i dag reservvärdet i
    //                  src/components/mobilapp/skal-inloggning.ts
    //   androidklient: ERSATT_MED_ANDROIDKLIENTENS_ID (skapas i Google Cloud,
    //                  behövs inte i koden, bara registrerad med SHA-1)
    SocialLogin: {
      providers: { google: true, apple: false, facebook: false, twitter: false },
      logLevel: 1,
    },
  },
  // iOS läggs till med `npx cap add ios` på en Mac eller i molnbygget.
  ios: {
    appendUserAgent: `JobbcoachApp/${VERSION} (ios)`,
  },
};

export default config;
