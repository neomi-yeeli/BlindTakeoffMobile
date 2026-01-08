import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, AppState, AppStateStatus } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { ALARM_SOUND_URI, UI } from '../config';
import { ConnectionStatus, FlightRequest } from '../types';
import { StreamingClient } from '../services/StreamingClient';

const FRAME_INTERVAL_MS = UI.frameIntervalMs ?? 1400;

type Props = {
  request: FlightRequest;
  streamUrl: string;
  autoStart?: boolean;
  onStreamingStart: (ts: number) => void;
  onFinish: (endedAt: number) => Promise<void> | void;
};

export const useStreamingSession = ({
  request,
  streamUrl,
  autoStart = true,
  onStreamingStart,
  onFinish,
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
  const autoStartBlockedRef = useRef(false);
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

  const onCameraReady = useCallback(() => {
    setCameraReady(true);
  }, []);

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
        quality: 0.2,
        skipProcessing: true,
        shutterSound: false,
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
      setErrorMessage((prev) => prev ?? 'Frame capture failed. Check camera placement.');
      // eslint-disable-next-line no-console
      console.warn('capture failed', error);
    } finally {
      sendingRef.current = false;
    }
  }, [cameraReady, connectionStatus, request.operationType]);

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
    if (autoStartBlockedRef.current) return;
    if (autoStart && permission?.granted && cameraReady && !isStreaming && !isFinishing) {
      beginStreaming();
    }
  }, [autoStart, beginStreaming, cameraReady, isFinishing, isStreaming, permission?.granted]);

  const finish = useCallback(async () => {
    const endedAt = Date.now();
    autoStartBlockedRef.current = true;
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

  return {
    cameraRef,
    onCameraReady,
    permissionGranted,
    beginStreaming,
    connectionLabel,
    errorMessage,
    alarmActive,
    stopAlarm,
    finish,
    isFinishing,
    livePulse,
  };
};

