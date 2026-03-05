
-- Fix board_shares RLS: drop RESTRICTIVE policies and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Board owner can manage shares" ON public.board_shares;
DROP POLICY IF EXISTS "Users can view own share rows" ON public.board_shares;
DROP POLICY IF EXISTS "Users can update own share" ON public.board_shares;

CREATE POLICY "Board owner can manage shares"
ON public.board_shares
AS PERMISSIVE
FOR ALL
TO authenticated
USING (is_board_owner(auth.uid(), board_id))
WITH CHECK (is_board_owner(auth.uid(), board_id));

CREATE POLICY "Users can view own share rows"
ON public.board_shares
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR (email IS NOT NULL AND lower(email) = lower(auth.jwt() ->> 'email'))
  OR is_board_owner(auth.uid(), board_id)
);

CREATE POLICY "Users can update own share"
ON public.board_shares
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  OR (email IS NOT NULL AND lower(email) = lower(auth.jwt() ->> 'email'))
)
WITH CHECK (
  user_id = auth.uid()
  OR (email IS NOT NULL AND lower(email) = lower(auth.jwt() ->> 'email'))
);

-- Also fix boards policies to PERMISSIVE
DROP POLICY IF EXISTS "Users can create their own boards" ON public.boards;
DROP POLICY IF EXISTS "Users can view own or shared boards" ON public.boards;
DROP POLICY IF EXISTS "Users can update their own boards" ON public.boards;
DROP POLICY IF EXISTS "Users can delete their own boards" ON public.boards;

CREATE POLICY "Users can create their own boards"
ON public.boards AS PERMISSIVE FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own or shared boards"
ON public.boards AS PERMISSIVE FOR SELECT
USING (auth.uid() = user_id OR visibility = 'public' OR user_has_board_access(auth.uid(), id));

CREATE POLICY "Users can update their own boards"
ON public.boards AS PERMISSIVE FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boards"
ON public.boards AS PERMISSIVE FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Fix posts policies to PERMISSIVE
DROP POLICY IF EXISTS "Users can view posts on accessible boards" ON public.posts;
DROP POLICY IF EXISTS "Users can create posts on accessible boards" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

CREATE POLICY "Users can view posts on accessible boards"
ON public.posts AS PERMISSIVE FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM boards b
    WHERE b.id = posts.board_id
    AND (b.visibility = 'public' OR b.user_id = auth.uid() OR user_has_board_access(auth.uid(), b.id))
  )
);

CREATE POLICY "Users can create posts on accessible boards"
ON public.posts AS PERMISSIVE FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM boards b
    WHERE b.id = posts.board_id
    AND (b.user_id = auth.uid() OR b.visibility = 'public' OR user_has_board_access(auth.uid(), b.id))
  )
);

CREATE POLICY "Users can update their own posts"
ON public.posts AS PERMISSIVE FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.posts AS PERMISSIVE FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Fix comments policies to PERMISSIVE
DROP POLICY IF EXISTS "Users can view comments on accessible posts" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

CREATE POLICY "Users can view comments on accessible posts"
ON public.comments AS PERMISSIVE FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM posts p JOIN boards b ON b.id = p.board_id
    WHERE p.id = comments.post_id
    AND (b.user_id = auth.uid() OR b.visibility = 'public' OR user_has_board_access(auth.uid(), p.board_id))
  )
);

CREATE POLICY "Authenticated users can create comments"
ON public.comments AS PERMISSIVE FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.comments AS PERMISSIVE FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Fix likes policies to PERMISSIVE
DROP POLICY IF EXISTS "Users can view likes" ON public.likes;
DROP POLICY IF EXISTS "Authenticated users can like" ON public.likes;
DROP POLICY IF EXISTS "Users can unlike" ON public.likes;

CREATE POLICY "Users can view likes"
ON public.likes AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can like"
ON public.likes AS PERMISSIVE FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike"
ON public.likes AS PERMISSIVE FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Fix profiles policies to PERMISSIVE
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles AS PERMISSIVE FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles AS PERMISSIVE FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles AS PERMISSIVE FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Update user_has_board_access to also check if user is blocked
CREATE OR REPLACE FUNCTION public.user_has_board_access(_user_id uuid, _board_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.board_shares bs
    WHERE bs.board_id = _board_id
      AND bs.permission <> 'blocked'
      AND (
        bs.user_id = _user_id
        OR (
          bs.email IS NOT NULL
          AND lower(bs.email) = lower(auth.jwt() ->> 'email')
        )
      )
  );
$$;

-- Create function to check if user is blocked
CREATE OR REPLACE FUNCTION public.is_user_blocked(_user_id uuid, _board_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.board_shares bs
    WHERE bs.board_id = _board_id
      AND bs.permission = 'blocked'
      AND (
        bs.user_id = _user_id
        OR (
          bs.email IS NOT NULL
          AND lower(bs.email) = lower(auth.jwt() ->> 'email')
        )
      )
  );
$$;
