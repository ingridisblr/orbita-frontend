import { useMemo, useState } from 'react';
import './Auditoria.css';

export interface RegistroAuditoria {
  id: string;
  dataHora: string;
  usuario: string;
  modulo: string;
  acao: string;
  descricao: string;
}

export interface AuditoriaProps {
  registros?: readonly RegistroAuditoria[];
  carregando?: boolean;
  erro?: string;
}

const tamanhoPagina = 7;

function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function classeAcao(acao: string) {
  switch (normalizar(acao)) {
    case 'aprovar':
      return 'aprovacao';
    case 'criar':
    case 'devolver':
      return 'destaque';
    case 'sugestao':
      return 'sugestao';
    default:
      return 'neutro';
  }
}

function escaparCsv(valor: string) {
  // Evita que dados textuais sejam interpretados como fórmulas em planilhas.
  const texto =
    /^[\s\uFEFF]*[=+@-]/.test(valor) || /^[\t\r\n]/.test(valor)
      ? "'" + valor
      : valor;

  return '"' + texto.replace(/"/g, '""') + '"';
}

function exportarCsv(registros: readonly RegistroAuditoria[]) {
  const cabecalho = ['Data/Hora', 'Usuário', 'Módulo', 'Ação', 'Descrição'];
  const linhas = registros.map(
    ({ dataHora, usuario, modulo, acao, descricao }) => [
      dataHora,
      usuario,
      modulo,
      acao,
      descricao,
    ],
  );

  const conteudo = [cabecalho, ...linhas]
    .map((linha) => linha.map(escaparCsv).join(';'))
    .join('\r\n');

  const arquivo = new Blob(['\uFEFF', conteudo], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'orbita-auditoria.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Auditoria({
  registros,
  carregando = false,
  erro = '',
}: AuditoriaProps) {
  const [busca, setBusca] = useState('');
  const [moduloSelecionado, setModuloSelecionado] = useState('');
  const [pagina, setPagina] = useState(1);

  const modulos = useMemo(() => {
    const valores = new Map<string, string>();

    for (const registro of registros ?? []) {
      const chave = normalizar(registro.modulo);

      if (chave && !valores.has(chave)) {
        valores.set(chave, registro.modulo);
      }
    }

    return [...valores.entries()].sort((a, b) =>
      a[1].localeCompare(b[1], 'pt-BR'),
    );
  }, [registros]);

  const filtrados = useMemo(() => {
    const termo = normalizar(busca);

    return (registros ?? []).filter((registro) => {
      const modulo = normalizar(registro.modulo);
      const correspondeModulo =
        !moduloSelecionado || modulo === moduloSelecionado;
      const correspondeBusca =
        !termo ||
        [registro.usuario, registro.modulo, registro.acao].some((valor) =>
          normalizar(valor).includes(termo),
        );

      return correspondeModulo && correspondeBusca;
    });
  }, [registros, busca, moduloSelecionado]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / tamanhoPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * tamanhoPagina;
  const registrosVisiveis = filtrados.slice(inicio, inicio + tamanhoPagina);
  const bloqueado = carregando || Boolean(erro);
  const limite = Math.min(inicio + tamanhoPagina, filtrados.length);
  const temFiltros = Boolean(busca.trim() || moduloSelecionado);

  function limparFiltros() {
    setBusca('');
    setModuloSelecionado('');
    setPagina(1);
  }

  return (
    <div className="auditoria-page" aria-busy={carregando}>
      <header className="auditoria-page__header">
        <div>
          <h1>Auditoria</h1>
          <p>Histórico completo de ações no sistema.</p>
        </div>

        <button
          type="button"
          className="auditoria-page__btn auditoria-page__btn--exportar"
          disabled={bloqueado || !filtrados.length}
          onClick={() => exportarCsv(filtrados)}
        >
          Exportar CSV
        </button>
      </header>

      {carregando && (
        <p className="auditoria-page__estado" role="status">
          Carregando histórico...
        </p>
      )}
      {erro && (
        <p className="auditoria-page__estado auditoria-page__erro" role="alert">
          {erro}
        </p>
      )}

      <div className="auditoria-page__filtros">
        <label className="auditoria-page__busca">
          <span className="auditoria-page__sr-only">
            Buscar por usuário, módulo ou ação
          </span>
          <input
            type="search"
            placeholder="Buscar por usuário, módulo ou ação..."
            value={busca}
            onChange={(event) => {
              setBusca(event.target.value);
              setPagina(1);
            }}
            disabled={bloqueado}
          />
        </label>

        <label className="auditoria-page__filtro-modulo">
          <span className="auditoria-page__sr-only">Filtrar por módulo</span>
          <select
            value={moduloSelecionado}
            disabled={bloqueado}
            onChange={(event) => {
              setModuloSelecionado(event.target.value);
              setPagina(1);
            }}
          >
            <option value="">Todos os módulos</option>
            {modulos.map(([chave, titulo]) => (
              <option key={chave} value={chave}>
                {titulo}
              </option>
            ))}
          </select>
        </label>

        {temFiltros && (
          <button
            className="auditoria-page__btn"
            type="button"
            onClick={limparFiltros}
            disabled={bloqueado}
          >
            Limpar filtros
          </button>
        )}
      </div>

      <section
        className="auditoria-page__card"
        aria-label="Histórico de auditoria"
      >
        <div className="auditoria-page__tabela-container">
          <table className="auditoria-page__tabela">
            <thead>
              <tr>
                <th scope="col">Data/Hora</th>
                <th scope="col">Usuário</th>
                <th scope="col">Módulo</th>
                <th scope="col">Ação</th>
                <th scope="col">Descrição</th>
              </tr>
            </thead>
            <tbody>
              {registrosVisiveis.map((registro) => (
                <tr key={registro.id}>
                  <td className="auditoria-page__codigo">
                    {registro.dataHora || '—'}
                  </td>
                  <td className="auditoria-page__usuario">
                    {registro.usuario || '—'}
                  </td>
                  <td>
                    <span className="auditoria-page__modulo">
                      {registro.modulo || '—'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`auditoria-page__acao auditoria-page__acao--${classeAcao(registro.acao)}`}
                    >
                      {registro.acao || '—'}
                    </span>
                  </td>
                  <td className="auditoria-page__descricao">
                    {registro.descricao || '—'}
                  </td>
                </tr>
              ))}

              {!registrosVisiveis.length && (
                <tr>
                  <td colSpan={5} className="auditoria-page__vazio">
                    {carregando
                      ? 'Carregando registros...'
                      : erro
                        ? 'Não foi possível exibir o histórico.'
                        : registros === undefined
                          ? 'Os registros serão exibidos quando o serviço de auditoria estiver disponível.'
                          : temFiltros
                            ? 'Nenhum registro encontrado para os filtros selecionados.'
                            : 'Nenhum registro de auditoria disponível.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="auditoria-page__rodape">
        <p aria-live="polite">
          {registros === undefined
            ? 'Quantidade de registros indisponível'
            : `${filtrados.length.toLocaleString('pt-BR')} ${filtrados.length === 1 ? 'registro' : 'registros'} · Exibindo ${filtrados.length ? inicio + 1 : 0}–${limite}`}
        </p>

        <nav
          className="auditoria-page__paginacao"
          aria-label="Paginação da auditoria"
        >
          <button
            type="button"
            className="auditoria-page__btn"
            disabled={bloqueado || paginaAtual === 1}
            onClick={() => setPagina(paginaAtual - 1)}
          >
            <span aria-hidden="true">←</span> Anterior
          </button>
          <span aria-live="polite">
            {paginaAtual} / {totalPaginas}
          </span>
          <button
            type="button"
            className="auditoria-page__btn"
            disabled={bloqueado || paginaAtual >= totalPaginas}
            onClick={() => setPagina(paginaAtual + 1)}
          >
            Próximo <span aria-hidden="true">→</span>
          </button>
        </nav>
      </footer>
    </div>
  );
}
