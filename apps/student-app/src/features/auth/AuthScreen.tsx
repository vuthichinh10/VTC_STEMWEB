import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { api, ApiError } from '@/shared/api/client';
import { Button, Card } from '@/shared/components/ui';
import { colors } from '@/shared/design-system/theme';
import { useAuthStore } from './auth-store';

const schema = z.object({
  displayName: z.string().max(50).optional(),
  username: z.string().min(3, 'Tên đăng nhập cần ít nhất 3 ký tự.').max(50),
  password: z.string().min(8, 'Mật khẩu cần ít nhất 8 ký tự.'),
});
type FormData = z.infer<typeof schema>;
export function AuthScreen({ mode }: { mode: 'login' | 'register' }) {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: '', username: '', password: '' },
  });
  const setUser = useAuthStore((s) => s.setUser);
  const signup = mode === 'register';
  const submit = async (data: FormData) => {
    try {
      const user = signup
        ? await api.register(data.displayName ?? '', data.username, data.password)
        : await api.login(data.username, data.password);
      setUser(user);
      router.replace('/');
    } catch (error) {
      setError('root', {
        message: error instanceof ApiError ? error.message : 'Không thể kết nối máy chủ.',
      });
    }
  };
  return (
    <View style={styles.page}>
      <View style={styles.intro}>
        <Text style={styles.brand}>✣ STEMLab</Text>
        <Text style={styles.hero}>Học, lắp ráp, và khám phá.</Text>
        <Text style={styles.desc}>Tiến độ được lưu an toàn để em tiếp tục trên thiết bị khác.</Text>
      </View>
      <Card style={styles.card}>
        <Text style={styles.title}>
          {signup ? 'Tạo tài khoản học sinh' : 'Chào mừng em trở lại'}
        </Text>
        <Text style={styles.sub}>
          {signup
            ? 'Chỉ cần những thông tin cần thiết để bắt đầu.'
            : 'Đăng nhập để lưu tiến độ học tập.'}
        </Text>
        {signup && (
          <Field control={control} name="displayName" label="Tên hiển thị" secure={false} />
        )}
        <Field control={control} name="username" label="Tên đăng nhập" secure={false} />
        <Field control={control} name="password" label="Mật khẩu" secure />
        {errors.root && <Text style={styles.error}>{errors.root.message}</Text>}
        <Button disabled={isSubmitting} onPress={handleSubmit(submit)}>
          {isSubmitting ? 'Đang xử lý…' : signup ? 'Tạo tài khoản' : 'Đăng nhập'}
        </Button>
        <Link href={signup ? '/auth/login' : '/auth/register'} style={styles.link}>
          {signup ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
        </Link>
        <Link href="/" style={styles.back}>
          ← Tiếp tục xem học liệu
        </Link>
      </Card>
    </View>
  );
}
function Field({
  control,
  name,
  label,
  secure,
}: {
  control: ReturnType<typeof useForm<FormData>>['control'];
  name: keyof FormData;
  label: string;
  secure: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            accessibilityLabel={label}
            style={[styles.input, fieldState.error && styles.inputError]}
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            secureTextEntry={secure}
            autoCapitalize="none"
          />
          <Text style={styles.error}>{fieldState.error?.message}</Text>
        </View>
      )}
    />
  );
}
const styles = StyleSheet.create({
  page: {
    flex: 1,
    minHeight: '100%',
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 50,
    padding: 24,
  },
  intro: { maxWidth: 430 },
  brand: { fontWeight: '900', fontSize: 22, color: colors.primary },
  hero: { fontSize: 38, fontWeight: '900', color: colors.textPrimary, marginVertical: 20 },
  desc: { color: colors.textMuted, fontSize: 16, lineHeight: 25 },
  card: { width: '100%', maxWidth: 430 },
  title: { fontSize: 23, fontWeight: '900', color: colors.textPrimary },
  sub: { color: colors.textMuted, marginTop: 7, marginBottom: 18 },
  fieldWrap: { marginBottom: 8 },
  label: { fontWeight: '800', color: colors.textPrimary, fontSize: 12, marginBottom: 7 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    minHeight: 46,
    padding: 12,
    color: colors.textPrimary,
  },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 11, minHeight: 17, marginTop: 4 },
  link: { color: colors.primary, fontWeight: '800', textAlign: 'center', marginTop: 18 },
  back: { color: colors.textMuted, textAlign: 'center', marginTop: 15 },
});
