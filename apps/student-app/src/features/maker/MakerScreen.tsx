import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuthStore } from '@/features/auth/auth-store';
import { validateCircuit, type ModuleInstance } from '@/features/circuit-editor/compatibility';
import { api } from '@/shared/api/client';
import { AppShell } from '@/shared/components/AppShell';
import { Button, Card, EmptyState, StatusChip } from '@/shared/components/ui';
import { colors } from '@/shared/design-system/theme';

const DEFAULT_CODE = `// Mô phỏng thật sẽ được cung cấp ở M3.\n// M2 lưu code + wiring thành một revision nhất quán.\nvoid setup() {\n  pinMode(23, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(23, HIGH);\n}`;

export function MakerScreen() {
  const user = useAuthStore((state) => state.user);
  const boardQuery = useQuery({ queryKey: ['board-profile'], queryFn: api.boardProfile });
  const specsQuery = useQuery({ queryKey: ['module-specs'], queryFn: api.moduleSpecs });
  const [title, setTitle] = useState('Ý tưởng STEM của em');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState(DEFAULT_CODE);
  const [modules, setModules] = useState<ModuleInstance[]>([]);
  const issues = useMemo(
    () =>
      boardQuery.data && specsQuery.data
        ? validateCircuit(boardQuery.data, specsQuery.data, modules)
        : [],
    [boardQuery.data, specsQuery.data, modules],
  );
  const save = useMutation({
    mutationFn: () => api.createProject({ title, description, code, modules }),
  });

  const addModule = (moduleId: string) => {
    const spec = specsQuery.data?.find((item) => item.id === moduleId);
    if (!spec) return;
    const used = new Set(modules.map((item) => item.gpio));
    const gpio = spec.suggestedPins.find((pin) => !used.has(pin)) ?? spec.suggestedPins[0] ?? 23;
    setModules([...modules, { instanceId: `${moduleId}-${Date.now()}`, moduleId, gpio }]);
  };
  const updatePin = (instanceId: string, text: string) => {
    const gpio = Number(text.replace(/\D/g, ''));
    if (Number.isInteger(gpio))
      setModules(
        modules.map((item) => (item.instanceId === instanceId ? { ...item, gpio } : item)),
      );
  };
  if (boardQuery.isLoading || specsQuery.isLoading)
    return (
      <AppShell>
        <ActivityIndicator />
      </AppShell>
    );
  if (!boardQuery.data || !specsQuery.data)
    return (
      <AppShell>
        <EmptyState
          title="Không tải được hồ sơ mạch"
          message="API chưa sẵn sàng; chưa thể kiểm tra chân an toàn."
        />
      </AppShell>
    );
  return (
    <AppShell>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Tự sáng tạo</Text>
        </View>
        <StatusChip tone={issues.some((i) => i.severity === 'ERROR') ? 'warning' : 'success'}>
          {issues.some((i) => i.severity === 'ERROR') ? 'CẦN SỬA MẠCH' : 'MẠCH HỢP LỆ'}
        </StatusChip>
      </View>
      <View style={styles.workspace}>
        <Card style={styles.panel}>
          <Text style={styles.section}>1 · Ý tưởng</Text>
          <TextInput
            accessibilityLabel="Tên dự án"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          <TextInput
            accessibilityLabel="Mô tả dự án"
            value={description}
            onChangeText={setDescription}
            placeholder="Sản phẩm này giúp ích gì?"
            style={[styles.input, styles.description]}
            multiline
          />
          <Text style={styles.section}>2 · Chọn module</Text>
          <View style={styles.moduleGrid}>
            {specsQuery.data.map((spec) => (
              <Button key={spec.id} kind="soft" onPress={() => addModule(spec.id)}>
                {spec.emoji} + {spec.name}
              </Button>
            ))}
          </View>
        </Card>
        <Card style={styles.boardPanel}>
          <Text style={styles.boardTitle}>{boardQuery.data.displayName}</Text>
          <Text style={styles.notice}>{boardQuery.data.notice}</Text>
          <Text style={styles.boardHint}>
            Logic {boardQuery.data.logicVoltage}V · GPIO được lấy từ board profile version{' '}
            {boardQuery.data.version}
          </Text>
          {modules.length === 0 ? (
            <EmptyState
              title="Chưa có module"
              message="Chọn một module để hệ thống đề xuất chân phù hợp."
            />
          ) : (
            modules.map((item) => {
              const spec = specsQuery.data.find((candidate) => candidate.id === item.moduleId)!;
              return (
                <View key={item.instanceId} style={styles.wireRow}>
                  <Text style={styles.wireName}>
                    {spec.emoji} {spec.name}
                  </Text>
                  <TextInput
                    accessibilityLabel={`GPIO cho ${spec.name}`}
                    value={`GPIO${item.gpio}`}
                    onChangeText={(value) => updatePin(item.instanceId, value)}
                    style={styles.pinInput}
                  />
                  <Button
                    kind="soft"
                    onPress={() =>
                      setModules(modules.filter((m) => m.instanceId !== item.instanceId))
                    }
                  >
                    Gỡ
                  </Button>
                </View>
              );
            })
          )}
          {issues.map((issue, index) => (
            <View
              key={`${issue.code}-${index}`}
              style={issue.severity === 'ERROR' ? styles.error : styles.warning}
            >
              <Text style={styles.issueTitle}>
                {issue.severity === 'ERROR' ? '⛔' : '⚠️'} {issue.code}
              </Text>
              <Text style={styles.issueText}>
                {issue.message}
                {issue.suggestedPins.length
                  ? ` Gợi ý: GPIO${issue.suggestedPins.join(', GPIO')}.`
                  : ''}
              </Text>
            </View>
          ))}
        </Card>
        <Card style={styles.codePanel}>
          <Text style={styles.section}>3 · Code Arduino</Text>
          <TextInput
            multiline
            value={code}
            onChangeText={setCode}
            style={styles.code}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.scope}>
            Chưa có compiler/virtual HAL M3, vì vậy workspace không hiển thị nút Chạy giả. Lưu dự án
            không đồng nghĩa nạp firmware.
          </Text>
        </Card>
      </View>
      <View style={styles.footer}>
        <Text style={styles.saveText}>
          {!user
            ? 'Đăng nhập để lưu dự án vào PostgreSQL.'
            : save.isSuccess
              ? `Đã lưu revision 1 · ${save.data.title}`
              : save.isError
                ? 'Lưu thất bại. Dữ liệu chưa được ghi.'
                : 'Sẵn sàng lưu code + wiring.'}
        </Text>
        <Button
          disabled={
            !user || !title.trim() || issues.some((i) => i.severity === 'ERROR') || save.isPending
          }
          onPress={() => save.mutate()}
        >
          {save.isPending ? 'Đang lưu…' : 'Lưu dự án'}
        </Button>
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
  eyebrow: { color: colors.primary, fontWeight: '900', fontSize: 11, letterSpacing: 1.4 },
  title: { fontSize: 29, fontWeight: '900', color: colors.textPrimary, marginTop: 6 },
  subtitle: { color: colors.textMuted, marginTop: 7 },
  workspace: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginTop: 20 },
  panel: { minWidth: 300, flex: 1 },
  codePanel: { minWidth: 360, flex: 1.25 },
  section: { fontWeight: '900', fontSize: 16, color: colors.textPrimary, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  description: { minHeight: 80, textAlignVertical: 'top' },
  moduleGrid: { gap: 8 },
  boardPanel: { minWidth: 300, flex: 1, backgroundColor: '#183F34', borderColor: '#376D5A' },
  boardTitle: { color: '#fff', fontWeight: '900', fontSize: 18 },
  notice: { color: '#FFD991', fontSize: 11, fontWeight: '900', marginTop: 7 },
  boardHint: { color: '#C5E2D5', lineHeight: 20, marginVertical: 14 },
  wireRow: {
    backgroundColor: '#245445',
    borderRadius: 11,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  wireName: { color: '#fff', fontWeight: '800', flex: 1 },
  pinInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    width: 82,
    color: colors.textPrimary,
  },
  error: { backgroundColor: '#5A2934', padding: 11, borderRadius: 9, marginTop: 8 },
  warning: { backgroundColor: '#5C4926', padding: 11, borderRadius: 9, marginTop: 8 },
  issueTitle: { color: '#fff', fontWeight: '900', fontSize: 12 },
  issueText: { color: '#F2F5FA', fontSize: 12, lineHeight: 18, marginTop: 3 },
  code: {
    backgroundColor: colors.navy,
    color: '#DDF3E9',
    fontFamily: 'monospace',
    minHeight: 330,
    padding: 14,
    borderRadius: 11,
    textAlignVertical: 'top',
  },
  scope: { color: colors.warning, lineHeight: 19, marginTop: 12 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 14,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  saveText: { color: colors.textMuted },
});
