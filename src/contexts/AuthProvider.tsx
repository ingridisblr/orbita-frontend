import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import * as authService from '../services/authService'
import type { RegisterInput, User } from '../types/auth'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser())

  const value = useMemo(
    () => ({
      user,
      login: async (email: string, password: string) => setUser(await authService.login(email, password)),
      register: async (input: RegisterInput) => setUser(await authService.register(input)),
      logout: () => {
        authService.logout()
        setUser(null)
      },
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
