import React, { useRef, useEffect, useCallback } from 'react';
import { View, Pressable, Modal, Animated, PanResponder, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii } from '@/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeight?: number | `${number}%`;
};

export default function BottomSheet({ visible, onClose, children, maxHeight = '85%' }: Props) {
  const insets  = useSafeAreaInsets();
  const slideY  = useRef(new Animated.Value(800)).current;
  const dragY   = useRef(new Animated.Value(0)).current;
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  const close = useCallback(() => {
    Animated.timing(slideY, { toValue: 800, useNativeDriver: true, duration: 220 }).start(() => {
      dragY.setValue(0);
      closeRef.current();
    });
  }, []);

  useEffect(() => {
    if (visible) {
      dragY.setValue(0);
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
    }
  }, [visible]);

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, g) => g.dy > 4,
    onPanResponderMove: (_, g) => { if (g.dy > 0) dragY.setValue(g.dy); },
    onPanResponderRelease: (_, g) => {
      if (g.dy > 100 || g.vy > 0.5) {
        close();
      } else {
        Animated.spring(dragY, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
      }
    },
  })).current;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}/>
      <Animated.View style={[
        styles.panel,
        { maxHeight, paddingBottom: Math.max(32, insets.bottom + 16),
          transform: [{ translateY: Animated.add(slideY, dragY) }] },
      ]}>
        <View style={styles.handleArea} {...pan.panHandlers}>
          <View style={styles.handle}/>
        </View>
        {children}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  panel: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl,
    paddingHorizontal: 20, paddingTop: 0,
  },
  handleArea: { alignItems: 'center', paddingVertical: 12 },
  handle:     { width: 36, height: 4, borderRadius: radii.pill, backgroundColor: colors.hairline },
});
