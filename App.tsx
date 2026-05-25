// App entry. Loads fonts before mounting the navigator so all
// type/family rules in theme/index.ts resolve correctly.

import 'react-native-gesture-handler';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  useFonts,
  Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  JetBrainsMono_500Medium, JetBrainsMono_600SemiBold,
} from '@expo-google-fonts/jetbrains-mono';

import RootNavigator from '@/navigation';
import { colors } from '@/theme';

export default function App() {
  const [loaded] = useFonts({
    Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold,
    JetBrainsMono_500Medium, JetBrainsMono_600SemiBold,
  });
  if (!loaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgApp }}>
        <ActivityIndicator color={colors.brandBlue}/>
      </View>
    );
  }
  return (
    <SafeAreaProvider>
      <StatusBar style="dark"/>
      <RootNavigator/>
    </SafeAreaProvider>
  );
}
