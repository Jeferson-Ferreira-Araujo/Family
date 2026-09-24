import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { useApp } from '@/context/app-context';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import * as familiesService from '@/services/families';
import { getErrorMessage } from '@/utils/errors';

export default function CreateFamilyScreen() {
  const { refresh } = useApp();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      Alert.alert('Nome obrigatório', 'Dê um nome para sua família, como "Família Silva".');
      return;
    }
    setLoading(true);
    try {
      await familiesService.createFamily(name);
      await refresh();
    } catch (err) {
      Alert.alert('Não foi possível criar', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Criar família" />
      <View style={styles.container}>
        <Text style={styles.subtitle}>Como sua família gostaria de ser chamada?</Text>
        <TextField placeholder="Ex.: Família Silva" value={name} onChangeText={setName} autoFocus />
        <Button label="Criar família" onPress={handleCreate} loading={loading} style={styles.button} />
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
