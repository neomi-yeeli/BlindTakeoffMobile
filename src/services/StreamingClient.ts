import { ConnectionStatus, OperationType } from '../types';

export type FramePayload = {
  type: 'frame';
  ts: number;
  data: string;
  width: number;
  height: number;
  operationType: OperationType;
};

export class StreamingClient {
  private socket: WebSocket | null = null;
  private status: ConnectionStatus = 'idle';

  constructor(private url: string, private onStatusChange?: (status: ConnectionStatus) => void) {}

  get currentStatus() {
    return this.status;
  }

  async connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

    await new Promise<void>((resolve, reject) => {
      try {
        // eslint-disable-next-line no-console
        console.log('[streaming] connecting', this.url);
        this.socket = new WebSocket(this.url);
        this.setStatus('connecting');

        this.socket.onopen = () => {
          this.setStatus('connected');
          resolve();
        };

        this.socket.onerror = (event) => {
          this.setStatus('error');
          const maybeMessage = (event as unknown as { message?: unknown })?.message;
          const details = typeof maybeMessage === 'string' ? maybeMessage : JSON.stringify(event);
          reject(new Error(`Streaming socket error (${this.url}): ${details}`));
        };

        this.socket.onclose = (event) => {
          this.setStatus('closed');
          // eslint-disable-next-line no-console
          console.log('[streaming] closed', {
            url: this.url,
            code: (event as unknown as { code?: unknown })?.code,
            reason: (event as unknown as { reason?: unknown })?.reason,
          });
        };
      } catch (error) {
        this.setStatus('error');
        reject(error);
      }
    });
  }

  sendFrame(payload: FramePayload) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    try {
      this.socket.send(JSON.stringify(payload));
    } catch (error) {
      this.setStatus('error');
      // Re-throw for upstream logging, but do not crash the app
      // eslint-disable-next-line no-console
      console.warn('Streaming send failed', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.setStatus('closed');
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.onStatusChange?.(status);
  }
}

