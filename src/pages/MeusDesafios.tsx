import { useEffect, useState } from 'react';
import { excluirDesafio, listarDesafios } from '../services/desafioService';
import type { Desafio } from '../types/desafio';
import './MeusDesafios.css';

interface MeusDesafiosProps {
  gestorId: string;
  onIrParaNovoDesafio: () => void;
  onIrParaIdeias?: (desafioId: string) => void;
  onEditar: (desafio: Desafio) => void;
}

export const MeusDesafios = ({
  gestorId,
  onIrParaNovoDesafio,
  onIrParaIdeias,
  onEditar,
}: MeusDesafiosProps) => {
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    listarDesafios()
      .then((resultado) => {
        if (ativo) setDesafios(resultado.filter((desafio) => desafio.responsavelId === gestorId));
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
  }, [gestorId]);

  async function handleExcluir(desafio: Desafio) {
    if (
      !window.confirm(
        `Excluir o desafio “${desafio.titulo}”? Essa ação não pode ser desfeita.`,
      )
    ) {
      return;
    }

    setExcluindoId(desafio.id);
    setErro('');

    try {
      await excluirDesafio(desafio.id);
      setDesafios((atuais) => atuais.filter((item) => item.id !== desafio.id));
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir o desafio.',
      );
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <div className="meus-desafios-page" aria-busy={carregando}>
      <header className="meus-desafios-page__header">
        <div>
          <h1>Meus Desafios</h1>
          <p>Desafios cadastrados pela sua área.</p>
        </div>

        <button
          type="button"
          className="meus-desafios-page__btn meus-desafios-page__btn--primario"
          onClick={onIrParaNovoDesafio}
        >
          <span aria-hidden="true">+</span> Novo Desafio
        </button>
      </header>

      <div className="meus-desafios-page__aviso">
        <span className="meus-desafios-page__aviso-icone" aria-hidden="true">
          i
        </span>
        <p>
          Um <strong>desafio</strong> é um problema ou necessidade da sua área.
          Após cadastrado, colaboradores poderão propor ideias e o Hub de
          Inovação realizará o processo de match e avaliação. A decisão final
          sobre aprovação é do Analista/Hub.
        </p>
      </div>

      {erro && (
        <p
          className="meus-desafios-page__estado meus-desafios-page__estado--erro"
          role="alert"
        >
          {erro}
        </p>
      )}

      {carregando && (
        <p className="meus-desafios-page__estado" role="status">
          Carregando desafios...
        </p>
      )}

      {!carregando && !erro && desafios.length === 0 && (
        <p className="meus-desafios-page__estado">
          Nenhum desafio cadastrado ainda.
        </p>
      )}

      <section
        className="meus-desafios-page__lista"
        aria-label="Desafios cadastrados"
      >
        {desafios.map((desafio) => {
          const statusAberto = ['ativo', 'aberto'].includes(
            desafio.status.toLowerCase(),
          );
          const impactoAlto = desafio.impacto.toLowerCase() === 'alto';
          const urgenciaAlta = desafio.urgencia.toLowerCase() === 'alta';

          return (
            <article key={desafio.id} className="meus-desafios-page__card">
              <div className="meus-desafios-page__conteudo">
                <div className="meus-desafios-page__identificacao">
                  <span className="meus-desafios-page__codigo">
                    DSF-{desafio.id}
                  </span>
                  <span
                    className={`meus-desafios-page__status ${statusAberto ? 'meus-desafios-page__status--aberto' : ''}`}
                  >
                    {desafio.status || 'Sem status'}
                  </span>
                </div>

                <h2>{desafio.titulo}</h2>
                <p className="meus-desafios-page__descricao">
                  {desafio.descricao}
                </p>

                <div className="meus-desafios-page__tags">
                  <span
                    className={`meus-desafios-page__tag ${impactoAlto ? 'meus-desafios-page__tag--prioridade' : ''}`}
                  >
                    Impacto {desafio.impacto}
                  </span>
                  <span
                    className={`meus-desafios-page__tag ${urgenciaAlta ? 'meus-desafios-page__tag--prioridade' : ''}`}
                  >
                    Urgência {desafio.urgencia}
                  </span>
                  <span className="meus-desafios-page__tag">
                    {desafio.areaDemandante}
                  </span>
                </div>
              </div>

              <footer className="meus-desafios-page__rodape">
                {desafio.dataCriacao && (
                  <span className="meus-desafios-page__data">
                    Criado em {desafio.dataCriacao}
                  </span>
                )}

                <div className="meus-desafios-page__acoes">
                  <button type="button" className="meus-desafios-page__btn meus-desafios-page__btn--ver"
                    disabled={Boolean(excluindoId)} onClick={() => onEditar(desafio)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="meus-desafios-page__btn meus-desafios-page__btn--ver"
                    onClick={() => onIrParaIdeias?.(desafio.id)}
                  >
                    Ver ideias <span aria-hidden="true">→</span>
                  </button>
                  <button
                    type="button"
                    className="meus-desafios-page__btn meus-desafios-page__btn--excluir"
                    onClick={() => void handleExcluir(desafio)}
                    disabled={excluindoId === desafio.id}
                  >
                    {excluindoId === desafio.id ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </footer>
            </article>
          );
        })}
      </section>

    </div>
  );
};
