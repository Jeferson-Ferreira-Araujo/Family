import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import * as authService from '@/services/auth';
import { getErrorMessage } from '@/utils/errors';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email.trim()) {
      Alert.alert('Informe seu e-mail', 'Digite o e-mail cadastrado na sua conta.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPasswordForEmail(email);
      Alert.alert(
        'E-mail enviado',
        'Enviamos um link para redefinir sua senha. Verifique sua caixa de entrada.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (err) {
      Alert.alert('Não foi possível enviar', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Recuperar senha" showBack />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>
          Informe o e-mail da sua conta. Enviaremos um link para você redefinir sua senha.
        </Text>
        <View style={styles.form}>
          <TextField
            label="E-mail"
            placeholder="voce@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <Button label="Enviar link" onPress={handleSubmit} loading={loading} style={styles.button} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, padding: Spacing.xl },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.xl },
  form: { gap: Spacing.md },
  button: { marginTop: Spacing.xl },
});
