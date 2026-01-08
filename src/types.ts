export type OperationType = 'takeoff' | 'landing';

export type OperationPhase = 'home' | 'form' | 'pending' | 'countdown' | 'streaming' | 'summary';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'closed';

export interface FlightRequest {
  lat: number;
  lon: number;
  widthCm: number;
  lengthCm: number;
  operationType: OperationType;
  timerMs: number;
  locationLabel?: string;
  createdAt: number;
}

export interface LocationSample {
  timestamp: number;
  lat: number;
  lon: number;
  altitude: number;
}

export interface MissionSummary {
  operationType: OperationType;
  startTime: number;
  endTime: number;
  location: {
    lat: number;
    lon: number;
    label?: string;
  };
  droneSizeCm: {
    width: number;
    length: number;
  };
  samples: LocationSample[];
}

