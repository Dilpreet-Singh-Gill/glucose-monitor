import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { PulseRings } from '../components/PulseAnimation';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../utils/theme';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;
  const badgeFade = useRef(new Animated.Value(0)).current;
  const statsFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.parallel([
        Animated.timing(fadeIn, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
      Animated.timing(badgeFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(statsFade, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={[Colors.bg, '#0f1a24', Colors.bg]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

      {/* Pulse Rings */}
      <View style={styles.pulseContainer}>
        <PulseRings size={220} color={Colors.accent} />
        <View style={styles.heartCore}>
          <Text style={styles.heartIcon}>♥</Text>
        </View>
      </View>

      {/* Badge */}
      <Animated.View style={[styles.badge, { opacity: badgeFade }]}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeText}>Experimental · Non-Invasive · AI-Powered</Text>
      </Animated.View>

      {/* Title */}
      <Animated.View
        style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}
      >
        <Text style={styles.title}>Monitor Glucose</Text>
        <Text style={styles.titleAccent}>Without a Needle</Text>
        <Text style={styles.subtitle}>
          Record your fingertip with the camera. Our LSTM model extracts your PPG signal
          and predicts blood glucose — all in seconds.
        </Text>
      </Animated.View>

      {/* CTAs */}
      <Animated.View style={[styles.ctaRow, { opacity: fadeIn }]}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Auth', { mode: 'signup' })}
        >
          <LinearGradient
            colors={[Colors.accent, Colors.accentGradientEnd]}
            style={styles.primaryBtnInner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
            <Text style={styles.arrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Auth', { mode: 'login' })}
        >
          <Text style={styles.secondaryBtnText}>Sign In</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Stats */}
      <Animated.View style={[styles.stats, { opacity: statsFade }]}>
        {[
          { val: '< 5s', label: 'Analysis time' },
          { val: 'LSTM', label: 'Neural model' },
          { val: 'PPG', label: 'Signal source' },
        ].map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={styles.statVal}>{s.val}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ⚠️ Experimental. Not a medical device.
        </Text>
      </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 40,
  },
  pulseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  heartCore: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,200,180,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    fontSize: 28,
    color: Colors.accent,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.pill,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    gap: 8,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  badgeText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 50,
  },
  titleAccent: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.extrabold,
    color: Colors.accent,
    textAlign: 'center',
    lineHeight: 50,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  primaryBtn: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  primaryBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md + 2,
    gap: 8,
  },
  primaryBtnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#000',
  },
  arrow: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#000',
  },
  secondaryBtn: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md + 2,
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    backgroundColor: Colors.bgGlass,
    borderWidth: 1,
    borderColor: Colors.bgGlassBorder,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    minWidth: (width - Spacing.lg * 2 - Spacing.md * 2) / 3,
  },
  statVal: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.accent,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
