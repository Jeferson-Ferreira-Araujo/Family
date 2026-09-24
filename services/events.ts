import { supabase } from '@/lib/supabase';
import type { TablesInsert, TablesUpdate } from '@/types/database';

const EVENT_SELECT = '*, responsible:profiles!events_responsible_id_fkey(*), participants:event_participants(profile:profiles(*))';

function mapEvent(row: any) {
  return {
    ...row,
    responsible: row.responsible ?? null,
    participants: (row.participants ?? []).map((p: any) => p.profile).filter(Boolean),
  };
}

export async function listEvents(familyId: string, fromISO: string, toISO: string) {
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_SELECT)
    .eq('family_id', familyId)
    .gte('start_at', fromISO)
    .lte('start_at', toISO)
    .order('start_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapEvent);
}

export async function listUpcomingEvents(familyId: string, fromISO: string, limit = 5) {
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_SELECT)
    .eq('family_id', familyId)
    .gte('start_at', fromISO)
    .order('start_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapEvent);
}

export async function getEvent(eventId: string) {
  const { data, error } = await supabase.from('events').select(EVENT_SELECT).eq('id', eventId).single();
  if (error) throw error;
  return mapEvent(data);
}

export async function createEvent(input: TablesInsert<'events'>, participantIds: string[]) {
  const { data, error } = await supabase.from('events').insert(input).select().single();
  if (error) throw error;

  if (participantIds.length > 0) {
    const rows = participantIds.map((profile_id) => ({ event_id: data.id, profile_id }));
    const { error: participantsError } = await supabase.from('event_participants').insert(rows);
    if (participantsError) throw participantsError;
  }

  return data;
}

export async function updateEvent(eventId: string, updates: TablesUpdate<'events'>, participantIds?: string[]) {
  const { data, error } = await supabase.from('events').update(updates).eq('id', eventId).select().single();
  if (error) throw error;

  if (participantIds) {
    await supabase.from('event_participants').delete().eq('event_id', eventId);
    if (participantIds.length > 0) {
      const rows = participantIds.map((profile_id) => ({ event_id: eventId, profile_id }));
      const { error: participantsError } = await supabase.from('event_participants').insert(rows);
      if (participantsError) throw participantsError;
    }
  }

  return data;
}

export async function deleteEvent(eventId: string) {
  const { error } = await supabase.from('events').delete().eq('id', eventId);
  if (error) throw error;
}
