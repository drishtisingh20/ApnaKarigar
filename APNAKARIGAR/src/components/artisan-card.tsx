import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/brand';
import { t } from '@/data/copy';
import { useApp } from '@/context/app-context';
import { imageUrl } from '@/lib/api';
import type { Artisan } from '@/types/app';

export function ArtisanCard({ artisan }: { artisan: Artisan }) {
  const { language } = useApp();
  const copy = t(language);
  const craft = language === 'hi' ? artisan.craftHi : artisan.craft;
  const village = language === 'hi' ? artisan.villageHi : artisan.village;
  const need = language === 'hi' ? artisan.requirement.titleHi : artisan.requirement.title;

  return (
    <Link href={`/artisan/${artisan.id}`} style={styles.link}>
      <View style={styles.card}>
        <Image
          source={{ uri: imageUrl(artisan.avatar) }}
          style={[styles.avatar, { backgroundColor: Brand.chip }]}
          contentFit="cover"
        />
        <View style={styles.body}>
          <Text style={styles.name}>{artisan.name}</Text>
          <Text style={styles.meta}>
            {craft} · {village}
          </Text>
          <View style={styles.need}>
            <Text style={styles.needLabel}>{copy.requirement}</Text>
            <Text style={styles.needText}>
              {need}
              {artisan.requirement.amount ? ` · ${artisan.requirement.amount}` : ''}
            </Text>
          </View>
          <Text style={styles.cta}>{copy.viewProfile} →</Text>
        </View>
      </View>
    </Link>
  );
}

const styles = StyleSheet.create({
  link: {
    width: '100%',
  },
  card: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: Brand.card,
    borderRadius: 16,
    padding: 14,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Brand.chip,
  },
  body: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: Brand.ink,
  },
  meta: {
    marginTop: 2,
    fontSize: 13,
    color: Brand.muted,
  },
  need: {
    marginTop: 8,
    backgroundColor: Brand.chip,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  needLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Brand.gold,
    textTransform: 'uppercase',
  },
  needText: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '600',
    color: Brand.ink,
  },
  cta: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    color: Brand.terracotta,
  },
});
