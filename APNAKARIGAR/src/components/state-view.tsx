import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/brand';
import { useApp } from '@/context/app-context';
import { t } from '@/data/copy';

type Props = {
  loading?: boolean;
  error?: string | null;
  /** Message to show when the list loaded but is empty. */
  empty?: string;
  onRetry?: () => void;
};

/** Loading / error / empty placeholder. Renders nothing when there is content to show. */
export function StateView({ loading, error, empty, onRetry }: Props) {
  const { language } = useApp();
  const copy = t(language);

  if (loading) {
    return (
      <View style={styles.wrap}>
        <ActivityIndicator color={Brand.terracotta} />
        <Text style={styles.text}>{copy.loading}</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.text}>{error}</Text>
        {onRetry ? (
          <Pressable style={styles.btn} onPress={onRetry}>
            <Text style={styles.btnText}>{copy.retry}</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }
  if (empty) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.text}>{empty}</Text>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', padding: 32, gap: 12 },
  text: { color: Brand.muted, fontSize: 15, textAlign: 'center' },
  btn: {
    backgroundColor: Brand.terracotta,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  btnText: { color: '#fff', fontWeight: '600' },
});
