import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import * as listsService from '@/services/lists';
import type { ListItem, ListWithProgress } from '@/types/models';

export function useLists(familyId: string | null) {
  const [lists, setLists] = useState<ListWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!familyId) {
      setLists([]);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await listsService.listLists(familyId);
      setLists(data as unknown as ListWithProgress[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar listas');
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
      .channel(`lists-family-${familyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lists', filter: `family_id=eq.${familyId}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'list_items' }, load)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [familyId, load]);

  return { lists, loading, error, reload: load };
}

export function useListItems(listId: string | null) {
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!listId) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await listsService.listItems(listId);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar itens');
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!listId) return;
    const channel = supabase
      .channel(`list-items-${listId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'list_items', filter: `list_id=eq.${listId}` },
        load
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listId, load]);

  return { items, loading, error, reload: load };
}
