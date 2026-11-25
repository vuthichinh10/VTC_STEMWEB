import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { api } from '@/shared/api/client';
import { AppShell } from '@/shared/components/AppShell';
import { Card } from '@/shared/components/ui';
import { colors } from '@/shared/design-system/theme';

export function DashboardScreen() {
  const stats = useQuery({ queryKey: ['dashboard'], queryFn: api.stats, retry: false });
  const values = stats.data ?? {
    completedLessons: 0,
    totalLessons: 10,
    completedProjects: 0,
    groups: 0,
    pairedDevices: 0,
  };
  return (
    <AppShell>
      <View style={styles.hero}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>PHÒNG THÍ NGHIỆM STEM THẾ HỆ MỚI</Text>
          <Text style={styles.heroTitle}>Học bằng cách tự tay khám phá.</Text>
          <Text style={styles.heroText}>
            Chọn một bài học, lắp module, viết chương trình và quan sát kết quả an toàn trong chế độ
            mô phỏng.
          </Text>
          <Link href={`/learn/${stats.data?.resumeLessonId ?? 'led-on'}`} style={styles.heroButton}>
            Tiếp tục bài học →
          </Link>
        </View>
        <Text style={styles.heroIcon}>🔬</Text>
      </View>
      <Text style={styles.heading}>Hành trình của em</Text>
      <View style={styles.grid}>
        {[
          ['📘', 'Bài học đã hoàn thành', `${values.completedLessons}/${values.totalLessons}`],
          ['🧩', 'Dự án đã hoàn thành', String(values.completedProjects)],
          ['👥', 'Nhóm tham gia', String(values.groups)],
          ['🎛️', 'Mạch đã ghép nối', String(values.pairedDevices)],
        ].map(([icon, label, value]) => (
          <Card key={label} style={styles.stat}>
            <Text style={styles.statIcon}>{icon}</Text>
            <Text style={styles.muted}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
          </Card>
        ))}
      </View>
      <Text style={styles.heading}>Bắt đầu từ đây</Text>
      <View style={styles.grid}>
        {[
          ['/learn', '💡', 'Bài học STEM', '10 bài học theo 4 bước rõ ràng.'],
          ['/projects', '🌙', 'Dự án mở rộng', 'Áp dụng nhiều kiến thức vào sản phẩm.'],
          ['/maker', '🚀', 'Không gian sáng tạo', 'Tính năng Maker được triển khai ở M2.'],
        ].map(([href, icon, title, desc]) => (
          <Link key={href} href={href as '/learn' | '/projects' | '/maker'} asChild>
            <Card style={styles.quick}>
              <Text style={styles.statIcon}>{icon}</Text>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.muted}>{desc}</Text>
            </Card>
          </Link>
        ))}
      </View>
    </AppShell>
  );
}
const styles = StyleSheet.create({
  hero: {
    minHeight: 260,
    borderRadius: 22,
    padding: 32,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyebrow: { color: '#D9F5E7', fontSize: 11, fontWeight: '900', letterSpacing: 1.4 },
  heroTitle: { color: '#fff', fontWeight: '900', fontSize: 34, marginVertical: 14 },
  heroText: { color: '#E7F7EF', fontSize: 15, lineHeight: 23, maxWidth: 650 },
  heroButton: {
    color: colors.primary,
    backgroundColor: '#fff',
    padding: 13,
    borderRadius: 11,
    fontWeight: '800',
    textDecorationLine: 'none',
    alignSelf: 'flex-start',
    marginTop: 20,
  },
  heroIcon: { fontSize: 72, margin: 24 },
  heading: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 28,
    marginBottom: 14,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  stat: { minWidth: 190, flexGrow: 1 },
  statIcon: { fontSize: 27, marginBottom: 9 },
  muted: { color: colors.textMuted, lineHeight: 20 },
  statValue: { color: colors.textPrimary, fontWeight: '900', fontSize: 22, marginTop: 5 },
  quick: { minWidth: 240, flex: 1 },
  cardTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '900', marginBottom: 7 },
});
