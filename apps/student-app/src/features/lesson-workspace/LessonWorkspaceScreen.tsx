import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuthStore } from '@/features/auth/auth-store';
import { CircuitBuilder } from '@/features/circuit-editor/CircuitBuilder';
import { syncCodePins } from '@/features/circuit-editor/code-sync';
import { validateCircuit, type ModuleInstance } from '@/features/circuit-editor/compatibility';
import { api } from '@/shared/api/client';
import { AppShell } from '@/shared/components/AppShell';
import { Button, Card, EmptyState, StatusChip } from '@/shared/components/ui';
import { colors } from '@/shared/design-system/theme';
import type { Progress } from '@/shared/types/domain';

const STEPS = ['Hiểu bài', 'Lắp module', 'Lập trình & thử', 'Kết luận'];
export function LessonWorkspaceScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const user = useAuthStore((s) => s.user);
  const client = useQueryClient();
  const lesson = useQuery({ queryKey: ['lesson', lessonId], queryFn: () => api.lesson(lessonId) });
  const board = useQuery({ queryKey: ['board-profile'], queryFn: api.boardProfile });
  const moduleSpecs = useQuery({ queryKey: ['module-specs'], queryFn: api.moduleSpecs });
  const saved = useQuery({
    queryKey: ['progress', lessonId],
    queryFn: () => api.progress(lessonId),
    enabled: Boolean(user),
    retry: false,
  });
  const [draft, setDraft] = useState<Omit<Progress, 'lessonId' | 'updatedAt'>>({
    step: 0,
    prediction: '',
    observation: '',
    conclusion: '',
    completed: false,
  });
  const [circuit, setCircuit] = useState<ModuleInstance[]>([]);
  const [code, setCode] = useState('');
  const [codeCustomized, setCodeCustomized] = useState(false);
  const [suggestedCode, setSuggestedCode] = useState<string>();
  useEffect(() => {
    if (saved.data) setDraft(saved.data);
  }, [saved.data]);
  useEffect(() => {
    if (!lesson.data) return;
    setCircuit([]);
    setCode(lesson.data.defaultCode);
    setCodeCustomized(false);
    setSuggestedCode(undefined);
  }, [lesson.data?.id]);
  const save = useMutation({
    mutationFn: () => api.saveProgress(lessonId, { ...draft, completed: draft.step === 3 }),
    onSuccess: (data) => {
      setDraft(data);
      client.setQueryData(['progress', lessonId], data);
      client.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
  if (lesson.isLoading)
    return (
      <AppShell>
        <ActivityIndicator />
      </AppShell>
    );
  if (!lesson.data)
    return (
      <AppShell>
        <EmptyState
          title="Không tìm thấy bài học"
          message="ID bài học không tồn tại hoặc API chưa sẵn sàng."
        />
      </AppShell>
    );
  const item = lesson.data;
  const changeCircuit = (next: ModuleInstance[]) => {
    setCircuit(next);
    const synchronized = syncCodePins(code || item.defaultCode, next).code;
    if (codeCustomized) setSuggestedCode(synchronized);
    else {
      setCode(synchronized);
      setSuggestedCode(undefined);
    }
  };
  const circuitIssues =
    board.data && moduleSpecs.data ? validateCircuit(board.data, moduleSpecs.data, circuit) : [];
  return (
    <AppShell>
      <View style={styles.header}>
        <View>
          <View style={styles.chips}>
            <StatusChip>Bài học · Cấp {item.level}</StatusChip>
            <StatusChip tone="warning">⏱ {item.durationMinutes} phút</StatusChip>
          </View>
          <Text style={styles.title}>
            {item.emoji} {item.title}
          </Text>
          <Text style={styles.desc}>{item.description}</Text>
        </View>
        <StatusChip tone="warning">MÔ PHỎNG CHƯA KÍCH HOẠT</StatusChip>
      </View>
      <View style={styles.stepper}>
        {STEPS.map((name, index) => (
          <Button
            key={name}
            kind={draft.step === index ? 'primary' : 'soft'}
            onPress={() => setDraft({ ...draft, step: index })}
          >
            {index + 1}. {name}
          </Button>
        ))}
      </View>
      {draft.step === 0 && (
        <View style={styles.columns}>
          <Card style={styles.column}>
            <Text style={styles.section}>🎯 Hôm nay em sẽ làm được gì?</Text>
            {item.goals.map((goal) => (
              <Text key={goal} style={styles.line}>
                ✓ {goal}
              </Text>
            ))}
            <Text style={styles.question}>🤔 {item.question}</Text>
            {item.choices.map((choice, index) => (
              <View key={choice} style={styles.choice}>
                <Text>
                  {String.fromCharCode(65 + index)}. {choice}
                </Text>
              </View>
            ))}
          </Card>
          <Card style={styles.column}>
            <Text style={styles.section}>✍️ Viết dự đoán trước khi thử</Text>
            <TextInput
              multiline
              style={styles.textarea}
              value={draft.prediction}
              onChangeText={(prediction) => setDraft({ ...draft, prediction })}
              placeholder="Em dự đoán rằng…"
            />
            <Text style={styles.note}>
              Quan sát → Dự đoán → Thử nghiệm → Ghi kết quả → Giải thích.
            </Text>
          </Card>
        </View>
      )}
      {draft.step === 1 &&
        (board.isLoading || moduleSpecs.isLoading ? (
          <ActivityIndicator />
        ) : board.data && moduleSpecs.data ? (
          <CircuitBuilder
            board={board.data}
            moduleIds={item.modules}
            specs={moduleSpecs.data}
            value={circuit}
            onChange={changeCircuit}
          />
        ) : (
          <EmptyState
            title="Chưa tải được hồ sơ mạch"
            message="API board profile chưa sẵn sàng nên hệ thống không thể gợi ý GPIO an toàn."
          />
        ))}
      {draft.step === 2 && (
        <View style={styles.columns}>
          <Card style={styles.column}>
            <Text style={styles.section}>⌘ Code Arduino theo GPIO đã chọn</Text>
            <TextInput
              multiline
              style={styles.code}
              value={code}
              onChangeText={(next) => {
                setCode(next);
                setCodeCustomized(true);
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {suggestedCode && suggestedCode !== code && (
              <View style={styles.syncNotice}>
                <Text style={styles.syncText}>
                  Em vừa đổi GPIO. Code đang có chỉnh sửa riêng nên hệ thống chưa tự ghi đè.
                </Text>
                <Button
                  kind="soft"
                  onPress={() => {
                    setCode(suggestedCode);
                    setSuggestedCode(undefined);
                  }}
                >
                  Cập nhật chân GPIO trong code
                </Button>
              </View>
            )}
            <Text style={styles.warning}>
              M3 mới cung cấp compiler + virtual HAL chạy theo code. Nút Chạy được vô hiệu hóa để
              không giả lập kết quả.
            </Text>
            <Button disabled>Chạy mô phỏng (M3)</Button>
          </Card>
          <Card style={styles.column}>
            <Text style={styles.section}>🔌 Mạch tương ứng</Text>
            {circuit.length === 0 ? (
              <EmptyState
                title="Chưa ghép module với GPIO"
                message="Quay lại bước 2 để kéo từng module vào chân GPIO."
              />
            ) : (
              <View style={styles.wiringList}>
                {circuit.map((connection) => {
                  const spec = moduleSpecs.data?.find((entry) => entry.id === connection.moduleId);
                  const hasError = circuitIssues.some(
                    (issue) =>
                      issue.moduleInstanceId === connection.instanceId && issue.severity === 'ERROR',
                  );
                  return (
                    <View key={connection.instanceId} style={styles.wiringRow}>
                      <Text style={styles.wiringModule}>
                        {spec?.emoji} {spec?.name ?? connection.moduleId}
                      </Text>
                      <Text style={hasError ? styles.wiringError : styles.wiringPin}>
                        → GPIO{connection.gpio} {hasError ? '· cần sửa' : '· hợp lệ'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
            <Text style={styles.previewNote}>
              Đây là sơ đồ đấu nối logic đồng bộ với code, chưa phải phiên mô phỏng firmware. Trạng
              thái chạy chỉ xuất hiện khi compiler và virtual HAL M3 được tích hợp.
            </Text>
            <Text style={styles.section}>🧪 Ghi kết quả quan sát</Text>
            <TextInput
              multiline
              style={styles.textarea}
              value={draft.observation}
              onChangeText={(observation) => setDraft({ ...draft, observation })}
              placeholder="Ghi quan sát của em…"
            />
          </Card>
        </View>
      )}
      {draft.step === 3 && (
        <Card>
          <Text style={styles.section}>📝 Kết luận</Text>
          <Text style={styles.line}>{item.takeaway}</Text>
          <TextInput
            multiline
            style={styles.textarea}
            value={draft.conclusion}
            onChangeText={(conclusion) => setDraft({ ...draft, conclusion })}
            placeholder="Giải thích kết quả bằng lời của em…"
          />
          <Text style={styles.note}>
            Chỉ đánh dấu hoàn thành khi đã ghi dự đoán, quan sát và kết luận.
          </Text>
        </Card>
      )}
      <View style={styles.footer}>
        <Text style={styles.saveState}>
          {!user
            ? 'Đăng nhập để lưu lên PostgreSQL'
            : save.isPending
              ? 'Đang lưu…'
              : save.isSuccess
                ? 'Đã lưu'
                : save.isError
                  ? 'Lưu lỗi'
                  : 'Chưa có thay đổi được lưu'}
        </Text>
        <Button disabled={!user || save.isPending} onPress={() => save.mutate()}>
          {draft.step === 3 ? 'Lưu tiến độ' : 'Lưu'}
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
  chips: { flexDirection: 'row', gap: 8 },
  title: { fontSize: 27, fontWeight: '900', color: colors.textPrimary, marginTop: 12 },
  desc: { color: colors.textMuted, marginTop: 6 },
  stepper: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginVertical: 20 },
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  column: { minWidth: 300, flex: 1 },
  section: { fontSize: 17, fontWeight: '900', color: colors.textPrimary, marginBottom: 12 },
  line: { color: colors.textPrimary, lineHeight: 27 },
  question: { fontWeight: '800', marginTop: 20, color: colors.textPrimary },
  choice: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    padding: 11,
    marginTop: 7,
  },
  textarea: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    padding: 12,
    textAlignVertical: 'top',
    color: colors.textPrimary,
  },
  note: {
    backgroundColor: colors.primarySoft,
    color: colors.textMuted,
    padding: 12,
    borderRadius: 10,
    lineHeight: 20,
    marginTop: 14,
  },
  code: {
    backgroundColor: colors.navy,
    color: '#D7E4F7',
    fontFamily: 'monospace',
    minHeight: 320,
    borderRadius: 11,
    padding: 14,
    textAlignVertical: 'top',
  },
  warning: { color: colors.warning, lineHeight: 20, marginVertical: 12 },
  syncNotice: {
    gap: 10,
    padding: 12,
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
  },
  syncText: { color: colors.textMuted, lineHeight: 19 },
  wiringList: { gap: 9, marginBottom: 12 },
  wiringRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },
  wiringModule: { color: colors.textPrimary, fontWeight: '800' },
  wiringPin: { color: colors.success, fontWeight: '800' },
  wiringError: { color: colors.danger, fontWeight: '800' },
  previewNote: {
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: 18,
    padding: 11,
    borderRadius: 9,
    backgroundColor: '#FFF7E5',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 14,
    marginTop: 18,
  },
  saveState: { color: colors.textMuted },
});
