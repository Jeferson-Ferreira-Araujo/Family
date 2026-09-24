import { Alert, FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Fab } from '@/components/ui/Fab';
import { MemberAvatar } from '@/components/ui/MemberAvatar';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useApp } from '@/context/app-context';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { useAllRoutines } from '@/hooks/use-routines';
import * as routinesService from '@/services/routines';
import { WEEKDAY_LABELS, formatTimeFromString } from '@/utils/date';
import { getErrorMessage } from '@/utils/errors';

export default function RoutinesScreen() {
  const { family } = useApp();
  const { routines, loading, reload } = useAllRoutines(family?.id ?? null);

  async function toggleActive(routineId: string, active: boolean) {
    try {
      await routinesService.updateRoutine(routineId, { active: !active });
      reload();
    } catch (err) {
      Alert.alert('Erro', getErrorMessage(err));
    }
  }

  function confirmDelete(routineId: string) {
    Alert.alert('Excluir rotina', 'Todo o histórico de conclusões também será removido. Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await routinesService.deleteRoutine(routineId);
            reload();
          } catch (err) {
            Alert.alert('Não foi possível excluir', getErrorMessage(err));
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Rotinas" />
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={reload}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState icon="repeat-outline" title="Nenhuma rotina cadastrada" description="Crie rotinas como arrumar a mochila ou tomar vitaminas." />
        }
        renderItem={({ item }) => (
          <Pressable onLongPress={() => confirmDelete(item.id)}>
            <Card style={styles.card}>
              <View style={[styles.colorBar, { backgroundColor: item.color }]} />
              <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>
                  {formatTimeFromString(item.time_of_day)} · {item.days_of_week.length === 7 ? 'Todos os dias' : item.days_of_week.map((d: number) => WEEKDAY_LABELS[d]).join(', ')}
                </Text>
              </View>
              {item.assignee ? (
                <MemberAvatar name={item.assignee.full_name} color={item.assignee.color} avatarUrl={item.assignee.avatar_url} size={32} />
              ) : null}
              <Switch value={item.active} onValueChange={() => toggleActive(item.id, item.active)} trackColor={{ true: Colors.primary }} />
            </Card>
          </Pressable>
        )}
      />
      <Fab onPress={() => router.push('/routines/new')} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.lg, paddingBottom: 100, gap: Spacing.sm },
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: 0, overflow: 'hidden' },
  colorBar: { width: 6, alignSelf: 'stretch' },
  info: { flex: 1, paddingVertical: Spacing.md },
  title: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
});
