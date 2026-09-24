import { useCallback, useEffect, useState } from 'react';

import * as routinesService from '@/services/routines';
import { toDateOnly } from '@/utils/date';
import type { RoutineWithStatus } from '@/types/models';

export function useRoutinesForDate(familyId: string | null, date: Date) {
  const [routines, setRoutines] = useState<RoutineWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dateISO = toDateOnly(date);
  const weekday = date.getDay();

  const load = useCallback(async () => {
    if (!familyId) {
      setRoutines([]);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const [allRoutines, completions] = await Promise.all([
        routinesService.listRoutines(familyId),
        routinesService.listRoutineCompletionsForDate(familyId, dateISO),
      ]);
      const completedIds = new Set(completions.map((c: any) => c.routine_id));
      const todays = (allRoutines as any[])
        .filter((r) => r.active && r.days_of_week.includes(weekday))
        .map((r) => ({ ...r, completedToday: completedIds.has(r.id) }));
      setRoutines(todays as RoutineWithStatus[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar rotinas');
    } finally {
      setLoading(false);
    }
  }, [familyId, dateISO, weekday]);

  useEffect(() => {
    load();
  }, [load]);

  return { routines, loading, error, reload: load, dateISO };
}

export function useAllRoutines(familyId: string | null) {
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!familyId) {
      setRoutines([]);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await routinesService.listRoutines(familyId);
      setRoutines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar rotinas');
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => {
    load();
  }, [load]);

  return { routines, loading, error, reload: load };
}
