import { View, Animated, StyleSheet } from 'react-native';
import { useEffect, useRef } from 'react';
import { Colors } from '../utils/theme';

/**
 * Animated pulse bars (matching web's heart rate visualization)
 */
export function PulseBars({ color = Colors.accent, barCount = 20 }) {
  const heights = [4, 4, 8, 20, 40, 20, 8, 4, 4, 4, 4, 8, 24, 44, 24, 8, 4, 4, 4, 4];
  const anims = useRef(heights.slice(0, barCount).map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 50),
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      )
    );
    Animated.parallel(animations).start();

    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.barsContainer}>
      {heights.slice(0, barCount).map((h, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              height: h,
              backgroundColor: color,
              opacity: anims[i].interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 1],
              }),
              transform: [
                {
                  scaleY: anims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

/**
 * Pulsing ring animation (for welcome/camera screens)
 */
export function PulseRings({ size = 200, color = Colors.accent }) {
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulse = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

    Animated.parallel([
      createPulse(ring1, 0),
      createPulse(ring2, 600),
      createPulse(ring3, 1200),
    ]).start();
  }, []);

  const createRingStyle = (anim) => ({
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 1.5,
    borderColor: color,
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 0],
    }),
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.4, 1.2],
        }),
      },
    ],
  });

  return (
    <View style={[styles.ringsContainer, { width: size, height: size }]}>
      <Animated.View style={createRingStyle(ring1)} />
      <Animated.View style={createRingStyle(ring2)} />
      <Animated.View style={createRingStyle(ring3)} />
    </View>
  );
}

const styles = StyleSheet.create({
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 50,
    paddingVertical: 8,
  },
  bar: {
    width: 3,
    borderRadius: 1.5,
  },
  ringsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
