import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { Alert, Button, Input } from '../components/common'
import { useAuth } from '../hooks/useAuth'
import { AuthLayout } from './AuthLayout'

export function RegisterPage({ onGoLogin }: { onGoLogin: () => void }) {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const errors = {
    name: name.trim().length < 3 ? 'Informe o seu nome completo.' : undefined,
    email: !email.includes('@') ? 'Informe um e-mail válido, como nome@empresa.com.' : undefined,
    password: password.length < 8 ? 'A senha precisa ter pelo menos 8 caracteres.' : undefined,
    confirm: confirm !== password ? 'As senhas não são iguais.' : undefined,
  }
  const hasErrors = Object.values(errors).some(Boolean)

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setError('')
    if (hasErrors) return
    setLoading(true)
    try {
      await register({ name, email, password })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir o cadastro.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Criar conta" subtitle="Preencha os dados abaixo para se cadastrar.">
      {error && (
        <div className="auth__alert">
          <Alert variant="error" title="Não foi possível cadastrar">{error}</Alert>
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Nome completo"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={submitted ? errors.name : undefined}
        />
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={submitted ? errors.email : undefined}
        />
        <Input
          label="Senha"
          type="password"
          autoComplete="new-password"
          required
          hint="Mínimo de 8 caracteres."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={submitted ? errors.password : undefined}
        />
        <Input
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={submitted ? errors.confirm : undefined}
        />
        <Button type="submit" size="lg" fullWidth loading={loading}>Cadastrar</Button>
      </form>
      <p className="auth__switch">
        Já tem conta?
        <Button variant="ghost" onClick={onGoLogin}>Entrar</Button>
      </p>
    </AuthLayout>
  )
}
