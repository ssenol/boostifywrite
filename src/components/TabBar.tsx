// TabBar — alttan floating pill nav (4 sekme: Home / Assignments / Report / Profile)
import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { colors, fonts, radii, shadow } from '@/theme';
import { TabIcon } from './Icons';

export type TabId = 'Home' | 'Assignments' | 'Report' | 'Profile';

const TABS: Array<{ id: TabId; color: string }> = [
  { id: 'Home',        color: colors.brandBlue },
  { id: 'Assignments', color: colors.brandGreen },
  { id: 'Report',      color: colors.rubricTask },
  { id: 'Profile',     color: colors.textPrimary },
];

export default function TabBar({
  active, onChange,
}: { active: TabId; onChange: (t: TabId) => void }) {
  return (
    <View style={[styles.bar, shadow.lg]}>
      {TABS.map(({ id, color }) => {
        const isActive = id === active;
        const Icon = TabIcon[id];
        return (
          <Pressable
            key={id}
            onPress={() => onChange(id)}
            style={[
              styles.tab,
              { flex: isActive ? 1.6 : 1, backgroundColor: isActive ? color : 'transparent' },
            ]}
          >
            <Icon size={20} color={isActive ? '#fff' : colors.textSecondary} filled={isActive}/>
            {isActive ? <Text style={styles.label}>{id}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute', left: 16, right: 16, bottom: 24,
    backgroundColor: colors.bgCard,
    borderRadius: 28, borderWidth: 1, borderColor: colors.border,
    padding: 6,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  tab: {
    height: 44, borderRadius: 22,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  label: {
    fontFamily: fonts.sansSb, fontSize: 13, color: '#fff',
  },
});
