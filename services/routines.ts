import { supabase } from '@/lib/supabase';
import type { TablesInsert, TablesUpdate } from '@/types/database';

const ROUTINE_SELECT = '*, assignee:profiles!routines_assignee_id_fkey(*)';

export async function listRoutines(familyId: string) {
  const { data, error } = await supabase
    .from('routines')
    .select(ROUTINE_SELECT)
    .eq('family_id', familyId)
    .order('time_of_day', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data ?? [];
}

export async function listRoutineCompletionsForDate(familyId: string, dateISO: string) {
  const { data, error } = await supabase
    .from('routine_completions')
    .select('*, routine:routines!inner(family_id)')
    .eq('routine.family_id', familyId)
    .eq('completion_date', dateISO);
  if (error) throw error;
  return data ?? [];
}

export async function createRoutine(input: TablesInsert<'routines'>) {
  const { data, error } = await supabase.from('routines').insert(input).select(ROUTINE_SELECT).single();
  if (error) throw error;
  return data;
}

export async function updateRoutine(routineId: string, updates: TablesUpdate<'routines'>) {
  const { data, error } = await supabase
    .from('routines')
    .update(updates)
    .eq('id', routineId)
    .select(ROUTINE_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRoutine(routineId: string) {
  const { error } = await supabase.from('routines').delete().eq('id', routineId);
  if (error) throw error;
}

export async function completeRoutine(routineId: string, dateISO: string) {
  const { data, error } = await supabase.rpc('complete_routine', { p_routine_id: routineId, p_date: dateISO });
  if (error) throw error;
  return data;
}

export async function uncompleteRoutine(routineId: string, dateISO: string) {
  const { error } = await supabase.rpc('uncomplete_routine', { p_routine_id: routineId, p_date: dateISO });
  if (error) throw error;
}
