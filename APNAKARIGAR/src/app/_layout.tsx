import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Brand } from '@/constants/brand';
import { AppProvider } from '@/context/app-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <AnimatedSplashOverlay />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Brand.cream },
          headerTintColor: Brand.terracotta,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Brand.cream },
          headerTitleStyle: { fontWeight: '700', color: Brand.ink },
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="discover" options={{ headerShown: false }} />
        <Stack.Screen name="community" options={{ headerShown: false }} />
        <Stack.Screen name="upload" options={{ headerShown: false }} />
        <Stack.Screen name="offers" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ title: '' }} />
        <Stack.Screen name="artisan/[id]" options={{ title: 'Profile' }} />
      </Stack>
    </AppProvider>
  );
}
