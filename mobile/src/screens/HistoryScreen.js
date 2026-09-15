import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { getHistory } from '../utils/storage';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, getGlucoseStatus } from '../utils/theme';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load history every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadData = async () => {
        const data = await getHistory();
        if (isActive) {
          setHistory(data);
          setLoading(false);
        }
      };
      loadData();
      return () => { isActive = false; };
    }, [])
  );

  const renderItem = ({ item, index }) => {
    const gs = getGlucoseStatus(item.glucose);
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Results', { results: item })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
          <Text style={styles.index}>#{String(history.length - index).padStart(2, '0')}</Text>
        </View>

        <View style={styles.metricsRow}>
          <View style={[styles.metricChip, { borderColor: `${gs.color}33` }]}>
            <Text style={styles.metricIcon}>🩸</Text>
            <Text style={[styles.metricText, { color: gs.color }]}>{item.glucose} mg/dL</Text>
          </View>
          <View style={[styles.metricChip, { borderColor: Colors.border }]}>
            <Text style={styles.metricIcon}>♥</Text>
            <Text style={styles.metricText}>
              {item.heart_rate > 0 ? `${item.heart_rate} bpm` : '—'}
            </Text>
          </View>
        </View>

        {/* Mini gauge */}
        <View style={styles.miniGauge}>
          <View style={styles.miniGaugeTrack}>
            <View
              style={[
                styles.miniGaugeFill,
                {
                  width: `${Math.min((item.glucose / 300) * 100, 100)}%`,
                  backgroundColor: gs.color,
                },
              ]}
            />
          </View>
          <Text style={[styles.miniGaugeLabel, { color: gs.color }]}>{gs.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={[Colors.bg, '#0f1a24', Colors.bg]} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.sectionLabel}>Session History</Text>
        <Text style={styles.title}>Past Scans</Text>
        <Text style={styles.subtitle}>
          {history.length} scan{history.length !== 1 ? 's' : ''} saved to this device
        </Text>
      </View>

      {!loading && history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>◷</Text>
          <Text style={styles.emptyTitle}>No scans yet</Text>
          <Text style={styles.emptySub}>Your scan history will appear here after your first analysis.</Text>
          <TouchableOpacity
            style={styles.scanBtn}
            onPress={() => navigation.navigate('Scan')}
          >
            <Text style={styles.scanBtnText}>Go to Scan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id || String(Math.random())}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
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
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.bgGlass,
    borderWidth: 1,
    borderColor: Colors.bgGlassBorder,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  timestamp: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  index: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: FontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  metricIcon: {
    fontSize: 14,
  },
  metricText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  miniGauge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  miniGaugeTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniGaugeFill: {
    height: '100%',
    borderRadius: 2,
  },
  miniGaugeLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    minWidth: 60,
    textAlign: 'right',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  scanBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(0,200,180,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,200,180,0.3)',
  },
  scanBtnText: {
    fontSize: FontSize.md,
    color: Colors.accent,
    fontWeight: FontWeight.bold,
  },
});
