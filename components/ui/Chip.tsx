import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

type Props = {
  label: string;
  selected?: boolean;
  color?: string;
  onPress?: () => void;
};

export function Chip({ label, selected, color, onPress }: Props) {
  const activeColor = color ?? Colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: activeColor, borderColor: activeColor }
          : { backgroundColor: Colors.surface, borderColor: Colors.border },
      ]}>
      <Text style={[styles.label, { color: selected ? '#fff' : Colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
