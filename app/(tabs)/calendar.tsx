import { Ionicons } from '@expo/vector-icons';
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Fab } from '@/components/ui/Fab';
import { useApp } from '@/context/app-context';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { useEventsRange } from '@/hooks/use-events';
import { formatTime, WEEKDAY_LABELS } from '@/utils/date';

type ViewMode = 'day' | 'week' | 'month';

export default function CalendarScreen() {
  const { family } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [visibleMonth, setVisibleMonth] = useState(new Date());

  const rangeStart = useMemo(() => startOfMonth(addMonths(visibleMonth, -1)), [visibleMonth]);
  const rangeEnd = useMemo(() => endOfMonth(addMonths(visibleMonth, 1)), [visibleMonth]);

  const { events, loading, reload } = useEventsRange(
    family?.id ?? null,
    rangeStart.toISOString(),
    rangeEnd.toISOString()
  );

  const eventsByDay = useMemo(() => {
    const map = new Map<string, typeof events>();
    for (const event of events) {
      const key = format(new Date(event.start_at), 'yyyy-MM-dd');
      map.set(key, [...(map.get(key) ?? []), event]);
    }
    return map;
  }, [events]);

  const selectedKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedEvents = (eventsByDay.get(selectedKey) ?? []).sort(
    (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
  );

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [visibleMonth]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendário</Text>
        <View style={styles.modeRow}>
          <Chip label="Dia" selected={viewMode === 'day'} onPress={() => setViewMode('day')} />
          <Chip label="Semana" selected={viewMode === 'week'} onPress={() => setViewMode('week')} />
          <Chip label="Mês" selected={viewMode === 'month'} onPress={() => setViewMode('month')} />
        </View>
      </View>

      {viewMode === 'month' ? (
        <View style={styles.monthNav}>
          <Pressable onPress={() => setVisibleMonth(addMonths(visibleMonth, -1))} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </Pressable>
          <Text style={styles.monthLabel}>{format(visibleMonth, 'MMMM yyyy', { locale: ptBR })}</Text>
          <Pressable onPress={() => setVisibleMonth(addMonths(visibleMonth, 1))} hitSlop={8}>
            <Ionicons name="chevron-forward" size={22} color={Colors.text} />
          </Pressable>
        </View>
      ) : null}

      {viewMode === 'week' || viewMode === 'day' ? (
        <View style={styles.weekNavRow}>
          <Pressable onPress={() => setSelectedDate(addWeeks(selectedDate, -1))} hitSlop={8}>
            <Ionicons name="chevron-back" size={20} color={Colors.text} />
          </Pressable>
          <View style={styles.weekStrip}>
            {weekDays.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              return (
                <Pressable key={day.toISOString()} style={styles.dayCell} onPress={() => setSelectedDate(day)}>
                  <Text style={styles.dayLabel}>{WEEKDAY_LABELS[day.getDay()]}</Text>
                  <View style={[styles.dayNumberWrap, isSelected && styles.dayNumberSelected]}>
                    <Text style={[styles.dayNumber, isSelected && styles.dayNumberTextSelected]}>{day.getDate()}</Text>
                  </View>
                  {eventsByDay.get(format(day, 'yyyy-MM-dd'))?.length ? <View style={styles.eventDot} /> : null}
                </Pressable>
              );
            })}
          </View>
          <Pressable onPress={() => setSelectedDate(addWeeks(selectedDate, 1))} hitSlop={8}>
            <Ionicons name="chevron-forward" size={20} color={Colors.text} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.monthGrid}>
          {WEEKDAY_LABELS.map((label) => (
            <Text key={label} style={styles.monthWeekdayLabel}>
              {label}
            </Text>
          ))}
          {monthDays.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const isSelected = isSameDay(day, selectedDate);
            const inMonth = isSameMonth(day, visibleMonth);
            return (
              <Pressable
                key={key}
                style={styles.monthCell}
                onPress={() => {
                  setSelectedDate(day);
                }}>
                <View style={[styles.monthDayCircle, isSelected && styles.dayNumberSelected]}>
                  <Text style={[styles.monthDayText, !inMonth && styles.monthDayMuted, isSelected && styles.dayNumberTextSelected]}>
                    {day.getDate()}
                  </Text>
                </View>
                {eventsByDay.get(key)?.length ? <View style={styles.eventDot} /> : null}
              </Pressable>
            );
          })}
        </View>
      )}

      <Text style={styles.selectedDateLabel}>
        {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
      </Text>

      <FlatList
        contentContainerStyle={styles.list}
        data={selectedEvents}
        keyExtractor={(item) => item.id}
        onRefresh={reload}
        refreshing={loading}
        ListEmptyComponent={<EmptyState icon="calendar-outline" title="Nenhum evento neste dia" />}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/events/${item.id}`)}>
            <Card style={styles.eventCard}>
              <View style={[styles.eventBar, { backgroundColor: item.responsible?.color ?? Colors.primary }]} />
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventTime}>
                  {item.all_day ? 'Dia inteiro' : `${formatTime(item.start_at)}${item.end_at ? ` – ${formatTime(item.end_at)}` : ''}`}
                </Text>
                {item.location ? <Text style={styles.eventLocation}>{item.location}</Text> : null}
              </View>
            </Card>
          </Pressable>
        )}
      />

      <Fab onPress={() => router.push('/events/new')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  modeRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md, marginBottom: Spacing.sm },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  monthLabel: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, textTransform: 'capitalize' },
  weekNavRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.sm },
  weekStrip: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  dayCell: { alignItems: 'center', gap: 4, width: 40 },
  dayLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  dayNumberWrap: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  dayNumberSelected: { backgroundColor: Colors.primary },
  dayNumber: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  dayNumberTextSelected: { color: '#fff' },
  eventDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 2 },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md },
  monthWeekdayLabel: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  monthCell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 4, gap: 2 },
  monthDayCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  monthDayText: { fontSize: FontSize.sm, color: Colors.text },
  monthDayMuted: { color: Colors.textMuted },
  selectedDateLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'capitalize',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100, gap: Spacing.sm },
  eventCard: { flexDirection: 'row', padding: 0, overflow: 'hidden' },
  eventBar: { width: 6 },
  eventInfo: { flex: 1, padding: Spacing.md },
  eventTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  eventTime: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  eventLocation: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
});
