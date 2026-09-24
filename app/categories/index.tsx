import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { useApp } from '@/context/app-context';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import * as familiesService from '@/services/families';
import { getErrorMessage } from '@/utils/errors';
import type { Category } from '@/types/models';

const CATEGORY_COLORS = ['#0EA5E9', '#8B5CF6', '#EF4444', '#10B981', '#64748B', '#F97316'];

export default function CategoriesScreen() {
  const { family } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [colorIndex, setColorIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  function load() {
    if (!family) return;
    familiesService
      .listCategories(family.id)
      .then(setCategories)
      .catch((err) => Alert.alert('Erro', getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, [family]);

  async function handleAdd() {
    if (!family || !name.trim()) return;
    setSaving(true);
    try {
      await familiesService.createCategory(family.id, name, CATEGORY_COLORS[colorIndex]);
      setName('');
      load();
    } catch (err) {
      Alert.alert('Não foi possível adicionar', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(category: Category) {
    Alert.alert('Excluir categoria', `Remover "${category.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await familiesService.deleteCategory(category.id);
            load();
          } catch (err) {
            Alert.alert('Erro', getErrorMessage(err));
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Categorias" />
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={load}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="pricetags-outline" title="Nenhuma categoria" />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={styles.name}>{item.name}</Text>
            <Pressable onPress={() => confirmDelete(item)} hitSlop={8}>
              <Ionicons name="trash-outline" size={18} color={Colors.danger} />
            </Pressable>
          </View>
        )}
      />

      <View style={styles.footer}>
        <TextField placeholder="Nova categoria" value={name} onChangeText={setName} />
        <View style={styles.colorRow}>
          {CATEGORY_COLORS.map((color, index) => (
            <Pressable
              key={color}
              onPress={() => setColorIndex(index)}
              style={[styles.colorSwatch, { backgroundColor: color }, colorIndex === index && styles.colorSwatchSelected]}
            />
          ))}
        </View>
        <Button label="Adicionar categoria" onPress={handleAdd} loading={saving} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.lg, gap: Spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
  name: { flex: 1, fontSize: FontSize.md, color: Colors.text, fontWeight: '600' },
  footer: { padding: Spacing.lg, gap: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  colorRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  colorSwatch: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'transparent' },
  colorSwatchSelected: { borderColor: Colors.text },
});
