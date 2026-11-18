import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ArtisanCard } from '@/components/artisan-card';
import { BrandHeader } from '@/components/brand-header';
import { ScreenShell } from '@/components/screen-shell';
import { StateView } from '@/components/state-view';
import { useApp } from '@/context/app-context';
import { t } from '@/data/copy';
import { useAsync } from '@/hooks/use-async';
import { api } from '@/lib/api';

export default function DiscoverScreen() {
  const { language } = useApp();
  const copy = t(language);
  const load = useCallback(() => api.listArtisans(), []);
  const { data: artisans, error, loading, reload } = useAsync(load);

  return (
    <ScreenShell role="buyer">
      <BrandHeader title={copy.discoverTitle} subtitle={copy.discoverSubtitle} />
      <ScrollView contentContainerStyle={styles.list}>
        <StateView
          loading={loading && !artisans}
          error={artisans ? null : error}
          empty={artisans?.length === 0 ? copy.noArtisans : undefined}
          onRetry={reload}
        />
        {artisans?.map((artisan) => (
          <View key={artisan.id} style={styles.item}>
            <ArtisanCard artisan={artisan} />
          </View>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  item: {
    marginBottom: 14,
  },
});
