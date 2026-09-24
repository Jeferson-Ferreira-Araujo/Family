import { supabase } from '@/lib/supabase';

const POST_SELECT = '*, author:profiles(*)';

export async function listPosts(familyId: string) {
  const { data, error } = await supabase
    .from('family_posts')
    .select(POST_SELECT)
    .eq('family_id', familyId)
    .order('is_important', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createPost(familyId: string, authorId: string | null, content: string, isImportant: boolean) {
  const { data, error } = await supabase
    .from('family_posts')
    .insert({ family_id: familyId, author_id: authorId, content: content.trim(), is_important: isImportant })
    .select(POST_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function updatePost(postId: string, content: string, isImportant: boolean) {
  const { data, error } = await supabase
    .from('family_posts')
    .update({ content: content.trim(), is_important: isImportant })
    .eq('id', postId)
    .select(POST_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function deletePost(postId: string) {
  const { error } = await supabase.from('family_posts').delete().eq('id', postId);
  if (error) throw error;
}
