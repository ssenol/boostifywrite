// My Progress — kendi yazma performansı analiz paneli
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { ScreenSurface, ScreenScroll } from '@/components/Screen';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import { useAuth } from '@/context/AuthContext';
import { colors, fonts, type } from '@/theme';

export default function MyProgress() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <ScreenSurface>
      <View style={styles.header}>
        <Text style={[type.label, { marginBottom: 4 }]}>YOUR JOURNEY</Text>
        <Text style={styles.title}>My Progress</Text>
      </View>

      <ScreenScroll contentStyle={{ padding: 16, paddingBottom: 110 }}>
        <AnalyticsPanel userId={user.userId}/>
      </ScreenScroll>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16, paddingVertical: 16,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
  },
  title: { fontFamily: fonts.sansSb, fontSize: 26, letterSpacing: -0.5, color: colors.textPrimary },
});
