import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { FlightRequest, LocationSample, MissionSummary, OperationPhase } from '../types';

const DEFAULT_APPROVAL_MS = 2200;

// Mock function to simulate fetching samples from server
// TODO: Replace with actual API call when backend is ready
const fetchSamplesFromServer = async (): Promise<LocationSample[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  // Generate mock samples (4-5 samples with realistic data)
  const now = Date.now();
  const mockSamples: LocationSample[] = [
    { timestamp: now - 12000, lat: 32.0853, lon: 34.7818, altitude: 12.5 },
    { timestamp: now - 9000, lat: 32.0854, lon: 34.7819, altitude: 15.2 },
    { timestamp: now - 6000, lat: 32.0855, lon: 34.7820, altitude: 18.7 },
    { timestamp: now - 3000, lat: 32.0856, lon: 34.7821, altitude: 22.3 },
    { timestamp: now, lat: 32.0857, lon: 34.7822, altitude: 25.0 },
  ];
  
  return mockSamples;
};

export const useOperationFlow = (autoApproveMs: number = DEFAULT_APPROVAL_MS) => {
  const [phase, setPhase] = useState<OperationPhase>('home');
  const [request, setRequest] = useState<FlightRequest | null>(null);
  const [summary, setSummary] = useState<MissionSummary | null>(null);
  const [approvalState, setApprovalState] = useState<'pending' | 'approved'>('pending');
  const streamingStartRef = useRef<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [countdownMs, setCountdownMs] = useState<number>(0);

  useEffect(() => {
    if (phase !== 'pending') return undefined;
    setApprovalState('pending');

    const timer = setTimeout(async () => {
      setApprovalState('approved');
      setPhase('countdown');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, autoApproveMs);

    return () => clearTimeout(timer);
  }, [autoApproveMs, phase]);

  useEffect(() => {
    if (phase !== 'countdown') {
      stopCountdown();
      return;
    }
    if (!request) return;
    if (countdownMs <= 0) {
      setPhase('streaming');
      return;
    }
    startCountdown();
    return () => stopCountdown();
  }, [countdownMs, phase, request]);

  const startCountdown = () => {
    stopCountdown();
    countdownRef.current = setInterval(() => {
      setCountdownMs((prev) => {
        const next = Math.max(0, prev - 1000);
        if (next <= 0) {
          stopCountdown();
          setPhase('streaming');
        }
        return next;
      });
    }, 1000);
  };

  const stopCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  const submitRequest = (data: FlightRequest) => {
    setRequest(data);
    setCountdownMs(data.timerMs);
    setSummary(null);
    setPhase('pending');
    streamingStartRef.current = null;
  };

  const markStreamingStart = (timestamp: number) => {
    streamingStartRef.current = timestamp;
    setPhase('streaming');
  };

  const finishOperation = async (endedAt: number) => {
    if (!request) return;
    const endTime = endedAt || Date.now();
    const startTime = streamingStartRef.current || endTime - 5000; // Use current time or 5 seconds ago as fallback

    // Fetch samples from server (currently mock data)
    const samples = await fetchSamplesFromServer();

    setSummary({
      operationType: request.operationType,
      startTime,
      endTime,
      droneSizeCm: {
        width: request.widthCm,
        length: request.lengthCm,
      },
      location: {
        lat: request.lat,
        lon: request.lon,
        label: request.locationLabel,
      },
      samples,
    });
    setPhase('summary');
    streamingStartRef.current = null;
  };

  const reset = () => {
    setPhase('home');
    setSummary(null);
    setRequest(null);
    setApprovalState('pending');
    streamingStartRef.current = null;
    stopCountdown();
    setCountdownMs(0);
  };

  const startNew = () => {
    setPhase('form');
    setSummary(null);
    setRequest(null);
    setApprovalState('pending');
    stopCountdown();
    setCountdownMs(0);
    streamingStartRef.current = null;
  };

  const updateTimer = (ms: number) => {
    setCountdownMs(ms);
    if (request) {
      setRequest({ ...request, timerMs: ms });
    }
    if (phase === 'countdown') {
      if (ms <= 0) {
        setPhase('streaming');
      } else {
        startCountdown();
      }
    }
  };

  const launchNow = () => {
    setCountdownMs(0);
    stopCountdown();
    setPhase('streaming');
  };

  return {
    phase,
    request,
    summary,
    approvalState,
    countdownMs,
    submitRequest,
    markStreamingStart,
    finishOperation,
    startNew,
    updateTimer,
    launchNow,
    reset,
  };
};

