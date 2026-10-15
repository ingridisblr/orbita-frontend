import type { ReactNode } from 'react'
import { Brand } from '../components/common'
import './AuthPage.css'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
}

/** Moldura das telas de entrar e de cadastrar (sem menu lateral). */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="auth">
      <header className="auth__brand">
        <Brand />
      </header>
      <main className="auth__card">
        <h1>{title}</h1>
        <p className="auth__subtitle">{subtitle}</p>
        {children}
      </main>
    </div>
  )
}
