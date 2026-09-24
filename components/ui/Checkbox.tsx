import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

type Props = {
  checked: boolean;
  onPress: () => void;
  size?: number;
};

export function Checkbox({ checked, onPress, size = 24 }: Props) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={[
        styles.box,
        { width: size, height: size, borderRadius: Radius.sm },
        checked ? styles.checked : styles.unchecked,
      ]}>
      {checked ? <Ionicons name="checkmark" size={size * 0.7} color="#fff" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  checked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  unchecked: {
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
});
