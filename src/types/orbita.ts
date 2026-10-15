export type Prioridade = 'baixa' | 'media' | 'alta'
export type DesafioStatus = 'aberto' | 'encerrado'
export type IdeiaStatus = 'enviada' | 'aprovada' | 'rejeitada'
export type MatchStatus = 'pendente' | 'confirmado' | 'descartado'
export type KanbanColuna = 'backlog' | 'em_andamento' | 'mvp' | 'concluido'

export interface Desafio {
  id: string
  titulo: string
  descricao: string
  area: string
  prioridade: Prioridade
  status: DesafioStatus
  autorId: string
  autorNome: string
  criadoEm: string
}

export interface Triagem {
  impacto: number
  viabilidade: number
  custo: number
  alinhamento: number
  notaFinal: number
  parecer: string
  decisao: 'aprovada' | 'rejeitada'
  analistaNome: string
  em: string
}

export interface Ideia {
  id: string
  titulo: string
  descricao: string
  desafioId: string | null
  autorId: string
  autorNome: string
  status: IdeiaStatus
  criadoEm: string
  triagem?: Triagem
}

export interface Match {
  id: string
  ideiaId: string
  desafioId: string
  /** Compatibilidade de 0 a 100. */
  score: number
  status: MatchStatus
  origem: 'ia' | 'manual'
  decididoPor?: string
  decididoEm?: string
}

export interface Projeto {
  id: string
  ideiaId: string
  titulo: string
  coluna: KanbanColuna
  criadoEm: string
}

export interface AuditoriaItem {
  id: string
  em: string
  usuario: string
  acao: string
  detalhe: string
}

export interface OrbitaState {
  desafios: Desafio[]
  ideias: Ideia[]
  matches: Match[]
  projetos: Projeto[]
  auditoria: AuditoriaItem[]
}

export const AREAS = [
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'operacoes', label: 'Operações' },
  { value: 'negocios', label: 'Negócios' },
  { value: 'atendimento', label: 'Atendimento' },
  { value: 'juridico', label: 'Jurídico e Compliance' },
]

export const PRIORIDADES = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
]

export const PRIORIDADE_TONE: Record<Prioridade, 'neutral' | 'warning' | 'danger'> = {
  baixa: 'neutral',
  media: 'warning',
  alta: 'danger',
}

export const IDEIA_STATUS_LABEL: Record<IdeiaStatus, string> = {
  enviada: 'Aguardando triagem',
  aprovada: 'Aprovada',
  rejeitada: 'Rejeitada',
}

export const IDEIA_STATUS_TONE: Record<IdeiaStatus, 'info' | 'success' | 'danger'> = {
  enviada: 'info',
  aprovada: 'success',
  rejeitada: 'danger',
}

export const KANBAN_COLUNAS: { id: KanbanColuna; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'em_andamento', label: 'Em andamento' },
  { id: 'mvp', label: 'MVP' },
  { id: 'concluido', label: 'Concluído' },
]

export const areaLabel = (value: string) => AREAS.find((a) => a.value === value)?.label ?? value
