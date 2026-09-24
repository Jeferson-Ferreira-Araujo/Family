import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Fab } from '@/components/ui/Fab';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TextField } from '@/components/ui/TextField';
import { useApp } from '@/context/app-context';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useLists } from '@/hooks/use-lists';
import * as listsService from '@/services/lists';
import { getErrorMessage } from '@/utils/errors';

const LIST_COLORS = ['#0EA5E9', '#EF4444', '#8B5CF6', '#10B981', '#F97316'];
const LIST_ICONS = ['cart', 'medkit', 'airplane', 'home', 'school'];

export default function ListsScreen() {
  const { family, profile } = useApp();
  const { lists, loading, reload } = useLists(family?.id ?? null);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [colorIndex, setColorIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!family || !name.trim()) return;
    setSaving(true);
    try {
      const list = await listsService.createList({
        family_id: family.id,
        name: name.trim(),
        color: LIST_COLORS[colorIndex],
        icon: LIST_ICONS[colorIndex],
        created_by: profile?.id ?? null,
      });
      setModalVisible(false);
      setName('');
      reload();
      router.push(`/lists/${list.id}`);
    } catch (err) {
      Alert.alert('Não foi possível criar a lista', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Listas</Text>
      </View>

      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={reload}
        ListEmptyComponent={
          <EmptyState icon="list-outline" title="Nenhuma lista ainda" description="Crie listas como Mercado, Farmácia ou Viagem." />
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/lists/${item.id}`)}>
            <Card style={styles.listCard}>
              <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
                <Ionicons name={(item.icon as any) ?? 'list'} size={20} color="#fff" />
              </View>
              <View style={styles.listInfo}>
                <Text style={styles.listName}>{item.name}</Text>
                <Text style={styles.listProgressLabel}>
                  {item.totalItems === 0
                    ? 'Sem itens'
                    : `${item.checkedItems} de ${item.totalItems} itens comprados`}
                </Text>
                {item.totalItems > 0 ? (
                  <ProgressBar progress={item.checkedItems / item.totalItems} color={item.color} />
                ) : null}
              </View>
            </Card>
          </Pressable>
        )}
      />

      <Fab onPress={() => setModalVisible(true)} />

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nova lista</Text>
            <TextField placeholder="Ex.: Mercado" value={name} onChangeText={setName} autoFocus />
            <View style={styles.colorRow}>
              {LIST_COLORS.map((color, index) => (
                <Pressable
                  key={color}
                  onPress={() => setColorIndex(index)}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    colorIndex === index && styles.colorSwatchSelected,
                  ]}
                />
              ))}
            </View>
            <View style={styles.modalActions}>
              <Button label="Cancelar" variant="ghost" onPress={() => setModalVisible(false)} fullWidth={false} style={styles.modalButton} />
              <Button label="Criar" onPress={handleCreate} loading={saving} fullWidth={false} style={styles.modalButton} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100, gap: Spacing.sm },
  listCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconCircle: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  listInfo: { flex: 1, gap: 6 },
  listName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  listProgressLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  colorRow: { flexDirection: 'row', gap: Spacing.md },
  colorSwatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: 'transparent' },
  colorSwatchSelected: { borderColor: Colors.text },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm, marginTop: Spacing.sm },
  modalButton: { paddingHorizontal: Spacing.lg },
});
