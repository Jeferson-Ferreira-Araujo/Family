import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Spacing } from '@/constants/theme';

type Props = {
  title: string;
  onBack?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  showBack?: boolean;
};

export function ScreenHeader({ title, onBack, rightIcon, onRightPress, showBack = true }: Props) {
  return (
    <View style={styles.container}>
      {showBack ? (
        <Pressable onPress={onBack ?? (() => router.back())} hitSlop={12} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
      ) : (
        <View style={styles.iconButton} />
      )}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {rightIcon ? (
        <Pressable onPress={onRightPress} hitSlop={12} style={styles.iconButton}>
          <Ionicons name={rightIcon} size={22} color={Colors.primary} />
        </Pressable>
      ) : (
        <View style={styles.iconButton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
  },
  title: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
