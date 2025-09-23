# Supabase Email Configuration Guide

## Issue
You're getting ugly default Supabase confirmation emails instead of your beautiful custom Resend emails.

## Root Cause
Your signup flow calls `supabase.auth.signUp()` which triggers Supabase's automatic email system, even though you have a custom Resend implementation.

## Solution Steps

### Step 1: Disable Supabase Email Confirmations (Dashboard)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/dbvbnbkvadvlhjhomibg
2. Navigate to **Authentication** → **Providers**
3. Click on **Email** provider
4. **DISABLE** "Enable email confirmations" (set to OFF)
5. Click **Save**

This will allow users to sign up without Supabase sending confirmation emails.

### Step 2: Modify Your Signup Flow

Your current flow in `register-form.tsx`:
```typescript
// Current - triggers Supabase emails
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { full_name: fullName, phone: phone }}
})
```

**New Flow** (see updated file):
```typescript
// Step 1: Create user with Supabase (no email sent)
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { full_name: fullName, phone: phone }}
})

// Step 2: Send custom confirmation email via your API
if (data.user && !error) {
  await fetch('/api/auth/send-confirmation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: data.user.email,
      fullName: fullName,
      userId: data.user.id
    })
  })
}
```

### Step 3: Update Email Confirmation Handling

Your custom confirmation system in `/api/auth/send-confirmation` already works perfectly! It:
- Generates secure tokens
- Stores them in `email_confirmations` table
- Sends beautiful emails via Resend
- Handles confirmation via `/api/auth/confirm-email`

### Step 4: Verification

After making these changes:

1. Test user registration
2. Check that NO Supabase emails are sent
3. Verify your custom Resend emails are sent
4. Confirm the email confirmation flow works

## Alternative: Auth Hooks (Advanced)

If you want more control, consider implementing a [Send Email Auth Hook](https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook) to completely override Supabase's email system.

## Result

✅ No more ugly Supabase emails
✅ Only your beautiful custom Resend emails
✅ Full control over email content and branding
✅ Consistent user experience

## Files Modified
- `src/components/auth/register-form.tsx` - Updated signup flow
- Dashboard settings - Email confirmations disabled