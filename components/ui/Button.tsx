import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
};

export function Button({ label, onPress, variant = 'primary', loading, disabled, style, fullWidth = true }: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        fullWidth && { alignSelf: 'stretch' },
        isDisabled && styles.disabled,
        pressed && !isDisabled && { opacity: 0.85 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? Colors.primary : '#fff'} />
      ) : (
        <Text style={[styles.label, textVariantStyles[variant]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.primaryLight },
  danger: { backgroundColor: Colors.danger },
  ghost: { backgroundColor: 'transparent' },
});

const textVariantStyles = StyleSheet.create({
  primary: { color: '#fff' },
  secondary: { color: Colors.primaryDark },
  danger: { color: '#fff' },
  ghost: { color: Colors.primary },
});
