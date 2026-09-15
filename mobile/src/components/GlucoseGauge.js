import { View, Animated, StyleSheet } from 'react-native';
import { useEffect, useRef } from 'react';
import { Colors, BorderRadius } from '../utils/theme';

/**
 * Animated glucose gauge bar with color-coded zones
 */
export default function GlucoseGauge({ value, color, style }) {
  const percent = Math.min((value / 300) * 100, 100);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: percent,
      tension: 40,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [percent]);

  const widthInterpolate = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: widthInterpolate,
              backgroundColor: color,
            },
          ]}
        />
        {/* Zone markers */}
        <View style={[styles.marker, { left: `${(70 / 300) * 100}%` }]} />
        <View style={[styles.marker, { left: `${(100 / 300) * 100}%` }]} />
        <View style={[styles.marker, { left: `${(126 / 300) * 100}%` }]} />
      </View>
      <View style={styles.labels}>
        <View style={styles.labelItem}>
          <View style={[styles.dot, { backgroundColor: Colors.low }]} />
          <Animated.Text style={styles.labelText}>&lt;70</Animated.Text>
        </View>
        <View style={styles.labelItem}>
          <View style={[styles.dot, { backgroundColor: Colors.normal }]} />
          <Animated.Text style={styles.labelText}>70–99</Animated.Text>
        </View>
        <View style={styles.labelItem}>
          <View style={[styles.dot, { backgroundColor: Colors.preDiabetic }]} />
          <Animated.Text style={styles.labelText}>100–125</Animated.Text>
        </View>
        <View style={styles.labelItem}>
          <View style={[styles.dot, { backgroundColor: Colors.high }]} />
          <Animated.Text style={styles.labelText}>≥126</Animated.Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  marker: {
    position: 'absolute',
    top: 0,
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  labelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  labelText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
