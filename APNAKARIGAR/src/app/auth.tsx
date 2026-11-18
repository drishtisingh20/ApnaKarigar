import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/brand';
import { useApp } from '@/context/app-context';
import { t } from '@/data/copy';
import type { Role } from '@/types/app';

export default function AuthScreen() {
  const router = useRouter();
  const { back } = useLocalSearchParams<{ back?: string }>();
  const { language, role, setRole, signIn, signUp } = useApp();
  const copy = t(language);

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [craft, setCraft] = useState('');
  const [village, setVillage] = useState('');
  const [bio, setBio] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const cleanPhone = phone.replace(/[\s-]/g, '');
      const user =
        mode === 'signin'
          ? await signIn(cleanPhone, password)
          : await signUp({
              name: name.trim(),
              phone: cleanPhone,
              password,
              role,
              craft: craft.trim(),
              village: village.trim(),
              bio: bio.trim(),
            });
      // Came here from "I can help" or Upload? Go back to it. Otherwise open the right home.
      if (back === '1' && router.canGoBack()) {
        router.back();
      } else {
        router.replace(user.role === 'buyer' ? '/discover' : '/community');
      }
    } catch (e) {
      Alert.alert(e instanceof Error ? e.message : copy.retry);
    } finally {
      setBusy(false);
    }
  };

  const roles: Role[] = ['artisan', 'buyer'];

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{mode === 'signin' ? copy.signIn : copy.signUp}</Text>

        {mode === 'signup' ? (
          <>
            <View style={styles.chips}>
              {roles.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setRole(item)}
                  style={[styles.chip, role === item && styles.chipActive]}>
                  <Text style={[styles.chipText, role === item && styles.chipTextActive]}>
                    {item === 'artisan' ? copy.artisanTitle : copy.buyerTitle}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>{copy.nameLabel}</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} autoCapitalize="words" />
          </>
        ) : null}

        <Text style={styles.label}>{copy.phoneLabel}</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          keyboardType="phone-pad"
          autoComplete="tel"
        />

        <Text style={styles.label}>{copy.passwordLabel}</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          autoCapitalize="none"
        />

        {mode === 'signup' && role === 'artisan' ? (
          <>
            <Text style={styles.label}>{copy.craftLabel}</Text>
            <TextInput value={craft} onChangeText={setCraft} style={styles.input} />
            <Text style={styles.label}>{copy.villageLabel}</Text>
            <TextInput value={village} onChangeText={setVillage} style={styles.input} />
            <Text style={styles.label}>{copy.bioLabel}</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              style={[styles.input, styles.multiline]}
              multiline
            />
          </>
        ) : null}

        <Pressable style={[styles.submit, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy}>
          <Text style={styles.submitText}>{mode === 'signin' ? copy.signIn : copy.signUp}</Text>
        </Pressable>

        <Pressable onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')} hitSlop={8}>
          <Text style={styles.switch}>{mode === 'signin' ? copy.newHere : copy.haveAccount}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.cream },
  form: { paddingHorizontal: 20, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: '700', color: Brand.ink, marginBottom: 8 },
  label: { marginTop: 16, marginBottom: 8, fontSize: 13, fontWeight: '700', color: Brand.muted },
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
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: Brand.chip },
  chipActive: { backgroundColor: Brand.terracotta },
  chipText: { fontSize: 13, fontWeight: '600', color: Brand.ink },
  chipTextActive: { color: '#ffffff' },
  submit: {
    marginTop: 24,
    backgroundColor: Brand.terracotta,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: { color: '#ffffff', fontSize: 17, fontWeight: '700' },
  switch: { marginTop: 20, textAlign: 'center', color: Brand.terracotta, fontWeight: '700' },
});
