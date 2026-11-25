import { useEffect, useMemo, useRef, useState } from 'react';
import { listarDesafios } from '../services/desafioService';
import type { Desafio } from '../types/desafio';
import './DesafiosAbertos.css';

interface DesafiosAbertosProps {
  onProporIdeia: (desafioId: string) => void;
}

export function DesafiosAbertos({ onProporIdeia }: DesafiosAbertosProps) {
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [desafioSelecionado, setDesafioSelecionado] = useState<Desafio | null>(
    null,
  );
  const modalRef = useRef<HTMLDialogElement>(null);
  const modalAberto = desafioSelecionado !== null;

  useEffect(() => {
    let ativo = true;

    listarDesafios()
      .then((resultado) => {
        if (ativo) setDesafios(resultado);
      })
      .catch((error: unknown) => {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar os desafios.',
          );
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    const modal = modalRef.current;

    if (!modal || !modalAberto) return;

    modal.showModal();

    return () => {
      modal.close();
    };
  }, [modalAberto]);

  const desafiosFiltrados = useMemo(() => {
    const termo = termoBusca.trim().toLowerCase();

    return desafios.filter((desafio) => {
      const ativo = ['ativo', 'aberto'].includes(
        desafio.status.trim().toLowerCase(),
      );

      return (
        ativo &&
        (!termo ||
          [desafio.titulo, desafio.descricao, desafio.areaDemandante].some(
            (valor) => valor.toLowerCase().includes(termo),
          ))
      );
    });
  }, [desafios, termoBusca]);

  function fecharDetalhes() {
    setDesafioSelecionado(null);
  }

  function proporIdeia(desafioId: string) {
    fecharDetalhes();
    onProporIdeia(desafioId);
  }

  return (
    <div className="desafios-abertos-page" aria-busy={carregando}>
      <header className="desafios-abertos-page__header">
        <h1>Desafios Abertos</h1>
        <p>
          Explore os gargalos operacionais e estratégicos da organização e
          submeta a sua proposta de solução.
        </p>
      </header>

      <div className="desafios-abertos-page__aviso">
        <span className="desafios-abertos-page__aviso-icone" aria-hidden="true">
          i
        </span>
        <p>
          <strong>Dica para o colaborador:</strong> escolha um desafio alinhado
          à sua área de atuação e clique em Propor Ideia.
        </p>
      </div>

      <div className="desafios-abertos-page__busca">
        <input
          aria-label="Pesquisar desafios por título, descrição ou área"
          type="search"
          placeholder="Pesquisar desafios por título, descrição ou área..."
          value={termoBusca}
          onChange={(event) => setTermoBusca(event.target.value)}
        />
      </div>

      {carregando && (
        <p className="desafios-abertos-page__estado" role="status">
          Carregando desafios...
        </p>
      )}
      {erro && (
        <p
          className="desafios-abertos-page__estado desafios-abertos-page__estado--erro"
          role="alert"
        >
          {erro}
        </p>
      )}
      {!carregando && !erro && desafiosFiltrados.length === 0 && (
        <p className="desafios-abertos-page__estado">
          Nenhum desafio ativo encontrado.
        </p>
      )}

      {desafiosFiltrados.length > 0 && (
        <section
          className="desafios-abertos-page__grid"
          aria-label="Desafios disponíveis"
        >
          {desafiosFiltrados.map((desafio) => {
            const impactoAlto = desafio.impacto.trim().toLowerCase() === 'alto';
            const urgenciaAlta =
              desafio.urgencia.trim().toLowerCase() === 'alta';

            return (
              <article className="desafios-abertos-page__card" key={desafio.id}>
                <div className="desafios-abertos-page__card-header">
                  <div className="desafios-abertos-page__identificacao">
                    <span className="desafios-abertos-page__codigo">
                      DSF-{desafio.id}
                    </span>
                    <span className="desafios-abertos-page__status">
                      {desafio.status}
                    </span>
                  </div>
                  {desafio.dataCriacao && (
                    <span className="desafios-abertos-page__data">
                      Criado em {desafio.dataCriacao}
                    </span>
                  )}
                </div>

                <div className="desafios-abertos-page__conteudo">
                  <h2>{desafio.titulo}</h2>
                  <p className="desafios-abertos-page__descricao">
                    {desafio.descricao || 'Descrição não informada.'}
                  </p>
                </div>

                <dl className="desafios-abertos-page__metadados">
                  <div>
                    <dt>Área demandante</dt>
                    <dd>{desafio.areaDemandante || 'Não informada'}</dd>
                  </div>
                  <div>
                    <dt>Categoria</dt>
                    <dd>{desafio.categoria || 'Não informada'}</dd>
                  </div>
                  <div className="desafios-abertos-page__campo-largo">
                    <dt>Pessoas/setores afetados</dt>
                    <dd>{desafio.quemAfeta || 'Não informado'}</dd>
                  </div>
                </dl>

                <div className="desafios-abertos-page__tags">
                  <span
                    className={`desafios-abertos-page__tag ${impactoAlto ? 'desafios-abertos-page__tag--prioridade' : ''}`}
                  >
                    Impacto: {desafio.impacto || 'Não informado'}
                  </span>
                  <span
                    className={`desafios-abertos-page__tag ${urgenciaAlta ? 'desafios-abertos-page__tag--prioridade' : ''}`}
                  >
                    Urgência: {desafio.urgencia || 'Não informada'}
                  </span>
                </div>

                <footer className="desafios-abertos-page__card-footer">
                  <button
                    type="button"
                    className="desafios-abertos-page__detalhes"
                    onClick={() => setDesafioSelecionado(desafio)}
                    aria-label={`Ver detalhes do desafio ${desafio.titulo}`}
                  >
                    Ver detalhes <span aria-hidden="true">→</span>
                  </button>
                  <button
                    type="button"
                    className="desafios-abertos-page__btn desafios-abertos-page__btn--primario"
                    onClick={() => proporIdeia(desafio.id)}
                  >
                    Propor Ideia
                  </button>
                </footer>
              </article>
            );
          })}
        </section>
      )}

      <dialog
        ref={modalRef}
        className="desafios-abertos-page__modal"
        aria-labelledby="desafio-preview-titulo"
        aria-describedby="desafio-preview-descricao"
        onCancel={(event) => {
          event.preventDefault();
          fecharDetalhes();
        }}
      >
        {desafioSelecionado && (
          <div className="desafios-abertos-page__modal-conteudo">
            <header className="desafios-abertos-page__modal-header">
              <div>
                <h2 id="desafio-preview-titulo">Detalhes do desafio</h2>
                <p id="desafio-preview-descricao">
                  Confira as informações antes de propor uma solução.
                </p>
              </div>
              <button
                type="button"
                className="desafios-abertos-page__fechar"
                onClick={fecharDetalhes}
                aria-label="Fechar detalhes"
              >
                ×
              </button>
            </header>

            <div className="desafios-abertos-page__identificacao">
              <span className="desafios-abertos-page__codigo">
                DSF-{desafioSelecionado.id}
              </span>
              <span className="desafios-abertos-page__status">
                {desafioSelecionado.status}
              </span>
            </div>
            <h3 className="desafios-abertos-page__modal-titulo">
              {desafioSelecionado.titulo}
            </h3>

            <dl className="desafios-abertos-page__modal-dados">
              <div>
                <dt>Área demandante</dt>
                <dd>{desafioSelecionado.areaDemandante || 'Não informada'}</dd>
              </div>
              <div>
                <dt>Categoria</dt>
                <dd>{desafioSelecionado.categoria || 'Não informada'}</dd>
              </div>
              <div>
                <dt>Impacto</dt>
                <dd>{desafioSelecionado.impacto || 'Não informado'}</dd>
              </div>
              <div>
                <dt>Urgência</dt>
                <dd>{desafioSelecionado.urgencia || 'Não informada'}</dd>
              </div>
              <div>
                <dt>Data de criação</dt>
                <dd>{desafioSelecionado.dataCriacao || 'Não informada'}</dd>
              </div>
              <div>
                <dt>ID do desafio</dt>
                <dd>{desafioSelecionado.id}</dd>
              </div>
              <div className="desafios-abertos-page__campo-largo">
                <dt>Pessoas/setores afetados</dt>
                <dd>{desafioSelecionado.quemAfeta || 'Não informado'}</dd>
              </div>
              <div className="desafios-abertos-page__campo-largo">
                <dt>Descrição completa do problema</dt>
                <dd>{desafioSelecionado.descricao || 'Não informada'}</dd>
              </div>
            </dl>

            <footer className="desafios-abertos-page__modal-acoes">
              <button
                type="button"
                className="desafios-abertos-page__btn"
                onClick={fecharDetalhes}
              >
                Fechar
              </button>
              <button
                type="button"
                className="desafios-abertos-page__btn desafios-abertos-page__btn--primario"
                onClick={() => proporIdeia(desafioSelecionado.id)}
              >
                Propor Ideia
              </button>
            </footer>
          </div>
        )}
      </dialog>
    </div>
  );
}
