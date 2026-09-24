import { useCallback, useEffect, useState } from 'react';

import * as eventsService from '@/services/events';
import type { EventWithParticipants } from '@/types/models';

export function useEventsRange(familyId: string | null, fromISO: string, toISO: string) {
  const [events, setEvents] = useState<EventWithParticipants[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!familyId) {
      setEvents([]);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await eventsService.listEvents(familyId, fromISO, toISO);
      setEvents(data as unknown as EventWithParticipants[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  }, [familyId, fromISO, toISO]);

  useEffect(() => {
    load();
  }, [load]);

  return { events, loading, error, reload: load };
}

export function useUpcomingEvents(familyId: string | null, fromISO: string, limit = 5) {
  const [events, setEvents] = useState<EventWithParticipants[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!familyId) {
      setEvents([]);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await eventsService.listUpcomingEvents(familyId, fromISO, limit);
      setEvents(data as unknown as EventWithParticipants[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  }, [familyId, fromISO, limit]);

  useEffect(() => {
    load();
  }, [load]);

  return { events, loading, error, reload: load };
}
