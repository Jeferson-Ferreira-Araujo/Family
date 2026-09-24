import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { MemberAvatar } from '@/components/ui/MemberAvatar';
import { useApp } from '@/context/app-context';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useUpcomingEvents } from '@/hooks/use-events';
import { usePosts } from '@/hooks/use-posts';
import { useRoutinesForDate } from '@/hooks/use-routines';
import { useTasks } from '@/hooks/use-tasks';
import * as routinesService from '@/services/routines';
import * as tasksService from '@/services/tasks';
import { formatDateLong, formatTime, formatTimeFromString, greetingForHour } from '@/utils/date';

export default function TodayScreen() {
  const { profile, family, members } = useApp();
  const today = useMemo(() => new Date(), []);
  const startOfDay = useMemo(() => new Date(today.getFullYear(), today.getMonth(), today.getDate()), [today]);

  const { events, loading: eventsLoading, reload: reloadEvents } = useUpcomingEvents(
    family?.id ?? null,
    startOfDay.toISOString(),
    5
  );
  const { tasks, loading: tasksLoading, reload: reloadTasks } = useTasks(family?.id ?? null);
  const { routines, loading: routinesLoading, reload: reloadRoutines } = useRoutinesForDate(
    family?.id ?? null,
    today
  );
  const { posts, loading: postsLoading, reload: reloadPosts } = usePosts(family?.id ?? null);

  const todayISO = startOfDay.toISOString().slice(0, 10);
  const todayTasks = tasks.filter((t) => t.due_date === todayISO && t.status !== 'completed');
  const importantPosts = posts.filter((p) => p.is_important).slice(0, 3);
  const isLoading = eventsLoading || tasksLoading || routinesLoading || postsLoading;

  async function handleRefresh() {
    await Promise.all([reloadEvents(), reloadTasks(), reloadRoutines(), reloadPosts()]);
  }

  async function toggleTask(taskId: string, completed: boolean) {
    try {
      await tasksService.setTaskStatus(taskId, completed ? 'pending' : 'completed');
      reloadTasks();
    } catch {
      // silently ignore, list will resync on reload
    }
  }

  async function toggleRoutine(routineId: string, done: boolean) {
    try {
      if (done) {
        await routinesService.uncompleteRoutine(routineId, todayISO);
      } else {
        await routinesService.completeRoutine(routineId, todayISO);
      }
      reloadRoutines();
    } catch {
      // ignore
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={Colors.primary} />}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {greetingForHour()}, {profile?.full_name?.split(' ')[0] ?? ''} 👋
            </Text>
            <Text style={styles.date}>{formatDateLong(today)}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.membersRow}>
          {members.map((member) => (
            <View key={member.id} style={styles.memberItem}>
              <MemberAvatar name={member.full_name} color={member.color} avatarUrl={member.avatar_url} isChild={member.is_child} />
              <Text style={styles.memberName} numberOfLines={1}>
                {member.full_name.split(' ')[0]}
              </Text>
            </View>
          ))}
        </ScrollView>

        <SectionTitle title="Próximos compromissos" onSeeAll={() => router.push('/(tabs)/calendar')} />
        <Card style={styles.sectionCard}>
          {events.length === 0 ? (
            <EmptyState icon="calendar-outline" title="Nenhum compromisso" description="Sua agenda está livre por enquanto." />
          ) : (
            events.map((event, index) => (
              <View key={event.id} style={[styles.row, index > 0 && styles.rowBorder]}>
                <View style={[styles.dot, { backgroundColor: event.responsible?.color ?? Colors.primary }]} />
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>{event.title}</Text>
                  <Text style={styles.rowSubtitle}>
                    {formatTime(event.start_at)} · {event.responsible?.full_name ?? 'Família toda'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>

        <SectionTitle title="Tarefas de hoje" onSeeAll={() => router.push('/(tabs)/tasks')} />
        <Card style={styles.sectionCard}>
          {todayTasks.length === 0 ? (
            <EmptyState icon="checkmark-done-outline" title="Tudo em dia!" description="Nenhuma tarefa pendente para hoje." />
          ) : (
            todayTasks.map((task, index) => (
              <View key={task.id} style={[styles.row, index > 0 && styles.rowBorder]}>
                <Checkbox checked={task.status === 'completed'} onPress={() => toggleTask(task.id, task.status === 'completed')} />
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>{task.title}</Text>
                  {task.assignee ? <Text style={styles.rowSubtitle}>{task.assignee.full_name}</Text> : null}
                </View>
              </View>
            ))
          )}
        </Card>

        <SectionTitle title="Rotinas de hoje" onSeeAll={() => router.push('/routines')} />
        <Card style={styles.sectionCard}>
          {routines.length === 0 ? (
            <EmptyState icon="repeat-outline" title="Nenhuma rotina hoje" />
          ) : (
            routines.map((routine, index) => (
              <View key={routine.id} style={[styles.row, index > 0 && styles.rowBorder]}>
                <Checkbox checked={routine.completedToday} onPress={() => toggleRoutine(routine.id, routine.completedToday)} />
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>{routine.title}</Text>
                  <Text style={styles.rowSubtitle}>
                    {formatTimeFromString(routine.time_of_day)} {routine.assignee ? `· ${routine.assignee.full_name}` : ''}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>

        {importantPosts.length > 0 ? (
          <>
            <SectionTitle title="Recados importantes" onSeeAll={() => router.push('/mural')} />
            <Card style={styles.sectionCard}>
              {importantPosts.map((post, index) => (
                <View key={post.id} style={[styles.row, index > 0 && styles.rowBorder]}>
                  <Ionicons name="alert-circle" size={20} color={Colors.warning} />
                  <View style={styles.rowContent}>
                    <Text style={styles.rowTitle} numberOfLines={2}>
                      {post.content}
                    </Text>
                    <Text style={styles.rowSubtitle}>{post.author?.full_name ?? 'Família'}</Text>
                  </View>
                </View>
              ))}
            </Card>
          </>
        ) : null}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll ? (
        <Text style={styles.sectionAction} onPress={onSeeAll}>
          Ver todos
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.lg, gap: Spacing.sm },
  header: { marginBottom: Spacing.sm },
  greeting: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  date: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  membersRow: { marginBottom: Spacing.md },
  memberItem: { alignItems: 'center', marginRight: Spacing.lg, width: 56 },
  memberName: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  sectionAction: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  sectionCard: { padding: 0, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  rowBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: FontSize.md, color: Colors.text, fontWeight: '600' },
  rowSubtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: Radius.pill },
});
