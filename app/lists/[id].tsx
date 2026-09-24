import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Checkbox } from '@/components/ui/Checkbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingView } from '@/components/ui/LoadingView';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { useApp } from '@/context/app-context';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { useListItems } from '@/hooks/use-lists';
import * as listsService from '@/services/lists';
import { getErrorMessage } from '@/utils/errors';
import type { List } from '@/types/models';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useApp();
  const [list, setList] = useState<List | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [newItem, setNewItem] = useState('');
  const [adding, setAdding] = useState(false);

  const { items, loading: itemsLoading } = useListItems(id ?? null);

  useEffect(() => {
    if (!id) return;
    listsService
      .getList(id)
      .then(setList)
      .catch((err) => Alert.alert('Erro', getErrorMessage(err)))
      .finally(() => setLoadingList(false));
  }, [id]);

  const checkedCount = items.filter((i) => i.is_checked).length;

  async function handleAddItem() {
    if (!id || !newItem.trim()) return;
    setAdding(true);
    try {
      await listsService.addListItem(id, newItem.trim(), null, profile?.id ?? null);
      setNewItem('');
    } catch (err) {
      Alert.alert('Não foi possível adicionar', getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  }

  async function toggleItem(itemId: string, checked: boolean) {
    try {
      await listsService.setItemChecked(itemId, !checked, profile?.id ?? null);
    } catch (err) {
      Alert.alert('Erro', getErrorMessage(err));
    }
  }

  function confirmRemoveItem(itemId: string) {
    Alert.alert('Remover item', 'Deseja remover este item da lista?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => listsService.deleteListItem(itemId).catch(() => {}) },
    ]);
  }

  function confirmDeleteList() {
    Alert.alert('Excluir lista', 'Todos os itens desta lista serão excluídos. Deseja continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            if (id) await listsService.deleteList(id);
            router.back();
          } catch (err) {
            Alert.alert('Não foi possível excluir', getErrorMessage(err));
          }
        },
      },
    ]);
  }

  if (loadingList || !list) return <LoadingView />;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title={list.name} rightIcon="trash-outline" onRightPress={confirmDeleteList} />

      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>
          {items.length === 0 ? 'Sem itens ainda' : `${checkedCount} de ${items.length} itens comprados`}
        </Text>
        {items.length > 0 ? <ProgressBar progress={checkedCount / items.length} color={list.color} /> : null}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshing={itemsLoading}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="cart-outline" title="Nenhum item ainda" description="Adicione itens abaixo." />}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Checkbox checked={item.is_checked} onPress={() => toggleItem(item.id, item.is_checked)} />
            <Text style={[styles.itemName, item.is_checked && styles.itemNameChecked]}>{item.name}</Text>
            <Pressable onPress={() => confirmRemoveItem(item.id)} hitSlop={8}>
              <Ionicons name="close" size={18} color={Colors.textMuted} />
            </Pressable>
          </View>
        )}
      />

      <View style={styles.addRow}>
        <View style={{ flex: 1 }}>
          <TextField placeholder="Adicionar item..." value={newItem} onChangeText={setNewItem} onSubmitEditing={handleAddItem} returnKeyType="done" />
        </View>
        <Pressable style={[styles.addButton, { backgroundColor: list.color }]} onPress={handleAddItem} disabled={adding}>
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  progressSection: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: Spacing.xs },
  progressLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: Spacing.xs },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: Spacing.md,
  },
  itemName: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  itemNameChecked: { textDecorationLine: 'line-through', color: Colors.textMuted },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  addButton: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
