import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useApp } from '@/context/app-context';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

export default function WelcomeScreen() {
  const { signOut } = useApp();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Image source={require('@/assets/images/icon.png')} style={styles.logoIcon} resizeMode="contain" />
        <Text style={styles.title}>Vamos organizar sua família</Text>
        <Text style={styles.subtitle}>
          Crie uma nova família ou entre em uma existente usando um código de convite.
        </Text>
      </View>

      <Pressable onPress={() => router.push('/(onboarding)/create-family')}>
        <Card style={styles.optionCard}>
          <View style={[styles.iconCircle, { backgroundColor: Colors.primaryLight }]}>
            <Ionicons name="home" size={24} color={Colors.primary} />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Criar uma família</Text>
            <Text style={styles.optionDescription}>Comece do zero e convide os outros membros depois</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </Card>
      </Pressable>

      <Pressable onPress={() => router.push('/(onboarding)/join-family')}>
        <Card style={styles.optionCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#FFEDD5' }]}>
            <Ionicons name="key" size={22} color="#F97316" />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Entrar com um código</Text>
            <Text style={styles.optionDescription}>Já tenho um código de convite de família</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </Card>
      </Pressable>

      <Button label="Sair" variant="ghost" onPress={signOut} style={styles.signOut} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.xl, gap: Spacing.md },
  header: { alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg, marginTop: Spacing.xl },
  logoIcon: { width: 72, height: 72, borderRadius: Radius.lg },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center' },
  optionCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconCircle: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  optionText: { flex: 1 },
  optionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  optionDescription: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  signOut: { marginTop: 'auto' },
});
