
-- Board shares table for collaboration
CREATE TABLE public.board_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  user_id UUID, -- null for link-based sharing
  email TEXT, -- for email invitations
  permission TEXT NOT NULL DEFAULT 'read' CHECK (permission IN ('read', 'write', 'admin')),
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(board_id, user_id)
);

-- Enable RLS
ALTER TABLE public.board_shares ENABLE ROW LEVEL SECURITY;

-- Board owner can manage shares
CREATE POLICY "Board owner can manage shares" ON public.board_shares
FOR ALL USING (
  EXISTS (SELECT 1 FROM boards WHERE boards.id = board_shares.board_id AND boards.user_id = auth.uid())
);

-- Shared users can see their own shares
CREATE POLICY "Users can view their shares" ON public.board_shares
FOR SELECT USING (user_id = auth.uid());

-- Update boards SELECT policy to include shared boards
DROP POLICY IF EXISTS "Users can view their own boards" ON public.boards;
CREATE POLICY "Users can view own or shared boards" ON public.boards
FOR SELECT USING (
  auth.uid() = user_id 
  OR visibility = 'public'
  OR EXISTS (SELECT 1 FROM board_shares WHERE board_shares.board_id = boards.id AND board_shares.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view public boards" ON public.boards;

-- Update posts SELECT to include shared boards
DROP POLICY IF EXISTS "Users can view posts on their boards" ON public.posts;
CREATE POLICY "Users can view posts on accessible boards" ON public.posts
FOR SELECT USING (
  EXISTS (SELECT 1 FROM boards WHERE boards.id = posts.board_id AND (
    boards.user_id = auth.uid() 
    OR boards.visibility = 'public'
    OR EXISTS (SELECT 1 FROM board_shares WHERE board_shares.board_id = boards.id AND board_shares.user_id = auth.uid())
  ))
);

-- Allow shared users with write permission to create posts
DROP POLICY IF EXISTS "Users can create posts on their boards" ON public.posts;
CREATE POLICY "Users can create posts on accessible boards" ON public.posts
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND (
    EXISTS (SELECT 1 FROM boards WHERE boards.id = posts.board_id AND boards.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM board_shares WHERE board_shares.board_id = posts.board_id AND board_shares.user_id = auth.uid() AND board_shares.permission IN ('write', 'admin'))
  )
);

-- Update comments SELECT for shared boards
DROP POLICY IF EXISTS "Users can view comments on accessible posts" ON public.comments;
CREATE POLICY "Users can view comments on accessible posts" ON public.comments
FOR SELECT USING (
  EXISTS (SELECT 1 FROM posts p JOIN boards b ON b.id = p.board_id WHERE p.id = comments.post_id AND (
    b.user_id = auth.uid() 
    OR b.visibility = 'public'
    OR EXISTS (SELECT 1 FROM board_shares WHERE board_shares.board_id = b.id AND board_shares.user_id = auth.uid())
  ))
);
