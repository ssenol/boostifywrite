// App entry. Loads fonts before mounting the navigator so all
// type/family rules in theme/index.ts resolve correctly.

import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import {
  useFonts,
  Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  JetBrainsMono_500Medium, JetBrainsMono_600SemiBold,
} from '@expo-google-fonts/jetbrains-mono';

import RootNavigator from '@/navigation';
import { AuthProvider } from '@/context/AuthContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [loaded] = useFonts({
    Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold,
    JetBrainsMono_500Medium, JetBrainsMono_600SemiBold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }
  return (
    <SafeAreaProvider>
      <StatusBar style="dark"/>
      <AuthProvider>
        <RootNavigator/>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
