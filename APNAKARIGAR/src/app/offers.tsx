import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandHeader } from '@/components/brand-header';
import { ScreenShell } from '@/components/screen-shell';
import { StateView } from '@/components/state-view';
import { Brand } from '@/constants/brand';
import { useApp } from '@/context/app-context';
import { t } from '@/data/copy';
import { useAsync } from '@/hooks/use-async';
import { api } from '@/lib/api';

export default function OffersScreen() {
  const router = useRouter();
  const { language, user } = useApp();
  const copy = t(language);
  const isArtisan = user?.role === 'artisan';

  const load = useCallback(
    () => (isArtisan ? api.receivedOffers() : Promise.resolve([])),
    [isArtisan]
  );
  const { data, error, loading, reload } = useAsync(load);

  if (!isArtisan) {
    return (
      <ScreenShell role="artisan">
        <BrandHeader title={copy.offersTitle} subtitle={copy.signInToUpload} />
        <View style={styles.list}>
          <Pressable
            style={styles.primary}
            onPress={() => router.push({ pathname: '/auth', params: { back: '1' } })}>
            <Text style={styles.primaryText}>{copy.signIn}</Text>
          </Pressable>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell role="artisan">
      <BrandHeader title={copy.offersTitle} subtitle={copy.offersSubtitle} />
      <ScrollView contentContainerStyle={styles.list}>
        <StateView
          loading={loading && !data}
          error={data ? null : error}
          empty={data?.length === 0 ? copy.offersEmpty : undefined}
          onRetry={reload}
        />
        {data?.map((offer) => (
          <View key={offer.id} style={styles.card}>
            <Text style={styles.name}>{offer.supporterName}</Text>
            {offer.message ? <Text style={styles.message}>{offer.message}</Text> : null}
            <Pressable onPress={() => Linking.openURL(`tel:${offer.supporterPhone}`)} hitSlop={8}>
              <Text style={styles.phone}>📞 {offer.supporterPhone}</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  card: {
    backgroundColor: Brand.card,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  name: { fontSize: 17, fontWeight: '700', color: Brand.ink },
  message: { fontSize: 14, color: Brand.muted },
  phone: { fontSize: 16, fontWeight: '700', color: Brand.terracotta, marginTop: 4 },
  primary: {
    backgroundColor: Brand.terracotta,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryText: { color: '#ffffff', fontSize: 17, fontWeight: '700' },
});
