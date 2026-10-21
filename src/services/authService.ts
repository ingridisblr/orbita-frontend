
import { apiRequest } from './api';
import type { User, UserRole } from '../types/auth';

const TOKEN_KEY = 'orbita.token';
const USER_KEY = 'orbita.user';

export interface UsuarioApi {
  id_usuario: number;
  nome: string;
  email: string;
  area: string | null;
  status: string;
  perfis: string[];
  data_criacao: string | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario: UsuarioApi;
}

export interface CadastroUsuario {
  nome: string;
  email: string;
  senha: string;
  area: string;
  perfil: UserRole;
}

function converterPerfil(perfis: string[]): UserRole {
  if (perfis.includes('Analista/Hub')) {
    return 'analista';
  }

  if (perfis.includes('Gestor Demandante')) {
    return 'gestor';
  }

  if (perfis.includes('Colaborador')) {
    return 'colaborador';
  }

  throw new Error('Perfil de usuário não reconhecido.');
}

function converterUsuario(usuario: UsuarioApi): User {
  return {
    id: String(usuario.id_usuario),
    name: usuario.nome,
    email: usuario.email,
    area: usuario.area ?? '',
    role: converterPerfil(usuario.perfis),
  };
}

export async function login(
  email: string,
  senha: string
): Promise<User> {
  const resposta = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      senha,
    }),
  });

  const usuario = converterUsuario(resposta.usuario);

  localStorage.setItem(TOKEN_KEY, resposta.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));

  return usuario;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): User | null {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const usuario = localStorage.getItem(USER_KEY);

    return usuario ? (JSON.parse(usuario) as User) : null;
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function cadastrarUsuario(
  dados: CadastroUsuario
): Promise<UsuarioApi> {
  return apiRequest<UsuarioApi>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}
