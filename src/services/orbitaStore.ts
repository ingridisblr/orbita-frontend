/*
 * Dados de DEMONSTRAÇÃO do ÓRBITA (desafios, ideias, matches, triagem, kanban e auditoria).
 * Ficam no localStorage, sem backend. Quando a API Flask estiver pronta, troque o corpo das
 * funções exportadas por chamadas ao `api` (src/services/api.ts); as telas não precisam mudar.
 * As regras de permissão aqui valem só para a demonstração: o backend precisa repetir todas.
 * A "IA" abaixo é uma simulação por similaridade de palavras, não um modelo de verdade.
 */
import type {
  AuditoriaItem,
  Desafio,
  Ideia,
  KanbanColuna,
  Match,
  OrbitaState,
  Prioridade,
} from '../types/orbita'
import type { User } from '../types/auth'
import { getCurrentUser } from './authService'

const KEY = 'orbita.data'

export class DataError extends Error {}

const uid = () => crypto.randomUUID()
const now = () => new Date().toISOString()

/* ---------- estado e persistência ---------- */

function seed(): OrbitaState {
  const d1: Desafio = {
    id: uid(),
    titulo: 'Reduzir o tempo de atendimento de chamados internos',
    descricao: 'Os chamados de suporte demoram para ser classificados e encaminhados ao time certo.',
    area: 'atendimento',
    prioridade: 'alta',
    status: 'aberto',
    autorId: 'seed',
    autorNome: 'Equipe de Inovação',
    criadoEm: now(),
  }
  const d2: Desafio = {
    id: uid(),
    titulo: 'Automatizar a conferência de relatórios financeiros mensais',
    descricao: 'A conferência manual das planilhas consome dias de trabalho e gera erros de digitação.',
    area: 'operacoes',
    prioridade: 'media',
    status: 'aberto',
    autorId: 'seed',
    autorNome: 'Equipe de Inovação',
    criadoEm: now(),
  }
  const i1: Ideia = {
    id: uid(),
    titulo: 'Chatbot para classificar chamados de suporte',
    descricao: 'Um assistente que lê o chamado, identifica o assunto e encaminha ao time responsável.',
    desafioId: null,
    autorId: 'seed',
    autorNome: 'Equipe de Inovação',
    status: 'enviada',
    criadoEm: now(),
  }
  const i2: Ideia = {
    id: uid(),
    titulo: 'Painel de conferência automática de planilhas',
    descricao: 'Compara os relatórios financeiros mensais e destaca as divergências para revisão.',
    desafioId: d2.id,
    autorId: 'seed',
    autorNome: 'Equipe de Inovação',
    status: 'enviada',
    criadoEm: now(),
  }
  return {
    desafios: [d1, d2],
    ideias: [i1, i2],
    matches: [{ id: uid(), ideiaId: i1.id, desafioId: d1.id, score: 64, status: 'pendente', origem: 'ia' }],
    projetos: [],
    auditoria: [],
  }
}

function load(): OrbitaState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as OrbitaState
  } catch {
    // dados corrompidos: recomeça com a demonstração
  }
  const initial = seed()
  localStorage.setItem(KEY, JSON.stringify(initial))
  return initial
}

let state: OrbitaState = load()
const listeners = new Set<() => void>()

export const getState = () => state

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function commit(next: OrbitaState) {
  state = next
  localStorage.setItem(KEY, JSON.stringify(next))
  listeners.forEach((listener) => listener())
}

/* ---------- permissões e auditoria ---------- */

function actor(): User {
  const user = getCurrentUser()
  if (!user) throw new DataError('Faça login para continuar.')
  return user
}

function adminActor(): User {
  const user = actor()
  if (user.role !== 'admin') throw new DataError('Somente o administrador pode fazer isso.')
  return user
}

