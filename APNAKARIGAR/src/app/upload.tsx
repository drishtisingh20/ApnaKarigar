import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BrandHeader } from '@/components/brand-header';
import { ScreenShell } from '@/components/screen-shell';
import { Brand } from '@/constants/brand';
import { useApp } from '@/context/app-context';
import { t } from '@/data/copy';
import { api, type PickedImage } from '@/lib/api';
import type { RequirementCategory } from '@/types/app';

const CATEGORIES: RequirementCategory[] = ['funding', 'materials', 'tools', 'market'];

export default function UploadScreen() {
  const router = useRouter();
  const { language, user } = useApp();
  const copy = t(language);
  const [photo, setPhoto] = useState<string | null>(null);
  const [asset, setAsset] = useState<PickedImage | null>(null);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [need, setNeed] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<RequirementCategory>('materials');

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) {
      const picked = result.assets[0];
      setPhoto(picked?.uri ?? null);
      setAsset(picked ?? null);
    }
  };

  const publish = async () => {
    if (!asset) {
      Alert.alert(copy.emptyPhoto);
      return;
    }
    if (!title.trim()) {
      Alert.alert(copy.emptyTitle);
      return;
    }

    setBusy(true);
    try {
      const url = await api.uploadImage(asset);
      const hasNeed = need.trim() || amount.trim();
      await api.createWork({
        title: title.trim(),
        description: story.trim(),
        image: url,
        requirement: hasNeed
          ? { category, detail: need.trim(), amount: amount.trim() || undefined }
          : undefined,
      });
      Alert.alert(copy.published);
      setPhoto(null);
      setAsset(null);
      setTitle('');
      setStory('');
      setNeed('');
      setAmount('');
      router.replace('/community');
    } catch (e) {
      Alert.alert(e instanceof Error ? e.message : copy.retry);
    } finally {
      setBusy(false);
    }
  };

  if (user?.role !== 'artisan') {
    return (
      <ScreenShell role="artisan">
        <BrandHeader title={copy.uploadTitle} subtitle={copy.signInToUpload} />
        <View style={styles.form}>
          <Pressable
            style={styles.publish}
            onPress={() => router.push({ pathname: '/auth', params: { back: '1' } })}>
            <Text style={styles.publishText}>{copy.signIn}</Text>
          </Pressable>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell role="artisan">
      <BrandHeader title={copy.uploadTitle} subtitle={copy.uploadSubtitle} />
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Pressable style={styles.photoBox} onPress={pickPhoto}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photo} contentFit="cover" />
          ) : (
            <Text style={styles.photoHint}>{copy.uploadPhoto}</Text>
          )}
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={pickPhoto}>
          <Text style={styles.secondaryText}>{copy.pickPhoto}</Text>
        </Pressable>

        <Text style={styles.label}>{copy.workTitle}</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder={copy.workTitle}
          placeholderTextColor={Brand.border}
        />

        <Text style={styles.label}>{copy.workStory}</Text>
        <TextInput
          value={story}
          onChangeText={setStory}
          style={[styles.input, styles.multiline]}
          placeholder={copy.workStory}
          placeholderTextColor={Brand.border}
          multiline
        />

        <Text style={styles.label}>{copy.needLabel}</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((item) => {
            const active = category === item;
            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {copy.categories[item]}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          value={need}
          onChangeText={setNeed}
          style={[styles.input, styles.multiline]}
          placeholder={copy.needDetail}
          placeholderTextColor={Brand.border}
          multiline
        />

        <Text style={styles.label}>{copy.amount}</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          style={styles.input}
          placeholder="₹"
          placeholderTextColor={Brand.border}
          keyboardType="numeric"
        />

        <Pressable style={[styles.publish, busy && { opacity: 0.6 }]} onPress={publish} disabled={busy}>
          <Text style={styles.publishText}>{busy ? copy.publishing : copy.publish}</Text>
        </Pressable>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  form: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  photoBox: {
    height: 180,
    borderRadius: 16,
    backgroundColor: Brand.chip,
    borderWidth: 1,
    borderColor: Brand.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoHint: {
    color: Brand.muted,
    fontWeight: '600',
  },
  secondaryBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: Brand.buyerSoft,
  },
  secondaryText: {
    color: Brand.gold,
    fontWeight: '700',
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
    color: Brand.muted,
  },
  input: {
    backgroundColor: Brand.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Brand.ink,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Brand.chip,
  },
  chipActive: {
    backgroundColor: Brand.terracotta,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Brand.ink,
  },
  chipTextActive: {
    color: '#ffffff',
  },
  publish: {
    marginTop: 24,
    backgroundColor: Brand.terracotta,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  publishText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});
