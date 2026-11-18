// Funções de apoio da tela de Match (arquivo próprio: o formatters.ts da
// develop está vazio e pode ser preenchido por outra pessoa do grupo).

function normalizar(status: string): string {
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
  return rotulosStatusIdeia[normalizar(status)] ?? status;
}

export function formatarData(iso: string | null): string {
  if (!iso) return '—';

  const data = new Date(iso);

  return Number.isNaN(data.getTime())
    ? '—'
    : data.toLocaleDateString('pt-BR');
}

// Código exibido na tela, ex.: DSF-007
export function codigoDesafio(id: number | string): string {
  const numero = Number(id);

  return Number.isNaN(numero)
    ? String(id)
    : `DSF-${String(numero).padStart(3, '0')}`;
}

// "em_analise" -> "Em analise"
export function rotuloStatusDesafio(status: string): string {
  const texto = status.trim().replace(/_/g, ' ');
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// "manual" -> "Manual"; "ia" -> "IA"
export function rotuloOrigemMatch(origem: string): string {
  const valor = origem.trim().toLowerCase();
  return valor === 'ia' ? 'IA' : valor.charAt(0).toUpperCase() + valor.slice(1);
}

// "VALIDADO" -> "Validado"
export function rotuloStatusMatch(status: string): string {
  const texto = status.trim().replace(/_/g, ' ');
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

export function classeStatusMatch(status: string): string {
  return `status-match-${status.trim().toLowerCase().replace(/_/g, '-')}`;
}

// Texto de erro para exibir na tela
export function descreverErro(erro: unknown): string {
  if (erro instanceof TypeError) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
  }

  if (erro instanceof Error && erro.message) {
    return erro.message;
  }

  return 'Ocorreu um erro inesperado.';
}
