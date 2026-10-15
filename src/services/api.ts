import axios from 'axios'

/** URL base da API, lida do .env (VITE_API_URL). Nunca fixar a URL no código. */
export const API_URL = import.meta.env.VITE_API_URL

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

/** Traduz um erro do Axios para uma mensagem que o usuário entende. */
export function describeApiError(error: unknown): string {
  if (!API_URL) {
    return 'A variável VITE_API_URL não está definida. Copie .env.example para .env e reinicie o servidor.'
  }
  if (axios.isAxiosError(error)) {
    if (error.response) {
      return `A API respondeu com erro ${error.response.status}.`
    }
    if (error.code === 'ECONNABORTED') {
      return 'A API demorou mais de 10 segundos para responder.'
    }
    return `Não foi possível falar com a API em ${API_URL}. Verifique se o backend está ligado, se a URL está certa e se o CORS está liberado.`
  }
  return 'Erro inesperado ao chamar a API.'
}
