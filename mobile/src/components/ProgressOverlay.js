import { View, Text, Animated, StyleSheet, Modal } from 'react-native';
import { useEffect, useRef } from 'react';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '../utils/theme';

const STEPS = [
  'Extracting frames',
  'Computing PPG signal',
  'Filtering & smoothing',
  'Running LSTM model',
];

/**
 * Full-screen overlay during video analysis
 */
export default function ProgressOverlay({ visible, progress = 0 }) {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const stepIdx = Math.min(Math.floor((progress / 100) * STEPS.length), STEPS.length - 1);

  const widthInterpolate = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Animated hex icon */}
          <Animated.Text
            style={[
              styles.hexIcon,
              {
                opacity: pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }),
                transform: [
                  {
                    scale: pulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1.1],
                    }),
                  },
                ],
              },
            ]}
          >
            ⬡
          </Animated.Text>

          <Text style={styles.title}>Analyzing Video</Text>
          <Text style={styles.subtitle}>Please wait while we process your recording</Text>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: widthInterpolate },
              ]}
            />
          </View>

          {/* Step indicator */}
          <View style={styles.stepRow}>
            <View style={styles.stepDot} />
            <Text style={styles.stepText}>{STEPS[stepIdx]}…</Text>
          </View>

          {/* Step list */}
          <View style={styles.stepList}>
            {STEPS.map((step, i) => (
              <View key={step} style={styles.stepItem}>
                <Text style={[styles.stepIcon, i <= stepIdx && styles.stepDone]}>
                  {i < stepIdx ? '✓' : i === stepIdx ? '◉' : '○'}
                </Text>
                <Text style={[styles.stepLabel, i <= stepIdx && styles.stepLabelActive]}>
                  {step}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.percent}>{Math.round(progress)}%</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.bgGlassBorder,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  hexIcon: {
    fontSize: 48,
    color: Colors.accent,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  stepText: {
    fontSize: FontSize.sm,
    color: Colors.accent,
    fontWeight: FontWeight.medium,
  },
  stepList: {
    width: '100%',
    gap: 12,
    marginBottom: Spacing.lg,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepIcon: {
    fontSize: 14,
    color: Colors.textMuted,
    width: 20,
    textAlign: 'center',
  },
  stepDone: {
    color: Colors.accent,
  },
  stepLabel: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  stepLabelActive: {
    color: Colors.textPrimary,
  },
  percent: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.accent,
  },
});
