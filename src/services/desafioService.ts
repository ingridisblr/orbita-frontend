import { apiRequest } from './api';
import {
  converterDesafio,
  type Desafio,
  type DesafioApi,
  type NovoDesafioPayload,
} from '../types/desafio';

export async function listarDesafios(): Promise<Desafio[]> {
  const resposta = await apiRequest<DesafioApi[]>(
    '/desafio/listar_todos'
  );

  if (!Array.isArray(resposta)) {
    throw new Error(
      'A API retornou uma lista de desafios em formato inválido.'
    );
  }

  return resposta.map(converterDesafio);
}

export async function cadastrarDesafio(
  dados: NovoDesafioPayload
): Promise<void> {
  await apiRequest<unknown>('/desafio/add', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export async function excluirDesafio(id: string): Promise<void> {
  if (!id.trim()) {
    throw new Error('ID do desafio inválido.');
  }

  await apiRequest<unknown>(
    `/desafio/delete/${encodeURIComponent(id)}`,
    { method: 'DELETE' }
  );
}