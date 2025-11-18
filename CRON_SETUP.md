# Cron Jobs Setup

## Premium Expiration Cron

Automatiskt rensar utgångna premium-konton varje timme.

### Setup i Vercel

1. **Lägg till CRON_SECRET i Vercel miljövariabler:**
   ```bash
   # Generera ett säkert secret
   openssl rand -base64 32

   # Lägg till i Vercel:
   # Settings → Environment Variables → Add New
   # Name: CRON_SECRET
   # Value: <your-secret-here>
   # Environments: Production, Preview, Development
   ```

2. **Verifiera att cron är konfigurerad i vercel.json:**
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/expire-premiums",
         "schedule": "0 * * * *"  // Varje timme
       }
     ]
   }
   ```

3. **Deploy till Vercel**
   - Cron-jobbet aktiveras automatiskt på Vercel Hobby/Pro plans
   - Körs enligt schema (varje timme)

### Manuell Testning

```bash
# Testa lokalt (kräver CRON_SECRET i .env.local)
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
     http://localhost:3000/api/cron/expire-premiums

# Testa i produktion
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://www.jobbcoach.ai/api/cron/expire-premiums
```

### Vad händer när cron körs?

1. Hittar alla användare med:
   - `subscription_tier = 'premium'`
   - `premium_until < NOW()`
   - INGEN aktiv Stripe subscription (`subscription_status != 'active'/'trialing'`)

2. Uppdaterar dessa användare:
   - `subscription_tier = 'free'`
   - Behåller `premium_until` och `premium_source` för historik

3. Loggar varje nedgradering

### Vilka premiums påverkas?

✅ **Rensas:**
- Introduktionsbelöning (1 dag) efter utgång
- Gästinbjudningar (7 dagar) efter utgång
- Trial-signup (7 dagar) utan Stripe subscription
- OAuth-signup trial (7 dagar) utan Stripe subscription
- Admin-beviljade premiums med utgångsdatum

❌ **Rensas INTE:**
- Aktiva Stripe-prenumerationer (subscription_status = 'active')
- Trial-perioder via Stripe (subscription_status = 'trialing')
- Premium utan utgångsdatum (legacy eller admin)

### Monitoring

- Loggar finns i Vercel Function Logs
- Returnerar JSON med antal nedgraderade konton
- Exempel output:
  ```json
  {
    "success": true,
    "message": "Expired 3 premium accounts",
    "expired": 3,
    "users": [
      {
        "id": "user-id",
        "email": "user@example.com",
        "source": "onboarding_completion",
        "expiredAt": "2025-01-17T10:00:00.000Z"
      }
    ]
  }
  ```

### Felsökning

**Problem:** Cron körs inte
- Verifiera att du har Vercel Pro plan (Hobby stödjer max 1 cron)
- Kontrollera vercel.json syntax
- Se till att cron är synlig i Vercel Dashboard → Cron Jobs

**Problem:** Unauthorized error
- Lägg till CRON_SECRET i Vercel miljövariabler
- Matcha secret i både Vercel och request headers

**Problem:** Användare får premium tillbaka efter nedgradering
- Kontrollera att cron faktiskt körs (se logs)
- Verifiera att `premium_until` är korrekt satt i databasen
- Kolla client-side validering i use-profile.ts
