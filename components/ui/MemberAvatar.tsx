import { Image, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

type Props = {
  name: string;
  color?: string | null;
  avatarUrl?: string | null;
  size?: number;
  isChild?: boolean;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function MemberAvatar({ name, color, avatarUrl, size = 40, isChild }: Props) {
  const bg = color ?? Colors.primary;

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ]}>
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{getInitials(name)}</Text>
      {isChild ? <View style={[styles.childDot, { borderColor: Colors.surface }]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: '700',
  },
  childDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F59E0B',
    borderWidth: 2,
  },
});
