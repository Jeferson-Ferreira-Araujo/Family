import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Fab } from '@/components/ui/Fab';
import { MemberAvatar } from '@/components/ui/MemberAvatar';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { useApp } from '@/context/app-context';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { usePosts } from '@/hooks/use-posts';
import * as postsService from '@/services/posts';
import { formatDateShort, formatTime } from '@/utils/date';
import { getErrorMessage } from '@/utils/errors';
import type { PostWithAuthor } from '@/types/models';

export default function MuralScreen() {
  const { family, profile, isAdmin } = useApp();
  const { posts, loading, reload } = usePosts(family?.id ?? null);
  const [modalVisible, setModalVisible] = useState(false);
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!family || !content.trim()) return;
    setSaving(true);
    try {
      await postsService.createPost(family.id, profile?.id ?? null, content, isImportant);
      setContent('');
      setIsImportant(false);
      setModalVisible(false);
      reload();
    } catch (err) {
      Alert.alert('Não foi possível publicar', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(post: PostWithAuthor) {
    const canDelete = isAdmin || post.author_id === profile?.id;
    if (!canDelete) return;
    Alert.alert('Excluir recado', 'Deseja excluir este recado?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await postsService.deletePost(post.id);
            reload();
          } catch (err) {
            Alert.alert('Erro', getErrorMessage(err));
          }
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Mural da família" />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={reload}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="megaphone-outline" title="Nenhum recado ainda" description="Deixe um aviso para a família." />}
        renderItem={({ item }) => (
          <Pressable onLongPress={() => confirmDelete(item)}>
            <Card style={[styles.postCard, item.is_important && styles.postCardImportant]}>
              {item.is_important ? (
                <View style={styles.importantBadge}>
                  <Ionicons name="alert-circle" size={14} color="#fff" />
                  <Text style={styles.importantText}>Importante</Text>
                </View>
              ) : null}
              <Text style={styles.postContent}>{item.content}</Text>
              <View style={styles.postFooter}>
                <MemberAvatar name={item.author?.full_name ?? '?'} color={item.author?.color} avatarUrl={item.author?.avatar_url} size={24} />
                <Text style={styles.postMeta}>
                  {item.author?.full_name ?? 'Família'} · {formatDateShort(item.created_at)} {formatTime(item.created_at)}
                </Text>
              </View>
            </Card>
          </Pressable>
        )}
      />

      <Fab onPress={() => setModalVisible(true)} icon="create-outline" />

      {modalVisible ? (
        <View style={styles.composer}>
          <TextField
            placeholder="Escreva um recado para a família..."
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={3}
            style={{ height: 90, textAlignVertical: 'top', paddingTop: Spacing.sm }}
            autoFocus
          />
          <View style={styles.composerRow}>
            <View style={styles.importantToggle}>
              <Text style={styles.label}>Marcar como importante</Text>
              <Switch value={isImportant} onValueChange={setIsImportant} trackColor={{ true: Colors.warning }} />
            </View>
          </View>
          <View style={styles.composerActions}>
            <Button label="Cancelar" variant="ghost" onPress={() => setModalVisible(false)} fullWidth={false} style={styles.composerButton} />
            <Button label="Publicar" onPress={handleCreate} loading={saving} fullWidth={false} style={styles.composerButton} />
          </View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.lg, paddingBottom: 100, gap: Spacing.sm },
  postCard: { gap: Spacing.sm },
  postCardImportant: { borderWidth: 1, borderColor: Colors.warning },
  importantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.warning,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  importantText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '700' },
  postContent: { fontSize: FontSize.md, color: Colors.text },
  postFooter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  postMeta: { fontSize: FontSize.xs, color: Colors.textSecondary },
  composer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  composerRow: { flexDirection: 'row' },
  importantToggle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  composerActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm },
  composerButton: { paddingHorizontal: Spacing.lg },
});
