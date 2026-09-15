import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight, GlassCard } from '../utils/theme';

/**
 * Glassmorphic card for displaying metric results
 */
export default function MetricCard({ icon, label, value, unit, statusLabel, statusColor, children, style }) {
  return (
    <View style={[styles.card, style]}>
      {/* Accent top line */}
      <View style={[styles.accentLine, { backgroundColor: statusColor || Colors.accent }]} />

      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>

      {value !== undefined && value !== null && (
        <View style={styles.valueRow}>
          <Text style={[styles.value, statusColor ? { color: statusColor } : null]}>
            {value}
          </Text>
          {unit && <Text style={styles.unit}>{unit}</Text>}
        </View>
      )}

      {statusLabel && (
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...GlassCard,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  value: {
    fontSize: 42,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  unit: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
    marginBottom: Spacing.sm,
  },
  statusText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
