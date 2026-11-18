import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { StyleSheet, Text, View, type DimensionValue } from 'react-native';

import { Brand } from '@/constants/brand';
import { useApp } from '@/context/app-context';
import { t } from '@/data/copy';
import { imageUrl } from '@/lib/api';
import type { Work } from '@/types/app';

export function WorkCard({ work, width }: { work: Work; width?: DimensionValue }) {
  const { language } = useApp();
  const copy = t(language);
  const title = language === 'hi' ? work.titleHi : work.title;
  const cardWidth = width ?? '100%';

  const card = (
    <View style={[styles.card, { width: cardWidth }]}>
      <Image source={{ uri: imageUrl(work.image) }} style={styles.image} contentFit="cover" />
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {work.artisanName || copy.you}
      </Text>
    </View>
  );

  if (!work.artisanId) {
    return card;
  }

  return (
    <Link href={`/artisan/${work.artisanId}`} style={{ width: cardWidth }}>
      {card}
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Brand.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: Brand.chip,
  },
  title: {
    paddingHorizontal: 10,
    paddingTop: 8,
    fontSize: 14,
    fontWeight: '700',
    color: Brand.ink,
  },
  meta: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 2,
    fontSize: 12,
    color: Brand.muted,
  },
});
