// TabBar — alttan floating pill nav (5 sekme: Home / Assignments / Report / My Progress / Profile)
import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { colors, fonts, radii, shadow } from '@/theme';
import { TabIcon } from './Icons';

export type TabId = 'Home' | 'Assignments' | 'Report' | 'MyProgress' | 'Profile';

const TABS: Array<{ id: TabId; label?: string; color: string }> = [
  { id: 'Home',        color: colors.brandBlue },
  { id: 'Assignments', label: 'Tasks', color: colors.brandGreen },
  { id: 'Report',      color: colors.rubricTask },
  { id: 'MyProgress',  label: 'My Progress', color: colors.rubricGrammar },
  { id: 'Profile',     color: colors.textPrimary },
];

export default function TabBar({
  active, onChange,
}: { active: TabId; onChange: (t: TabId) => void }) {
  return (
    <View style={[styles.bar, shadow.lg]}>
      {TABS.map(({ id, label, color }) => {
        const isActive = id === active;
        const Icon = TabIcon[id];
        return (
          <Pressable
            key={id}
            onPress={() => onChange(id)}
            style={[
              styles.tab,
              { flex: isActive ? 2.3 : 0.85, backgroundColor: isActive ? color : 'transparent' },
            ]}
          >
            <Icon size={20} color={isActive ? '#fff' : colors.textSecondary} filled={isActive}/>
            {isActive ? <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{label ?? id}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute', left: 20, right: 20, bottom: 24,
    backgroundColor: colors.bgCard,
    borderRadius: 28, borderWidth: 1, borderColor: colors.border,
    padding: 6,
    flexDirection: 'row', alignItems: 'center', gap: 3,
  },
  tab: {
    height: 44, borderRadius: 22,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingHorizontal: 4,
  },
  label: {
    fontFamily: fonts.sansSb, fontSize: 12.5, color: '#fff',
  },
});
