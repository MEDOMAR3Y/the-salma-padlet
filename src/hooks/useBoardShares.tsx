import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface BoardShare {
  id: string;
  board_id: string;
  user_id: string | null;
  email: string | null;
  permission: 'read' | 'write' | 'admin';
  share_token: string;
  created_at: string;
  profile?: { display_name: string | null; avatar_url: string | null };
}

export function useBoardShares(boardId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const sharesQuery = useQuery({
    queryKey: ['board-shares', boardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('board_shares')
        .select('*')
        .eq('board_id', boardId);
      if (error) throw error;
      
      // Fetch profiles for user-based shares
      const userIds = (data as BoardShare[]).filter(s => s.user_id).map(s => s.user_id!);
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds);
        const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]));
        return (data as BoardShare[]).map(s => ({ ...s, profile: s.user_id ? profileMap[s.user_id] : undefined }));
      }
      return data as BoardShare[];
    },
    enabled: !!boardId,
  });

  const addShare = useMutation({
    mutationFn: async ({ email, permission }: { email: string; permission: string }) => {
      // Check if user exists by email in profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('display_name', email) // We'll search by email later
        .maybeSingle();
      
      const { error } = await supabase
        .from('board_shares')
        .insert({
          board_id: boardId,
          email,
          permission,
          user_id: profile?.user_id || null,
        });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board-shares', boardId] }),
  });

  const updatePermission = useMutation({
    mutationFn: async ({ id, permission }: { id: string; permission: string }) => {
      const { error } = await supabase
        .from('board_shares')
        .update({ permission })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board-shares', boardId] }),
  });

  const removeShare = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('board_shares').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board-shares', boardId] }),
  });

  // Get share link token
  const getShareLink = async () => {
    // Find or create a link-only share (no user_id)
    const existing = sharesQuery.data?.find(s => !s.user_id && !s.email);
    if (existing) return existing.share_token;
    
    const { data, error } = await supabase
      .from('board_shares')
      .insert({ board_id: boardId, permission: 'read' })
      .select('share_token')
      .single();
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['board-shares', boardId] });
    return data.share_token;
  };

  return {
    shares: sharesQuery.data ?? [],
    isLoading: sharesQuery.isLoading,
    addShare,
    updatePermission,
    removeShare,
    getShareLink,
  };
}
