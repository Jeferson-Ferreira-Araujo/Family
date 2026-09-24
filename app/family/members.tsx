import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { MemberAvatar } from '@/components/ui/MemberAvatar';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { useApp } from '@/context/app-context';
import { Colors, FontSize, MemberColors, Radius, Spacing } from '@/constants/theme';
import * as familiesService from '@/services/families';
import { getErrorMessage } from '@/utils/errors';

export default function FamilyMembersScreen() {
  const { members, isAdmin, refresh } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [childName, setChildName] = useState('');
  const [colorIndex, setColorIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  async function handleAddChild() {
    if (!childName.trim()) return;
    setSaving(true);
    try {
      await familiesService.addChildProfile(childName, MemberColors[colorIndex]);
      setChildName('');
      setModalVisible(false);
      await refresh();
    } catch (err) {
      Alert.alert('Não foi possível adicionar', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function confirmRemove(memberId: string, name: string) {
    Alert.alert('Remover membro', `Deseja remover ${name} da família?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await familiesService.removeProfile(memberId);
            await refresh();
          } catch (err) {
            Alert.alert('Não foi possível remover', getErrorMessage(err));
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.flex}>
      <ScreenHeader
        title="Membros da família"
        rightIcon={isAdmin ? 'person-add-outline' : undefined}
        onRightPress={() => router.push('/family/invite')}
      />

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.memberRow}>
            <MemberAvatar name={item.full_name} color={item.color} avatarUrl={item.avatar_url} isChild={item.is_child} size={48} />
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{item.full_name}</Text>
              <Text style={styles.memberRole}>
                {item.role === 'admin' ? 'Administrador' : item.is_child ? 'Criança' : 'Membro'}
              </Text>
            </View>
            {isAdmin && item.is_child ? (
              <Pressable onPress={() => confirmRemove(item.id, item.full_name)} hitSlop={8}>
                <Ionicons name="trash-outline" size={20} color={Colors.danger} />
              </Pressable>
            ) : null}
          </View>
        )}
      />

      {isAdmin ? (
        <View style={styles.footer}>
          <Button label="Adicionar perfil infantil" variant="secondary" onPress={() => setModalVisible(true)} />
          <Button label="Convidar por código" onPress={() => router.push('/family/invite')} style={{ marginTop: Spacing.sm }} />
        </View>
      ) : null}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Adicionar perfil infantil</Text>
            <TextField placeholder="Nome da criança" value={childName} onChangeText={setChildName} autoFocus />
            <View style={styles.colorRow}>
              {MemberColors.map((color, index) => (
                <Pressable
                  key={color}
                  onPress={() => setColorIndex(index)}
                  style={[styles.colorSwatch, { backgroundColor: color }, colorIndex === index && styles.colorSwatchSelected]}
                />
              ))}
            </View>
            <View style={styles.modalActions}>
              <Button label="Cancelar" variant="ghost" onPress={() => setModalVisible(false)} fullWidth={false} style={styles.modalButton} />
              <Button label="Adicionar" onPress={handleAddChild} loading={saving} fullWidth={false} style={styles.modalButton} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.lg, gap: Spacing.sm },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  memberInfo: { flex: 1 },
  memberName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  memberRole: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  footer: { padding: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  colorRow: { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' },
  colorSwatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: 'transparent' },
  colorSwatchSelected: { borderColor: Colors.text },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm },
  modalButton: { paddingHorizontal: Spacing.lg },
});
