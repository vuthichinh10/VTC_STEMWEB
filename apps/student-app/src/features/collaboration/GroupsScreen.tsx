import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuthStore } from '@/features/auth/auth-store';
import { AppShell } from '@/shared/components/AppShell';
import { Button, Card, EmptyState, StatusChip } from '@/shared/components/ui';
import { colors } from '@/shared/design-system/theme';

const tabs = ['Dự án', 'Nhiệm vụ', 'Thảo luận', 'Thành viên'] as const;

export function GroupsScreen() {
  const user = useAuthStore((state) => state.user);
  const [tab, setTab] = useState<(typeof tabs)[number]>('Dự án');
  const [joinCode, setJoinCode] = useState('');
  return (
    <AppShell>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>CỘNG TÁC AN TOÀN</Text>
          <Text style={styles.title}>Nhóm sáng tạo</Text>
          <Text style={styles.subtitle}>Chia việc, thảo luận và cùng phát triển dự án STEM.</Text>
        </View>
       <StatusChip tone="warning">Chưa kết nối mạch</StatusChip>
      </View>
      <View style={styles.heroGrid}>
        <Card style={styles.createCard}>
          <Text style={styles.cardIcon}>👥</Text>
          <Text style={styles.cardTitle}>Tạo nhóm mới</Text>
          <Text style={styles.body}>Đặt mục tiêu và mời bạn cùng làm dự án.</Text>
          <TextInput
            style={styles.input}
            placeholder="Tên nhóm sáng tạo"
            editable={Boolean(user)}
          />
          <Button disabled={!user}>Tạo nhóm</Button>
          {!user && <Text style={styles.note}>Đăng nhập để tạo nhóm và lưu dữ liệu.</Text>}
        </Card>
        <Card style={styles.joinCard}>
          <Text style={styles.cardIcon}>🔑</Text>
          <Text style={styles.cardTitle}>Tham gia bằng mã</Text>
          <Text style={styles.body}>Mã mời phải còn hạn và chưa bị thu hồi.</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: STEM-24A"
            value={joinCode}
            onChangeText={setJoinCode}
            autoCapitalize="characters"
            editable={Boolean(user)}
          />
          <Button kind="soft" disabled={!user || joinCode.trim().length < 4}>
            Tham gia nhóm
          </Button>
        </Card>
        {/* <Card style={styles.safetyCard}>
          <Text style={styles.cardIcon}>🛡️</Text>
          <Text style={styles.cardTitle}>Quyền được tách riêng</Text>
          <Text style={styles.body}>
            Vai trò nhóm không tự động cấp quyền điều khiển mạch thật. Thiết bị luôn cần quyền và
            controller lease riêng.
          </Text>
        </Card> */}
      </View>
      <View style={styles.workspace}>
        <View style={styles.tabs}>
          {tabs.map((item) => (
            <Button
              key={item}
              kind={tab === item ? 'primary' : 'soft'}
              onPress={() => setTab(item)}
            >
              {item}
            </Button>
          ))}
        </View>
        <EmptyState
          title={`Chưa có ${tab.toLowerCase()}`}
          message={
            user
              ? 'Hãy tạo dự án nhóm.'
              : 'Đăng nhập và tham gia một nhóm để xem không gian cộng tác.'
          }
        />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    flexWrap: 'wrap',
  },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.3, color: colors.primary },
  title: { fontSize: 29, fontWeight: '900', color: colors.textPrimary, marginTop: 5 },
  subtitle: { color: colors.textMuted, marginTop: 7 },
  heroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 22 },
  createCard: { minWidth: 280, flex: 1 },
  joinCard: { minWidth: 280, flex: 1 },
  safetyCard: { minWidth: 260, flex: 0.8, backgroundColor: '#FFF9ED', borderColor: '#F2D99E' },
  cardIcon: { fontSize: 30 },
  cardTitle: { fontSize: 17, fontWeight: '900', color: colors.textPrimary, marginTop: 10 },
  body: { color: colors.textMuted, lineHeight: 20, marginVertical: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    color: colors.textPrimary,
    marginVertical: 8,
  },
  note: { fontSize: 11, color: colors.warning, marginTop: 8 },
  workspace: { marginTop: 20, gap: 14 },
  tabs: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
});
