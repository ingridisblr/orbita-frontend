import { useEffect, useRef, useState, type FormEvent } from 'react';
import './ProjetosKanban.css';

const colunas = [
  { id: 'aprovado', titulo: 'Aprovado' },
  { id: 'planejamento', titulo: 'Planejamento' },
  { id: 'desenvolvimento', titulo: 'Em Desenvolvimento' },
  { id: 'teste', titulo: 'Em Teste' },
  { id: 'concluido', titulo: 'Concluído' },
] as const;

export type StatusProjetoKanban = (typeof colunas)[number]['id'];

export interface ProjetoKanban {
  id: string;
  codigo: string;
  titulo: string;
  area?: string;
  status: StatusProjetoKanban;
}

export interface NovoProjetoKanban {
  titulo: string;
  area: string;
  status: StatusProjetoKanban;
}

export interface ProjetosKanbanProps {
  projetos?: readonly ProjetoKanban[];
  carregando?: boolean;
  erro?: string;
  onCriarProjeto?: (projeto: NovoProjetoKanban) => Promise<void> | void;
  onMoverProjeto?: (id: string, status: StatusProjetoKanban) => Promise<void> | void;
}

export function ProjetosKanban({
  projetos,
  carregando = false,
  erro = '',
  onCriarProjeto,
  onMoverProjeto,
}: ProjetosKanbanProps) {
  const [formulario, setFormulario] = useState<NovoProjetoKanban | null>(null);
  const [processando, setProcessando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erroAcao, setErroAcao] = useState('');
  const bloqueado = carregando || Boolean(erro) || processando;
  const modalRef = useRef<HTMLDialogElement>(null);
  const formularioAberto = formulario !== null;

  useEffect(() => {
    const modal = modalRef.current;

    if (!modal || !formularioAberto) return;

    modal.showModal();
    modal.querySelector('input')?.focus();

    return () => {
      modal.close();
    };
  }, [formularioAberto]);

  function abrirFormulario(status: StatusProjetoKanban = 'aprovado') {
    setFormulario({ titulo: '', area: '', status });
    setMensagem('');
    setErroAcao('');
  }

  function fecharFormulario() {
    if (processando) return;
    setFormulario(null);
    setErroAcao('');
  }

  async function criarProjeto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formulario || !onCriarProjeto || bloqueado) return;

    const titulo = formulario.titulo.trim();

    if (!titulo) {
      setErroAcao('Informe o título do projeto.');
      return;
    }

    setProcessando(true);
    setErroAcao('');
    setMensagem('');

    try {
      await onCriarProjeto({
        ...formulario,
        titulo,
        area: formulario.area.trim(),
      });
      setFormulario(null);
      setMensagem('Projeto cadastrado com sucesso.');
    } catch (error: unknown) {
      setErroAcao(error instanceof Error ? error.message : 'Não foi possível cadastrar o projeto.');
    } finally {
      setProcessando(false);
    }
  }

  async function moverProjeto(projeto: ProjetoKanban, status: StatusProjetoKanban) {
    if (!onMoverProjeto || bloqueado || projeto.status === status) return;

    setProcessando(true);
    setErroAcao('');
    setMensagem('');

    try {
      await onMoverProjeto(projeto.id, status);
      setMensagem('Status do projeto atualizado.');
    } catch (error: unknown) {
      setErroAcao(error instanceof Error ? error.message : 'Não foi possível atualizar o projeto.');
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="kanban-page" aria-busy={carregando || processando}>
      <header className="kanban-page__header">
        <div>
          <h1>Projetos / Kanban</h1>
          <p>Acompanhamento do portfólio de projetos de inovação.</p>
        </div>

        <button
          type="button"
          className="kanban-page__btn kanban-page__btn--primario"
          onClick={() => abrirFormulario()}
          disabled={bloqueado}
        >
          <span aria-hidden="true">+</span> Novo Projeto
        </button>
      </header>

      {carregando && <p className="kanban-page__estado" role="status">Carregando projetos...</p>}
      {erro && <p className="kanban-page__estado kanban-page__erro" role="alert">{erro}</p>}
      {!carregando && !erro && projetos === undefined && (
        <p className="kanban-page__estado">Dados dos projetos indisponíveis.</p>
      )}
      {mensagem && <p className="kanban-page__estado kanban-page__sucesso" role="status">{mensagem}</p>}
      {!formulario && erroAcao && <p className="kanban-page__estado kanban-page__erro" role="alert">{erroAcao}</p>}

      <dialog
        ref={modalRef}
        className="kanban-page__modal"
        aria-labelledby="kanban-form-title"
        aria-describedby="kanban-form-description"
        onCancel={(event) => {
          event.preventDefault();
          fecharFormulario();
        }}
      >
        {formulario && (
          <section className="kanban-page__form-card">
            <header className="kanban-page__modal-header">
              <div>
                <h2 id="kanban-form-title">Novo Projeto</h2>
                <p id="kanban-form-description">Preencha as informações para adicionar um projeto ao Kanban.</p>
              </div>
              <button
                type="button"
                className="kanban-page__modal-close"
                aria-label="Fechar formulário"
                onClick={fecharFormulario}
                disabled={processando}
              >
                ×
              </button>
            </header>
            {!onCriarProjeto && (
              <p className="kanban-page__estado" role="status">
                O serviço de cadastro de projetos ainda não está conectado.
              </p>
            )}
            {erroAcao && (
              <p className="kanban-page__estado kanban-page__erro" role="alert">{erroAcao}</p>
            )}
            <form onSubmit={criarProjeto}>
              <div className="kanban-page__form-fields">
                <label className="kanban-page__campo-titulo">
                  Título do projeto *
                  <input
                    required
                    autoFocus
                    value={formulario.titulo}
                    onChange={(event) => setFormulario({ ...formulario, titulo: event.target.value })}
                    disabled={bloqueado}
                    placeholder="Informe o título"
                  />
                </label>
                <label>
                  Área responsável
                  <input
                    value={formulario.area}
                    onChange={(event) => setFormulario({ ...formulario, area: event.target.value })}
                    disabled={bloqueado}
                    placeholder="Informe a área"
                  />
                </label>
                <label>
                  Etapa inicial
                  <select
                    value={formulario.status}
                    onChange={(event) => setFormulario({ ...formulario, status: event.target.value as StatusProjetoKanban })}
                    disabled={bloqueado}
                  >
                    {colunas.map((coluna) => <option key={coluna.id} value={coluna.id}>{coluna.titulo}</option>)}
                  </select>
                </label>
              </div>
              <div className="kanban-page__form-actions">
                <button type="button" className="kanban-page__btn" onClick={fecharFormulario} disabled={processando}>Cancelar</button>
                <button type="submit" className="kanban-page__btn kanban-page__btn--primario" disabled={bloqueado || !onCriarProjeto}>
                  {processando ? 'Salvando...' : 'Cadastrar projeto'}
                </button>
              </div>
            </form>
          </section>
        )}
      </dialog>

      <div className="kanban-page__board" aria-label="Quadro de projetos por etapa">
        {colunas.map((coluna) => {
          const lista = projetos?.filter((projeto) => projeto.status === coluna.id) ?? [];

          return (
            <section
              key={coluna.id}
              className={`kanban-page__coluna kanban-page__coluna--${coluna.id}`}
              aria-labelledby={`kanban-coluna-${coluna.id}`}
            >
              <div className="kanban-page__coluna-header">
                <h2 id={`kanban-coluna-${coluna.id}`}>{coluna.titulo}</h2>
                <span className="kanban-page__contagem" aria-label={projetos ? `${lista.length} projetos` : 'Quantidade indisponível'}>
                  {projetos ? lista.length : '—'}
                </span>
              </div>

              <ul className="kanban-page__lista">
                {lista.map((projeto) => (
                  <li key={projeto.id} className="kanban-page__projeto">
                    <span className="kanban-page__codigo">{projeto.codigo}</span>
                    <h3>{projeto.titulo}</h3>
                    {projeto.area && <p>{projeto.area}</p>}
                    {onMoverProjeto && (
                      <label className="kanban-page__mover">
                        <span>Mover para</span>
                        <select
                          aria-label={`Alterar etapa de ${projeto.titulo}`}
                          value={projeto.status}
                          disabled={bloqueado}
                          onChange={(event) => moverProjeto(projeto, event.target.value as StatusProjetoKanban)}
                        >
                          {colunas.map((destino) => <option key={destino.id} value={destino.id}>{destino.titulo}</option>)}
                        </select>
                      </label>
                    )}
                  </li>
                ))}
                {!lista.length && <li className="kanban-page__vazio">{carregando ? 'Carregando...' : projetos ? 'Nenhum projeto' : 'Sem dados'}</li>}
              </ul>

              <button
                type="button"
                className="kanban-page__adicionar"
                aria-label={`Adicionar projeto em ${coluna.titulo}`}
                onClick={() => abrirFormulario(coluna.id)}
                disabled={bloqueado}
              >
                <span aria-hidden="true">+</span> Adicionar
              </button>
            </section>
          );
        })}
      </div>
    </div>
  );
}
