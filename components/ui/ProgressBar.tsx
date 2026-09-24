import { StyleSheet, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

type Props = {
  progress: number;
  color?: string;
};

export function ProgressBar({ progress, color }: Props) {
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: color ?? Colors.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
});
