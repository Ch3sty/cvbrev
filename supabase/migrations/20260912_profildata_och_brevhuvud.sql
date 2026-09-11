-- Punkt 3 och 4 i docs/plan-inloggat-saljflode.md.
--
-- 3. handle_new_user läste bara full_name ur metadata, men Google skickar
--    name och picture. Den skrev dessutom 'Ej angivet' som namn, vilket ser
--    ifyllt ut och därför aldrig fångas av kompletteringsflödet.
-- 4. include_phone_in_letters och include_location_in_letters defaultade till
--    false. 128 konton har telefon som aldrig nådde brevhuvudet.

-- full_name måste tillåta NULL för att ett saknat namn ska gå att upptäcka.
alter table public.profiles alter column full_name drop not null;

-- Ny default framåt: har användaren fyllt i uppgiften vill hon rimligen
-- att den syns i brevet. Valet går att stänga av i profilen.
alter table public.profiles alter column include_phone_in_letters set default true;
alter table public.profiles alter column include_location_in_letters set default true;

-- Befintliga konton som redan har ett värde får det synligt i brevhuvudet.
-- Rör aldrig rader utan värde: där finns inget att visa.
update public.profiles
set include_phone_in_letters = true
where include_phone_in_letters is not true
  and phone is not null and trim(phone) <> '';

update public.profiles
set include_location_in_letters = true
where include_location_in_letters is not true
  and location is not null and trim(location) <> '';

-- 'Ej angivet' är inte ett namn. Nolla det så kompletteringskortet hittar dem.
update public.profiles
set full_name = null
where full_name = 'Ej angivet';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  meta_name text;
  meta_avatar text;
begin
  -- Google skickar 'name' och 'picture', e-post/lösenord skickar 'full_name'.
  -- Tomma strängar behandlas som saknade, annars ser raden ifylld ut.
  meta_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), '')
  );
  meta_avatar := coalesce(
    nullif(trim(new.raw_user_meta_data->>'avatar_url'), ''),
    nullif(trim(new.raw_user_meta_data->>'picture'), '')
  );

  insert into public.profiles (
    id, email, full_name, phone, profile_photo_url, created_at, updated_at
  )
  values (
    new.id,
    new.email,
    meta_name,                                        -- NULL om det saknas
    nullif(trim(new.raw_user_meta_data->>'phone'), ''),
    meta_avatar,
    now(),
    now()
  )
  on conflict (id) do nothing;

  return new;
end;
$function$;
