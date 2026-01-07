export const formatTime = (value: number) =>
  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const formatDuration = (ms: number) => {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const padded = seconds.toString().padStart(2, '0');
  return `${minutes}:${padded}`;
};

export const formatLocation = (lat: number, lon: number) => `${lat.toFixed(5)}, ${lon.toFixed(5)}`;

