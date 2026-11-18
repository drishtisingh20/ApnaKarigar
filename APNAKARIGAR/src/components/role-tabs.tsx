import { Link, usePathname } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand } from '@/constants/brand';
import { t } from '@/data/copy';
import { useApp } from '@/context/app-context';

export function RoleTabs({ role }: { role: 'buyer' | 'artisan' }) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const copy = t(language);

  const items =
    role === 'buyer'
      ? [{ href: '/discover' as const, label: copy.discoverTab, match: '/discover' }]
      : [
          { href: '/community' as const, label: copy.communityTab, match: '/community' },
          { href: '/upload' as const, label: copy.uploadTab, match: '/upload' },
          { href: '/offers' as const, label: copy.offersTab, match: '/offers' },
        ];

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {items.map((item) => {
        const active = pathname === item.match || pathname.startsWith(`${item.match}/`);
        return (
          <Link key={item.href} href={item.href} style={styles.link}>
            <View style={[styles.pill, active && styles.pillActive]}>
              <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
            </View>
          </Link>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 10,
    paddingHorizontal: 16,
    backgroundColor: Brand.cream,
    borderTopWidth: 1,
    borderTopColor: Brand.border,
  },
  link: {
    flex: 1,
    maxWidth: 220,
  },
  pill: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Brand.chip,
  },
  pillActive: {
    backgroundColor: Brand.terracotta,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Brand.ink,
  },
  labelActive: {
    color: '#ffffff',
  },
});
