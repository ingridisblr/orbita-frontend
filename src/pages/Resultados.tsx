import { useEffect, useRef, useState, type FormEvent } from 'react';
import './Resultados.css';

export interface EvidenciaResultado {
  id: string;
  titulo: string;
  descricao?: string;
}

export interface DadosResultado {
  projeto: string;
  indicador: string;
  esperado: string;
  alcancado: string;
  status: string;
}

export interface RegistroResultado extends DadosResultado {
  id: string;
  codigo: string;
  quantidadeEvidencias?: number;
  evidencias?: readonly EvidenciaResultado[];
}

export interface ResultadosProps {
  resultados?: readonly RegistroResultado[];
  carregando?: boolean;
  erro?: string;
  onRegistrarResultado?: (dados: DadosResultado) => Promise<void> | void;
}

type ModalResultado =
  | { tipo: 'cadastro'; dados: DadosResultado }
  | { tipo: 'evidencias'; resultado: RegistroResultado };

const dadosIniciais: DadosResultado = {
  projeto: '',
  indicador: '',
  esperado: '',
  alcancado: '',
  status: 'Pendente',
};

const opcoesStatus = ['Pendente', 'Atingido', 'Superado', 'Não atingido'];

function classeStatus(status: string) {
  const normalizado = status.trim().toLowerCase();

  if (normalizado === 'superado' || normalizado === 'atingido')
    return 'positivo';
  if (normalizado === 'não atingido') return 'negativo';
  if (normalizado === 'pendente') return 'pendente';

  return 'neutro';
}

