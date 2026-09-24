import * as Notifications from 'expo-notifications';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useApp } from '@/context/app-context';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { registerForPushNotificationsAsync } from '@/services/notifications';
import { getErrorMessage } from '@/utils/errors';

export default function NotificationsScreen() {
  const { profile } = useApp();
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [registering, setRegistering] = useState(false);

  const checkPermission = useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionGranted(status === 'granted');
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkPermission();
    }, [checkPermission])
  );

  async function handleToggle(value: boolean) {
    if (!value) {
      Alert.alert(
        'Desativar notificações',
        'Para desativar completamente, acesse as configurações do sistema do seu celular.'
      );
      return;
    }
    if (!profile) return;
    setRegistering(true);
    try {
      const token = await registerForPushNotificationsAsync(profile.id);
      if (!token) {
        Alert.alert('Permissão negada', 'Ative as notificações nas configurações do sistema para receber lembretes.');
      }
      await checkPermission();
    } catch (err) {
      Alert.alert('Erro', getErrorMessage(err));
    } finally {
      setRegistering(false);
    }
  }

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Notificações" />
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Notificações push</Text>
              <Text style={styles.description}>
                Receba lembretes de compromissos, tarefas e rotinas mesmo com o app fechado.
              </Text>
            </View>
            <Switch
              value={!!permissionGranted}
              onValueChange={handleToggle}
              disabled={registering}
              trackColor={{ true: Colors.primary }}
            />
          </View>
        </Card>

        <Text style={styles.hint}>
          Os lembretes de eventos, tarefas e rotinas que você cria são agendados automaticamente neste
          aparelho, de acordo com a opção de lembrete escolhida em cada item.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.lg, gap: Spacing.md },
  card: {},
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  title: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  description: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  hint: { fontSize: FontSize.xs, color: Colors.textMuted, paddingHorizontal: Spacing.sm },
});
