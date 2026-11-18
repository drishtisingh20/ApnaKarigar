import { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { BrandHeader } from '@/components/brand-header';
import { ScreenShell } from '@/components/screen-shell';
import { StateView } from '@/components/state-view';
import { WorkCard } from '@/components/work-card';
import { useApp } from '@/context/app-context';
import { t } from '@/data/copy';
import { useAsync } from '@/hooks/use-async';
import { api } from '@/lib/api';

export default function CommunityScreen() {
  const { language } = useApp();
  const copy = t(language);
  const { width } = useWindowDimensions();
  const cardWidth = (width - 52) / 2;
  const load = useCallback(() => api.listWorks(), []);
  const { data, error, loading, reload } = useAsync(load);

  const columns = useMemo(() => {
    const works = data ?? [];
    const left = works.filter((_, index) => index % 2 === 0);
    const right = works.filter((_, index) => index % 2 === 1);
    return [left, right];
  }, [data]);

  return (
    <ScreenShell role="artisan">
      <BrandHeader title={copy.communityTitle} subtitle={copy.communitySubtitle} />
      <ScrollView contentContainerStyle={styles.list}>
        <StateView
          loading={loading && !data}
          error={data ? null : error}
          empty={data?.length === 0 ? copy.noWorks : undefined}
          onRetry={reload}
        />
        <View style={styles.grid}>
          {columns.map((column, index) => (
            <View key={index} style={styles.column}>
              {column.map((work) => (
                <WorkCard key={work.id} work={work} width={cardWidth} />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
  },
});
