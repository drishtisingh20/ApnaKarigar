import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StateView } from '@/components/state-view';
import { WorkCard } from '@/components/work-card';
import { Brand } from '@/constants/brand';
import { useApp } from '@/context/app-context';
import { t } from '@/data/copy';
import { useAsync } from '@/hooks/use-async';
import { api, imageUrl } from '@/lib/api';

export default function ArtisanProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { language, user } = useApp();
  const copy = t(language);
  const [justHelped, setJustHelped] = useState(false);
  const userId = user?.id;

  const load = useCallback(async () => {
    const [artisan, works, mine] = await Promise.all([
      api.getArtisan(id ?? ''),
      api.listWorks({ artisanId: id ?? '' }),
      userId ? api.mySupports() : Promise.resolve([] as string[]),
    ]);
    return { artisan, works, alreadyHelped: mine.includes(artisan.id) };
  }, [id, userId]);
  const { data, error, loading, reload } = useAsync(load);

  if (!data) {
    return loading ? (
      <StateView loading />
    ) : (
      <View style={styles.missing}>
        <Text style={styles.missingText}>{error?.includes('not found') ? copy.missingArtisan : error}</Text>
        <Pressable onPress={reload}>
          <Text style={styles.missingText}>{copy.retry}</Text>
        </Pressable>
      </View>
    );
  }

  const { artisan, works, alreadyHelped } = data;
  const helped = alreadyHelped || justHelped;
  const craft = language === 'hi' ? artisan.craftHi : artisan.craft;
  const village = language === 'hi' ? artisan.villageHi : artisan.village;
  const bio = language === 'hi' ? artisan.bioHi : artisan.bio;
  const needTitle = language === 'hi' ? artisan.requirement.titleHi : artisan.requirement.title;
  const needDetail = language === 'hi' ? artisan.requirement.detailHi : artisan.requirement.detail;

  const offerHelp = async () => {
    if (!user) {
      Alert.alert(copy.signInToHelp);
      router.push({ pathname: '/auth', params: { back: '1' } });
      return;
    }
    try {
      await api.offerSupport(artisan.id);
      setJustHelped(true);
      Alert.alert(artisan.name, copy.supportThanks);
    } catch (e) {
      Alert.alert(e instanceof Error ? e.message : copy.retry);
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: artisan.name }} />
      <Image
        source={{ uri: imageUrl(artisan.cover) }}
        style={[styles.cover, { backgroundColor: Brand.chip }]}
        contentFit="cover"
      />
      <View style={styles.identity}>
        <Image
          source={{ uri: imageUrl(artisan.avatar) }}
          style={[styles.avatar, { backgroundColor: Brand.chip }]}
          contentFit="cover"
        />
        <Text style={styles.name}>{artisan.name}</Text>
        <Text style={styles.meta}>
          {craft} · {village}
        </Text>
        <Text style={styles.bio}>{bio}</Text>
      </View>

      <View style={styles.needCard}>
        <Text style={styles.needLabel}>{copy.requirement}</Text>
        <Text style={styles.needTitle}>
          {needTitle}
          {artisan.requirement.amount ? ` · ${artisan.requirement.amount}` : ''}
        </Text>
        {needDetail ? <Text style={styles.needDetail}>{needDetail}</Text> : null}
        <Pressable
          style={[styles.helpBtn, helped && styles.helpBtnDone]}
          onPress={offerHelp}
          disabled={helped}>
          <Text style={styles.helpText}>{helped ? copy.supportSent : copy.support}</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>{copy.theirWork}</Text>
      <View style={styles.works}>
        {works.map((work) => (
          <WorkCard key={work.id} work={work} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Brand.cream,
  },
  content: {
    paddingBottom: 40,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.cream,
    padding: 24,
  },
  missingText: {
    color: Brand.muted,
    fontSize: 16,
  },
  cover: {
    width: '100%',
    height: 180,
    backgroundColor: Brand.chip,
  },
  identity: {
    paddingHorizontal: 20,
    marginTop: -36,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: Brand.cream,
    backgroundColor: Brand.chip,
  },
  name: {
    marginTop: 12,
    fontSize: 26,
    fontWeight: '700',
    color: Brand.ink,
  },
  meta: {
    marginTop: 4,
    fontSize: 14,
    color: Brand.muted,
  },
  bio: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: Brand.ink,
  },
  needCard: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: Brand.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  needLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Brand.gold,
    textTransform: 'uppercase',
  },
  needTitle: {
    marginTop: 6,
    fontSize: 17,
    fontWeight: '700',
    color: Brand.ink,
  },
  needDetail: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: Brand.muted,
  },
  helpBtn: {
    marginTop: 16,
    backgroundColor: Brand.terracotta,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  helpBtnDone: {
    opacity: 0.6,
  },
  helpText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  section: {
    marginTop: 24,
    marginHorizontal: 20,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '700',
    color: Brand.ink,
  },
  works: {
    paddingHorizontal: 20,
    gap: 12,
  },
});
