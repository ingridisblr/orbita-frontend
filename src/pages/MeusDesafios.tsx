import React, { useEffect, useState } from 'react';
import { Alert } from '../components/common/Alert';
import { excluirDesafio, listarMeusDesafios } from '../services/desafioService';
import type { User } from '../types/auth';
import type { Desafio } from '../types/desafio';
import {
  classeNivel,
  classeStatusDesafio,
  codigoDesafio,
  descreverErro,
  rotuloStatusDesafio,
} from '../utils/formatters';
import { podeEditarDesafio, podeExcluirDesafio } from '../utils/permissions';
import './MeusDesafios.css';

interface MeusDesafiosProps {
  user: User;
  onIrParaNovoDesafio: () => void;
  onEditar: (desafio: Desafio) => void;
  onIrParaIdeias?: (desafio: Desafio) => void;
}

export const MeusDesafios: React.FC<MeusDesafiosProps> = ({
  user,
  onIrParaNovoDesafio,
  onEditar,
  onIrParaIdeias,
}) => {
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [excluindoId, setExcluindoId] = useState<number | null>(null);
  const [tentativa, setTentativa] = useState(0);

  // Só os desafios sob responsabilidade do usuário logado
  useEffect(() => {
    let cancelado = false;

    listarMeusDesafios(Number(user.id))
      .then((lista) => {
        if (cancelado) return;
        setDesafios(lista);
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
  }, [user.id, tentativa]);

  function tentarNovamente() {
    setCarregando(true);
    setTentativa((n) => n + 1);
  }

  async function handleExcluir(desafio: Desafio) {
    const confirmou = window.confirm(
      `Excluir o desafio "${desafio.titulo}"? Esta ação não pode ser desfeita.`
    );
    if (!confirmou) return;

    setErro('');
    setSucesso('');
    setExcluindoId(desafio.id_desafio);

    try {
      await excluirDesafio(desafio.id_desafio);
      setDesafios((lista) => lista.filter((d) => d.id_desafio !== desafio.id_desafio));
      setSucesso(`Desafio ${codigoDesafio(desafio.id_desafio)} excluído com sucesso.`);
    } catch (e) {
      setErro(descreverErro(e));
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <div className="gestor-container">
      <div className="gestor-header">
        <div>
          <h1>Meus Desafios</h1>
          <p>Desafios sob a sua responsabilidade</p>
        </div>
        <button className="btn-novo-desafio" onClick={onIrParaNovoDesafio}>
          + Novo Desafio
        </button>
      </div>

      <div className="alerta-aviso-gestor">
        Um <strong>desafio</strong> é um problema ou necessidade da sua área. Após cadastrado, colaboradores poderão propor ideias e o Hub de Inovação realizará o processo de match e avaliação. A decisão final sobre aprovação é do Analista/Hub.
      </div>

      {sucesso && <div className="mensagem-sucesso" role="status">{sucesso}</div>}

      {erro && (
        <div>
          <Alert variant="error">{erro}</Alert>
          {!carregando && desafios.length === 0 && (
            <button className="btn-card-acao" onClick={tentarNovamente}>
              Tentar novamente
            </button>
          )}
        </div>
      )}

      {carregando && <p className="estado-lista">Carregando seus desafios...</p>}

      {!carregando && !erro && desafios.length === 0 && (
        <p className="estado-lista">
          Você ainda não cadastrou nenhum desafio. Clique em "+ Novo Desafio" para começar.
        </p>
      )}

      <div className="desafios-list">
        {desafios.map((desafio) => (
          <div key={desafio.id_desafio} className="desafio-card">
            <div className="desafio-card-content">
              <div className="desafio-meta-top">
                <span className="badge-dsf-id">{codigoDesafio(desafio.id_desafio)}</span>
                <span className={`badge-dsf-status ${classeStatusDesafio(desafio.status)}`}>
                  {rotuloStatusDesafio(desafio.status)}
                </span>
                <span className="badge-ideias-qtd">
                  {desafio.qtd_ideias} {desafio.qtd_ideias === 1 ? 'ideia' : 'ideias'}
                </span>
              </div>

              <h3>{desafio.titulo}</h3>
              <p className="desafio-descricao">{desafio.descricao_problema}</p>

              <div className="desafio-tags-bottom">
                {desafio.impacto && (
                  <span className={classeNivel(desafio.impacto)}>Impacto {desafio.impacto}</span>
                )}
                {desafio.urgencia && (
                  <span className={classeNivel(desafio.urgencia)}>Urgência {desafio.urgencia}</span>
                )}
                <span className="tag-area">{desafio.area_demandante}</span>
              </div>
            </div>

            <div className="desafio-card-actions">
              {podeEditarDesafio(user, desafio) && (
                <button className="btn-card-acao" onClick={() => onEditar(desafio)}>
                  Editar
                </button>
              )}
              <button className="btn-card-acao" onClick={() => onIrParaIdeias?.(desafio)}>
                Ver ideias
              </button>
              {podeExcluirDesafio(user, desafio) && (
                <button
                  className="btn-card-acao btn-card-excluir"
                  onClick={() => handleExcluir(desafio)}
                  disabled={excluindoId === desafio.id_desafio}
                >
                  {excluindoId === desafio.id_desafio ? 'Excluindo...' : 'Excluir'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
