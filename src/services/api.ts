import { obterToken } from './session';

const API_URL = import.meta.env.VITE_API_URL;

// Erro da API com o status HTTP e, em 422, os erros por campo.
export class ApiError extends Error {
  status: number;
  campos?: Record<string, string[]>;

  constructor(
    mensagem: string,
    status: number,
    campos?: Record<string, string[]>
  ) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
    this.campos = campos;
  }
}

// Chamado quando a API recusa o token (expirado ou inválido).
let aoSessaoExpirada: (() => void) | null = null;

export function definirAoSessaoExpirada(callback: (() => void) | null) {
  aoSessaoExpirada = callback;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = obterToken();

  const resposta = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const resultado = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    if (resposta.status === 401 && token) {
      aoSessaoExpirada?.();
    }

    throw new ApiError(
      resultado?.mensagem ??
      resultado?.message ??
      resultado?.erro ??
      'Ocorreu um erro ao comunicar com a API.',
      resposta.status,
      resultado?.campos
    );
  }

  return resultado as T;
}
