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

