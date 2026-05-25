// Common Screen wrapper — safe area + app background.
// Use this as the outer container for every screen except auth/hero
// screens that need a custom gradient.

import React from 'react';
import { View, StyleSheet, ViewStyle, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme';

export function ScreenSurface({
  children, style, edges = ['top', 'bottom'],
}: { children: React.ReactNode; style?: ViewStyle; edges?: any }) {
  return (
    <SafeAreaView style={[styles.surface, style]} edges={edges}>
      {children}
    </SafeAreaView>
  );
}

export function ScreenScroll({
  children, contentStyle, ...rest
}: {
  children: React.ReactNode;
  contentStyle?: ViewStyle;
  [key: string]: any;
}) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={contentStyle}
      showsVerticalScrollIndicator={false}
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  surface: { flex: 1, backgroundColor: colors.bgApp },
});
