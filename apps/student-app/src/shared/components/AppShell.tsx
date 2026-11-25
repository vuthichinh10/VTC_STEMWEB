import { Link, router, usePathname, type Href } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { PropsWithChildren, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useAuthStore } from '@/features/auth/auth-store';
import { api } from '../api/client';
import { colors } from '../design-system/theme';
import { StatusChip } from './ui';

const navigation = [
  ['/', '⌂', 'Tổng quan'],
  ['/learn', '▤', 'Bài học STEM'],
  ['/projects', '⚒', 'Dự án mở rộng'],
  ['/maker', '✦', 'Tự sáng tạo'],
  ['/catalog', '◫', 'Thư viện module'],
  ['/groups', '♟', 'Nhóm sáng tạo'],
  ['/devices', '⌁', 'Kết nối mạch thật'],
  ['/ai-study', '✦', 'Học tập cùng AI'],
] as const;

export function AppShell({ children }: PropsWithChildren) {
  const path = usePathname();
  const { width } = useWindowDimensions();
  const compact = width < 820;
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();
  const [loggingOut, setLoggingOut] = useState(false);
  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await api.logout();
    } finally {
      // The UI must never remain in an authenticated-looking state after the user signs out.
      queryClient.clear();
      setUser(null);
      setLoggingOut(false);
      router.replace('/auth/login');
    }
  };
  return (
    <View style={[styles.root, compact && styles.rootCompact]}>
      <View style={[styles.sidebar, compact && styles.sidebarCompact]}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>✣</Text>
          </View>
          <View>
            <Text style={styles.brandText}>
              STEM<Text style={{ color: colors.primary }}>Lab</Text>
            </Text>
            {!compact && <Text style={styles.brandSub}>LEARN · BUILD · DISCOVER</Text>}
          </View>
        </View>
        <ScrollView
          horizontal={compact}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={compact ? styles.navCompact : undefined}
        >
          {navigation.map(([href, icon, label]) => (
            <Link
              key={href}
              href={href as Href}
              style={[
                styles.nav,
                (href === '/' ? path === '/' : path.startsWith(href)) && styles.navActive,
              ]}
              accessibilityLabel={label}
            >
              <Text>
                {icon} {!compact && label}
              </Text>
            </Link>
          ))}
        </ScrollView>
      </View>
      <View style={styles.main}>
        <View style={styles.topbar}>
          <Text style={styles.breadcrumb}>
            {' '}
            {
              navigation.find(([href]) =>
                href === '/' ? path === '/' : path.startsWith(href),
              )?.[2]
            }
          </Text>
          <View style={styles.account}>
            <Link href={user ? '/profile' : '/auth/login'} style={styles.accountLink}>
              {user ? user.displayName : 'Đăng nhập'}
            </Link>
            {user && (
              <Pressable
                accessibilityRole="button"
                disabled={loggingOut}
                onPress={() => void logout()}
              >
                <Text style={styles.logout}>{loggingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}</Text>
              </Pressable>
            )}
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, minHeight: '100%', flexDirection: 'row', backgroundColor: colors.background },
  rootCompact: { flexDirection: 'column' },
  sidebar: {
    width: 250,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    padding: 14,
  },
  sidebarCompact: {
    width: '100%',
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: 10,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, marginBottom: 12 },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#fff', fontSize: 21 },
  brandText: { fontWeight: '900', fontSize: 20, color: colors.textPrimary },
  brandSub: { color: colors.textMuted, fontSize: 8, letterSpacing: 1.3 },
  nav: {
    color: colors.textMuted,
    padding: 12,
    marginVertical: 2,
    borderRadius: 11,
    fontWeight: '700',
    textDecorationLine: 'none',
  },
  navActive: { color: colors.primary, backgroundColor: colors.primarySoft },
  navCompact: { gap: 4 },
  hint: { marginTop: 'auto', backgroundColor: '#EEF8F2', padding: 14, borderRadius: 14 },
  hintTitle: { color: colors.textPrimary, fontWeight: '800', fontSize: 12 },
  hintText: { color: colors.textMuted, fontSize: 11, lineHeight: 18, marginTop: 5 },
  main: { flex: 1 },
  topbar: {
    minHeight: 68,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  breadcrumb: { color: colors.textMuted, fontWeight: '700' },
  account: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  accountLink: { color: colors.textPrimary, fontWeight: '800', textDecorationLine: 'none' },
  logout: { color: colors.danger, fontWeight: '700', fontSize: 12 },
  content: { padding: 24, maxWidth: 1500, width: '100%', alignSelf: 'center' },
});
