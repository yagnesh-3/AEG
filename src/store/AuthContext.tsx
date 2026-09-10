import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { users } from '@/data';
import { loadState, saveState } from '@/store/storage';
import type { Role, User } from '@/types';

interface AuthValue {
  user: User | null;
  signIn: (userId: string) => void;
  signOut: () => void;
  /** Swap to the demo account for a role, keeping the session alive. */
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(() => loadState<string | null>('session', null));

  const signIn = useCallback((id: string) => {
    setUserId(id);
    saveState('session', id);
  }, []);

  const signOut = useCallback(() => {
    setUserId(null);
    saveState('session', null);
  }, []);

  const switchRole = useCallback(
    (role: Role) => {
      const match = users.find((u) => u.role === role);
      if (match) signIn(match.id);
    },
    [signIn],
  );

  const value = useMemo<AuthValue>(
    () => ({
      user: users.find((u) => u.id === userId) ?? null,
      signIn,
      signOut,
      switchRole,
    }),
    [userId, signIn, signOut, switchRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
