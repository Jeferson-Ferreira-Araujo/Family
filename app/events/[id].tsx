import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { LoadingView } from '@/components/ui/LoadingView';
import { MemberPicker } from '@/components/ui/MemberPicker';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { useApp } from '@/context/app-context';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import * as eventsService from '@/services/events';
import { cancelScheduledNotification, minutesBeforeToDate, scheduleLocalNotification } from '@/services/notifications';
import { getErrorMessage } from '@/utils/errors';
import type { RecurrenceRule } from '@/types/models';

const RECURRENCE_OPTIONS: { value: RecurrenceRule; label: string }[] = [
  { value: 'none', label: 'Não repetir' },
  { value: 'daily', label: 'Todo dia' },
  { value: 'weekly', label: 'Toda semana' },
  { value: 'monthly', label: 'Todo mês' },
];

const REMINDER_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: 'Sem lembrete' },
  { value: 15, label: '15 min antes' },
  { value: 30, label: '30 min antes' },
  { value: 60, label: '1 hora antes' },
  { value: 1440, label: '1 dia antes' },
];

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { members } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [allDay, setAllDay] = useState(false);
  const [responsibleId, setResponsibleId] = useState<string | null>(null);
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [recurrence, setRecurrence] = useState<RecurrenceRule>('none');
  const [reminder, setReminder] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    eventsService
      .getEvent(id)
      .then((event) => {
        const start = new Date(event.start_at);
        setTitle(event.title);
        setDescription(event.description ?? '');
        setLocation(event.location ?? '');
        setDate(start);
        setStartTime(start);
        setEndTime(event.end_at ? new Date(event.end_at) : new Date(start.getTime() + 60 * 60 * 1000));
        setAllDay(event.all_day);
        setResponsibleId(event.responsible_id);
        setParticipantIds(event.participants.map((p: { id: string }) => p.id));
        setRecurrence(event.recurrence_rule as RecurrenceRule);
        setReminder(event.reminder_minutes_before);
      })
      .catch((err) => Alert.alert('Erro', getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  function combineDateAndTime(base: Date, time: Date) {
    const result = new Date(base);
    result.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return result;
  }

  async function handleSave() {
    if (!id || !title.trim()) return;
    const startAt = allDay ? new Date(new Date(date).setHours(0, 0, 0, 0)) : combineDateAndTime(date, startTime);
    const endAt = allDay ? null : combineDateAndTime(date, endTime);

    setSaving(true);
    try {
      await eventsService.updateEvent(
        id,
        {
          title: title.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
          start_at: startAt.toISOString(),
          end_at: endAt ? endAt.toISOString() : null,
          all_day: allDay,
          recurrence_rule: recurrence,
          reminder_minutes_before: reminder,
          responsible_id: responsibleId,
        },
        participantIds
      );

      await cancelScheduledNotification(`event-${id}`);
      if (reminder !== null) {
        await scheduleLocalNotification({
          title: 'Compromisso em breve',
          body: title.trim(),
          triggerDate: minutesBeforeToDate(startAt, reminder),
          identifier: `event-${id}`,
        });
      }

      router.back();
    } catch (err) {
      Alert.alert('Não foi possível salvar', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    Alert.alert('Excluir evento', 'Esta ação não pode ser desfeita. Deseja continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await eventsService.deleteEvent(id);
            await cancelScheduledNotification(`event-${id}`);
            router.back();
          } catch (err) {
            Alert.alert('Não foi possível excluir', getErrorMessage(err));
          }
        },
      },
    ]);
  }

  if (loading) return <LoadingView />;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Editar evento" rightIcon="trash-outline" onRightPress={confirmDelete} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TextField label="Título" value={title} onChangeText={setTitle} />
        <TextField
          label="Descrição (opcional)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ height: 80, textAlignVertical: 'top', paddingTop: Spacing.sm }}
        />
        <TextField label="Local (opcional)" value={location} onChangeText={setLocation} />

        <View style={styles.row}>
          <Text style={styles.label}>Dia inteiro</Text>
          <Switch value={allDay} onValueChange={setAllDay} trackColor={{ true: Colors.primary }} />
        </View>

        <DateTimeField label="Data" value={date} mode="date" onChange={setDate} />

        {!allDay ? (
          <View style={styles.timeRow}>
            <DateTimeField label="Início" value={startTime} mode="time" onChange={setStartTime} />
            <DateTimeField label="Término" value={endTime} mode="time" onChange={setEndTime} />
          </View>
        ) : null}

        <MemberPicker
          label="Responsável"
          members={members}
          selectedIds={responsibleId ? [responsibleId] : []}
          onToggle={(mid) => setResponsibleId((prev) => (prev === mid ? null : mid))}
        />
        <MemberPicker
          label="Participantes"
          members={members}
          selectedIds={participantIds}
          onToggle={(mid) => setParticipantIds((prev) => (prev.includes(mid) ? prev.filter((p) => p !== mid) : [...prev, mid]))}
        />

        <View style={styles.section}>
          <Text style={styles.label}>Recorrência</Text>
          <View style={styles.chipRow}>
            {RECURRENCE_OPTIONS.map((opt) => (
              <Chip key={opt.value} label={opt.label} selected={recurrence === opt.value} onPress={() => setRecurrence(opt.value)} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Lembrete</Text>
          <View style={styles.chipRow}>
            {REMINDER_OPTIONS.map((opt) => (
              <Chip key={opt.label} label={opt.label} selected={reminder === opt.value} onPress={() => setReminder(opt.value)} />
            ))}
          </View>
        </View>

        <Button label="Salvar alterações" onPress={handleSave} loading={saving} style={styles.saveButton} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xxl },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  timeRow: { flexDirection: 'row', gap: Spacing.md },
  section: { gap: Spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  saveButton: { marginTop: Spacing.md },
});
