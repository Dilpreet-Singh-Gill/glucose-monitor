import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '../utils/theme';
import { getQualityInfo } from '../utils/theme';

/**
 * Signal quality indicator badge
 */
export default function QualityBadge({ quality, style }) {
  if (!quality) return null;

  const info = getQualityInfo(quality);

  return (
    <View style={[styles.badge, { borderColor: `${info.color}44` }, style]}>
      <Text style={styles.icon}>{info.icon}</Text>
      <Text style={[styles.text, { color: info.color }]}>
        Signal: {info.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  icon: {
    fontSize: 12,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});
