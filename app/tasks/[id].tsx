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
import * as familiesService from '@/services/families';
import { cancelScheduledNotification, minutesBeforeToDate, scheduleLocalNotification } from '@/services/notifications';
import * as tasksService from '@/services/tasks';
import { parseISO, toDateOnly } from '@/utils/date';
import { getErrorMessage } from '@/utils/errors';
import type { Category, RecurrenceRule } from '@/types/models';

const RECURRENCE_OPTIONS: { value: RecurrenceRule; label: string }[] = [
  { value: 'none', label: 'Não repetir' },
  { value: 'daily', label: 'Todo dia' },
  { value: 'weekly', label: 'Toda semana' },
  { value: 'monthly', label: 'Todo mês' },
];

const REMINDER_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: 'Sem lembrete' },
  { value: 15, label: '15 min antes' },
  { value: 60, label: '1 hora antes' },
  { value: 1440, label: '1 dia antes' },
];

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { family, members } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'completed'>('pending');
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState(new Date());
  const [hasDueTime, setHasDueTime] = useState(false);
  const [dueTime, setDueTime] = useState(new Date());
  const [recurrence, setRecurrence] = useState<RecurrenceRule>('none');
  const [reminder, setReminder] = useState<number | null>(null);

  useEffect(() => {
    if (family) familiesService.listCategories(family.id).then(setCategories).catch(() => {});
  }, [family]);

  useEffect(() => {
    if (!id) return;
    tasksService
      .getTask(id)
      .then((task: any) => {
        setTitle(task.title);
        setDescription(task.description ?? '');
        setStatus(task.status);
        setAssigneeId(task.assignee_id);
        setCategoryId(task.category_id);
        setHasDueDate(!!task.due_date);
        if (task.due_date) setDueDate(parseISO(task.due_date));
        setHasDueTime(!!task.due_time);
        if (task.due_time) {
          const [h, m] = task.due_time.split(':');
          const t = new Date();
          t.setHours(Number(h), Number(m), 0, 0);
          setDueTime(t);
        }
        setRecurrence(task.recurrence_rule);
        setReminder(task.reminder_minutes_before);
      })
      .catch((err) => Alert.alert('Erro', getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    if (!id || !title.trim()) return;
    setSaving(true);
    try {
      await tasksService.updateTask(id, {
        title: title.trim(),
        description: description.trim() || null,
        assignee_id: assigneeId,
        category_id: categoryId,
        due_date: hasDueDate ? toDateOnly(dueDate) : null,
        due_time: hasDueDate && hasDueTime ? dueTime.toTimeString().slice(0, 5) : null,
        recurrence_rule: recurrence,
        reminder_minutes_before: reminder,
      });

      await cancelScheduledNotification(`task-${id}`);
      if (reminder !== null && hasDueDate) {
        const target = new Date(dueDate);
        if (hasDueTime) target.setHours(dueTime.getHours(), dueTime.getMinutes(), 0, 0);
        else target.setHours(9, 0, 0, 0);
        await scheduleLocalNotification({
          title: 'Tarefa pendente',
          body: title.trim(),
          triggerDate: minutesBeforeToDate(target, reminder),
          identifier: `task-${id}`,
        });
      }

      router.back();
    } catch (err) {
      Alert.alert('Não foi possível salvar', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus() {
    if (!id) return;
    const next = status === 'completed' ? 'pending' : 'completed';
    setStatus(next);
    try {
      await tasksService.setTaskStatus(id, next);
    } catch (err) {
      setStatus(status);
      Alert.alert('Erro', getErrorMessage(err));
    }
  }

  function confirmDelete() {
    Alert.alert('Excluir tarefa', 'Esta ação não pode ser desfeita. Deseja continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await tasksService.deleteTask(id);
            await cancelScheduledNotification(`task-${id}`);
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
      <ScreenHeader title="Editar tarefa" rightIcon="trash-outline" onRightPress={confirmDelete} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Button
          label={status === 'completed' ? 'Marcar como pendente' : 'Marcar como concluída'}
          variant={status === 'completed' ? 'secondary' : 'primary'}
          onPress={toggleStatus}
        />

        <TextField label="Título" value={title} onChangeText={setTitle} />
        <TextField
          label="Descrição (opcional)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ height: 80, textAlignVertical: 'top', paddingTop: Spacing.sm }}
        />

        <MemberPicker
          label="Responsável"
          members={members}
          selectedIds={assigneeId ? [assigneeId] : []}
          onToggle={(mid) => setAssigneeId((prev) => (prev === mid ? null : mid))}
        />

        <View style={styles.row}>
          <Text style={styles.label}>Tem data prevista</Text>
          <Switch value={hasDueDate} onValueChange={setHasDueDate} trackColor={{ true: Colors.primary }} />
        </View>
        {hasDueDate ? <DateTimeField label="Data" value={dueDate} mode="date" onChange={setDueDate} /> : null}
        {hasDueDate ? (
          <View style={styles.row}>
            <Text style={styles.label}>Definir horário</Text>
            <Switch value={hasDueTime} onValueChange={setHasDueTime} trackColor={{ true: Colors.primary }} />
          </View>
        ) : null}
        {hasDueDate && hasDueTime ? <DateTimeField label="Horário" value={dueTime} mode="time" onChange={setDueTime} /> : null}

        <View style={styles.section}>
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.chipRow}>
            {categories.map((cat) => (
              <Chip key={cat.id} label={cat.name} color={cat.color} selected={categoryId === cat.id} onPress={() => setCategoryId((prev) => (prev === cat.id ? null : cat.id))} />
            ))}
          </View>
        </View>

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
  section: { gap: Spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  saveButton: { marginTop: Spacing.md },
});
