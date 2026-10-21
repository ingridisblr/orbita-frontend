import { apiRequest } from './api';

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