export function Resultados({
  resultados,
  carregando = false,
  erro = '',
  onRegistrarResultado,
}: ResultadosProps) {
  const [modal, setModal] = useState<ModalResultado | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erroAcao, setErroAcao] = useState('');
  const modalRef = useRef<HTMLDialogElement>(null);
  const modalAberto = modal !== null;
  const bloqueado = carregando || Boolean(erro) || salvando;

  useEffect(() => {
    const dialog = modalRef.current;

    if (!dialog || !modalAberto) return;

    dialog.showModal();
    dialog.querySelector('input')?.focus();

    return () => {
      dialog.close();
    };
  }, [modalAberto]);

  function abrirCadastro() {
    setModal({ tipo: 'cadastro', dados: { ...dadosIniciais } });
    setErroAcao('');
    setMensagem('');
  }

  function abrirEvidencias(resultado: RegistroResultado) {
    setModal({ tipo: 'evidencias', resultado });
    setErroAcao('');
  }

  function fecharModal() {
    if (salvando) return;
    setModal(null);
    setErroAcao('');
  }

  function alterarCampo(campo: keyof DadosResultado, valor: string) {
    setModal((anterior) => {
      if (!anterior || anterior.tipo !== 'cadastro') return anterior;
      return { ...anterior, dados: { ...anterior.dados, [campo]: valor } };
    });
  }

  async function registrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !modal ||
      modal.tipo !== 'cadastro' ||
      !onRegistrarResultado ||
      bloqueado
    )
      return;

    const dados: DadosResultado = {
      projeto: modal.dados.projeto.trim(),
      indicador: modal.dados.indicador.trim(),
      esperado: modal.dados.esperado.trim(),
      alcancado: modal.dados.alcancado.trim(),
      status: modal.dados.status,
    };

    if (!dados.projeto || !dados.indicador || !dados.esperado) {
      setErroAcao('Informe o projeto, o indicador e o resultado esperado.');
      return;
    }

    setSalvando(true);
    setErroAcao('');

    try {
      await onRegistrarResultado(dados);
      setModal(null);
      setMensagem('Resultado registrado com sucesso.');
    } catch (error: unknown) {
      setErroAcao(
        error instanceof Error
          ? error.message
          : 'Não foi possível registrar o resultado.',
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="resultados-page" aria-busy={carregando || salvando}>
      <header className="resultados-page__header">
        <div>
          <h1>Resultados</h1>
          <p>Comparativo entre resultados esperados e alcançados.</p>
        </div>
        <button
          type="button"
          className="resultados-page__btn resultados-page__btn--primario"
          onClick={abrirCadastro}
          disabled={bloqueado}
        >
          <span aria-hidden="true">+</span> Registrar Resultado
        </button>
      </header>

      {carregando && (
        <p className="resultados-page__estado" role="status">
          Carregando resultados...
        </p>
      )}
      {erro && (
        <p
          className="resultados-page__estado resultados-page__erro"
          role="alert"
        >
          {erro}
        </p>
      )}
      {mensagem && (
        <p
          className="resultados-page__estado resultados-page__sucesso"
          role="status"
        >
          {mensagem}
        </p>
      )}

      <section
        className="resultados-page__card"
        aria-label="Comparativo de resultados"
      >
        <div className="resultados-page__tabela-container">
          <table className="resultados-page__tabela">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Projeto</th>
                <th scope="col">Indicador</th>
                <th scope="col">Esperado</th>
                <th scope="col">Alcançado</th>
                <th scope="col">Status</th>
                <th scope="col">Evidências</th>
              </tr>
            </thead>
            <tbody>
              {resultados?.map((resultado) => {
                const quantidade =
                  resultado.quantidadeEvidencias ??
                  resultado.evidencias?.length;

                return (
                  <tr key={resultado.id}>
                    <td className="resultados-page__codigo">
                      {resultado.codigo}
                    </td>
                    <td className="resultados-page__codigo">
                      {resultado.projeto}
                    </td>
                    <th scope="row">{resultado.indicador}</th>
                    <td className="resultados-page__medida">
                      {resultado.esperado}
                    </td>
                    <td className="resultados-page__alcancado">
                      {resultado.alcancado || 'Em medição'}
                    </td>
                    <td>
                      <span
                        className={`resultados-page__status resultados-page__status--${classeStatus(resultado.status)}`}
                      >
                        {resultado.status}
                      </span>
                    </td>
                    <td>
                      {quantidade !== undefined && quantidade > 0 ? (
                        <button
                          type="button"
                          className="resultados-page__evidencia-link"
                          onClick={() => abrirEvidencias(resultado)}
                          disabled={bloqueado}
                          aria-label={`Ver evidências de ${resultado.indicador}`}
                        >
                          {quantidade} {quantidade === 1 ? 'anexo' : 'anexos'}
                        </button>
                      ) : (
                        <span>{quantidade === 0 ? 'Sem anexos' : '—'}</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {!resultados?.length && (
                <tr>
                  <td colSpan={7} className="resultados-page__vazio">
                    {carregando
                      ? 'Carregando registros...'
                      : erro
                        ? 'Não foi possível exibir os resultados.'
                        : resultados
                          ? 'Nenhum resultado registrado.'
                          : 'Os registros serão exibidos quando os dados estiverem disponíveis.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <dialog
        ref={modalRef}
        className="resultados-page__modal"
        aria-labelledby="resultado-modal-titulo"
        onCancel={(event) => {
          event.preventDefault();
          fecharModal();
        }}
      >
        {modal && (
          <div className="resultados-page__modal-conteudo">
            <header className="resultados-page__modal-header">
              <div>
                <h2 id="resultado-modal-titulo">
                  {modal.tipo === 'cadastro'
                    ? 'Registrar Resultado'
                    : 'Evidências do resultado'}
                </h2>
                {modal.tipo === 'cadastro' && (
                  <p>Informe a meta e o resultado alcançado pelo projeto.</p>
                )}
              </div>
              <button
                type="button"
                className="resultados-page__fechar"
                onClick={fecharModal}
                disabled={salvando}
                aria-label="Fechar formulário"
              >
                ×
              </button>
            </header>

            {modal.tipo === 'cadastro' ? (
              <form onSubmit={registrar}>
                {!onRegistrarResultado && (
                  <p className="resultados-page__estado" role="status">
                    O serviço de registro de resultados ainda não está
                    conectado.
                  </p>
                )}
                {erroAcao && (
                  <p
                    className="resultados-page__estado resultados-page__erro"
                    role="alert"
                  >
                    {erroAcao}
                  </p>
                )}

                <fieldset
                  className="resultados-page__campos"
                  disabled={bloqueado}
                >
                  <label className="resultados-page__campo-largo">
                    Projeto vinculado *
                    <input
                      required
                      value={modal.dados.projeto}
                      onChange={(event) =>
                        alterarCampo('projeto', event.target.value)
                      }
                      placeholder="Ex.: PRJ-001"
                    />
                  </label>
                  <label className="resultados-page__campo-largo">
                    Indicador *
                    <input
                      required
                      value={modal.dados.indicador}
                      onChange={(event) =>
                        alterarCampo('indicador', event.target.value)
                      }
                      placeholder="Ex.: Taxa de resolução autônoma"
                    />
                  </label>
                  <label>
                    Resultado esperado *
                    <input
                      required
                      value={modal.dados.esperado}
                      onChange={(event) =>
                        alterarCampo('esperado', event.target.value)
                      }
                      placeholder="Ex.: ≥ 60%"
                    />
                  </label>
                  <label>
                    Resultado alcançado
                    <input
                      value={modal.dados.alcancado}
                      onChange={(event) =>
                        alterarCampo('alcancado', event.target.value)
                      }
                      placeholder="Ex.: 68%"
                    />
                  </label>
                  <label>
                    Status *
                    <select
                      value={modal.dados.status}
                      onChange={(event) =>
                        alterarCampo('status', event.target.value)
                      }
                    >
                      {opcoesStatus.map((status) => (
                        <option value={status} key={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                </fieldset>

                <div className="resultados-page__modal-acoes">
                  <button
                    type="button"
                    className="resultados-page__btn"
                    onClick={fecharModal}
                    disabled={salvando}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="resultados-page__btn resultados-page__btn--primario"
                    disabled={!onRegistrarResultado || bloqueado}
                  >
                    {salvando ? 'Registrando...' : 'Registrar resultado'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="resultados-page__codigo">
                  {modal.resultado.codigo} · {modal.resultado.projeto}
                </p>
                <h3 className="resultados-page__evidencias-titulo">
                  {modal.resultado.indicador}
                </h3>
                {modal.resultado.evidencias?.length ? (
                  <ul className="resultados-page__evidencias">
                    {modal.resultado.evidencias.map((evidencia) => (
                      <li key={evidencia.id}>
                        <strong>{evidencia.titulo}</strong>
                        {evidencia.descricao && <p>{evidencia.descricao}</p>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="resultados-page__estado">
                    {modal.resultado.evidencias
                      ? 'Nenhuma evidência anexada.'
                      : 'Detalhes das evidências indisponíveis.'}
                  </p>
                )}
                <div className="resultados-page__modal-acoes">
                  <button
                    type="button"
                    className="resultados-page__btn"
                    onClick={fecharModal}
                  >
                    Fechar
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}
