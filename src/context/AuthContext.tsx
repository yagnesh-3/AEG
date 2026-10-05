// Fake authentication for the demo. No real credential checking — login is by
// picking a demo account (or matching an email against the seed accounts).

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { DemoAccount, Role } from '../types'
import { demoAccounts } from '../data/seed'

type AuthContextValue = {
  currentUser: DemoAccount | null
  role: Role | null
  accounts: DemoAccount[]
  login: (accountId: string) => DemoAccount | null
  loginByEmail: (email: string) => DemoAccount | null
}

const AuthContext = createContext<AuthContextValue | null>(null)
const STORAGE_KEY = 'aeg-demo-auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<DemoAccount | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null
      const parsed = JSON.parse(stored) as DemoAccount
      return demoAccounts.find((a) => a.id === parsed.id) ?? null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (currentUser) localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser))
    else localStorage.removeItem(STORAGE_KEY)
  }, [currentUser])

  const value = useMemo<AuthContextValue>(() => ({
    currentUser,
    role: currentUser?.role ?? null,
    accounts: demoAccounts,
    login: (accountId) => {
      const account = demoAccounts.find((a) => a.id === accountId) ?? null
      setCurrentUser(account)
      return account
    },
    loginByEmail: (email) => {
      const account = demoAccounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase()) ?? null
      if (account) setCurrentUser(account)
      return account
    },
  }), [currentUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
