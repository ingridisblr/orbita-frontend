const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://orbita-plataformaparagestaodedemandas-h7q2.onrender.com/api/v1';

/* #region Erro tipado */

// rede:   o fetch lançou exceção. Com CORS quebrado, uma resposta 429 do
//         preflight cai aqui, porque o navegador esconde o status.
// limite: o backend respondeu 429 de forma legível.
// http:   qualquer outra resposta de erro.
export type TipoErroApi = 'rede' | 'limite' | 'http';

export class ApiError extends Error {
  readonly tipo: TipoErroApi;
  readonly status: number | null;
  readonly retryAfterMs: number | null;

  constructor(
    mensagem: string,
    tipo: TipoErroApi,
    status: number | null = null,
    retryAfterMs: number | null = null
  ) {
    super(mensagem);
    this.name = 'ApiError';
    this.tipo = tipo;
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }

  // Falha que provavelmente passa sozinha se esperar um pouco.
  get ehTemporario(): boolean {
    return this.tipo === 'rede' || this.tipo === 'limite';
  }
}

/* #endregion */

/* #region Retry com espera */

// Só GET repete em falha de rede (é idempotente). Os demais métodos só
// repetem quando o backend respondeu 429, pois nesse caso ele rejeitou a
// requisição antes de processar.
const ESPERAS_RETRY_MS = [2000, 5000];
const ESPERA_MAXIMA_MS = 10000;

function esperar(ms: number, signal?: AbortSignal | null): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Requisição cancelada.', 'AbortError'));
      return;
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', aoCancelar);
      resolve();
    }, ms);

    function aoCancelar() {
      clearTimeout(timer);
      reject(new DOMException('Requisição cancelada.', 'AbortError'));
    }

    signal?.addEventListener('abort', aoCancelar, { once: true });
  });
}

// Retry-After pode vir em segundos ou como data HTTP.
function lerRetryAfter(resposta: Response): number | null {
  const valor = resposta.headers.get('Retry-After');
  if (!valor) return null;

  const segundos = Number(valor);
  if (Number.isFinite(segundos)) return Math.max(0, segundos * 1000);

  const data = Date.parse(valor);
  return Number.isNaN(data) ? null : Math.max(0, data - Date.now());
}

function adicionarJitter(ms: number): number {
  return ms + Math.round(Math.random() * 500);
}

/* #endregion */

/* #region Deduplicação de GET em andamento */

// Duas chamadas iguais ao mesmo tempo (ex.: useEffect duplo do StrictMode
// em dev, ou duas telas pedindo a mesma lista) viram uma só requisição.
// A entrada some assim que a requisição termina; não há cache.
const getsEmAndamento = new Map<string, Promise<unknown>>();

/* #endregion */

async function executar<T>(
  endpoint: string,
  options: RequestInit
): Promise<T> {
  const token = localStorage.getItem('orbita.token');
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const metodo = (options.method ?? 'GET').toUpperCase();

  for (let tentativa = 0; ; tentativa++) {
    const podeRepetir = tentativa < ESPERAS_RETRY_MS.length;
    let erro: ApiError;

    try {
      const resposta = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const resultado = await resposta.json().catch(() => null);

      if (resposta.ok) {
        return resultado as T;
      }

      const mensagem =
        resultado?.mensagem ??
        resultado?.message ??
        resultado?.erro ??
        resultado?.error;

      if (resposta.status === 429) {
        const retryAfterMs = lerRetryAfter(resposta);
        const segundos = retryAfterMs ? Math.ceil(retryAfterMs / 1000) : null;

        erro = new ApiError(
          mensagem ??
            (segundos
              ? `Muitas requisições em pouco tempo. Aguarde ${segundos} s e tente novamente.`
              : 'Muitas requisições em pouco tempo. Aguarde alguns segundos e tente novamente.'),
          'limite',
          429,
          retryAfterMs
        );
      } else {
        throw new ApiError(
          mensagem ?? 'Ocorreu um erro ao comunicar com a API.',
          'http',
          resposta.status
        );
      }
    } catch (e) {
      if (e instanceof ApiError && e.tipo === 'http') throw e;

      // Cancelamento pelo chamador não é falha de rede.
      if (options.signal?.aborted) throw e;

      erro =
        e instanceof ApiError
          ? e
          : new ApiError(
              'Não foi possível conectar ao backend. O servidor pode estar iniciando ou o limite de requisições foi atingido. Aguarde alguns segundos e tente novamente.',
              'rede'
            );
    }

    const repetivel =
      erro.tipo === 'limite' || (erro.tipo === 'rede' && metodo === 'GET');

    if (!repetivel || !podeRepetir) throw erro;

    const espera = Math.min(
      erro.retryAfterMs ?? ESPERAS_RETRY_MS[tentativa],
      ESPERA_MAXIMA_MS
    );

    await esperar(adicionarJitter(espera), options.signal);
  }
}

export function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const metodo = (options.method ?? 'GET').toUpperCase();

  // Com signal próprio, o cancelamento é do chamador: não compartilha.
  if (metodo !== 'GET' || options.signal) {
    return executar<T>(endpoint, options);
  }

  const chave = endpoint;
  const existente = getsEmAndamento.get(chave);
  if (existente) return existente as Promise<T>;

  const promessa = executar<T>(endpoint, options).finally(() => {
    getsEmAndamento.delete(chave);
  });

  getsEmAndamento.set(chave, promessa);
  return promessa;
}
