// SwipeableRow — sağa kaydırarak silme (yalnızca __DEV__)
import React, { useRef } from 'react';
import { View, Text, Animated, PanResponder, StyleSheet } from 'react-native';
import { IconTrash } from '@/components/Icons';
import { colors, fonts, radii } from '@/theme';

type Props = {
  children: React.ReactNode;
  onDelete: () => void;
  label?: string;
};

const THRESHOLD = 90;

export default function SwipeableRow({ children, onDelete, label = 'Delete' }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;

  const snapBack = () =>
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 8 }).start();

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, { dx, dy }) => dx > 8 && dx > Math.abs(dy) * 1.5,
      onPanResponderMove: (_, { dx }) => {
        if (dx > 0) translateX.setValue(Math.min(dx, THRESHOLD * 1.6));
      },
      onPanResponderRelease: (_, { dx }) => {
        if (dx >= THRESHOLD) {
          snapBack();
          onDelete();
        } else {
          snapBack();
        }
      },
      onPanResponderTerminate: () => snapBack(),
    })
  ).current;

  const bgOpacity = translateX.interpolate({
    inputRange: [0, THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.deleteBack, { opacity: bgOpacity }]}>
        <IconTrash size={18} color="#fff" />
        <Text style={styles.deleteLabel}>{label}</Text>
      </Animated.View>

      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: radii.md,
  },
  deleteBack: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.danger,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 20,
    borderRadius: radii.md,
  },
  deleteLabel: {
    fontFamily: fonts.sansSb,
    fontSize: 13,
    color: '#fff',
  },
});
