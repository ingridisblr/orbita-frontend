import React, { useEffect, useState } from 'react';
import { Alert } from '../components/common/Alert';
import { listarIdeias } from '../services/ideiaService';
import type { Ideia } from '../types/ideia';
import {
  codigoDesafio,
  descreverErro,
  formatarData,
  rotuloStatusIdeia,
} from '../utils/formatters';
import './IdeiasRelacionadas.css';

interface IdeiasRelacionadasProps {
  idDesafio?: number;        // quando informado, lista só as ideias desse desafio
  tituloDesafio?: string;
  visaoAnalista?: boolean;   // analista vê as ideias de todos os desafios
  onVoltarParaMeusDesafios?: () => void;
  onVerTodas?: () => void;
}

const POR_PAGINA = 10;

export const IdeiasRelacionadas: React.FC<IdeiasRelacionadasProps> = ({
  idDesafio,
  tituloDesafio,
  visaoAnalista = false,
  onVoltarParaMeusDesafios,
  onVerTodas,
}) => {
  const [ideias, setIdeias] = useState<Ideia[]>([]);
  const [total, setTotal] = useState(0);
  const [paginas, setPaginas] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let cancelado = false;

    listarIdeias(pagina, POR_PAGINA, idDesafio)
      .then((resposta) => {
        if (cancelado) return;
        setIdeias(resposta.items);
        setTotal(resposta.total);
        setPaginas(resposta.pages);
        setErro('');
      })
      .catch((e: unknown) => {
        if (!cancelado) setErro(descreverErro(e));
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [pagina, idDesafio, tentativa]);

  function irParaPagina(numero: number) {
    setCarregando(true);
    setPagina(numero);
  }

  function tentarNovamente() {
    setCarregando(true);
    setTentativa((n) => n + 1);
  }

  return (
    <div className="gestor-container">
      {onVoltarParaMeusDesafios && (
        <button
          className="link-voltar-gestor"
          onClick={onVoltarParaMeusDesafios}
        >
          ← Meus Desafios
        </button>
      )}

      <div className="gestor-header">
        <h1>Ideias Relacionadas</h1>
        <p>
          {visaoAnalista
            ? 'Ideias propostas em todos os desafios'
            : 'Ideias propostas para os seus desafios'}
        </p>
      </div>

      <div className="alerta-aviso-gestor">
        A avaliação, triagem e aprovação das ideias é realizada pelo Analista/Hub de Inovação. Sua função é acompanhar o andamento.
      </div>

      {idDesafio && (
        <div className="ideias-rel-filtro">
          <span>
            Mostrando só as ideias do desafio{' '}
            <strong>
              {codigoDesafio(idDesafio)}
              {tituloDesafio ? ` · ${tituloDesafio}` : ''}
            </strong>
          </span>
          {onVerTodas && (
            <button className="ideias-rel-btn" onClick={onVerTodas}>
              Ver todas
            </button>
          )}
        </div>
      )}

      {erro && (
        <div>
          <Alert variant="error">{erro}</Alert>
          {!carregando && (
            <button className="ideias-rel-btn" onClick={tentarNovamente}>
              Tentar novamente
            </button>
          )}
        </div>
      )}

      {carregando && <p className="ideias-rel-estado">Carregando ideias...</p>}

      {!carregando && !erro && ideias.length === 0 && (
        <p className="ideias-rel-estado">
          {idDesafio
            ? 'Nenhuma ideia foi proposta para este desafio ainda.'
            : 'Nenhuma ideia foi proposta para os seus desafios ainda.'}
        </p>
      )}

      <div className="ideias-list">
        {ideias.map((ideia) => (
          <div key={ideia.id_ideia} className="ideia-item-card">
            <div className="ideia-item-header">
              <span className="badge-ida-id">{ideia.codigo ?? `#${ideia.id_ideia}`}</span>
              <span
                className={`badge-ida-status ${
                  ideia.status.trim().toLowerCase() === 'aprovada' ? 'aprovada' : 'match'
                }`}
              >
                {rotuloStatusIdeia(ideia.status)}
              </span>
            </div>

            <h3>{ideia.titulo}</h3>
            <p className="ideia-subtitulo">{ideia.descricao}</p>

            <div className="ideia-item-footer">
              <div className="tags-container">
                {ideia.area && <span className="tag-item">{ideia.area}</span>}
                {ideia.categoria && <span className="tag-item">{ideia.categoria}</span>}
                <span className="tag-item">Submetida em {formatarData(ideia.data_criacao)}</span>
              </div>
              <span className="dsf-codigo">
                → {codigoDesafio(ideia.id_desafio)}
                {ideia.desafio_titulo ? ` · ${ideia.desafio_titulo}` : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      {!carregando && !erro && paginas > 1 && (
        <div className="ideias-rel-paginacao">
          <button
            className="ideias-rel-btn"
            onClick={() => irParaPagina(pagina - 1)}
            disabled={pagina <= 1}
          >
            Anterior
          </button>
          <span>
            Página {pagina} de {paginas} · {total} ideias
          </span>
          <button
            className="ideias-rel-btn"
            onClick={() => irParaPagina(pagina + 1)}
            disabled={pagina >= paginas}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
};
