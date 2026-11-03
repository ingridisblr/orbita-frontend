import { apiRequest } from './api';
import type { Desafio, DesafioPayload } from '../types/desafio';

// GET /desafio/listar_todos
export async function listarDesafios(): Promise<Desafio[]> {
  return apiRequest<Desafio[]>('/desafio/listar_todos');
}

// Só os desafios do gestor (GET /desafio/listar_todos?id_responsavel=<id>)
export async function listarMeusDesafios(
  idResponsavel: number
): Promise<Desafio[]> {
  return apiRequest<Desafio[]>(
    `/desafio/listar_todos?id_responsavel=${idResponsavel}`
  );
}

// POST /desafio/add (o gestor responsável é identificado pelo e-mail)
export async function criarDesafio(
  email: string,
  payload: DesafioPayload
): Promise<Desafio> {
  return apiRequest<Desafio>('/desafio/add', {
    method: 'POST',
    body: JSON.stringify({ ...payload, email }),
  });
}

// PATCH /desafio/update/<id>
export async function atualizarDesafio(
  idDesafio: number,
  payload: Partial<DesafioPayload>
): Promise<Desafio> {
  return apiRequest<Desafio>(`/desafio/update/${idDesafio}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

// DELETE /desafio/delete/<id> (resposta 204, sem corpo)
export async function excluirDesafio(idDesafio: number): Promise<void> {
  await apiRequest<null>(`/desafio/delete/${idDesafio}`, { method: 'DELETE' });
}

// Desafios que aceitam ideias (status "aberto", sem diferenciar maiúsculas).
export function desafioEstaAberto(desafio: Desafio): boolean {
  return desafio.status.trim().toLowerCase() === 'aberto';
}
