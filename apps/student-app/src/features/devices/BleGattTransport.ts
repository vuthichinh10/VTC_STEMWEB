export type BleConnection = {
  deviceName: string;
  disconnect: () => void;
  onDisconnected: (listener: () => void) => () => void;
};

export interface BleGattTransport {
  connect(): Promise<BleConnection>;
}

export class BleTransportError extends Error {
  constructor(
    readonly code: 'UNSUPPORTED_PLATFORM' | 'PERMISSION_DENIED' | 'CONNECTION_FAILED',
    message: string,
  ) {
    super(message);
    this.name = 'BleTransportError';
  }
}
