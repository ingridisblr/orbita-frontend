import type { User } from '../types/auth';

const TOKEN_KEY = 'orbita_token';
const USER_KEY = 'orbita_user';

export function obterToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function obterUsuarioSalvo(): User | null {
  try {
    const bruto = localStorage.getItem(USER_KEY);
    return bruto ? (JSON.parse(bruto) as User) : null;
  } catch {
    return null;
  }
}

export function salvarSessao(token: string, usuario: User): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  } catch {
    // Armazenamento indisponível: a sessão vale só até recarregar a página.
  }
}

export function limparSessao(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // Nada a limpar.
  }
}
