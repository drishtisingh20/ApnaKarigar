import { useRouter } from 'expo-router';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Brand } from '@/constants/brand';
import { useApp } from '@/context/app-context';
import { t } from '@/data/copy';
import type { Language } from '@/types/app';

export default function LandingScreen() {
  const router = useRouter();
  const { language, role, user, setLanguage, setRole, signOut } = useApp();
  const copy = t(language);

  const continueToApp = () => {
    router.replace(role === 'buyer' ? '/discover' : '/community');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwO-SM1DTrnrPKvsgeSzsEBrxsDic9Kh3nf6PRaHO0OYod5UBvYTzscljk4m4QKpwm1TTUQjyt-nkCTD3e-IioJJoKm1_gSg0C8d8BDcLjFHKoCimJZUGIRkAlIhZ38Mvm0cFn1w9kD7J_t7qL4CqAzLgeusOWa1a3aDrHS0hc0DP2VwkKBsfDyRV67g6SsDOngwM2tMWwCJjkpzVHTG5nf2x35Zm8wMtaZ0-hNt8GZUQsVkErY4_v',
              }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Apnakarigar</Text>
          <Text style={styles.subtitle}>{copy.tagline}</Text>
        </View>

        <View style={styles.langContainer}>
          {(['hi', 'en'] as Language[]).map((code) => (
            <TouchableOpacity
              key={code}
              style={[styles.langBtn, language === code && styles.langBtnActive]}
              onPress={() => setLanguage(code)}>
              <Text style={styles.langText}>{code === 'hi' ? copy.hindi : copy.english}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionHeading}>{copy.selectPath}</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.card, role === 'artisan' && styles.cardActiveArtisan]}
          onPress={() => setRole('artisan')}>
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, { backgroundColor: Brand.artisanSoft }]}>
              <Text style={styles.cardEmoji}>🎨</Text>
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{copy.artisanTitle}</Text>
              <Text style={styles.cardDesc}>{copy.artisanDesc}</Text>
            </View>
            <View style={[styles.radio, role === 'artisan' && styles.radioActiveArtisan]} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.card, role === 'buyer' && styles.cardActiveBuyer]}
          onPress={() => setRole('buyer')}>
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, { backgroundColor: Brand.buyerSoft }]}>
              <Text style={styles.cardEmoji}>🛍️</Text>
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{copy.buyerTitle}</Text>
              <Text style={styles.cardDesc}>{copy.buyerDesc}</Text>
            </View>
            <View style={[styles.radio, role === 'buyer' && styles.radioActiveBuyer]} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.9} style={styles.submitBtn} onPress={continueToApp}>
          <Text style={styles.submitBtnText}>{copy.continue}</Text>
        </TouchableOpacity>

        <View style={styles.sessionRow}>
          {user ? (
            <>
              <Text style={styles.sessionText}>
                {copy.signedInAs} {user.name}
              </Text>
              <TouchableOpacity onPress={signOut}>
                <Text style={styles.sessionLink}>{copy.signOut}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={() => router.push('/auth')}>
              <Text style={styles.sessionLink}>{copy.signIn}</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.footerText}>{copy.terms}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.cream,
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Brand.card,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 16,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Brand.ink,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Brand.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  langContainer: {
    flexDirection: 'row',
    backgroundColor: Brand.chip,
    borderRadius: 25,
    padding: 4,
    marginBottom: 32,
  },
  langBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  langBtnActive: {
    backgroundColor: Brand.card,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  langText: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.ink,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Brand.muted,
    letterSpacing: 1.2,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  card: {
    width: '100%',
    backgroundColor: Brand.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  cardActiveArtisan: {
    borderColor: Brand.terracotta,
  },
  cardActiveBuyer: {
    borderColor: Brand.gold,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardEmoji: {
    fontSize: 20,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Brand.ink,
  },
  cardDesc: {
    fontSize: 12,
    color: Brand.muted,
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Brand.border,
  },
  radioActiveArtisan: {
    borderColor: Brand.terracotta,
    backgroundColor: Brand.terracotta,
  },
  radioActiveBuyer: {
    borderColor: Brand.gold,
    backgroundColor: Brand.gold,
  },
  submitBtn: {
    width: '100%',
    backgroundColor: Brand.terracotta,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    elevation: 3,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  sessionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  sessionText: {
    fontSize: 13,
    color: Brand.muted,
  },
  sessionLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Brand.terracotta,
  },
  footerText: {
    fontSize: 12,
    color: Brand.muted,
    marginTop: 24,
    textAlign: 'center',
  },
});
