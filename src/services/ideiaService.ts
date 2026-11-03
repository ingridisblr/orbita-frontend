import { apiRequest } from './api';
import type {
  Ideia,
  IdeiaPayload,
  IdeiasPaginadas,
} from '../types/ideia';

// "Minhas Ideias": só as ideias de autoria do usuário logado
export async function listarMinhasIdeias(
  page = 1,
  pageSize = 10
): Promise<IdeiasPaginadas> {
  const params = new URLSearchParams({
    minhas:    'true',
    page:      String(page),
    page_size: String(pageSize),
  });

  return apiRequest<IdeiasPaginadas>(`/ideias?${params.toString()}`);
}

export async function obterIdeia(idIdeia: number): Promise<Ideia> {
  return apiRequest<Ideia>(`/ideias/${idIdeia}`);
}

export async function criarIdeia(payload: IdeiaPayload): Promise<Ideia> {
  return apiRequest<Ideia>('/ideias', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function atualizarIdeia(
  idIdeia: number,
  payload: Partial<IdeiaPayload>
): Promise<Ideia> {
  return apiRequest<Ideia>(`/ideias/${idIdeia}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

// Arquivar não apaga: a ideia fica com status "arquivada"
export async function arquivarIdeia(idIdeia: number): Promise<Ideia> {
  return apiRequest<Ideia>(`/ideias/${idIdeia}/arquivar`, {
    method: 'POST',
  });
}
