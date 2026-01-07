import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { FlightRequest, MissionSummary, OperationPhase } from '../types';

const DEFAULT_APPROVAL_MS = 2200;

export const useOperationFlow = (autoApproveMs: number = DEFAULT_APPROVAL_MS) => {
  const [phase, setPhase] = useState<OperationPhase>('form');
  const [request, setRequest] = useState<FlightRequest | null>(null);
  const [summary, setSummary] = useState<MissionSummary | null>(null);
  const [approvalState, setApprovalState] = useState<'pending' | 'approved'>('pending');
  const streamingStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== 'pending') return undefined;
    setApprovalState('pending');

    const timer = setTimeout(async () => {
      setApprovalState('approved');
      setPhase('approved');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, autoApproveMs);

    return () => clearTimeout(timer);
  }, [autoApproveMs, phase]);

  const submitRequest = (data: FlightRequest) => {
    setRequest(data);
    setSummary(null);
    setPhase('pending');
    streamingStartRef.current = null;
  };

  const markStreamingStart = (timestamp: number) => {
    streamingStartRef.current = timestamp;
    setPhase('streaming');
  };

  const finishOperation = (endedAt: number) => {
    if (!request || !streamingStartRef.current) return;
    const endTime = endedAt || Date.now();
    const startTime = streamingStartRef.current;

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
    });
    setPhase('summary');
    streamingStartRef.current = null;
  };

  const reset = () => {
    setPhase('form');
    setSummary(null);
    setRequest(null);
    setApprovalState('pending');
    streamingStartRef.current = null;
  };

  return {
    phase,
    request,
    summary,
    approvalState,
    submitRequest,
    markStreamingStart,
    finishOperation,
    reset,
  };
};

