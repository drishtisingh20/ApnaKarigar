import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { Artisan, RequirementCategory, Role, Work } from '@/types/app';

// ---------- Server address ----------
// 1. EXPO_PUBLIC_API_URL (production, or an ngrok URL), else
// 2. the computer running `expo start` (works on a real phone on the same Wi-Fi), else
// 3. the Android emulator's alias for the host machine / localhost.
function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host && /^(localhost|\d{1,3}(\.\d{1,3}){3})$/.test(host)) return `http://${host}:8000`;
  return Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
}

export const BASE_URL = resolveBaseUrl();

/** Photos uploaded through the app come back as "/uploads/x.jpg"; demo data is already absolute. */
export function imageUrl(path?: string | null): string {
  if (!path) return '';
  return /^(https?:|file:|data:|blob:)/.test(path) ? path : `${BASE_URL}${path}`;
}

// ---------- Types that only exist because of the backend ----------
export type User = { id: string; name: string; phone: string; role: Role };

export type SupportOffer = {
  id: string;
  supporterName: string;
  supporterPhone: string;
  message: string;
  createdAt: string;
};

export type RegisterInput = {
  name: string;
  phone: string;
  password: string;
  role: Role;
  craft?: string;
  village?: string;
  bio?: string;
};

export type NewWork = {
  title: string;
  description: string;
  image: string;
  requirement?: { category: RequirementCategory; detail: string; amount?: string };
};

export type PickedImage = { uri: string; mimeType?: string | null; fileName?: string | null };

// ---------- Token storage (SecureStore on phones, localStorage on web) ----------
const TOKEN_KEY = 'apnakarigar_token';
const onWeb = Platform.OS === 'web';
const hasLocalStorage = () => typeof localStorage !== 'undefined';

export const tokenStore = {
  async get(): Promise<string | null> {
    if (onWeb) return hasLocalStorage() ? localStorage.getItem(TOKEN_KEY) : null;
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async set(token: string): Promise<void> {
    if (onWeb) {
      if (hasLocalStorage()) localStorage.setItem(TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async clear(): Promise<void> {
    if (onWeb) {
      if (hasLocalStorage()) localStorage.removeItem(TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};

// ---------- Core request ----------
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

function describe(detail: unknown): string {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    // FastAPI validation errors: [{ loc: ['body','phone'], msg: '...' }]
    const first = detail[0] as { loc?: (string | number)[]; msg?: string };
    const field = first.loc?.filter((p) => p !== 'body').join('.');
    return field ? `${field}: ${first.msg}` : (first.msg ?? 'Invalid input');
  }
  return 'Something went wrong. Please try again.';
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
  const token = await tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (typeof init.body === 'string') headers['Content-Type'] = 'application/json';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000); // slow village networks
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...init, headers, signal: controller.signal });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your internet and try again.');
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, describe((data as { detail?: unknown }).detail));
  return data as T;
}

const send = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

// ---------- Endpoints ----------
export const api = {
  // auth
  register: (input: RegisterInput) =>
    request<{ token: string; user: User }>('/auth/register', send('POST', input)),
  login: (phone: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', send('POST', { phone, password })),
  me: () => request<User>('/auth/me'),

  // browsing (public)
  listArtisans: (params: { q?: string; category?: RequirementCategory } = {}) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<Artisan[]>(`/artisans${qs ? `?${qs}` : ''}`);
  },
  getArtisan: (id: string) => request<Artisan>(`/artisans/${encodeURIComponent(id)}`),
  listWorks: (params: { artisanId?: string } = {}) => {
    const qs = params.artisanId ? `?artisanId=${encodeURIComponent(params.artisanId)}` : '';
    return request<Work[]>(`/works${qs}`);
  },

  // artisans
  async uploadImage(image: PickedImage): Promise<string> {
    const form = new FormData();
    const type = image.mimeType ?? 'image/jpeg';
    const name = image.fileName ?? `work.${type.split('/')[1] ?? 'jpg'}`;
    if (onWeb) {
      form.append('file', await (await fetch(image.uri)).blob(), name);
    } else {
      form.append('file', { uri: image.uri, name, type } as unknown as Blob);
    }
    const { url } = await request<{ url: string }>('/upload', { method: 'POST', body: form });
    return url;
  },
  createWork: (work: NewWork) => request<Work>('/works', send('POST', work)),
  deleteWork: (id: string) => request<void>(`/works/${encodeURIComponent(id)}`, send('DELETE')),
  receivedOffers: () => request<SupportOffer[]>('/supports/received'),

  // "I can help"
  offerSupport: (artisanId: string, message = '') =>
    request<{ ok: boolean }>(`/artisans/${encodeURIComponent(artisanId)}/support`, send('POST', { message })),
  mySupports: () => request<string[]>('/supports/mine'),
};
