import { ApiError } from '../services/api';

function normalizarStatus(status: string): string {
  return status.trim().toLowerCase().replace(/[-\s]+/g, '_');
}

const rotulosStatusIdeia: Record<string, string> = {
  submetida:    'Submetida',
  rascunho:     'Rascunho',
  nova:         'Nova',
  em_avaliacao: 'Em Avaliação',
  em_avaliação: 'Em Avaliação',
  aprovada:     'Aprovada',
  arquivada:    'Arquivada',
};

export function rotuloStatusIdeia(status: string): string {
  return rotulosStatusIdeia[normalizarStatus(status)] ?? status;
}

// Classe CSS do selo de status (ex.: "em_avaliacao" -> "status-em-avaliacao")
export function classeStatusIdeia(status: string): string {
  return `status-${normalizarStatus(status).replace(/_/g, '-')}`;
}

export function formatarData(iso: string | null): string {
  if (!iso) return '—';

  const data = new Date(iso);

  return Number.isNaN(data.getTime())
    ? '—'
    : data.toLocaleDateString('pt-BR');
}

const rotulosCampos: Record<string, string> = {
  email:              'E-mail',
  descricao_problema: 'Descrição',
  area_demandante:    'Área responsável',
  quem_afeta:         'Pessoas/setores afetados',
  impacto:            'Impacto',
  urgencia:           'Urgência',
  status:             'Status',
  id_desafio:         'Desafio',
  titulo:             'Título',
  descricao:          'Descrição',
  area:               'Área de origem',
  categoria:          'Categoria',
  problema_resolvido: 'Problema resolvido',
  beneficio_esperado: 'Benefício esperado',
};

// Texto de erro para exibir na tela, com a mensagem devolvida pelo backend
export function descreverErro(erro: unknown): string {
  if (erro instanceof ApiError) {
    if (erro.campos) {
      const detalhes = Object.entries(erro.campos).flatMap(
        ([campo, mensagens]) =>
          mensagens.map((mensagem) =>
            campo in rotulosCampos
              ? `${rotulosCampos[campo]}: ${mensagem}`
              : mensagem
          )
      );

      if (detalhes.length > 0) {
        return `${erro.message} ${detalhes.join(' ')}`;
      }
    }

    return erro.message;
  }

  if (erro instanceof TypeError) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
  }

  return 'Ocorreu um erro inesperado.';
}

// #region Desafios
// Código exibido na tela, ex.: DSF-007
export function codigoDesafio(id: number): string {
  return `DSF-${String(id).padStart(3, '0')}`;
}

// "em_analise" -> "Em analise"
export function rotuloStatusDesafio(status: string): string {
  const texto = status.trim().replace(/_/g, ' ');
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

export function classeStatusDesafio(status: string): string {
  return status.trim().toLowerCase() === 'aberto' ? 'aberto' : '';
}

// Alto/Alta usa o destaque forte; os demais níveis, o neutro
export function classeNivel(valor: string | null): string {
  const nivel = (valor ?? '').trim().toLowerCase();
  return nivel === 'alto' || nivel === 'alta'
    ? 'tag-impacto-alto'
    : 'tag-impacto-medio';
}
// #endregion
