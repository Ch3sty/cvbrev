-- E-post i CV och brev (fix/kontaktepost-numeriskt, 2026-10-10).
-- Null betyder kontoadressen. Kontoadressen (auth.users.email / profiles.email)
-- används fortfarande för inloggning och kvitton.
-- Befintlig RLS "Users can update own profile" (auth.uid() = id) täcker kolumnen.
-- Inga nya grants: kolumnen ärver tabellens befintliga rättigheter.
alter table public.profiles
  add column if not exists contact_email text;

alter table public.profiles
  add constraint profiles_contact_email_format
  check (contact_email is null or (char_length(contact_email) <= 254 and contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'));

comment on column public.profiles.contact_email is
  'Adressen som visas i CV-mallar och personliga brev. Null = kontoadressen.';
