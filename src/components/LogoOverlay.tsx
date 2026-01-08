import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LogoSvg } from './LogoSvg';

type Props = {
  size?: number;
  opacity?: number;
};

export const LogoOverlay = ({ size = 110, opacity = 0.18 }: Props) => {
  const spin = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(spin, { toValue: 1, duration: 6000, useNativeDriver: true }),
        Animated.timing(spin, { toValue: 0, duration: 6000, useNativeDriver: true }),
      ])
    ).start();
  }, [spin]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -6, duration: 2200, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, [float]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['-6deg', '6deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY: float }, { rotate }] }]}>
      <View style={{ width: size, height: (size * 600) / 400 }}>
        <LogoSvg size={size} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 12,
    right: 12,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    pointerEvents: 'none',
  },
});

