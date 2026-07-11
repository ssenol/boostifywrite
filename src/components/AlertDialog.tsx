import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, Modal, Animated, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radii, layout } from '@/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  onClose?: () => void;
}

export default function AlertDialog({ visible, title, message, buttons, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 25,
          stiffness: 200,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onClose) {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => {}} />
        <Animated.View 
          style={[
            styles.sheet, 
            { 
              paddingBottom: insets.bottom || 16,
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          <View style={styles.sheetContent}>
            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.title}>{title}</Text>
              {message && <Text style={styles.message}>{message}</Text>}
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
              {buttons.map((button, index) => {
                const buttonStyle = button.style || 'default';
                const isCancel = buttonStyle === 'cancel';

                return (
                  <Pressable
                    key={index}
                    onPress={() => handleButtonPress(button)}
                    style={({ pressed }) => [
                      !isCancel && styles.button,
                      !isCancel && (buttonStyle === 'destructive' ? styles.buttonDestructive : styles.buttonPrimary),
                      !isCancel && pressed && styles.buttonPressed,
                      isCancel && styles.cancelButton,
                    ]}
                  >
                    <Text
                      style={[
                        !isCancel && styles.buttonText,
                        buttonStyle === 'destructive' && styles.buttonTextDestructive,
                        isCancel && styles.cancelButtonText,
                      ]}
                    >
                      {button.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingTop: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  content: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  title: {
    fontFamily: fonts.sansSb,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.4,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  message: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  sheetContent: {
    width: '100%', maxWidth: layout.maxActionWidth, alignSelf: 'center',
  },
  buttons: {
    gap: 10,
  },
  button: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  buttonPrimary: {
    backgroundColor: colors.textPrimary,
  },
  buttonDestructive: {
    backgroundColor: colors.danger,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontFamily: fonts.sansSb,
    fontSize: 16,
    color: colors.textInverse,
  },
  buttonTextDestructive: {
    color: colors.textInverse,
  },
  cancelButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: fonts.sansSb,
    fontSize: 16,
    color: colors.textSecondary,
  },
});
