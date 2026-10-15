import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { Alert, Button, Input } from '../components/common'
import { useAuth } from '../hooks/useAuth'
import { DEMO_ADMIN } from '../services/authService'
import { AuthLayout } from './AuthLayout'

export function LoginPage({ onGoRegister }: { onGoRegister: () => void }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const emailError = submitted && !email.includes('@') ? 'Informe um e-mail válido, como nome@empresa.com.' : undefined
  const passwordError = submitted && !password ? 'Informe a sua senha.' : undefined

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setError('')
    if (!email.includes('@') || !password) return
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Entrar" subtitle="Acesse a plataforma ÓRBITA com o seu e-mail e senha.">
      <div className="auth__alert">
        <Alert variant="info" title="Modo demonstração">
          Administrador de teste: {DEMO_ADMIN.email} / {DEMO_ADMIN.password}
        </Alert>
      </div>
      {error && (
        <div className="auth__alert">
          <Alert variant="error" title="Não foi possível entrar">{error}</Alert>
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
        />
        <Input
          label="Senha"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordError}
        />
        <Button type="submit" size="lg" fullWidth loading={loading}>Entrar</Button>
      </form>
      <p className="auth__switch">
        Ainda não tem conta?
        <Button variant="ghost" onClick={onGoRegister}>Cadastre-se</Button>
      </p>
    </AuthLayout>
  )
}
