import type { User } from '../types/auth';
import type { Desafio } from '../types/desafio';
import type { Ideia } from '../types/ideia';

// Mesmas regras do backend (ideia_service): o servidor continua sendo
// a autoridade; aqui só decidimos o que mostrar na tela.
const STATUS_EDITAVEIS = ['submetida', 'rascunho', 'nova'];

function normalizarStatus(status: string): string {
  return status.trim().toLowerCase().replace(/-/g, '_');
}

function ehAutor(ideia: Ideia, user: User): boolean {
  return ideia.id_autor === Number(user.id);
}

// Autor ou analista edita, e só enquanto a ideia está em status editável
export function podeEditarIdeia(ideia: Ideia, user: User): boolean {
  if (!ehAutor(ideia, user) && user.role !== 'analista') return false;

  return STATUS_EDITAVEIS.includes(normalizarStatus(ideia.status));
}

// Colaborador (autor) só arquiva em status editável; gestor e analista,
// em qualquer status, desde que ainda não esteja arquivada
export function podeArquivarIdeia(ideia: Ideia, user: User): boolean {
  const status = normalizarStatus(ideia.status);

  if (status === 'arquivada') return false;

  if (user.role === 'colaborador') {
    return ehAutor(ideia, user) && STATUS_EDITAVEIS.includes(status);
  }

  return true;
}

// #region Desafios
function ehResponsavel(user: User, desafio: Desafio): boolean {
  return user.role === 'gestor' && Number(user.id) === desafio.id_responsavel;
}

// Gestor ou analista cadastra (o backend também confere)
export function podeCadastrarDesafio(user: User): boolean {
  return user.role === 'gestor' || user.role === 'analista';
}

// Gestor responsável ou analista edita
export function podeEditarDesafio(user: User, desafio: Desafio): boolean {
  return user.role === 'analista' || ehResponsavel(user, desafio);
}

// Gestor responsável ou analista exclui (o backend recusa se houver ideias)
export function podeExcluirDesafio(user: User, desafio: Desafio): boolean {
  return user.role === 'analista' || ehResponsavel(user, desafio);
}
// #endregion
