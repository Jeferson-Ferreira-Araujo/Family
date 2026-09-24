import { supabase } from '@/lib/supabase';
import type { TablesInsert, TablesUpdate } from '@/types/database';

export async function listLists(familyId: string) {
  const { data, error } = await supabase
    .from('lists')
    .select('*, items:list_items(id, is_checked)')
    .eq('family_id', familyId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((list: any) => ({
    ...list,
    totalItems: list.items?.length ?? 0,
    checkedItems: list.items?.filter((i: any) => i.is_checked).length ?? 0,
  }));
}

export async function getList(listId: string) {
  const { data, error } = await supabase.from('lists').select('*').eq('id', listId).single();
  if (error) throw error;
  return data;
}

export async function createList(input: TablesInsert<'lists'>) {
  const { data, error } = await supabase.from('lists').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateList(listId: string, updates: TablesUpdate<'lists'>) {
  const { data, error } = await supabase.from('lists').update(updates).eq('id', listId).select().single();
  if (error) throw error;
  return data;
}

export async function deleteList(listId: string) {
  const { error } = await supabase.from('lists').delete().eq('id', listId);
  if (error) throw error;
}

export async function listItems(listId: string) {
  const { data, error } = await supabase
    .from('list_items')
    .select('*')
    .eq('list_id', listId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addListItem(listId: string, name: string, quantity: string | null, createdBy: string | null) {
  const { data, error } = await supabase
    .from('list_items')
    .insert({ list_id: listId, name: name.trim(), quantity, created_by: createdBy })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function setItemChecked(itemId: string, checked: boolean, checkedBy: string | null) {
  const { data, error } = await supabase
    .from('list_items')
    .update({
      is_checked: checked,
      checked_by: checked ? checkedBy : null,
      checked_at: checked ? new Date().toISOString() : null,
    })
    .eq('id', itemId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteListItem(itemId: string) {
  const { error } = await supabase.from('list_items').delete().eq('id', itemId);
  if (error) throw error;
}
