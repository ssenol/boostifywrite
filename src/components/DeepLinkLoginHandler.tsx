// DeepLinkLoginHandler — web'den SSO token'ıyla gelindiğinde girişi yapar.
// AuthProvider içinde render edilmeli ve kayıtlı oturum yüklenene kadar beklemeli: yükleme sonradan
// biterse eski oturum yeni oturumun üzerine yazılırdı.
// Açık bir oturum varsa yalnızca giriş başarılı olunca linkle gelen öğrenciye geçilir; hata olursa
// mevcut oturum olduğu gibi kalır.
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { NotStudentError, useAuth } from '@/context/AuthContext';
import { subscribeDeepLinkToken } from '@/utils/deepLinkToken';
import * as Biometric from '@/utils/biometric';
import { colors } from '@/theme';

export default function DeepLinkLoginHandler() {
  const { isLoading, loginWithSsoToken } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    return subscribeDeepLinkToken(async (ssoToken) => {
      setIsLoggingIn(true);
      try {
        const user = await loginWithSsoToken(ssoToken);
        // Başka öğrenciye geçildiyse önceki öğrencinin Face ID kaydı kalmasın
        await Biometric.clearCredentialsIfOtherUser(user.username);
      } catch (error) {
        Alert.alert(
          'Error',
          error instanceof NotStudentError
            ? error.message
            : 'Automatic sign-in failed. Please open the app again from your school platform or sign in manually.'
        );
      } finally {
        setIsLoggingIn(false);
      }
    });
  }, [isLoading, loginWithSsoToken]);

  if (!isLoggingIn) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="auto">
      <ActivityIndicator size="large" color={colors.brandBlue}/>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgApp,
  },
});
