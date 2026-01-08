import { memo } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { colors, radius, spacing } from '../theme';
import { FlightRequest } from '../types';
import { PrimaryButton, SecondaryButton } from './Buttons';
import { formatLocation } from '../utils/format';
import { useStreamingSession } from '../hooks/useStreamingSession';

type Props = {
  request: FlightRequest;
  streamUrl: string;
  autoStart?: boolean;
  onStreamingStart: (ts: number) => void;
  onFinish: (endedAt: number) => void;
};

type CameraCardProps = {
  permissionGranted: boolean;
  onRequestPermission: () => void;
  cameraRef: { current: CameraView | null };
  onCameraReady: () => void;
};

const CameraCard = memo(({ permissionGranted, onRequestPermission, cameraRef, onCameraReady }: CameraCardProps) => {
  return (
    <View style={styles.cameraCard}>
      {!permissionGranted ? (
        <View style={styles.permissionBlock}>
          <Text style={styles.permissionText}>נדרש אישור מצלמה כדי להמשיך.</Text>
          <PrimaryButton label="אפשר גישה למצלמה" onPress={onRequestPermission} />
        </View>
      ) : (
        <CameraView
          ref={cameraRef}
          facing="back"
          onCameraReady={onCameraReady}
          style={styles.camera}
          enableTorch={false}
          mute={false}
          animateShutter={false}
        />
      )}
    </View>
  );
});

export const StreamingScreen = ({
  request,
  streamUrl,
  onStreamingStart,
  onFinish,
  autoStart = true,
}: Props) => {
  const {
    cameraRef,
    onCameraReady,
    beginStreaming,
    permissionGranted,
    connectionLabel,
    errorMessage,
    alarmActive,
    stopAlarm,
    finish,
    isFinishing,
    livePulse,
  } = useStreamingSession({
    request,
    streamUrl,
    autoStart,
    onStreamingStart,
    onFinish,
  });

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

      <CameraCard
        permissionGranted={permissionGranted}
        onRequestPermission={beginStreaming}
        cameraRef={cameraRef}
        onCameraReady={onCameraReady}
      />

      <View style={styles.footer}>
        <View style={styles.statusBlock}>
          <Text style={styles.statusLabel}>חיבור: {connectionLabel}</Text>
          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          {alarmActive ? (
            <SecondaryButton label="כבה אזעקה" onPress={stopAlarm} style={styles.alarmButton} />
          ) : null}
        </View>
        <View style={styles.actions}>
          <PrimaryButton label="סיום הפעולה" onPress={finish} disabled={isFinishing} />
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
  statusBlock: {
    alignSelf: 'stretch',
    alignItems: 'flex-end',
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

