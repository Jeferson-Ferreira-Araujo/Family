import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MemberAvatar } from '@/components/ui/MemberAvatar';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import type { Profile } from '@/types/models';

type Props = {
  members: Profile[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  multiple?: boolean;
  label?: string;
};

export function MemberPicker({ members, selectedIds, onToggle, label }: Props) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {members.map((member) => {
          const selected = selectedIds.includes(member.id);
          return (
            <Pressable key={member.id} style={styles.item} onPress={() => onToggle(member.id)}>
              <View style={[styles.avatarWrap, selected && styles.avatarWrapSelected]}>
                <MemberAvatar name={member.full_name} color={member.color} avatarUrl={member.avatar_url} isChild={member.is_child} size={44} />
              </View>
              <Text style={styles.name} numberOfLines={1}>
                {member.full_name.split(' ')[0]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  row: { gap: Spacing.md, paddingVertical: Spacing.xs },
  item: { alignItems: 'center', width: 56 },
  avatarWrap: { padding: 3, borderRadius: Radius.pill, borderWidth: 2, borderColor: 'transparent' },
  avatarWrapSelected: { borderColor: Colors.primary },
  name: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4 },
});
