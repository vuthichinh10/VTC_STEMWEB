import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { CircuitBuilder } from '@/features/circuit-editor/CircuitBuilder';
import type { ModuleInstance } from '@/features/circuit-editor/compatibility';
import { api } from '@/shared/api/client';
import { AppShell } from '@/shared/components/AppShell';
import { Card, EmptyState, StatusChip } from '@/shared/components/ui';
import { colors } from '@/shared/design-system/theme';

export function ProjectWorkspaceScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const projects = useQuery({ queryKey: ['projects'], queryFn: api.projects });
  const board = useQuery({ queryKey: ['board-profile'], queryFn: api.boardProfile });
  const specs = useQuery({ queryKey: ['module-specs'], queryFn: api.moduleSpecs });
  const [circuit, setCircuit] = useState<ModuleInstance[]>([]);
  if (projects.isLoading || board.isLoading || specs.isLoading)
    return (
      <AppShell>
        <ActivityIndicator />
      </AppShell>
    );
  const project = projects.data?.find((item) => item.id === projectId);
  if (!project || !board.data || !specs.data)
    return (
      <AppShell>
        <EmptyState
          title="Không mở được dự án"
          message="Dự án hoặc hồ sơ VTC STEM Core chưa sẵn sàng."
        />
      </AppShell>
    );
  return (
    <AppShell>
      <View style={s.header}>
        <View>
          <Text style={s.eyebrow}>DỰ ÁN MỞ RỘNG · {project.difficulty.toUpperCase()}</Text>
          <Text style={s.title}>
            {project.emoji} {project.title}
          </Text>
          <Text style={s.sub}>{project.description}</Text>
        </View>
        <View style={s.chips}>
          <StatusChip tone="warning">{project.durationMinutes} PHÚT</StatusChip>
          <StatusChip>FUNCTIONAL LOGIC ONLY</StatusChip>
        </View>
      </View>
      <View style={s.brief}>
        <Card style={s.briefCard}>
          <Text style={s.briefTitle}>Mục tiêu dự án</Text>
          <Text style={s.text}>
            Kết hợp nhiều module trên VTC STEM Core, kiểm tra chân trước khi viết code và ghi lại
            giả thuyết của em.
          </Text>
        </Card>
        <Card style={s.briefCard}>
          <Text style={s.briefTitle}>Module yêu cầu</Text>
          <Text style={s.text}>{project.modules.join(' · ')}</Text>
        </Card>
        <Card style={s.warning}>
          <Text style={s.briefTitle}>Phạm vi xác minh</Text>
          <Text style={s.text}>
            Hình board dựa trên core.step. GPIO vẫn là mapping demo đến khi có schematic/netlist của
            board.
          </Text>
        </Card>
      </View>
      <Text style={s.section}>Lắp mạch cho dự án</Text>
      <CircuitBuilder
        board={board.data}
        moduleIds={project.modules}
        specs={specs.data}
        value={circuit}
        onChange={setCircuit}
      />
    </AppShell>
  );
}
const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
    flexWrap: 'wrap',
  },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  title: { fontSize: 28, fontWeight: '900', color: colors.textPrimary, marginTop: 7 },
  sub: { color: colors.textMuted, marginTop: 6 },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  brief: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginVertical: 18 },
  briefCard: { minWidth: 240, flex: 1 },
  warning: { minWidth: 240, flex: 1, backgroundColor: '#FFF8E8', borderColor: '#F2D99E' },
  briefTitle: { fontWeight: '900', color: colors.textPrimary },
  text: { color: colors.textMuted, lineHeight: 20, marginTop: 7 },
  section: { fontSize: 19, fontWeight: '900', color: colors.textPrimary, marginBottom: 12 },
});
