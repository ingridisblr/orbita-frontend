export type Role = 'usuario' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export const ROLE_LABEL: Record<Role, string> = {
  usuario: 'Usuário',
  admin: 'Administrador',
}
