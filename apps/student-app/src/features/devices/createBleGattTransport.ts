import { BleTransportError, type BleGattTransport } from './BleGattTransport';

// TypeScript resolves this fallback while Metro selects the .web.ts implementation on web.
// Native BLE intentionally remains unavailable until a tested native module is included.
export function createBleGattTransport(): BleGattTransport {
  return {
    async connect() {
      throw new BleTransportError(
        'UNSUPPORTED_PLATFORM',
        'Ứng dụng mobile cần native BLE adapter trong Expo development build. Expo Go chưa hỗ trợ kết nối này.',
      );
    },
  };
}
