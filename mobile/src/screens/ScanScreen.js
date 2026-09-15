
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';

import { useState, useRef, useEffect } from 'react';

import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from 'expo-camera';

import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { api } from '../services/api';
import { saveResult } from '../utils/storage';
import ProgressOverlay from '../components/ProgressOverlay';

import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from '../utils/theme';

const { width } = Dimensions.get('window');

export default function ScanScreen({ navigation }) {
  // ============================================================
  // PERMISSIONS
  // ============================================================

  const [cameraPermission, requestCameraPermission] =
    useCameraPermissions();

  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();

  // ============================================================
  // STATE
  // ============================================================

  const [showCamera, setShowCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [flashOn, setFlashOn] = useState(true);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const cameraRef = useRef(null);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  const recordPulse = useRef(new Animated.Value(1)).current;

  // ============================================================
  // RECORDING PULSE ANIMATION
  // ============================================================

  useEffect(() => {
    let animation;

    if (isRecording) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(recordPulse, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(recordPulse, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );

      animation.start();
    } else {
      recordPulse.stopAnimation();
      recordPulse.setValue(1);
    }

    return () => {
      if (animation) {
        animation.stop();
      }

      recordPulse.stopAnimation();
      recordPulse.setValue(1);
    };
  }, [isRecording, recordPulse]);

  // ============================================================
  // RECORDING TIMER
  // ============================================================

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setTimer(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRecording]);

  // ============================================================
  // CLEANUP
  // ============================================================

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, []);

  // ============================================================
  // PROCESS VIDEO
  // ============================================================

  const processVideo = async (uri, fileName = 'recording.mp4') => {
    if (!uri) {
      Alert.alert('Error', 'No video was selected.');
      return;
    }

    setLoading(true);
    setProgress(0);

    progressRef.current = setInterval(() => {
      setProgress((p) => {
        if (p < 85) {
          return Math.min(85, p + Math.random() * 8);
        }

        return p;
      });
    }, 400);

    try {
      console.log('Prediction request:', uri);

      // Send the actual video URI to your API.
      const data = await api.predict(uri, fileName);

      if (progressRef.current) {
        clearInterval(progressRef.current);
        progressRef.current = null;
      }

      setProgress(100);

      console.log('Prediction response:', data);

      if (data?.error) {
        Alert.alert('Analysis Error', data.error);
        setProgress(0);
        return;
      }

      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );

      await saveResult(data);

      setTimeout(() => {
        setProgress(0);

        navigation.navigate('Results', {
          results: data,
        });
      }, 600);
    } catch (error) {
      console.log('Prediction request error:', error);

      if (progressRef.current) {
        clearInterval(progressRef.current);
        progressRef.current = null;
      }

      setProgress(0);

      Alert.alert(
        'Connection Error',
        error?.message ||
        'Failed to connect to the server. Is the backend running?'
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // START RECORDING
  // ============================================================

  const startRecording = async () => {
    if (isRecording) {
      return;
    }

    if (!cameraRef.current) {
      Alert.alert('Camera Error', 'Camera is not ready yet.');
      return;
    }

    const cameraResult = await requestCameraPermission();
    const microphoneResult = await requestMicrophonePermission();

    if (!cameraResult.granted || !microphoneResult.granted) {
      Alert.alert(
        'Permissions Required',
        'Camera and microphone permissions are required to record a video. Please enable both in Settings.'
      );
      return;
    }

    try {
      await Haptics.impactAsync(
        Haptics.ImpactFeedbackStyle.Medium
      );

      setIsRecording(true);

      console.log('Starting video recording...');

      const video = await cameraRef.current.recordAsync({
        maxDuration: 60,
      });

      console.log('Recorded video:', video);

      if (video?.uri) {
        console.log('Recorded video URI:', video.uri);

        await processVideo(
          video.uri,
          'glucose-recording.mp4'
        );
      } else {
        Alert.alert(
          'Recording Error',
          'Video URI was not generated.'
        );
      }
    } catch (error) {
      console.log('Recording error:', error);

      Alert.alert(
        'Recording Error',
        error?.message ||
        'Unable to record video. Please check camera and microphone permissions.'
      );
    } finally {
      setIsRecording(false);
    }
  };

  // ============================================================
  // STOP RECORDING
  // ============================================================

  const stopRecording = async () => {
    if (!cameraRef.current || !isRecording) {
      return;
    }

    try {
      setIsRecording(false);

      cameraRef.current.stopRecording();

      await Haptics.impactAsync(
        Haptics.ImpactFeedbackStyle.Light
      );
    } catch (error) {
      console.log('Stop recording error:', error);
    }
  };

  // ============================================================
  // PICK VIDEO FROM GALLERY
  // ============================================================

  const pickVideo = async () => {
    try {
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['videos'],
          quality: 1,
        });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];

        await processVideo(
          asset.uri,
          asset.fileName || 'video.mp4'
        );
      }
    } catch (error) {
      console.log('Gallery error:', error);

      Alert.alert(
        'Gallery Error',
        'Unable to select the video.'
      );
    }
  };

  // ============================================================
  // OPEN CAMERA
  // ============================================================

  const openCamera = async () => {
    try {
      const cameraResult = await requestCameraPermission();
      const microphoneResult = await requestMicrophonePermission();

      if (!cameraResult.granted || !microphoneResult.granted) {
        Alert.alert(
          'Permissions Required',
          'Camera and microphone access is required to record your fingertip video. Please enable both permissions in Settings.'
        );
        return;
      }

      setShowCamera(true);
    } catch (error) {
      console.log('Permission error:', error);

      Alert.alert(
        'Permission Error',
        'Unable to request camera permissions.'
      );
    }
  };

  // ============================================================
  // CLOSE CAMERA
  // ============================================================

  const closeCamera = () => {
    if (isRecording) {
      stopRecording();
    }

    setShowCamera(false);
  };

  // ============================================================
  // FORMAT TIMER
  // ============================================================

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================================
  // CAMERA SCREEN
  // IMPORTANT:
  // CameraView MUST NOT HAVE CHILDREN.
  // All overlays are placed OUTSIDE CameraView.
  // ============================================================

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <StatusBar hidden />

        {/* CAMERA ONLY — NO CHILDREN */}
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          mode="video"
          enableTorch={flashOn}
        />

        {/* TOP CONTROLS */}
        <View style={styles.cameraTopBar}>
          <TouchableOpacity
            style={styles.cameraBtn}
            onPress={closeCamera}
            disabled={loading}
          >
            <Text style={styles.cameraBtnText}>✕</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cameraBtn,
              flashOn && styles.cameraBtnActive,
            ]}
            onPress={() => setFlashOn((f) => !f)}
            disabled={loading}
          >
            <Text style={styles.cameraBtnText}>⚡</Text>

            <Text style={styles.cameraBtnLabel}>
              {flashOn ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* TIPS OVERLAY */}
        {!isRecording && !loading && (
          <View style={styles.tipsOverlay}>
            <View style={styles.tipCard}>
              <Text style={styles.tipEmoji}>☝️</Text>

              <Text style={styles.tipText}>
                Place your fingertip on the camera lens.{'\n'}
                Keep flash ON and hold steady.
              </Text>
            </View>
          </View>
        )}

        {/* RECORDING TIMER */}
        {isRecording && (
          <View style={styles.timerContainer}>
            <View style={styles.timerBadge}>
              <View style={styles.recDot} />

              <Text style={styles.timerText}>
                REC {formatTime(timer)}
              </Text>
            </View>
          </View>
        )}

        {/* BOTTOM RECORD BUTTON */}
        <View style={styles.cameraBottomBar}>
          <View style={styles.recordBtnOuter}>
            <Animated.View
              style={{
                transform: [{ scale: recordPulse }],
              }}
            >
              <TouchableOpacity
                style={[
                  styles.recordBtn,
                  isRecording && styles.recordBtnRecording,
                ]}
                onPress={
                  isRecording
                    ? stopRecording
                    : startRecording
                }
                activeOpacity={0.7}
                disabled={loading}
              >
                {isRecording ? (
                  <View style={styles.stopSquare} />
                ) : (
                  <View style={styles.recordCircle} />
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>

          <Text style={styles.recordHint}>
            {isRecording
              ? 'Tap to stop recording'
              : 'Tap to start recording'}
          </Text>
        </View>

        {/* LOADING OVERLAY */}
        <ProgressOverlay
          visible={loading}
          progress={progress}
        />
      </View>
    );
  }

  // ============================================================
  // MAIN SCAN SCREEN
  // ============================================================

  return (
    <LinearGradient
      colors={[Colors.bg, '#0f1a24', Colors.bg]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

      <View style={styles.header}>
        <Text style={styles.sectionLabel}>New Scan</Text>

        <Text style={styles.title}>Capture Video</Text>

        <Text style={styles.subtitle}>
          Record your fingertip pressed on the rear camera for
          ~30 seconds under good lighting.
        </Text>
      </View>

      {/* TIPS */}
      <View style={styles.tips}>
        {[
          { icon: '☀️', tip: 'Use good lighting' },
          { icon: '🤏', tip: 'Steady pressure on lens' },
          { icon: '⏱', tip: 'Minimum 15 seconds' },
          { icon: '🔋', tip: 'Flash ON recommended' },
        ].map((t) => (
          <View key={t.tip} style={styles.tipItem}>
            <Text style={styles.tipItemIcon}>
              {t.icon}
            </Text>

            <Text style={styles.tipItemText}>
              {t.tip}
            </Text>
          </View>
        ))}
      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={openCamera}
          disabled={loading}
        >
          <LinearGradient
            colors={[
              'rgba(0,200,180,0.12)',
              'rgba(0,200,180,0.04)',
            ]}
            style={styles.actionCardInner}
          >
            <View style={styles.actionIconWrap}>
              <Text style={styles.actionIcon}>📹</Text>
            </View>

            <Text style={styles.actionTitle}>
              Record Video
            </Text>

            <Text style={styles.actionDesc}>
              Open camera and record your fingertip in
              real-time
            </Text>

            <View style={styles.actionArrow}>
              <Text style={styles.actionArrowText}>→</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={pickVideo}
          disabled={loading}
        >
          <LinearGradient
            colors={[
              'rgba(255,169,77,0.12)',
              'rgba(255,169,77,0.04)',
            ]}
            style={styles.actionCardInner}
          >
            <View
              style={[
                styles.actionIconWrap,
                {
                  backgroundColor:
                    'rgba(255,169,77,0.15)',
                },
              ]}
            >
              <Text style={styles.actionIcon}>📁</Text>
            </View>

            <Text style={styles.actionTitle}>
              Pick from Gallery
            </Text>

            <Text style={styles.actionDesc}>
              Select an existing video file from your phone
            </Text>

            <View
              style={[
                styles.actionArrow,
                {
                  backgroundColor:
                    'rgba(255,169,77,0.1)',
                },
              ]}
            >
              <Text
                style={[
                  styles.actionArrowText,
                  { color: Colors.preDiabetic },
                ]}
              >
                →
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      </ScrollView>

      <ProgressOverlay
        visible={loading}
        progress={progress}
      />
    </LinearGradient>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
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
    marginBottom: Spacing.sm,
  },

  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  tips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },

  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bgGlass,
    borderWidth: 1,
    borderColor: Colors.bgGlassBorder,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },

  tipItemIcon: {
    fontSize: 14,
  },

  tipItemText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },

  actions: {
    gap: Spacing.md,
  },

  actionCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.bgGlassBorder,
  },

  actionCardInner: {
    padding: Spacing.xl,
  },

  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(0,200,180,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },

  actionIcon: {
    fontSize: 24,
  },

  actionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },

  actionDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },

  actionArrow: {
    position: 'absolute',
    top: Spacing.xl,
    right: Spacing.xl,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,200,180,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionArrowText: {
    fontSize: 18,
    color: Colors.accent,
    fontWeight: FontWeight.bold,
  },

  // ==========================================================
  // CAMERA STYLES
  // ==========================================================

  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },

  camera: {
    flex: 1,
    width: '100%',
  },

  cameraTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
  },

  cameraBtn: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  cameraBtnActive: {
    backgroundColor: 'rgba(0,200,180,0.3)',
  },

  cameraBtnText: {
    fontSize: 18,
    color: '#fff',
  },

  cameraBtnLabel: {
    fontSize: FontSize.xs,
    color: '#fff',
    fontWeight: FontWeight.semibold,
  },

  tipsOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },

  tipCard: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    maxWidth: 280,
  },

  tipEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },

  tipText: {
    fontSize: FontSize.md,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
  },

  timerContainer: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,77,109,0.2)',
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },

  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.high,
  },

  timerText: {
    fontSize: FontSize.md,
    color: '#fff',
    fontWeight: FontWeight.bold,
    fontVariant: ['tabular-nums'],
  },

  cameraBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 60,
  },

  recordBtnOuter: {
    marginBottom: Spacing.md,
  },

  recordBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  recordBtnRecording: {
    borderColor: Colors.high,
  },

  recordCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.high,
  },

  stopSquare: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: Colors.high,
  },

  recordHint: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: FontWeight.medium,
  },
});