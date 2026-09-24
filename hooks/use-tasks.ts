import { useCallback, useEffect, useState } from 'react';

import * as tasksService from '@/services/tasks';
import type { TaskWithRelations } from '@/types/models';

export function useTasks(familyId: string | null) {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!familyId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await tasksService.listTasks(familyId);
      setTasks(data as unknown as TaskWithRelations[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => {
    load();
  }, [load]);

  return { tasks, loading, error, reload: load };
}
