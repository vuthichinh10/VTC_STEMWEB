import { useQuery } from '@tanstack/react-query';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, type Href } from 'expo-router';
import { api } from '@/shared/api/client';
import { AppShell } from '@/shared/components/AppShell';
import { Card, StatusChip } from '@/shared/components/ui';
import { colors } from '@/shared/design-system/theme';
export function ProjectsScreen() {
  const q = useQuery({ queryKey: ['projects'], queryFn: api.projects });
  return (
    <AppShell>
      <Text style={s.title}>🛠️ Dự án mở rộng</Text>
      <View style={s.grid}>
        {q.data?.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}` as unknown as Href} asChild>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`Mở dự án ${p.title}`}
              style={({ pressed }) => [s.cardLink, pressed && s.pressed]}
            >
              <Card style={s.card}>
                <Text style={s.icon}>{p.emoji}</Text>
                <Text style={s.name}>{p.title}</Text>
                <Text style={s.desc}>{p.description}</Text>
                <View style={s.row}>
                  <StatusChip>{p.difficulty}</StatusChip>
                  <StatusChip tone="warning">{p.durationMinutes} phút</StatusChip>
                </View>
                <Text style={s.open}>Mở workspace VTC STEM Core →</Text>
              </Card>
            </Pressable>
          </Link>
        ))}
      </View>
    </AppShell>
  );
}
const s = StyleSheet.create({
  title: { fontSize: 25, fontWeight: '900', color: colors.textPrimary },
  sub: { color: colors.textMuted, marginVertical: 10, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 14 },
  cardLink: { minWidth: 280, flex: 1 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  card: { flex: 1 },
  icon: { fontSize: 34 },
  name: { fontSize: 17, fontWeight: '900', color: colors.textPrimary, marginVertical: 9 },
  desc: { color: colors.textMuted, lineHeight: 20 },
  row: { flexDirection: 'row', gap: 8, marginTop: 14 },
  open: { color: colors.primary, fontWeight: '900', marginTop: 15 },
});