function withLog(s: OrbitaState, user: User, acao: string, detalhe: string): AuditoriaItem[] {
  return [{ id: uid(), em: now(), usuario: user.name, acao, detalhe }, ...s.auditoria].slice(0, 300)
}

/* ---------- "IA" simulada: similaridade de palavras ---------- */

const STOPWORDS = new Set(['para', 'como', 'mais', 'muito', 'sobre', 'porque', 'esse', 'essa', 'isso', 'onde', 'quando', 'cada', 'pelo', 'pela', 'seus', 'suas', 'uma', 'com'])

function tokens(text: string): Set<string> {
  const words = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w))
  // Usa só o começo da palavra para "relatório" casar com "relatórios".
  return new Set(words.map((w) => w.slice(0, 5)))
}

export function similarity(a: string, b: string): number {
  const ta = tokens(a)
  const tb = tokens(b)
  if (ta.size === 0 || tb.size === 0) return 0
  let common = 0
  ta.forEach((w) => {
    if (tb.has(w)) common += 1
  })
  return Math.min(95, Math.round((100 * common) / Math.min(ta.size, tb.size)))
}

/* ---------- Desafios (US01) ---------- */

interface DesafioInput {
  titulo: string
  descricao: string
  area: string
  prioridade: Prioridade
}

function checkDesafio(input: DesafioInput) {
  if (input.titulo.trim().length < 5) throw new DataError('O título do desafio precisa ter pelo menos 5 caracteres.')
  if (input.descricao.trim().length < 10) throw new DataError('Descreva o desafio com pelo menos 10 caracteres.')
  if (!input.area) throw new DataError('Escolha a área do desafio.')
}

function canManage(user: User, autorId: string) {
  return user.role === 'admin' || user.id === autorId
}

export function createDesafio(input: DesafioInput) {
  const user = actor()
  checkDesafio(input)
  const desafio: Desafio = {
    id: uid(),
    titulo: input.titulo.trim(),
    descricao: input.descricao.trim(),
    area: input.area,
    prioridade: input.prioridade,
    status: 'aberto',
    autorId: user.id,
    autorNome: user.name,
    criadoEm: now(),
  }
  commit({ ...state, desafios: [desafio, ...state.desafios], auditoria: withLog(state, user, 'Desafio criado', desafio.titulo) })
}

export function updateDesafio(id: string, input: DesafioInput) {
  const user = actor()
  const target = state.desafios.find((d) => d.id === id)
  if (!target) throw new DataError('Desafio não encontrado.')
  if (!canManage(user, target.autorId)) throw new DataError('Você só pode editar os desafios que cadastrou.')
  checkDesafio(input)
  const desafios = state.desafios.map((d) =>
    d.id === id ? { ...d, titulo: input.titulo.trim(), descricao: input.descricao.trim(), area: input.area, prioridade: input.prioridade } : d,
  )
  commit({ ...state, desafios, auditoria: withLog(state, user, 'Desafio editado', input.titulo.trim()) })
}

export function setDesafioStatus(id: string, status: 'aberto' | 'encerrado') {
  const user = actor()
  const target = state.desafios.find((d) => d.id === id)
  if (!target) throw new DataError('Desafio não encontrado.')
  if (!canManage(user, target.autorId)) throw new DataError('Você só pode alterar os desafios que cadastrou.')
  const desafios = state.desafios.map((d) => (d.id === id ? { ...d, status } : d))
  commit({
    ...state,
    desafios,
    auditoria: withLog(state, user, status === 'aberto' ? 'Desafio reaberto' : 'Desafio encerrado', target.titulo),
  })
}

export function deleteDesafio(id: string) {
  const user = actor()
  const target = state.desafios.find((d) => d.id === id)
  if (!target) throw new DataError('Desafio não encontrado.')
  if (!canManage(user, target.autorId)) throw new DataError('Você só pode excluir os desafios que cadastrou.')
  if (state.ideias.some((i) => i.desafioId === id)) {
    throw new DataError('Este desafio já tem ideias vinculadas. Encerre o desafio em vez de excluí-lo.')
  }
  commit({
    ...state,
    desafios: state.desafios.filter((d) => d.id !== id),
    matches: state.matches.filter((m) => m.desafioId !== id),
    auditoria: withLog(state, user, 'Desafio excluído', target.titulo),
  })
}

