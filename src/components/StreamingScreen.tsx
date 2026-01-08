import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, AppState, AppStateStatus, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { colors, radius, spacing } from '../theme';
import { ConnectionStatus, FlightRequest } from '../types';
import { PrimaryButton, SecondaryButton } from './Buttons';
import { StreamingClient } from '../services/StreamingClient';
import { formatLocation } from '../utils/format';
import { ALARM_SOUND_URI, UI } from '../config';

type Props = {
  request: FlightRequest;
  streamUrl: string;
  autoStart?: boolean;
  onStreamingStart: (ts: number) => void;
  onFinish: (endedAt: number) => void;
};

const FRAME_INTERVAL_MS = UI.frameIntervalMs ?? 1400;

export const StreamingScreen = ({
  request,
  streamUrl,
  onStreamingStart,
  onFinish,
  autoStart = true,
}: Props) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);

  const cameraRef = useRef<CameraView | null>(null);
  const streamingClientRef = useRef<StreamingClient | null>(null);
  const frameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const captureAndSendRef = useRef<(() => Promise<void>) | null>(null);
  const sendingRef = useRef(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const livePulse = useRef(new Animated.Value(0)).current;
  const alarmSoundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      appState.current = nextState;
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(livePulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(livePulse, { toValue: 0.2, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [livePulse]);

  const stopAlarm = useCallback(async () => {
    setAlarmActive(false);
    try {
      if (alarmSoundRef.current) {
        await alarmSoundRef.current.stopAsync();
        await alarmSoundRef.current.unloadAsync();
        alarmSoundRef.current = null;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('stop alarm failed', err);
    }
  }, []);

  const startAlarm = useCallback(async () => {
    if (alarmActive) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: ALARM_SOUND_URI },
        { shouldPlay: true, isLooping: true, volume: 0.7 }
      );
      alarmSoundRef.current = sound;
      setAlarmActive(true);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('alarm playback failed', err);
    }
  }, [alarmActive]);

  useEffect(() => {
    if (connectionStatus === 'error') {
      startAlarm();
    } else {
      stopAlarm();
    }
  }, [connectionStatus, startAlarm, stopAlarm]);

  const ensurePermission = useCallback(async () => {
    if (permission?.granted) return true;
    const result = await requestPermission();
    return result.granted;
  }, [permission?.granted, requestPermission]);

  const stopFrameLoop = useCallback(() => {
    if (frameLoopRef.current) {
      clearInterval(frameLoopRef.current);
      frameLoopRef.current = null;
    }
  }, []);

  const stopStreaming = useCallback(() => {
    stopFrameLoop();
    streamingClientRef.current?.disconnect();
    setIsStreaming(false);
    stopAlarm();
  }, [stopAlarm, stopFrameLoop]);

  useEffect(() => {
    streamingClientRef.current = new StreamingClient(streamUrl, setConnectionStatus);
    return () => {
      stopStreaming();
      streamingClientRef.current?.disconnect();
      stopAlarm();
    };
  }, [stopAlarm, streamUrl, stopStreaming]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: false,
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.warn('audio mode failed', err);
    });
  }, []);

  const captureAndSend = useCallback(async () => {
    if (appState.current !== 'active') return;
    if (!cameraReady || !cameraRef.current) return;
    if (sendingRef.current) return;
    if (connectionStatus !== 'connected') return;

    sendingRef.current = true;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        // Lower quality helps sustain higher FPS over WebSocket
        quality: 0.2,
        skipProcessing: true,
      });
      if (photo?.base64) {
        streamingClientRef.current?.sendFrame({
          type: 'frame',
          ts: Date.now(),
          data: photo.base64,
          width: photo.width ?? 0,
          height: photo.height ?? 0,
          operationType: request.operationType,
        });
      }
    } catch (error) {
      setErrorMessage('Frame capture failed. Check camera placement.');
      // eslint-disable-next-line no-console
      console.warn('capture failed', error);
    } finally {
      sendingRef.current = false;
    }
  }, [cameraReady, connectionStatus, request.operationType]);

  // Keep the interval always calling the latest capture function (avoid stale closure).
  captureAndSendRef.current = captureAndSend;

  const startFrameLoop = useCallback(() => {
    if (frameLoopRef.current) return;
    frameLoopRef.current = setInterval(() => {
      void captureAndSendRef.current?.();
    }, FRAME_INTERVAL_MS);
  }, []);

  const beginStreaming = useCallback(async () => {
    const hasPermission = await ensurePermission();
    if (!hasPermission) {
      setErrorMessage('Camera permission is required to start streaming.');
      return;
    }

    try {
      await streamingClientRef.current?.connect();
      setIsStreaming(true);
      onStreamingStart(Date.now());
      startFrameLoop();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      setErrorMessage('Unable to reach streaming server. Check URL and network.');
      // eslint-disable-next-line no-console
      console.warn('streaming connect error', error);
    }
  }, [ensurePermission, onStreamingStart, startFrameLoop]);

  useEffect(() => {
    if (autoStart && permission?.granted && cameraReady && !isStreaming) {
      beginStreaming();
    }
  }, [autoStart, beginStreaming, cameraReady, isStreaming, permission?.granted]);

  const finish = useCallback(async () => {
    const endedAt = Date.now();
    setIsFinishing(true);
    stopStreaming();
    try {
      await onFinish(endedAt);
    } finally {
      setIsFinishing(false);
    }
  }, [onFinish, stopStreaming]);

  const connectionLabel = useMemo(() => {
    switch (connectionStatus) {
      case 'connected':
        return 'מחובר';
      case 'connecting':
        return 'מתחבר...';
      case 'error':
        return 'שגיאה בחיבור';
      case 'closed':
        return 'מנותק';
      default:
        return 'בהמתנה';
    }
  }, [connectionStatus]);

  const permissionGranted = permission?.granted ?? false;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>מצב מצלמה חי</Text>
          <Text style={styles.subtitle}>הנח את הטלפון על עמדת ההמראה. ההזרמה החיה תתחיל אוטומטית.</Text>
          <Text style={styles.meta}>
            מיקום: {formatLocation(request.lat, request.lon)}
            {request.locationLabel ? ` (${request.locationLabel})` : ''}
          </Text>
          <Text style={styles.meta}>
            גודל רחפן: {request.widthCm}×{request.lengthCm} ס"מ · {request.operationType === 'takeoff' ? 'המראה' : 'נחיתה'}
          </Text>
        </View>
        <View style={styles.statusPill}>
          <Animated.View style={[styles.liveDot, { opacity: livePulse }]} />
          <Text style={styles.statusText}>LIVE</Text>
        </View>
      </View>

      <View style={styles.cameraCard}>
        {!permissionGranted ? (
          <View style={styles.permissionBlock}>
            <Text style={styles.permissionText}>נדרש אישור מצלמה כדי להמשיך.</Text>
            <PrimaryButton label="אפשר גישה למצלמה" onPress={beginStreaming} />
          </View>
        ) : (
          <CameraView
            ref={(ref) => {
              cameraRef.current = ref;
            }}
            facing="back"
            onCameraReady={() => setCameraReady(true)}
            style={styles.camera}
            enableTorch={false}
            mute={false}
          />
        )}
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.statusLabel}>חיבור</Text>
          <Text style={styles.statusValue}>{connectionLabel}</Text>
          <Text style={styles.statusUrl} numberOfLines={2}>
            {streamUrl}
          </Text>
          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          {alarmActive ? (
            <SecondaryButton label="כבה אזעקה" onPress={stopAlarm} style={styles.alarmButton} />
          ) : null}
        </View>
        <View style={styles.actions}>
          <PrimaryButton label="סיום הפעולה" onPress={finish} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: spacing.md,
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  subtitle: {
    color: colors.muted,
    marginTop: 4,
    writingDirection: 'rtl',
    textAlign: 'right',
    fontSize: 13,
  },
  meta: {
    color: colors.muted,
    marginTop: 2,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#0f172a',
    borderRadius: radius.lg,
    borderColor: colors.border,
    borderWidth: 1,
    gap: 6,
  },
  liveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  statusText: {
    color: colors.text,
    fontWeight: '700',
  },
  cameraCard: {
    height: 500,
    backgroundColor: '#0f172a',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  footer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusLabel: {
    color: colors.muted,
    fontWeight: '600',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  statusValue: {
    color: colors.text,
    fontWeight: '700',
    marginTop: 4,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  statusUrl: {
    color: colors.muted,
    marginTop: 4,
    maxWidth: 280,
  },
  error: {
    color: colors.danger,
    marginTop: 4,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmButton: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  permissionBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  permissionText: {
    color: colors.muted,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});

