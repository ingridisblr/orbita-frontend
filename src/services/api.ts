const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://orbita-plataformaparagestaodedemandas-h7q2.onrender.com/api/v1';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('orbita.token');
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let resposta: Response;

  try {
    resposta = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      'Não foi possível conectar ao backend. Verifique se o servidor está rodando.'
    );
  }

  const resultado = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw new Error(
      resultado?.mensagem ??
      resultado?.message ??
      resultado?.erro ??
      resultado?.error ??
      'Ocorreu um erro ao comunicar com a API.'
    );
  }

  return resultado as T;
}