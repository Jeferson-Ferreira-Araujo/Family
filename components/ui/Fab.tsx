import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { Colors, Radius, Shadow } from '@/constants/theme';

type Props = {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function Fab({ onPress, icon = 'add' }: Props) {
  return (
    <Pressable style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]} onPress={onPress} hitSlop={8}>
      <Ionicons name={icon} size={28} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
});
