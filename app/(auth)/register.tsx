import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import * as authService from '@/services/auth';
import { getErrorMessage } from '@/utils/errors';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert('Preencha os campos', 'Nome, e-mail e senha são obrigatórios.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Senha muito curta', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Senhas diferentes', 'A confirmação de senha não confere.');
      return;
    }

    setLoading(true);
    try {
      const { session } = await authService.signUp(email, password, fullName);
      if (!session) {
        Alert.alert(
          'Confirme seu e-mail',
          'Enviamos um link de confirmação para o seu e-mail. Confirme para poder entrar.'
        );
        router.replace('/(auth)/login');
      }
    } catch (err) {
      Alert.alert('Não foi possível criar a conta', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Criar conta" showBack />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>Crie sua conta para começar a organizar sua família</Text>

        <View style={styles.form}>
          <TextField label="Nome completo" placeholder="Seu nome" value={fullName} onChangeText={setFullName} />
          <TextField
            label="E-mail"
            placeholder="voce@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label="Senha"
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextField
            label="Confirmar senha"
            placeholder="Repita a senha"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <Button label="Criar conta" onPress={handleRegister} loading={loading} style={styles.button} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem conta?</Text>
          <Link href="/(auth)/login" style={styles.footerLink}>
            {' '}Entrar
          </Link>
        </View>
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
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  footerLink: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '700' },
});
