import { useEffect, useState } from 'react';
import type { Ideia } from '../types/ideia';
import { listarIdeias } from '../services/ideiaService';
import './IdeiasRelacionadas.css';

interface IdeiasRelacionadasProps {
  desafioId?: string;
  onVoltarParaMeusDesafios?: () => void;
}

export const IdeiasRelacionadas = ({ desafioId, onVoltarParaMeusDesafios }: IdeiasRelacionadasProps) => {
  const [ideias, setIdeias] = useState<Ideia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    listarIdeias({ desafioId })
      .then((resultado) => { if (ativo) setIdeias(resultado); })
      .catch((error: unknown) => {
        if (ativo) setErro(error instanceof Error ? error.message : 'Não foi possível carregar as ideias relacionadas.');
      })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [desafioId]);

  return (
    <div className="gestor-container">
      <button className="link-voltar-gestor" onClick={onVoltarParaMeusDesafios}>← Meus Desafios</button>
      <div className="gestor-header"><div><h1>Ideias Relacionadas</h1><p>{desafioId ? `Ideias propostas para o desafio #${desafioId}` : 'Ideias propostas para os desafios sob sua responsabilidade'}</p></div></div>
      <div className="alerta-aviso-gestor">A avaliação, triagem e aprovação das ideias é realizada pelo Analista/Hub de Inovação. Sua função é acompanhar o andamento.</div>
      {carregando && <p role="status">Carregando ideias...</p>}
      {erro && <p role="alert" style={{ color: '#b91c1c' }}>{erro}</p>}
      {!carregando && !erro && ideias.length === 0 && <p>Nenhuma ideia relacionada foi encontrada.</p>}

      <div className="ideias-list">
        {ideias.map((ideia) => (
          <div key={ideia.id} className="ideia-item-card">
            <div className="ideia-item-header">
              <span className="badge-ida-id">{ideia.codigo || `IDE-${ideia.id}`}</span>
              <span className={`badge-ida-status ${ideia.status.toLowerCase() === 'aprovada' ? 'aprovada' : 'match'}`}>{ideia.status}</span>
            </div>
            <h3>{ideia.titulo}</h3>
            <p className="ideia-subtitulo">{ideia.descricao}</p>
            <div className="ideia-item-footer">
              <div className="tags-container">
                {ideia.areaOrigem && <span className="tag-item">{ideia.areaOrigem}</span>}
                {ideia.categoria && <span className="tag-item">{ideia.categoria}</span>}
              </div>
              <span className="dsf-codigo">→ {ideia.desafio || `Desafio #${ideia.desafioId}`}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
