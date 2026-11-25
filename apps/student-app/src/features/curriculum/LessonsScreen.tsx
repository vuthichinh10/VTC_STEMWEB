import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '@/shared/api/client';
import { AppShell } from '@/shared/components/AppShell';
import { Card, EmptyState, StatusChip } from '@/shared/components/ui';
import { colors } from '@/shared/design-system/theme';

export function LessonsScreen() {
  const query = useQuery({ queryKey: ['lessons'], queryFn: api.lessons });
  return (
    <AppShell>
      <Text style={styles.title}>📚 Lộ trình bài học STEM</Text>
      <Text style={styles.subtitle}>10 bài · 3 cấp độ · mỗi bài có 4 bước học</Text>
      {query.isLoading ? (
        <ActivityIndicator />
      ) : query.isError ? (
        <EmptyState title="Chưa tải được bài học" message="Kiểm tra API rồi thử lại." />
      ) : (
        <View style={styles.grid}>
          {query.data?.map((lesson) => (
            <Link key={lesson.id} href={`/learn/${lesson.id}`} asChild>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`Mở bài học ${lesson.title}`}
                style={({ pressed }) => [styles.cardLink, pressed && styles.cardPressed]}
              >
                <Card style={styles.card}>
                  <View style={styles.top}>
                    <Text style={styles.icon}>{lesson.emoji}</Text>
                    <StatusChip>Cấp {lesson.level}</StatusChip>
                  </View>
                  <Text style={styles.cardTitle}>{lesson.title}</Text>
                  <Text style={styles.desc}>{lesson.description}</Text>
                  <Text style={styles.meta}>
                    {lesson.durationMinutes} phút · {lesson.topic}
                  </Text>
                </Card>
              </Pressable>
            </Link>
          ))}
        </View>
      )}
    </AppShell>
  );
}
const styles = StyleSheet.create({
  title: { fontSize: 25, color: colors.textPrimary, fontWeight: '900' },
  subtitle: { color: colors.textMuted, marginTop: 7, marginBottom: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  cardLink: { minWidth: 260, flexBasis: 300, flexGrow: 1 },
  cardPressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
  card: { flex: 1 },
  top: { flexDirection: 'row', justifyContent: 'space-between' },
  icon: { fontSize: 32 },
  cardTitle: { fontWeight: '900', color: colors.textPrimary, fontSize: 16, marginTop: 13 },
  desc: { color: colors.textMuted, lineHeight: 20, marginVertical: 8 },
  meta: { color: colors.primary, fontWeight: '700', fontSize: 12 },
});
