import type { PropsWithChildren } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing } from '../design-system/theme';

export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}
export function Button({
  children,
  kind = 'primary',
  ...props
}: PropsWithChildren<PressableProps & { kind?: 'primary' | 'soft' | 'danger' }>) {
  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      style={({ pressed }) => [
        styles.button,
        styles[kind],
        pressed && { opacity: 0.8 },
        props.disabled && { opacity: 0.45 },
      ]}
    >
      <Text style={[styles.buttonText, kind === 'soft' && { color: colors.primary }]}>
        {children}
      </Text>
    </Pressable>
  );
}
export function StatusChip({
  children,
  tone = 'neutral',
}: PropsWithChildren<{ tone?: 'neutral' | 'success' | 'warning' }>) {
  return (
    <View
      style={[
        styles.chip,
        tone === 'success' && styles.chipSuccess,
        tone === 'warning' && styles.chipWarning,
      ]}
    >
      <Text style={styles.chipText}>{children}</Text>
    </View>
  );
}
export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <Card style={styles.empty}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.muted}>{message}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  button: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primary: { backgroundColor: colors.primary },
  soft: { backgroundColor: colors.primarySoft },
  danger: { backgroundColor: colors.danger },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: 99,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  chipSuccess: { backgroundColor: '#DDF6EB' },
  chipWarning: { backgroundColor: '#FFF4DD' },
  chipText: { color: colors.textPrimary, fontSize: 11, fontWeight: '800' },
  empty: { alignItems: 'center', borderStyle: 'dashed' },
  title: { color: colors.textPrimary, fontWeight: '800', fontSize: 16 },
  muted: { color: colors.textMuted, textAlign: 'center', marginTop: 8 },
});
