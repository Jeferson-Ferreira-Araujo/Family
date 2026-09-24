import { supabase } from '@/lib/supabase';
import type { TablesInsert, TablesUpdate } from '@/types/database';

const TASK_SELECT = '*, assignee:profiles!tasks_assignee_id_fkey(*), category:categories(*)';

export async function listTasks(familyId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select(TASK_SELECT)
    .eq('family_id', familyId)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('due_time', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data ?? [];
}

export async function getTask(taskId: string) {
  const { data, error } = await supabase.from('tasks').select(TASK_SELECT).eq('id', taskId).single();
  if (error) throw error;
  return data;
}

export async function createTask(input: TablesInsert<'tasks'>) {
  const { data, error } = await supabase.from('tasks').insert(input).select(TASK_SELECT).single();
  if (error) throw error;
  return data;
}

export async function updateTask(taskId: string, updates: TablesUpdate<'tasks'>) {
  const { data, error } = await supabase.from('tasks').update(updates).eq('id', taskId).select(TASK_SELECT).single();
  if (error) throw error;
  return data;
}

export async function setTaskStatus(taskId: string, status: 'pending' | 'completed') {
  return updateTask(taskId, {
    status,
    completed_at: status === 'completed' ? new Date().toISOString() : null,
  });
}

export async function deleteTask(taskId: string) {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) throw error;
}
