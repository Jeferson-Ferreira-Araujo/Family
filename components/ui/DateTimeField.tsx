import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

type Props = {
  label: string;
  value: Date;
  mode: 'date' | 'time';
  onChange: (date: Date) => void;
};

export function DateTimeField({ label, value, mode, onChange }: Props) {
  const [visible, setVisible] = useState(false);

  const displayText =
    mode === 'date'
      ? value.toLocaleDateString('pt-BR')
      : value.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.field} onPress={() => setVisible(true)}>
        <Text style={styles.value}>{displayText}</Text>
      </Pressable>
      {visible && (
        <DateTimePicker
          value={value}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setVisible(Platform.OS === 'ios');
            if (event.type === 'dismissed') {
              setVisible(false);
              return;
            }
            if (date) onChange(date);
            if (Platform.OS === 'android') setVisible(false);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xs, flex: 1 },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  field: {
    height: 50,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  value: { fontSize: FontSize.md, color: Colors.text },
});
