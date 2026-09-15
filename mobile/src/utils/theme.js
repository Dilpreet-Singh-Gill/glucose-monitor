/**
 * GlucoScan AI — Design System
 * Matches the web app's dark glassmorphic aesthetic
 */

export const Colors = {
  // Backgrounds
  bg: '#0a0a0f',
  bgCard: 'rgba(255,255,255,0.04)',
  bgCardHover: 'rgba(255,255,255,0.07)',
  bgGlass: 'rgba(255,255,255,0.06)',
  bgGlassBorder: 'rgba(255,255,255,0.1)',
  bgInput: 'rgba(255,255,255,0.05)',

  // Text
  textPrimary: '#f0f0f5',
  textSecondary: 'rgba(240,240,245,0.6)',
  textMuted: 'rgba(240,240,245,0.35)',

  // Accents
  accent: '#00c8b4',
  accentDim: 'rgba(0,200,180,0.15)',
  accentGlow: 'rgba(0,200,180,0.25)',

  // Status
  normal: '#00c8b4',
  low: '#ffe566',
  preDiabetic: '#ffa94d',
  high: '#ff4d6d',
  undetected: '#9e9e9e',

  // Gradients
  gradientStart: '#0a0a0f',
  gradientEnd: '#0f1a24',
  accentGradientStart: '#00c8b4',
  accentGradientEnd: '#00a89e',

  // UI
  border: 'rgba(255,255,255,0.08)',
  borderActive: 'rgba(0,200,180,0.4)',
  error: '#ff4d6d',
  errorBg: 'rgba(255,77,109,0.1)',
  success: '#00c8b4',
  successBg: 'rgba(0,200,180,0.1)',
  warning: '#ffa94d',
  warningBg: 'rgba(255,169,77,0.1)',

  // Tab bar
  tabBarBg: 'rgba(10,10,15,0.95)',
  tabBarBorder: 'rgba(255,255,255,0.06)',
  tabInactive: 'rgba(240,240,245,0.35)',
  tabActive: '#00c8b4',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  xxxl: 36,
  hero: 44,
};

export const FontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

// ---------- Status Helpers ----------

export function getGlucoseStatus(g) {
  if (g < 70) return { label: 'Low', color: Colors.low, emoji: '⬇' };
  if (g <= 99) return { label: 'Normal', color: Colors.normal, emoji: '✓' };
  if (g <= 125) return { label: 'Pre-diabetic', color: Colors.preDiabetic, emoji: '⚠' };
  return { label: 'High', color: Colors.high, emoji: '⬆' };
}

export function getHRStatus(hr) {
  if (hr === 0) return { label: 'Undetected', color: Colors.undetected };
  if (hr < 60) return { label: 'Low', color: Colors.low };
  if (hr <= 100) return { label: 'Normal', color: Colors.normal };
  return { label: 'Elevated', color: Colors.preDiabetic };
}

export function getQualityInfo(quality) {
  switch (quality) {
    case 'good':
      return { label: 'Good', color: Colors.normal, icon: '🟢' };
    case 'acceptable':
      return { label: 'Acceptable', color: Colors.preDiabetic, icon: '🟡' };
    case 'poor':
      return { label: 'Poor', color: '#ff8a65', icon: '🟠' };
    case 'unusable':
      return { label: 'Unusable', color: Colors.high, icon: '🔴' };
    default:
      return { label: 'Unknown', color: Colors.undetected, icon: '⚪' };
  }
}

// Shared shadow style for glassmorphic cards
export const GlassCard = {
  backgroundColor: Colors.bgGlass,
  borderWidth: 1,
  borderColor: Colors.bgGlassBorder,
  borderRadius: BorderRadius.xl,
};
