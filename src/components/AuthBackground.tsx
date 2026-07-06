// AuthBackground — Welcome / Login ekranlarının gradient zemini + ambient glow'ları.
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { colors } from '@/theme';

function GlowBlob({ size, color, opacity, style }: {
  size: number; color: string; opacity: number; style: any;
}) {
  return (
    <View style={[{ position: 'absolute', width: size, height: size }, style]} pointerEvents="none">
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="g" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={opacity}/>
            <Stop offset="100%" stopColor={color} stopOpacity={0}/>
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#g)"/>
      </Svg>
    </View>
  );
}

export default function AuthBackground({ mirror = false }: { mirror?: boolean }) {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 4500, useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 4500, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift]);

  const driftStyle = {
    transform: [
      { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [0, mirror ? -24 : 24] }) },
      { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) },
    ],
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[colors.authBgStart, colors.authBgMid, colors.authBgEnd]}
        start={mirror ? { x: 1, y: 0 } : { x: 0.3, y: 0 }}
        end={mirror ? { x: 0.3, y: 1 } : { x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[{ position: 'absolute', top: -160, width: 480, height: 480 }, mirror ? { left: -140 } : { right: -140 }, driftStyle]}>
        <GlowBlob size={480} color={colors.brandBlue} opacity={0.2} style={{ position: 'relative', top: 0, left: 0 }}/>
      </Animated.View>
      <GlowBlob size={440} color={colors.brandGreen} opacity={0.22}
        style={mirror ? { bottom: -60, right: -160 } : { bottom: -60, left: -160 }}/>
      <GlowBlob size={320} color={colors.brandOrange} opacity={0.1}
        style={mirror ? { bottom: -80, left: -120 } : { bottom: -80, right: -120 }}/>
    </View>
  );
}
