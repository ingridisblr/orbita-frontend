import { apiRequest } from './api';
import type { User, UserRole } from '../types/auth';

export interface UsuarioApi {
  id_usuario:    number;
  nome:          string;
  email:         string;
  area:          string;
  status:        string;
  perfis:        string[];
  data_criacao:  string | null;
}

export interface LoginResponse {
  access_token:  string;
  token_type:    string;
  usuario:       UsuarioApi;
}

export async function login(
  email: string,
  senha: string
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });
}

// Converte o usuário da API para o usuário usado pelo front.
// O backend devolve os perfis como texto ("Colaborador",
// "Gestor Demandante", "Analista/Hub"); vale o de maior permissão.
export function usuarioApiParaUser(usuario: UsuarioApi): User {
  const perfis = usuario.perfis.map((perfil) => perfil.toLowerCase());

  let role: UserRole = 'colaborador';

  if (perfis.some((p) => /analista|hub|admin/.test(p))) {
    role = 'analista';
  } else if (perfis.some((p) => p.includes('gestor'))) {
    role = 'gestor';
  }

  return {
    id:    String(usuario.id_usuario),
    name:  usuario.nome,
    email: usuario.email,
    role,
    area:  usuario.area ?? '',
  };
}
