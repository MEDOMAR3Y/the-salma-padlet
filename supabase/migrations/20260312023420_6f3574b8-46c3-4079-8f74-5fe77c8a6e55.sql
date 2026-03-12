-- Ensure new users automatically get a profile with username/display_name from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _username text;
  _display_name text;
BEGIN
  _username := lower(nullif(trim(NEW.raw_user_meta_data->>'username'), ''));
  _display_name := COALESCE(_username, split_part(NEW.email, '@', 1));

  INSERT INTO public.profiles (user_id, display_name, username)
  VALUES (NEW.id, _display_name, _username)
  ON CONFLICT (user_id) DO UPDATE
  SET username = COALESCE(public.profiles.username, EXCLUDED.username),
      display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name);

  RETURN NEW;
END;
$$;

-- Enforce username format on profile writes
DROP TRIGGER IF EXISTS validate_username_trigger ON public.profiles;
CREATE TRIGGER validate_username_trigger
BEFORE INSERT OR UPDATE OF username ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_username();

-- Hook profile creation to new auth users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Backfill missing profiles/usernames for existing users
INSERT INTO public.profiles (user_id, display_name, username)
SELECT
  u.id,
  COALESCE(lower(nullif(trim(u.raw_user_meta_data->>'username'), '')), split_part(u.email, '@', 1)),
  lower(nullif(trim(u.raw_user_meta_data->>'username'), ''))
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
);

UPDATE public.profiles p
SET
  username = COALESCE(p.username, lower(nullif(trim(u.raw_user_meta_data->>'username'), ''))),
  display_name = COALESCE(p.display_name, COALESCE(lower(nullif(trim(u.raw_user_meta_data->>'username'), '')), split_part(u.email, '@', 1)))
FROM auth.users u
WHERE p.user_id = u.id
  AND (p.username IS NULL OR p.display_name IS NULL);