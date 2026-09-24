import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import * as postsService from '@/services/posts';
import type { PostWithAuthor } from '@/types/models';

export function usePosts(familyId: string | null) {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!familyId) {
      setPosts([]);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await postsService.listPosts(familyId);
      setPosts(data as unknown as PostWithAuthor[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar mural');
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!familyId) return;
    const channel = supabase
      .channel(`posts-family-${familyId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'family_posts', filter: `family_id=eq.${familyId}` },
        load
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [familyId, load]);

  return { posts, loading, error, reload: load };
}
