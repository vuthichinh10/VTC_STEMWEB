import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';
import { api } from '@/shared/api/client';
import { AppShell } from '@/shared/components/AppShell';
import { Card, StatusChip } from '@/shared/components/ui';
import { colors } from '@/shared/design-system/theme';
export function CatalogScreen() {
  const q = useQuery({ queryKey: ['modules'], queryFn: api.modules });
  return (
    <AppShell>
      <Text style={s.title}>◫ Thư viện module</Text>
      <View style={s.grid}>
        {q.data?.map((m) => (
          <Card key={m.id} style={s.card}>
            <Text style={s.icon}>{m.emoji}</Text>
            <Text style={s.name}>{m.name}</Text>
            <Text style={s.desc}>{m.summary}</Text>
            <StatusChip>{m.signal}</StatusChip>
            <Text style={s.warn}>⚠ {m.safety}</Text>
          </Card>
        ))}
      </View>
    </AppShell>
  );
}
const s = StyleSheet.create({
  title: { fontSize: 25, fontWeight: '900', color: colors.textPrimary, marginBottom: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  card: { minWidth: 280, flex: 1 },
  icon: { fontSize: 32 },
  name: { fontSize: 17, fontWeight: '900', color: colors.textPrimary, marginVertical: 9 },
  desc: { color: colors.textMuted, lineHeight: 20, marginBottom: 12 },
  warn: { color: colors.warning, fontSize: 12, lineHeight: 18, marginTop: 13 },
});
