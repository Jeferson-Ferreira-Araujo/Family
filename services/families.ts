import { supabase } from '@/lib/supabase';
import type { TablesUpdate } from '@/types/database';

export async function createFamily(name: string) {
  const { data, error } = await supabase.rpc('create_family', { p_name: name.trim() });
  if (error) throw error;
  return data;
}

export async function joinFamilyWithCode(code: string) {
  const { data, error } = await supabase.rpc('join_family_with_code', { p_code: code.trim() });
  if (error) throw error;
  return data;
}

export async function createFamilyInvite(expiresHours = 168) {
  const { data, error } = await supabase.rpc('create_family_invite', { p_expires_hours: expiresHours });
  if (error) throw error;
  return data;
}

export async function listFamilyInvites(familyId: string) {
  const { data, error } = await supabase
    .from('family_invites')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addChildProfile(fullName: string, color: string, avatarUrl?: string | null) {
  const { data, error } = await supabase.rpc('add_child_profile', {
    p_full_name: fullName.trim(),
    p_color: color,
    p_avatar_url: avatarUrl ?? undefined,
  });
  if (error) throw error;
  return data;
}

export async function updateProfile(profileId: string, updates: TablesUpdate<'profiles'>) {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', profileId).select().single();
  if (error) throw error;
  return data;
}

export async function removeProfile(profileId: string) {
  const { error } = await supabase.from('profiles').delete().eq('id', profileId);
  if (error) throw error;
}

export async function updateFamilyName(familyId: string, name: string) {
  const { data, error } = await supabase.from('families').update({ name: name.trim() }).eq('id', familyId).select().single();
  if (error) throw error;
  return data;
}

export async function listCategories(familyId: string) {
  const { data, error } = await supabase.from('categories').select('*').eq('family_id', familyId).order('name');
  if (error) throw error;
  return data;
}

export async function createCategory(familyId: string, name: string, color: string) {
  const { data, error } = await supabase
    .from('categories')
    .insert({ family_id: familyId, name: name.trim(), color })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(categoryId: string) {
  const { error } = await supabase.from('categories').delete().eq('id', categoryId);
  if (error) throw error;
}
