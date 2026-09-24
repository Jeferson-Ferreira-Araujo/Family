import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MemberAvatar } from '@/components/ui/MemberAvatar';
import { useApp } from '@/context/app-context';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

export default function MoreScreen() {
  const { profile, family, members, signOut } = useApp();

  const items: MenuItem[] = [
    { icon: 'person-outline', label: 'Minha conta', onPress: () => router.push('/account') },
    { icon: 'people-outline', label: 'Membros da família', onPress: () => router.push('/family/members') },
    { icon: 'megaphone-outline', label: 'Mural da família', onPress: () => router.push('/mural') },
    { icon: 'repeat-outline', label: 'Rotinas', onPress: () => router.push('/routines') },
    { icon: 'pricetags-outline', label: 'Categorias', onPress: () => router.push('/categories') },
    { icon: 'notifications-outline', label: 'Notificações', onPress: () => router.push('/notifications') },
  ];

  function confirmSignOut() {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Mais</Text>

        <View style={styles.familyCard}>
          <MemberAvatar name={profile?.full_name ?? '?'} color={profile?.color} avatarUrl={profile?.avatar_url} size={48} />
          <View style={styles.familyInfo}>
            <Text style={styles.familyName}>{family?.name ?? 'Minha família'}</Text>
            <Text style={styles.memberCount}>{members.length} membros</Text>
          </View>
        </View>

        <View style={styles.menu}>
          {items.map((item) => (
            <Pressable key={item.label} style={styles.menuItem} onPress={item.onPress}>
              <Ionicons name={item.icon} size={22} color={Colors.primary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.signOutButton} onPress={confirmSignOut}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.signOutLabel}>Sair</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginBottom: Spacing.lg },
  familyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  familyInfo: { flex: 1 },
  familyName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  memberCount: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  menu: { backgroundColor: Colors.surface, borderRadius: Radius.lg, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuLabel: { flex: 1, fontSize: FontSize.md, color: Colors.text, fontWeight: '500' },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  signOutLabel: { color: Colors.danger, fontSize: FontSize.md, fontWeight: '700' },
});
