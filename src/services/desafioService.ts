import { apiRequest } from './api';
import {
  converterDesafio,
  type Desafio,
  type DesafioApi,
  type NovoDesafioPayload,
  type RespostaPaginada,
} from '../types/desafio';

export async function listarDesafios(): Promise<Desafio[]> {
  const resposta = await apiRequest<RespostaPaginada<DesafioApi> | DesafioApi[]>(
    '/desafios'
  );
  const lista = Array.isArray(resposta)
    ? resposta
    : resposta?.items;
  if (!Array.isArray(lista)) {
    throw new Error(
      'A API retornou uma lista de desafios em formato inválido.'
    );
  }
  return lista.map(converterDesafio);
}

export async function cadastrarDesafio(
  dados: NovoDesafioPayload
): Promise<void> {
  await apiRequest<unknown>('/desafios', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export async function excluirDesafio(id: string): Promise<void> {
  if (!id.trim()) {
    throw new Error('ID do desafio inválido.');
  }

  await apiRequest<unknown>(
    `/desafios/${encodeURIComponent(id)}`,
    { method: 'DELETE' }
  );
}