/*
 * Autenticação integrada ao backend Flask (/api/v1/auth).
 * O token JWT e os dados do usuário ficam no localStorage; as telas e o AuthProvider não mudam.
 * ATENÇÃO: a permissão de administrador só vale de verdade se o BACKEND também a verificar.
 */
import type { RegisterInput, Role, User } from '../types/auth'

const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1'

const TOKEN_KEY = 'orbita.token'
const USER_KEY = 'orbita.user'

/** Credenciais de exemplo exibidas na tela de login. Crie essa conta no backend (perfil "analista"). */
export const DEMO_ADMIN = { email: 'admin@orbita.com', password: 'Admin@1234' }

/** Perfis do backend que viram "admin" no front (Hub de Inovação). */
const PERFIS_ADMIN = ['Analista/Hub']

export class AuthError extends Error {}

interface UsuarioApi {
  id_usuario: number
  nome: string
  email: string
  perfis: string[]
  data_criacao: string | null
}

interface LoginApi {
  access_token: string
  usuario: UsuarioApi
}

function toUser(api: UsuarioApi): User {
  const role: Role = api.perfis.some((perfil) => PERFIS_ADMIN.includes(perfil)) ? 'admin' : 'usuario'
  return {
    id: String(api.id_usuario),
    name: api.nome,
    email: api.email,
    role,
    createdAt: api.data_criacao ?? '',
  }
}

function mensagemDeErro(data: unknown): string {
  const corpo = (data ?? {}) as { erro?: string; campos?: Record<string, string[]> }
  const primeiroCampo = corpo.campos ? Object.values(corpo.campos)[0] : undefined
  if (primeiroCampo && primeiroCampo.length > 0) return primeiroCampo[0]
  return corpo.erro ?? 'Não foi possível concluir a operação.'
}

async function request<T>(path: string, method: 'GET' | 'POST', body?: unknown): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new AuthError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.')
  }
  const data: unknown = await response.json().catch(() => ({}))
  if (!response.ok) throw new AuthError(mensagemDeErro(data))
  return data as T
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/** Lê o campo `exp` do JWT (sem validar assinatura; quem valida é o backend). */
function tokenExpirado(token: string): boolean {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const { exp } = JSON.parse(atob(payload)) as { exp?: number }
    return typeof exp === 'number' && exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

/** Token JWT da sessão atual. Use nas próximas chamadas à API: Authorization: Bearer <token>. */
export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  if (tokenExpirado(token)) {
    clearSession()
    return null
  }
  return token
}

export function getCurrentUser(): User | null {
  if (!getToken()) return null
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null') as User | null
  } catch {
    return null
  }
}

export async function login(email: string, password: string): Promise<User> {
  const data = await request<LoginApi>('/auth/login', 'POST', {
    email: normalizeEmail(email),
    senha: password,
  })
  const user = toUser(data.usuario)
  localStorage.setItem(TOKEN_KEY, data.access_token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
}

export async function register({ name, email, password }: RegisterInput): Promise<User> {
  // Todo cadastro novo é "colaborador". O backend não devolve token no cadastro, então entramos em seguida.
  await request<UsuarioApi>('/auth/register', 'POST', {
    nome: name.trim(),
    email: normalizeEmail(email),
    senha: password,
    perfil: 'colaborador',
  })
  return login(email, password)
}

export function logout() {
  clearSession()
}

function requireAdmin(): User {
  const me = getCurrentUser()
  if (!me || me.role !== 'admin') throw new AuthError('Você não tem permissão para esta ação.')
  return me
}

/* O backend ainda não tem rotas para gerenciar usuários. Até existirem, a lista mostra só a sua conta. */
export function listUsers(): User[] {
  return [requireAdmin()]
}

export function changeRole(_userId: string, _role: Role): void {
  requireAdmin()
  throw new AuthError('Alterar perfis ainda não está disponível no backend.')
}

export function removeUser(_userId: string): void {
  requireAdmin()
  throw new AuthError('Remover usuários ainda não está disponível no backend.')
}