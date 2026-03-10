-- Fix search_path for validate_username function
CREATE OR REPLACE FUNCTION public.validate_username()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.username IS NOT NULL THEN
    IF NEW.username !~ '^[a-zA-Z0-9_]{3,20}$' THEN
      RAISE EXCEPTION 'Username must be 3-20 characters (letters, numbers, underscores only)';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;