import { BleTransportError, type BleConnection, type BleGattTransport } from './BleGattTransport';

type BluetoothRemoteGattServer = {
  connected: boolean;
  connect(): Promise<unknown>;
  disconnect(): void;
};
type BluetoothDevice = {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGattServer;
  addEventListener(type: 'gattserverdisconnected', listener: () => void): void;
  removeEventListener(type: 'gattserverdisconnected', listener: () => void): void;
};
type WebBluetooth = {
  requestDevice(options: {
    acceptAllDevices?: boolean;
    filters?: Array<{ services: string[] }>;
    optionalServices?: string[];
  }): Promise<BluetoothDevice>;
};

function configuredServiceUuid() {
  const value = process.env.EXPO_PUBLIC_BLE_SERVICE_UUID?.trim();
  return value || undefined;
}

function bluetoothApi(): WebBluetooth | undefined {
  return (globalThis.navigator as (Navigator & { bluetooth?: WebBluetooth }) | undefined)
    ?.bluetooth;
}

export function createBleGattTransport(): BleGattTransport {
  return {
    async connect(): Promise<BleConnection> {
      if (!globalThis.isSecureContext) {
        throw new BleTransportError(
          'UNSUPPORTED_PLATFORM',
          'Bluetooth cần HTTPS hoặc localhost để hoạt động.',
        );
      }

      const bluetooth = bluetoothApi();
      if (!bluetooth) {
        throw new BleTransportError(
          'UNSUPPORTED_PLATFORM',
          'Trình duyệt này không hỗ trợ Web Bluetooth. Hãy dùng Chrome hoặc Edge trên máy tính, hoặc kết nối Wi‑Fi.',
        );
      }

      const serviceUuid = configuredServiceUuid();
      let device: BluetoothDevice;
      try {
        device = await bluetooth.requestDevice(
          serviceUuid
            ? { filters: [{ services: [serviceUuid] }], optionalServices: [serviceUuid] }
            : { acceptAllDevices: true },
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === 'NotFoundError') {
          throw new BleTransportError(
            'PERMISSION_DENIED',
            'Bạn chưa chọn thiết bị Bluetooth hoặc đã đóng cửa sổ chọn thiết bị.',
          );
        }
        throw new BleTransportError(
          'CONNECTION_FAILED',
          'Không thể mở danh sách thiết bị Bluetooth.',
        );
      }

      if (!device.gatt) {
        throw new BleTransportError(
          'CONNECTION_FAILED',
          'Thiết bị đã chọn không hỗ trợ kết nối BLE GATT.',
        );
      }

      try {
        await device.gatt.connect();
      } catch {
        throw new BleTransportError(
          'CONNECTION_FAILED',
          'Không thể kết nối GATT. Hãy bật Bluetooth, đưa mạch lại gần rồi thử lại.',
        );
      }

      return {
        deviceName: device.name?.trim() || `Thiết bị BLE ${device.id.slice(-4)}`,
        disconnect: () => device.gatt?.disconnect(),
        onDisconnected(listener) {
          device.addEventListener('gattserverdisconnected', listener);
          return () => device.removeEventListener('gattserverdisconnected', listener);
        },
      };
    },
  };
}
