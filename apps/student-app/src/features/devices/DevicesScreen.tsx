import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell } from '@/shared/components/AppShell';
import { Button, Card, StatusChip } from '@/shared/components/ui';
import { colors } from '@/shared/design-system/theme';
import type { BleConnection } from './BleGattTransport';
import { createBleGattTransport } from './createBleGattTransport';

export function DevicesScreen() {
  const bleTransport = useMemo(() => createBleGattTransport(), []);
  const [bleConnection, setBleConnection] = useState<BleConnection | null>(null);
  const [bleStatus, setBleStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
  const [bleMessage, setBleMessage] = useState('Chọn mạch BLE ở gần để bắt đầu kết nối GATT.');

  useEffect(() => {
    if (!bleConnection) return;
    return bleConnection.onDisconnected(() => {
      setBleConnection(null);
      setBleStatus('idle');
      setBleMessage('Mạch đã ngắt kết nối Bluetooth.');
    });
  }, [bleConnection]);

  async function connectBluetooth() {
    setBleStatus('connecting');
    setBleMessage('Đang chờ bạn chọn thiết bị Bluetooth…');
    try {
      const connection = await bleTransport.connect();
      setBleConnection(connection);
      setBleStatus('connected');
      setBleMessage(`Đã kết nối GATT với ${connection.deviceName}.`);
    } catch (error) {
      setBleStatus('idle');
      setBleMessage(error instanceof Error ? error.message : 'Không thể kết nối Bluetooth.');
    }
  }

  function disconnectBluetooth() {
    bleConnection?.disconnect();
    setBleConnection(null);
    setBleStatus('idle');
    setBleMessage('Đã chủ động ngắt kết nối Bluetooth.');
  }

  return (
    <AppShell>
      <View style={s.header}>
        <View>
          <Text style={s.eyebrow}>THIẾT BỊ VẬT LÝ</Text>
          <Text style={s.title}>Kết nối mạch thật</Text>
          <Text style={s.sub}>Chọn một trong hai phương thức kết nối: Wi‑Fi hoặc Bluetooth.</Text>
        </View>
      </View>
      {/* <View style={s.alert}>
        <Text style={s.alertIcon}>⚠️</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.alertTitle}>Không có pipeline phần cứng đang hoạt động</Text>
          <Text style={s.alertText}>
            MQTT, BLE GATT và firmware bridge chưa có integration/HIL test. Màn hình không hiển thị
            “Đã kết nối” giả.
          </Text>
        </View>
      </View> */}
      <View style={s.columns}>
        <Card style={s.transport}>
          <Text style={s.transportIcon}>⌁</Text>
          <Text style={s.section}>Kết nối qua Wi‑Fi</Text>
          <View style={s.action}>
            <Button>Kết nối Wi‑Fi</Button>
          </View>
        </Card>
        <Card style={s.transport}>
          <Text style={s.transportIcon}>ᛒ</Text>
          <Text style={s.section}>Kết nối qua Bluetooth</Text>
          <StatusChip
            tone={
              bleStatus === 'connected'
                ? 'success'
                : bleStatus === 'connecting'
                  ? 'warning'
                  : 'neutral'
            }
          >
            {bleStatus === 'connected'
              ? 'Đã kết nối'
              : bleStatus === 'connecting'
                ? 'Đang kết nối'
                : 'Chưa kết nối'}
          </StatusChip>
          <Text style={s.text} accessibilityLiveRegion="polite">
            {bleMessage}
          </Text>
          <View style={s.action}>
            {bleStatus === 'connected' ? (
              <Button kind="danger" onPress={disconnectBluetooth}>
                Ngắt Bluetooth
              </Button>
            ) : (
              <Button disabled={bleStatus === 'connecting'} onPress={connectBluetooth}>
                {bleStatus === 'connecting' ? 'Đang kết nối…' : 'Kết nối Bluetooth'}
              </Button>
            )}
          </View>
        </Card>
      </View>
    </AppShell>
  );
}
const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    flexWrap: 'wrap',
  },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.3, color: colors.primary },
  title: { fontSize: 29, fontWeight: '900', color: colors.textPrimary, marginTop: 5 },
  sub: { color: colors.textMuted, marginTop: 7 },
  alert: {
    marginTop: 20,
    backgroundColor: '#FFF7E5',
    borderWidth: 1,
    borderColor: '#F2D89A',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    gap: 12,
  },
  alertIcon: { fontSize: 23 },
  alertTitle: { fontWeight: '900', color: colors.warning },
  alertText: { color: colors.textMuted, lineHeight: 19, marginTop: 4 },
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 16 },
  transport: { minWidth: 300, flex: 1 },
  section: { fontSize: 17, fontWeight: '900', color: colors.textPrimary, marginBottom: 9 },
  transportIcon: { fontSize: 34, color: colors.primary },
  text: { color: colors.textMuted, lineHeight: 20, marginTop: 12 },
  action: { marginTop: 18 },
});
