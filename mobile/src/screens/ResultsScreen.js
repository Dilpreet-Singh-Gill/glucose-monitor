import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MetricCard from '../components/MetricCard';
import GlucoseGauge from '../components/GlucoseGauge';
import { PulseBars } from '../components/PulseAnimation';
import QualityBadge from '../components/QualityBadge';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, getGlucoseStatus, getHRStatus } from '../utils/theme';

export default function ResultsScreen({ route, navigation }) {
  const { results } = route.params;
  const { heart_rate, glucose, status, graph, signal_quality, warnings } = results;
  const gStatus = getGlucoseStatus(glucose);
  const hrStatus = getHRStatus(heart_rate);
  const hasWarnings = warnings && warnings.length > 0;

  return (
    <LinearGradient colors={[Colors.bg, '#0f1a24', Colors.bg]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.sectionLabel}>Analysis Complete</Text>
          <Text style={styles.title}>Results</Text>
          <View style={styles.headerRow}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{status}</Text>
            </View>
            <QualityBadge quality={signal_quality} />
          </View>
        </View>

        {/* Warnings */}
        {hasWarnings && (
          <View style={styles.warningsSection}>
            {warnings.map((w, i) => (
              <View key={i} style={styles.warningItem}>
                <Text style={styles.warningIcon}>⚠</Text>
                <Text style={styles.warningText}>{w}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Glucose Card */}
        <MetricCard
          icon="🩸"
          label="Blood Glucose"
          value={glucose}
          unit="mg/dL"
          statusLabel={`${gStatus.emoji} ${gStatus.label}`}
          statusColor={gStatus.color}
          style={styles.card}
        >
          <GlucoseGauge value={glucose} color={gStatus.color} style={{ marginTop: Spacing.md }} />
        </MetricCard>

        {/* Heart Rate Card */}
        <MetricCard
          icon="♥"
          label="Heart Rate"
          value={heart_rate > 0 ? heart_rate : undefined}
          unit={heart_rate > 0 ? 'bpm' : undefined}
          statusLabel={hrStatus.label}
          statusColor={hrStatus.color}
          style={styles.card}
        >
          {heart_rate > 0 ? (
            <PulseBars color={hrStatus.color} />
          ) : (
            <View style={styles.undetected}>
              <Text style={styles.undetectedDash}>—</Text>
              <Text style={styles.undetectedLabel}>Could not detect heart rate</Text>
              <Text style={styles.undetectedHint}>
                Ensure your fingertip fully covers the camera lens with the flash turned on. Hold steady for at least 15 seconds.
              </Text>
            </View>
          )}
          <View style={styles.hrReference}>
            <Text style={[styles.refDot, { color: Colors.low }]}>■</Text>
            <Text style={styles.refText}>&lt;60 Low</Text>
            <Text style={[styles.refDot, { color: Colors.normal }]}>■</Text>
            <Text style={styles.refText}>60–100 Normal</Text>
            <Text style={[styles.refDot, { color: Colors.preDiabetic }]}>■</Text>
            <Text style={styles.refText}>&gt;100 Elevated</Text>
          </View>
        </MetricCard>

        {/* PPG Graph */}
        {graph && (
          <View style={styles.graphSection}>
            <Text style={styles.graphLabel}>PPG Waveform</Text>
            <View style={styles.graphWrap}>
              <Image
                source={{ uri: `data:image/png;base64,${graph}` }}
                style={styles.graphImage}
                resizeMode="contain"
              />
            </View>
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerIcon}>⚠️</Text>
          <Text style={styles.disclaimerText}>
            This is an <Text style={styles.bold}>experimental AI prediction</Text> and should not be used for medical decisions. Always consult a healthcare professional and use a certified glucometer for accurate readings.
          </Text>
        </View>

        {/* New Scan Button */}
        <TouchableOpacity
          style={styles.newScanBtn}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <LinearGradient
            colors={[Colors.accent, Colors.accentGradientEnd]}
            style={styles.newScanBtnInner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.newScanBtnText}>⬡ New Scan</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  statusText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  warningsSection: {
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.warningBg,
    borderWidth: 1,
    borderColor: `${Colors.warning}33`,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  warningIcon: {
    fontSize: 14,
    color: Colors.warning,
    marginTop: 1,
  },
  warningText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.warning,
    lineHeight: 20,
  },
  card: {
    marginBottom: Spacing.md,
  },
  undetected: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  undetectedDash: {
    fontSize: 36,
    color: Colors.textMuted,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  undetectedLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
  },
  undetectedHint: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
  },
  hrReference: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.md,
    flexWrap: 'wrap',
  },
  refDot: {
    fontSize: 10,
  },
  refText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginRight: 8,
  },
  graphSection: {
    marginBottom: Spacing.lg,
  },
  graphLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  graphWrap: {
    backgroundColor: Colors.bgGlass,
    borderWidth: 1,
    borderColor: Colors.bgGlassBorder,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    overflow: 'hidden',
  },
  graphImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  disclaimerIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  disclaimerText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  bold: {
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
  },
  newScanBtn: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  newScanBtnInner: {
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
  },
  newScanBtnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#000',
  },
});
