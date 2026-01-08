export const STREAM_SERVER_URL =
  process.env.EXPO_PUBLIC_STREAM_URL ?? 'ws://localhost:8080/stream';

export const AUTO_APPROVE_MS = 2200;

export const UI = {
  // 5 frames/sec (video-like feel)
  frameIntervalMs: 200,
};

export const ALARM_SOUND_URI =
  process.env.EXPO_PUBLIC_ALARM_SOUND_URI ??
  'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg';

