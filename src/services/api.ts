const API_URL = import.meta.env.VITE_API_URL;

console.log('URL da API:', API_URL);

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const resposta = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const resultado = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw new Error(
      resultado?.mensagem ??
      resultado?.message ??
      resultado?.erro ??
      'Ocorreu um erro ao comunicar com a API.'
    );
  }

  return resultado as T;
}
