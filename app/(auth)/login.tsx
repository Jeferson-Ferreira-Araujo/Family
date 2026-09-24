import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import * as authService from '@/services/auth';
import { getErrorMessage } from '@/utils/errors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Preencha os campos', 'Informe e-mail e senha para continuar.');
      return;
    }
    setLoading(true);
    try {
      await authService.signIn(email, password);
    } catch (err) {
      Alert.alert('Não foi possível entrar', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          <Image source={require('@/assets/images/logo-full.png')} style={styles.logoImage} resizeMode="contain" />
        </View>
        <Text style={styles.title}>Bem-vindo de volta</Text>
        <Text style={styles.subtitle}>Entre para organizar a rotina da sua família</Text>

        <View style={styles.form}>
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
            placeholder="Sua senha"
            secureTextEntry
            autoComplete="password"
            value={password}
            onChangeText={setPassword}
          />
          <Link href="/(auth)/forgot-password" style={[styles.forgotLink, styles.forgotText]}>
            Esqueceu sua senha?
          </Link>
        </View>

        <Button label="Entrar" onPress={handleLogin} loading={loading} style={styles.button} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Ainda não tem conta?</Text>
          <Link href="/(auth)/register" style={styles.footerLink}>
            {' '}Criar conta
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, padding: Spacing.xl, justifyContent: 'center' },
  logo: { alignItems: 'center', marginBottom: Spacing.lg },
  logoImage: { width: 220, height: 74 },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  form: { gap: Spacing.md },
  forgotLink: { alignSelf: 'flex-end' },
  forgotText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '600' },
  button: { marginTop: Spacing.xl },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  footerLink: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '700' },
});