/* ---------- Ideias (US02) ---------- */

interface IdeiaInput {
  titulo: string
  descricao: string
  desafioId: string | null
}

export function createIdeia(input: IdeiaInput) {
  const user = actor()
  if (input.titulo.trim().length < 5) throw new DataError('O título da ideia precisa ter pelo menos 5 caracteres.')
  if (input.descricao.trim().length < 20) throw new DataError('Explique a ideia com pelo menos 20 caracteres.')
  if (input.desafioId) {
    const desafio = state.desafios.find((d) => d.id === input.desafioId)
    if (!desafio) throw new DataError('Desafio não encontrado.')
    if (desafio.status !== 'aberto') throw new DataError('Este desafio está encerrado e não recebe novas ideias.')
  }
  const ideia: Ideia = {
    id: uid(),
    titulo: input.titulo.trim(),
    descricao: input.descricao.trim(),
    desafioId: input.desafioId,
    autorId: user.id,
    autorNome: user.name,
    status: 'enviada',
    criadoEm: now(),
  }
  // Sugestões de compatibilidade (simuladas). Entram como PENDENTE: quem decide é o analista.
  const texto = `${ideia.titulo} ${ideia.descricao}`
  const sugestoes: Match[] = state.desafios
    .filter((d) => d.status === 'aberto' && d.id !== input.desafioId)
    .map((d) => ({ d, score: similarity(texto, `${d.titulo} ${d.descricao}`) }))
    .filter((x) => x.score >= 15)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((x) => ({ id: uid(), ideiaId: ideia.id, desafioId: x.d.id, score: x.score, status: 'pendente' as const, origem: 'ia' as const }))
  commit({
    ...state,
    ideias: [ideia, ...state.ideias],
    matches: [...sugestoes, ...state.matches],
    auditoria: withLog(state, user, 'Ideia enviada', ideia.titulo),
  })
}

export function deleteIdeia(id: string) {
  const user = actor()
  const target = state.ideias.find((i) => i.id === id)
  if (!target) throw new DataError('Ideia não encontrada.')
  const own = target.autorId === user.id && target.status === 'enviada'
  if (!own && user.role !== 'admin') {
    throw new DataError('Você só pode retirar as suas ideias que ainda aguardam triagem.')
  }
  commit({
    ...state,
    ideias: state.ideias.filter((i) => i.id !== id),
    matches: state.matches.filter((m) => m.ideiaId !== id),
    projetos: state.projetos.filter((p) => p.ideiaId !== id),
    auditoria: withLog(state, user, 'Ideia retirada', target.titulo),
  })
}

/* ---------- Matches da IA (US03 / US07) ---------- */

export function decideMatch(id: string, decisao: 'confirmado' | 'descartado') {
  const user = adminActor()
  const match = state.matches.find((m) => m.id === id)
  if (!match) throw new DataError('Sugestão não encontrada.')
  if (match.status !== 'pendente') throw new DataError('Esta sugestão já foi decidida.')
  const ideia = state.ideias.find((i) => i.id === match.ideiaId)
  const desafio = state.desafios.find((d) => d.id === match.desafioId)
  const matches = state.matches.map((m) =>
    m.id === id ? { ...m, status: decisao, decididoPor: user.name, decididoEm: now() } : m,
  )
  const ideias =
    decisao === 'confirmado'
      ? state.ideias.map((i) => (i.id === match.ideiaId ? { ...i, desafioId: match.desafioId } : i))
      : state.ideias
  commit({
    ...state,
    matches,
    ideias,
    auditoria: withLog(
      state,
      user,
      decisao === 'confirmado' ? 'Match confirmado' : 'Match descartado',
      `${ideia?.titulo ?? '?'} ↔ ${desafio?.titulo ?? '?'}`,
    ),
  })
}

