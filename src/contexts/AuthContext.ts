import { createContext } from 'react'
import type { RegisterInput, User } from '../types/auth'

export interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
