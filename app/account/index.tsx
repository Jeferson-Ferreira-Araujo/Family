import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { MemberAvatar } from '@/components/ui/MemberAvatar';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { useApp } from '@/context/app-context';
import { Colors, FontSize, MemberColors, Spacing } from '@/constants/theme';
import * as authService from '@/services/auth';
import * as familiesService from '@/services/families';
import { getErrorMessage } from '@/utils/errors';

export default function AccountScreen() {
  const { profile, refresh } = useApp();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [color, setColor] = useState(profile?.color ?? MemberColors[0]);
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleSaveProfile() {
    if (!profile || !fullName.trim()) return;
    setSavingProfile(true);
    try {
      await familiesService.updateProfile(profile.id, { full_name: fullName.trim(), color });
      await refresh();
      Alert.alert('Perfil atualizado', 'Suas informações foram salvas.');
    } catch (err) {
      Alert.alert('Não foi possível salvar', getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    if (newPassword.length < 6) {
      Alert.alert('Senha muito curta', 'A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setSavingPassword(true);
    try {
      await authService.updatePassword(newPassword);
      setNewPassword('');
      Alert.alert('Senha alterada', 'Sua senha foi atualizada com sucesso.');
    } catch (err) {
      Alert.alert('Não foi possível alterar', getErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Minha conta" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.avatarSection}>
          <MemberAvatar name={fullName || '?'} color={color} avatarUrl={profile?.avatar_url} size={72} />
        </View>

        <Text style={styles.sectionTitle}>Dados pessoais</Text>
        <TextField label="Nome completo" value={fullName} onChangeText={setFullName} />

        <Text style={styles.label}>Cor</Text>
        <View style={styles.colorRow}>
          {MemberColors.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={[styles.colorSwatch, { backgroundColor: c }, color === c && styles.colorSwatchSelected]}
            />
          ))}
        </View>

        <Button label="Salvar alterações" onPress={handleSaveProfile} loading={savingProfile} style={styles.button} />

        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Alterar senha</Text>
        <TextField label="Nova senha" placeholder="Mínimo 6 caracteres" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
        <Button label="Atualizar senha" variant="secondary" onPress={handleChangePassword} loading={savingPassword} style={styles.button} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
  avatarSection: { alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  colorRow: { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' },
  colorSwatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 3, borderColor: 'transparent' },
  colorSwatchSelected: { borderColor: Colors.text },
  button: { marginTop: Spacing.sm },
});
