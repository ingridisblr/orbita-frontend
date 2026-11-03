import { useEffect, useState } from 'react';

import { Alert } from '../components/common/Alert';
import { ProporIdeia } from './ProporIdeia';
import {
  arquivarIdeia,
  listarMinhasIdeias,
  obterIdeia,
} from '../services/ideiaService';
import type { User } from '../types/auth';
import type { Ideia } from '../types/ideia';
import {
  classeStatusIdeia,
  descreverErro,
  formatarData,
  rotuloStatusIdeia,
} from '../utils/formatters';
import { podeArquivarIdeia, podeEditarIdeia } from '../utils/permissions';
import './MinhasIdeias.css';

const IDEIAS_POR_PAGINA = 10;

interface MinhasIdeiasProps {
  user: User;
  // Mensagem de sucesso vinda de outra tela (ex.: ideia recém-cadastrada)
  avisoInicial?: string | null;
}

type Modo =
  | { tipo: 'lista' }
  | { tipo: 'detalhe'; ideia: Ideia }
  | { tipo: 'editar'; ideia: Ideia };

function codigoDaIdeia(ideia: Ideia): string {
  return ideia.codigo ?? `#${ideia.id_ideia}`;
}

export function MinhasIdeias({ user, avisoInicial }: MinhasIdeiasProps) {
  const [ideias, setIdeias] = useState<Ideia[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [total, setTotal] = useState(0);
  const [versao, setVersao] = useState(0);

  const [carregando, setCarregando] = useState(true);
  const [ocupada, setOcupada] = useState<number | null>(null);

  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(avisoInicial ?? null);

  const [modo, setModo] = useState<Modo>({ tipo: 'lista' });

  // Lista as ideias do usuário logado a partir da API
  useEffect(() => {
    let ativo = true;

    listarMinhasIdeias(pagina, IDEIAS_POR_PAGINA)
      .then((resposta) => {
        if (!ativo) return;

        setIdeias(resposta.items);
        setTotal(resposta.total);
        setTotalPaginas(resposta.pages);
      })
      .catch((error) => {
        if (ativo) setErro(descreverErro(error));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [pagina, versao]);

  function recarregar() {
    setCarregando(true);
    setVersao((v) => v + 1);
  }

  function irParaPagina(numero: number) {
    setCarregando(true);
    setPagina(numero);
  }

  function voltarParaLista() {
    setModo({ tipo: 'lista' });
  }

  // Consulta: busca a ideia atualizada no servidor
  async function handleConsultar(ideia: Ideia) {
    setErro(null);
    setSucesso(null);
    setOcupada(ideia.id_ideia);

    try {
      const atual = await obterIdeia(ideia.id_ideia);
      setModo({ tipo: 'detalhe', ideia: atual });
    } catch (error) {
      setErro(descreverErro(error));
    } finally {
      setOcupada(null);
    }
  }

  function handleEditar(ideia: Ideia) {
    setErro(null);
    setSucesso(null);
    setModo({ tipo: 'editar', ideia });
  }

  function handleEdicaoConcluida(ideia: Ideia) {
    setSucesso(
      `Ideia ${codigoDaIdeia(ideia)} atualizada. Status: ${rotuloStatusIdeia(ideia.status)}.`
    );
    setModo({ tipo: 'lista' });
    recarregar();
  }

  async function handleArquivar(ideia: Ideia) {
    const confirmado = window.confirm(
      `Arquivar a ideia ${codigoDaIdeia(ideia)} — "${ideia.titulo}"? ` +
        'Ela deixará de poder ser editada.'
    );

    if (!confirmado) return;

    setErro(null);
    setSucesso(null);
    setOcupada(ideia.id_ideia);

    try {
      const arquivada = await arquivarIdeia(ideia.id_ideia);

      setSucesso(
        `Ideia ${codigoDaIdeia(arquivada)} arquivada. Status: ${rotuloStatusIdeia(arquivada.status)}.`
      );
      setModo({ tipo: 'lista' });

      if (ideias.length === 1 && pagina > 1) {
        irParaPagina(pagina - 1);
      } else {
        recarregar();
      }
    } catch (error) {
      // Ex.: a ideia mudou de status e não pode mais ser arquivada
      setErro(descreverErro(error));
      recarregar();
    } finally {
      setOcupada(null);
    }
  }

  // #region Edição
  if (modo.tipo === 'editar') {
    return (
      <ProporIdeia
        ideia={modo.ideia}
        onSucesso={handleEdicaoConcluida}
        onCancelar={voltarParaLista}
      />
    );
  }
  // #endregion

  // #region Detalhe
  if (modo.tipo === 'detalhe') {
    const ideia = modo.ideia;

    return (
      <main className="minhas-ideias-container">
        <button
          type="button"
          className="ideia-voltar"
          onClick={voltarParaLista}
        >
          ← Minhas Ideias
        </button>

        {erro && <Alert variant="error">{erro}</Alert>}

        <article className="ideia-card">
          <div className="ideia-card-topo">
            <div className="ideia-identificacao">
              <div className="ideia-status-linha">
                <span className="ideia-id">{codigoDaIdeia(ideia)}</span>

                <span className={`status-badge ${classeStatusIdeia(ideia.status)}`}>
                  {rotuloStatusIdeia(ideia.status)}
                </span>
              </div>

              <h2>{ideia.titulo}</h2>
            </div>

            <div className="ideia-acoes">
              {podeEditarIdeia(ideia, user) && (
                <button
                  type="button"
                  className="ideia-editar"
                  onClick={() => handleEditar(ideia)}
                >
                  Editar
                </button>
              )}

              {podeArquivarIdeia(ideia, user) && (
                <button
                  type="button"
                  className="ideia-editar"
                  disabled={ocupada === ideia.id_ideia}
                  onClick={() => handleArquivar(ideia)}
                >
                  Arquivar
                </button>
              )}
            </div>
          </div>

          <p className="ideia-descricao">{ideia.descricao}</p>

          {ideia.problema_resolvido && (
            <p className="ideia-descricao">
              <strong>Problema resolvido: </strong>
              {ideia.problema_resolvido}
            </p>
          )}

          {ideia.beneficio_esperado && (
            <p className="ideia-descricao">
              <strong>Benefício esperado: </strong>
              {ideia.beneficio_esperado}
            </p>
          )}

          <div className="ideia-card-rodape">
            {ideia.categoria && (
              <span className="ideia-categoria">{ideia.categoria}</span>
            )}

            {ideia.area && (
              <span className="ideia-categoria">{ideia.area}</span>
            )}

            <span className="ideia-desafio">
              Desafio: {ideia.desafio_titulo ?? ideia.id_desafio}
            </span>

            <span className="ideia-desafio">
              Submetida em: {formatarData(ideia.data_criacao)}
            </span>

            <span className="ideia-desafio">
              Atualizada em: {formatarData(ideia.data_atualizacao)}
            </span>
          </div>
        </article>
      </main>
    );
  }
  // #endregion

  // #region Lista
  return (
    <main className="minhas-ideias-container">
      <header className="minhas-ideias-header">
        <h1>Minhas Ideias</h1>
        <p>Ideias que você submeteu ao sistema</p>
      </header>

      {sucesso && <p className="ideias-sucesso" role="status">{sucesso}</p>}

      {erro && <Alert variant="error">{erro}</Alert>}

      <section className="ideias-list" aria-label="Lista de ideias">
        {carregando ? (
          <p className="ideias-empty">Carregando ideias...</p>
        ) : ideias.length === 0 ? (
          <p className="ideias-empty">
            Você ainda não submeteu nenhuma ideia.
          </p>
        ) : (
          ideias.map((ideia) => (
            <article key={ideia.id_ideia} className="ideia-card">
              <div className="ideia-card-topo">
                <div className="ideia-identificacao">
                  <div className="ideia-status-linha">
                    <span className="ideia-id">{codigoDaIdeia(ideia)}</span>

                    <span className={`status-badge ${classeStatusIdeia(ideia.status)}`}>
                      {rotuloStatusIdeia(ideia.status)}
                    </span>
                  </div>

                  <h2>{ideia.titulo}</h2>
                </div>

                <div className="ideia-acoes">
                  <button
                    type="button"
                    className="ideia-editar"
                    disabled={ocupada === ideia.id_ideia}
                    onClick={() => handleConsultar(ideia)}
                  >
                    Ver detalhes
                  </button>

                  {podeEditarIdeia(ideia, user) && (
                    <button
                      type="button"
                      className="ideia-editar"
                      disabled={ocupada === ideia.id_ideia}
                      onClick={() => handleEditar(ideia)}
                    >
                      Editar
                    </button>
                  )}

                  {podeArquivarIdeia(ideia, user) && (
                    <button
                      type="button"
                      className="ideia-editar"
                      disabled={ocupada === ideia.id_ideia}
                      onClick={() => handleArquivar(ideia)}
                    >
                      Arquivar
                    </button>
                  )}
                </div>
              </div>

              <p className="ideia-descricao">{ideia.descricao}</p>

              {ideia.beneficio_esperado && (
                <p className="ideia-descricao">
                  <strong>Benefício esperado: </strong>
                  {ideia.beneficio_esperado}
                </p>
              )}

              <div className="ideia-card-rodape">
                {ideia.categoria && (
                  <span className="ideia-categoria">
                    {ideia.categoria}
                  </span>
                )}

                <span className="ideia-desafio">
                  Desafio: {ideia.desafio_titulo ?? ideia.id_desafio}
                </span>

                <span className="ideia-desafio">
                  Submetida em: {formatarData(ideia.data_criacao)}
                </span>
              </div>
            </article>
          ))
        )}
      </section>

      {totalPaginas > 1 && (
        <nav className="ideias-paginacao" aria-label="Paginação">
          <button
            type="button"
            className="ideia-editar"
            disabled={pagina <= 1 || carregando}
            onClick={() => irParaPagina(pagina - 1)}
          >
            Anterior
          </button>

          <span>
            Página {pagina} de {totalPaginas} · {total} ideias
          </span>

          <button
            type="button"
            className="ideia-editar"
            disabled={pagina >= totalPaginas || carregando}
            onClick={() => irParaPagina(pagina + 1)}
          >
            Próxima
          </button>
        </nav>
      )}
    </main>
  );
  // #endregion
}
