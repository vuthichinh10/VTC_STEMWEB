import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuthStore } from '@/features/auth/auth-store';
import { api, ApiError } from '@/shared/api/client';
import { AppShell } from '@/shared/components/AppShell';
import { Button, Card, StatusChip } from '@/shared/components/ui';
import { colors } from '@/shared/design-system/theme';
import type { AiTutorMessage } from '@/shared/types/domain';

const suggestions = [
  'Vì sao LED không sáng khi nối vào GPIO34?',
  'Giải thích INPUT_PULLUP bằng ví dụ dễ hiểu.',
  'Cách chọn chân ADC an toàn trên ESP32?',
  'Giúp em tìm lỗi trong mạch nút nhấn và LED.',
];

export function AiStudyScreen() {
  const user = useAuthStore((state) => state.user);
  const status = useQuery({
    queryKey: ['ai-tutor-status'],
    queryFn: api.aiTutorStatus,
    enabled: Boolean(user),
    retry: false,
  });
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<AiTutorMessage[]>([
    {
      role: 'assistant',
      content:
        'Chào em! Hãy hỏi mình về ESP32, Arduino, GPIO, cảm biến, đấu nối hoặc cách tìm lỗi mạch nhúng.',
    },
  ]);
  const ask = useMutation({
    mutationFn: ({ text, history }: { text: string; history: AiTutorMessage[] }) =>
      api.askAiTutor(text, history),
    onSuccess: (data) =>
      setMessages((current) => [...current, { role: 'assistant', content: data.answer }]),
  });
  const send = () => {
    const text = question.trim();
    if (!text || ask.isPending || !user || status.data?.configured !== true) return;
    const history = messages.filter((message, index) => index > 0);
    setMessages([...messages, { role: 'user', content: text }]);
    setQuestion('');
    ask.mutate({ text, history });
  };
  const errorMessage =
    ask.error instanceof ApiError
      ? ask.error.message
      : ask.isError
        ? 'Không thể gửi câu hỏi. Hãy thử lại.'
        : null;
  return (
    <AppShell>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Học tập cùng AI</Text>
        </View>
        <StatusChip tone={status.data?.configured ? 'success' : 'warning'}>
          {!user
            ? 'CẦN ĐĂNG NHẬP'
            : status.isLoading
              ? 'ĐANG KIỂM TRA AI'
              : status.data?.configured
                ? `AI SẴN SÀNG · ${status.data.model}`
                : 'AI CHƯA CẤU HÌNH'}
        </StatusChip>
      </View>
      <View style={s.layout}>
        <Card style={s.sidebar}>
          <Text style={s.section}>Câu hỏi gợi ý</Text>
          {suggestions.map((item) => (
            <Button key={item} kind="soft" onPress={() => setQuestion(item)}>
              {item}
            </Button>
          ))}
        </Card>
        <Card style={s.chat}>
          <View style={s.botHeader}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>✦</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.botName}>STEM Coach</Text>
            </View>
          </View>
          <View style={s.messages}>
            {messages.map((message, index) => (
              <View
                key={`${index}-${message.role}`}
                style={[s.bubble, message.role === 'user' ? s.userBubble : s.aiBubble]}
              >
                <Text style={message.role === 'user' ? s.userText : s.aiText}>
                  {message.content}
                </Text>
              </View>
            ))}
            {ask.isPending && (
              <View style={[s.bubble, s.aiBubble]}>
                <Text style={s.typing}>Đang suy nghĩ về mạch của em…</Text>
              </View>
            )}
          </View>
          {errorMessage && (
            <View style={s.error}>
              <Text style={s.errorText}>⚠ {errorMessage}</Text>
            </View>
          )}
          <View style={s.composer}>
            <TextInput
              multiline
              value={question}
              onChangeText={setQuestion}
              style={s.input}
              placeholder={user ? 'Nhập câu hỏi về mạch nhúng…' : 'Đăng nhập để đặt câu hỏi cho AI'}
              editable={Boolean(user) && status.data?.configured === true && !ask.isPending}
              maxLength={4000}
            />
            <Button
              disabled={
                !user || status.data?.configured !== true || !question.trim() || ask.isPending
              }
              onPress={send}
            >
              {ask.isPending ? 'Đang gửi…' : 'Gửi câu hỏi'}
            </Button>
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
  notice: {
    marginTop: 20,
    backgroundColor: '#FFF7E5',
    borderWidth: 1,
    borderColor: '#F2D89A',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    gap: 12,
  },
  noticeIcon: { fontSize: 23 },
  noticeTitle: { fontWeight: '900', color: colors.warning },
  noticeText: { color: colors.textMuted, lineHeight: 19, marginTop: 4 },
  configError: {
    marginTop: 12,
    borderRadius: 12,
    padding: 13,
    backgroundColor: '#FFF0F2',
    borderWidth: 1,
    borderColor: '#F1C4CB',
  },
  configTitle: { color: colors.danger, fontWeight: '900' },
  configText: { color: colors.textMuted, lineHeight: 19, marginTop: 4 },
  layout: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 18 },
  sidebar: { minWidth: 260, flex: 0.55, gap: 9 },
  section: { fontSize: 17, fontWeight: '900', color: colors.textPrimary, marginBottom: 4 },
  scope: { backgroundColor: colors.primarySoft, borderRadius: 11, padding: 12, marginTop: 6 },
  scopeTitle: { fontWeight: '900', fontSize: 12, color: colors.primary },
  scopeText: { color: colors.textMuted, fontSize: 11, lineHeight: 18, marginTop: 5 },
  chat: { minWidth: 360, flex: 1.6 },
  botHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22, color: '#fff' },
  botName: { fontWeight: '900', color: colors.textPrimary },
  botStatus: { fontSize: 10, color: colors.success, marginTop: 2 },
  messages: { gap: 10, minHeight: 300, paddingVertical: 15 },
  bubble: { maxWidth: '88%', borderRadius: 14, padding: 12 },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  aiText: { color: colors.textPrimary, lineHeight: 21 },
  userText: { color: '#fff', lineHeight: 21 },
  typing: { color: colors.textMuted, fontStyle: 'italic' },
  error: { backgroundColor: '#FFF0F2', borderRadius: 9, padding: 10, marginBottom: 10 },
  errorText: { color: colors.danger, fontSize: 12, fontWeight: '700' },
  composer: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, gap: 10 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    padding: 12,
    minHeight: 82,
    textAlignVertical: 'top',
    color: colors.textPrimary,
  },
  loginHint: { color: colors.warning, fontSize: 11, marginTop: 9 },
});
