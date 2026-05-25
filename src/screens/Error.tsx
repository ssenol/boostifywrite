// Error states — Offline / Evaluation failed
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenSurface } from '@/components/Screen';
import IconButton from '@/components/IconButton';
import Button from '@/components/Button';
import { IconChevLeft, IconCloud, IconAlertFilled, IconArrow } from '@/components/Icons';
import { colors, fonts, type } from '@/theme';
import type { HomeStackParamList } from '@/navigation/types';

export default function ErrorScreen() {
  const nav = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, 'Error'>>();
  const isNetwork = route.params?.kind === 'network';

  return (
    <ScreenSurface>
      <View style={styles.header}>
        <IconButton onPress={() => nav.goBack()}>
          <IconChevLeft size={18} color={colors.textPrimary}/>
        </IconButton>
        <Text style={styles.headerTitle}>{isNetwork ? 'Connection' : 'Evaluation'}</Text>
      </View>

      <View style={styles.body}>
        <View style={{ marginBottom: 18 }}>
          {isNetwork
            ? <IconCloud size={42} color={colors.textTertiary}/>
            : <IconAlertFilled size={48} bg={colors.rubricGrammar}/>}
        </View>
        <Text style={styles.title}>
          {isNetwork ? "Looks like you're offline" : "Couldn't evaluate this essay"}
        </Text>
        <Text style={styles.body2}>
          {isNetwork
            ? "We couldn't reach our servers. Check your connection and try again — your draft is saved locally."
            : "Something went wrong on our end. Your essay is safe — try again in a moment, or save and come back later."}
        </Text>

        <View style={{ marginTop: 22, gap: 10, width: '100%', maxWidth: 280 }}>
          <Button kind="dark" icon={<IconArrow size={16} color="#fff"/>}>
            {isNetwork ? 'Retry' : 'Try again'}
          </Button>
          <Text style={styles.fallback} onPress={() => nav.popToTop()}>Go back home</Text>
        </View>
      </View>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20, paddingVertical: 16,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  headerTitle: { fontFamily: fonts.sansSb, fontSize: 16 },

  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  title: { fontFamily: fonts.sansSb, fontSize: 22, letterSpacing: -0.3, marginBottom: 8, textAlign: 'center' },
  body2: { fontFamily: fonts.sans, fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 21, maxWidth: 280 },

  fallback: { textAlign: 'center', padding: 12, fontFamily: fonts.sans, fontSize: 14, color: colors.textSecondary },
});
