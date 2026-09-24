import { addDays, format, isBefore, startOfDay } from 'date-fns';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Fab } from '@/components/ui/Fab';
import { MemberAvatar } from '@/components/ui/MemberAvatar';
import { useApp } from '@/context/app-context';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { useTasks } from '@/hooks/use-tasks';
import * as tasksService from '@/services/tasks';
import { formatRelativeDay, formatTimeFromString } from '@/utils/date';
import type { TaskWithRelations } from '@/types/models';

type Filter = 'today' | 'tomorrow' | 'upcoming' | 'done';

export default function TasksScreen() {
  const { family } = useApp();
  const { tasks, loading, reload } = useTasks(family?.id ?? null);
  const [filter, setFilter] = useState<Filter>('today');

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const tomorrowKey = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const filtered = useMemo(() => {
    const pending = tasks.filter((t) => t.status !== 'completed');
    switch (filter) {
      case 'today':
        return pending.filter((t) => t.due_date === todayKey || (t.due_date && isBefore(new Date(t.due_date), startOfDay(new Date()))));
      case 'tomorrow':
        return pending.filter((t) => t.due_date === tomorrowKey);
      case 'upcoming':
        return pending.filter((t) => t.due_date && t.due_date > tomorrowKey);
      case 'done':
        return tasks.filter((t) => t.status === 'completed');
      default:
        return pending;
    }
  }, [tasks, filter, todayKey, tomorrowKey]);

  async function toggle(task: TaskWithRelations) {
    try {
      await tasksService.setTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed');
      reload();
    } catch {
      // ignore, reload will resync
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Tarefas</Text>
      </View>

      <View style={styles.filterRow}>
        <Chip label="Hoje" selected={filter === 'today'} onPress={() => setFilter('today')} />
        <Chip label="Amanhã" selected={filter === 'tomorrow'} onPress={() => setFilter('tomorrow')} />
        <Chip label="Próximas" selected={filter === 'upcoming'} onPress={() => setFilter('upcoming')} />
        <Chip label="Concluídas" selected={filter === 'done'} onPress={() => setFilter('done')} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={reload}
        ListEmptyComponent={
          <EmptyState icon="checkmark-done-outline" title="Nenhuma tarefa por aqui" description="Toque no + para criar uma nova tarefa." />
        }
        renderItem={({ item }) => (
          <Card style={styles.taskCard}>
            <Checkbox checked={item.status === 'completed'} onPress={() => toggle(item)} />
            <Pressable style={styles.taskInfo} onPress={() => router.push(`/tasks/${item.id}`)}>
              <Text style={[styles.taskTitle, item.status === 'completed' && styles.taskTitleDone]}>{item.title}</Text>
              <View style={styles.taskMetaRow}>
                {item.due_date ? <Text style={styles.taskMeta}>{formatRelativeDay(item.due_date)}</Text> : null}
                {item.due_time ? <Text style={styles.taskMeta}>· {formatTimeFromString(item.due_time)}</Text> : null}
                {item.category ? (
                  <View style={[styles.categoryDot, { backgroundColor: item.category.color }]} />
                ) : null}
                {item.category ? <Text style={styles.taskMeta}>{item.category.name}</Text> : null}
              </View>
            </Pressable>
            {item.assignee ? (
              <MemberAvatar name={item.assignee.full_name} color={item.assignee.color} avatarUrl={item.assignee.avatar_url} size={32} />
            ) : null}
          </Card>
        )}
      />

      <Fab onPress={() => router.push('/tasks/new')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, paddingHorizontal: Spacing.lg, marginVertical: Spacing.md },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100, gap: Spacing.sm },
  taskCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  taskTitleDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  taskMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  taskMeta: { fontSize: FontSize.xs, color: Colors.textSecondary },
  categoryDot: { width: 6, height: 6, borderRadius: 3, marginLeft: 4 },
});
