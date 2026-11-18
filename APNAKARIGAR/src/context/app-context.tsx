import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { ApiError, api, tokenStore, type RegisterInput, type User } from '@/lib/api';
import type { Language, Role } from '@/types/app';

type AppContextValue = {
  language: Language;
  role: Role;
  /** Signed-in account, or null when browsing as a guest. */
  user: User | null;
  /** False until the saved session (if any) has been checked on app start. */
  authReady: boolean;
  setLanguage: (language: Language) => void;
  setRole: (role: Role) => void;
  signIn: (phone: string, password: string) => Promise<User>;
  signUp: (input: RegisterInput) => Promise<User>;
  signOut: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('hi');
  const [role, setRole] = useState<Role>('buyer');
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Restore a saved session.
  useEffect(() => {
    (async () => {
      try {
        if (await tokenStore.get()) {
          const me = await api.me();
          setUser(me);
          setRole(me.role);
        }
      } catch (e) {
        // Only drop the token if the server rejected it; keep it when merely offline.
        if (e instanceof ApiError && e.status === 401) {
          await tokenStore.clear();
        }
      } finally {
        setAuthReady(true);
      }
    })();
  }, []);

  const finishAuth = useCallback(async (result: { token: string; user: User }) => {
    await tokenStore.set(result.token);
    setUser(result.user);
    setRole(result.user.role);
    return result.user;
  }, []);

  const signIn = useCallback(
    async (phone: string, password: string) => finishAuth(await api.login(phone, password)),
    [finishAuth]
  );
  const signUp = useCallback(
    async (input: RegisterInput) => finishAuth(await api.register(input)),
    [finishAuth]
  );
  const signOut = useCallback(async () => {
    await tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ language, role, user, authReady, setLanguage, setRole, signIn, signUp, signOut }),
    [language, role, user, authReady, signIn, signUp, signOut]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}
