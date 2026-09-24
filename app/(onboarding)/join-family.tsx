import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { useApp } from '@/context/app-context';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import * as familiesService from '@/services/families';
import { getErrorMessage } from '@/utils/errors';

export default function JoinFamilyScreen() {
  const { refresh } = useApp();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    if (!code.trim()) {
      Alert.alert('Código obrigatório', 'Peça o código de convite para um administrador da família.');
      return;
    }
    setLoading(true);
    try {
      await familiesService.joinFamilyWithCode(code);
      await refresh();
    } catch (err) {
      Alert.alert('Não foi possível entrar', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Entrar em família" />
      <View style={styles.container}>
        <Text style={styles.subtitle}>Digite o código de convite compartilhado por um administrador</Text>
        <TextField
          placeholder="Ex.: A1B2C3"
          value={code}
          onChangeText={(text) => setCode(text.toUpperCase())}
          autoCapitalize="characters"
          autoFocus
        />
        <Button label="Entrar na família" onPress={handleJoin} loading={loading} style={styles.button} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.xl, gap: Spacing.md },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.sm },
  button: { marginTop: Spacing.lg },
});