/** Vínculo manual: usado quando a IA está indisponível ou o analista discorda dela. */
export function createManualMatch(ideiaId: string, desafioId: string) {
  const user = adminActor()
  const ideia = state.ideias.find((i) => i.id === ideiaId)
  const desafio = state.desafios.find((d) => d.id === desafioId)
  if (!ideia || !desafio) throw new DataError('Escolha uma ideia e um desafio.')
  if (ideia.desafioId === desafioId) throw new DataError('Esta ideia já está vinculada a este desafio.')
  const match: Match = {
    id: uid(),
    ideiaId,
    desafioId,
    score: similarity(`${ideia.titulo} ${ideia.descricao}`, `${desafio.titulo} ${desafio.descricao}`),
    status: 'confirmado',
    origem: 'manual',
    decididoPor: user.name,
    decididoEm: now(),
  }
  commit({
    ...state,
    matches: [match, ...state.matches],
    ideias: state.ideias.map((i) => (i.id === ideiaId ? { ...i, desafioId } : i)),
    auditoria: withLog(state, user, 'Vínculo manual', `${ideia.titulo} ↔ ${desafio.titulo}`),
  })
}

/* ---------- Triagem multicritério (US04) ---------- */

export interface TriagemInput {
  impacto: number
  viabilidade: number
  custo: number
  alinhamento: number
  parecer: string
  decisao: 'aprovada' | 'rejeitada'
}

export function triarIdeia(ideiaId: string, input: TriagemInput) {
  const user = adminActor()
  const ideia = state.ideias.find((i) => i.id === ideiaId)
  if (!ideia) throw new DataError('Ideia não encontrada.')
  if (ideia.status !== 'enviada') throw new DataError('Esta ideia já passou pela triagem.')
  const notas = [input.impacto, input.viabilidade, input.custo, input.alinhamento]
  if (notas.some((n) => !Number.isInteger(n) || n < 1 || n > 5)) {
    throw new DataError('Todas as notas devem ser números de 1 a 5.')
  }
  if (input.decisao === 'rejeitada' && input.parecer.trim().length < 5) {
    throw new DataError('Para rejeitar, escreva um parecer explicando o motivo.')
  }
  const notaFinal = Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 10) / 10
  const ideias = state.ideias.map((i) =>
    i.id === ideiaId
      ? {
          ...i,
          status: input.decisao,
          triagem: { ...input, parecer: input.parecer.trim(), notaFinal, analistaNome: user.name, em: now() },
        }
      : i,
  )
  const projetos =
    input.decisao === 'aprovada' && !state.projetos.some((p) => p.ideiaId === ideiaId)
      ? [{ id: uid(), ideiaId, titulo: ideia.titulo, coluna: 'backlog' as KanbanColuna, criadoEm: now() }, ...state.projetos]
      : state.projetos
  commit({
    ...state,
    ideias,
    projetos,
    auditoria: withLog(
      state,
      user,
      input.decisao === 'aprovada' ? 'Ideia aprovada' : 'Ideia rejeitada',
      `${ideia.titulo} (nota ${notaFinal})`,
    ),
  })
}

/* ---------- Kanban (US05) ---------- */

export function moveProjeto(id: string, coluna: KanbanColuna) {
  const user = adminActor()
  const projeto = state.projetos.find((p) => p.id === id)
  if (!projeto) throw new DataError('Projeto não encontrado.')
  commit({
    ...state,
    projetos: state.projetos.map((p) => (p.id === id ? { ...p, coluna } : p)),
    auditoria: withLog(state, user, 'Projeto movido', `${projeto.titulo} → ${coluna}`),
  })
}
