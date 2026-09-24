import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { MemberPicker } from '@/components/ui/MemberPicker';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { useApp } from '@/context/app-context';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import * as familiesService from '@/services/families';
import { minutesBeforeToDate, scheduleLocalNotification } from '@/services/notifications';
import * as tasksService from '@/services/tasks';
import { toDateOnly } from '@/utils/date';
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

export default function NewTaskScreen() {
  const { family, profile, members } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | null>(profile?.id ?? null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hasDueDate, setHasDueDate] = useState(true);
  const [dueDate, setDueDate] = useState(new Date());
  const [hasDueTime, setHasDueTime] = useState(false);
  const [dueTime, setDueTime] = useState(new Date());
  const [recurrence, setRecurrence] = useState<RecurrenceRule>('none');
  const [reminder, setReminder] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (family) familiesService.listCategories(family.id).then(setCategories).catch(() => {});
  }, [family]);

  async function handleSave() {
    if (!family) return;
    if (!title.trim()) {
      Alert.alert('Título obrigatório', 'Dê um título para a tarefa.');
      return;
    }

    setSaving(true);
    try {
      const task = await tasksService.createTask({
        family_id: family.id,
        title: title.trim(),
        description: description.trim() || null,
        assignee_id: assigneeId,
        category_id: categoryId,
        due_date: hasDueDate ? toDateOnly(dueDate) : null,
        due_time: hasDueTime ? dueTime.toTimeString().slice(0, 5) : null,
        recurrence_rule: recurrence,
        reminder_minutes_before: reminder,
        created_by: profile?.id ?? null,
      });

      if (reminder !== null && hasDueDate) {
        const target = new Date(dueDate);
        if (hasDueTime) target.setHours(dueTime.getHours(), dueTime.getMinutes(), 0, 0);
        else target.setHours(9, 0, 0, 0);
        await scheduleLocalNotification({
          title: 'Tarefa pendente',
          body: title.trim(),
          triggerDate: minutesBeforeToDate(target, reminder),
          identifier: `task-${task.id}`,
        });
      }

      router.back();
    } catch (err) {
      Alert.alert('Não foi possível salvar', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Nova tarefa" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TextField label="Título da tarefa" placeholder="Ex.: Organizar mochila" value={title} onChangeText={setTitle} />
        <TextField
          label="Descrição (opcional)"
          placeholder="Detalhes"
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
          onToggle={(id) => setAssigneeId((prev) => (prev === id ? null : id))}
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

        <Button label="Salvar tarefa" onPress={handleSave} loading={saving} style={styles.saveButton} />
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
