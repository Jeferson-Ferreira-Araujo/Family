import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Share, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useApp } from '@/context/app-context';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import * as familiesService from '@/services/families';
import { getErrorMessage } from '@/utils/errors';
import type { FamilyInvite } from '@/types/models';

export default function FamilyInviteScreen() {
  const { family } = useApp();
  const [invite, setInvite] = useState<FamilyInvite | null>(null);
  const [loading, setLoading] = useState(false);

  async function generateCode() {
    setLoading(true);
    try {
      const data = await familiesService.createFamilyInvite();
      setInvite(data);
    } catch (err) {
      Alert.alert('Não foi possível gerar o convite', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function shareCode() {
    if (!invite) return;
    await Share.share({
      message: `Entre na nossa família "${family?.name}" no app Ohana! Use o código de convite: ${invite.code}`,
    });
  }

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Convidar membro" />
      <View style={styles.container}>
        <Ionicons name="key" size={40} color={Colors.primary} style={{ alignSelf: 'center' }} />
        <Text style={styles.description}>
          Gere um código de convite e compartilhe com quem você quer adicionar à família {family?.name}.
        </Text>

        {invite ? (
          <Card style={styles.codeCard}>
            <Text style={styles.codeLabel}>Código de convite</Text>
            <Text style={styles.code}>{invite.code}</Text>
            <Text style={styles.expiry}>
              Válido até {invite.expires_at ? new Date(invite.expires_at).toLocaleDateString('pt-BR') : 'sem prazo'}
            </Text>
            <Button label="Compartilhar código" onPress={shareCode} style={{ marginTop: Spacing.md }} />
          </Card>
        ) : loading ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <Button label="Gerar código de convite" onPress={generateCode} />
        )}

        {invite ? <Button label="Gerar novo código" variant="ghost" onPress={generateCode} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.xl, gap: Spacing.lg },
  description: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center' },
  codeCard: { alignItems: 'center', gap: Spacing.xs },
  codeLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  code: { fontSize: 36, fontWeight: '800', color: Colors.primary, letterSpacing: 4 },
  expiry: { fontSize: FontSize.xs, color: Colors.textMuted },
});
