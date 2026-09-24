import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { MemberPicker } from '@/components/ui/MemberPicker';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { useApp } from '@/context/app-context';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import * as routinesService from '@/services/routines';
import { WEEKDAY_LABELS } from '@/utils/date';
import { getErrorMessage } from '@/utils/errors';

const ROUTINE_COLORS = ['#3B82F6', '#F97316', '#10B981', '#8B5CF6', '#EF4444'];

export default function NewRoutineScreen() {
  const { family, profile, members } = useApp();
  const [title, setTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [time, setTime] = useState(new Date());
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [colorIndex, setColorIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  function toggleDay(day: number) {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()));
  }

  async function handleSave() {
    if (!family) return;
    if (!title.trim()) {
      Alert.alert('Título obrigatório', 'Dê um nome para a rotina.');
      return;
    }
    if (days.length === 0) {
      Alert.alert('Selecione ao menos um dia', 'A rotina precisa acontecer em pelo menos um dia da semana.');
      return;
    }

    setSaving(true);
    try {
      await routinesService.createRoutine({
        family_id: family.id,
        title: title.trim(),
        color: ROUTINE_COLORS[colorIndex],
        assignee_id: assigneeId,
        time_of_day: time.toTimeString().slice(0, 5),
        days_of_week: days,
        reminder_enabled: reminderEnabled,
        created_by: profile?.id ?? null,
      });
      router.back();
    } catch (err) {
      Alert.alert('Não foi possível salvar', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Nova rotina" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TextField label="Nome da rotina" placeholder="Ex.: Tomar vitaminas" value={title} onChangeText={setTitle} />

        <MemberPicker
          label="Responsável"
          members={members}
          selectedIds={assigneeId ? [assigneeId] : []}
          onToggle={(id) => setAssigneeId((prev) => (prev === id ? null : id))}
        />

        <DateTimeField label="Horário" value={time} mode="time" onChange={setTime} />

        <View style={styles.section}>
          <Text style={styles.label}>Dias da semana</Text>
          <View style={styles.chipRow}>
            {WEEKDAY_LABELS.map((label, index) => (
              <Chip key={label} label={label} selected={days.includes(index)} onPress={() => toggleDay(index)} />
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Lembrete ativado</Text>
          <Switch value={reminderEnabled} onValueChange={setReminderEnabled} trackColor={{ true: Colors.primary }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Cor</Text>
          <View style={styles.chipRow}>
            {ROUTINE_COLORS.map((color, index) => (
              <Pressable
                key={color}
                onPress={() => setColorIndex(index)}
                style={[styles.colorSwatch, { backgroundColor: color }, colorIndex === index && styles.colorSwatchSelected]}
              />
            ))}
          </View>
        </View>

        <Button label="Salvar rotina" onPress={handleSave} loading={saving} style={styles.saveButton} />
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
  colorSwatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 3, borderColor: 'transparent' },
  colorSwatchSelected: { borderColor: Colors.text },
  saveButton: { marginTop: Spacing.md },
});
