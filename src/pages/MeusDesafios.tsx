import { useEffect, useState } from 'react';
import { excluirDesafio, listarDesafios } from '../services/desafioService';
import type { Desafio } from '../types/desafio';
import './MeusDesafios.css';

interface MeusDesafiosProps {
  onIrParaNovoDesafio: () => void;
  onIrParaIdeias?: (desafioId: string) => void;
}

export const MeusDesafios = ({ onIrParaNovoDesafio, onIrParaIdeias }: MeusDesafiosProps) => {
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    listarDesafios()
      .then((resultado) => { if (ativo) setDesafios(resultado); })
      .catch((error: unknown) => {
        if (ativo) setErro(error instanceof Error ? error.message : 'Não foi possível carregar os desafios.');
      })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  async function handleExcluir(desafio: Desafio) {
    if (!window.confirm(`Excluir o desafio “${desafio.titulo}”? Essa ação não pode ser desfeita.`)) return;
    setExcluindoId(desafio.id);
    setErro('');
    try {
      await excluirDesafio(desafio.id);
      setDesafios((atuais) => atuais.filter((item) => item.id !== desafio.id));
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível excluir o desafio.');
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <div className="gestor-container">
      <div className="gestor-header">
        <div><h1>Meus Desafios</h1><p>Desafios cadastrados pela sua área</p></div>
        <button className="btn-novo-desafio" onClick={onIrParaNovoDesafio}>+ Novo Desafio</button>
      </div>

      <div className="alerta-aviso-gestor">
        Um <strong>desafio</strong> é um problema ou necessidade da sua área. Após cadastrado, colaboradores poderão propor ideias e o Hub de Inovação realizará o processo de match e avaliação. A decisão final sobre aprovação é do Analista/Hub.
      </div>
      {erro && <p role="alert" style={{ color: '#b91c1c' }}>{erro}</p>}
      {carregando && <p role="status">Carregando desafios...</p>}
      {!carregando && !erro && desafios.length === 0 && <p>Nenhum desafio cadastrado ainda.</p>}

      <div className="desafios-list">
        {desafios.map((desafio) => (
          <div key={desafio.id} className="desafio-card">
            <div className="desafio-card-content">
              <div className="desafio-meta-top">
                <span className="badge-dsf-id">DSF-{desafio.id}</span>
                <span className={`badge-dsf-status ${desafio.status.toLowerCase() === 'ativo' ? 'aberto' : ''}`}>{desafio.status || 'Sem status'}</span>
              </div>
              <h3>{desafio.titulo}</h3>
              <p className="desafio-descricao">{desafio.descricao}</p>
              <div className="desafio-tags-bottom">
                <span className={desafio.impacto.toLowerCase() === 'alto' ? 'tag-impacto-alto' : 'tag-impacto-medio'}>Impacto {desafio.impacto}</span>
                <span className={desafio.urgencia.toLowerCase() === 'alta' ? 'tag-impacto-alto' : 'tag-impacto-medio'}>Urgência {desafio.urgencia}</span>
                <span className="tag-area">{desafio.areaDemandante}</span>
                {desafio.dataCriacao && <span className="tag-area">Criado em {desafio.dataCriacao}</span>}
              </div>
            </div>
            <div className="desafio-card-actions">
              <button className="btn-card-acao" onClick={() => onIrParaIdeias?.(desafio.id)}>Ver ideias</button>
              <button className="btn-card-acao" onClick={() => void handleExcluir(desafio)} disabled={excluindoId === desafio.id}>
                {excluindoId === desafio.id ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="desafio-aviso-api">A API ainda não separa desafios por usuário, então esta lista exibe todos os desafios cadastrados.</p>
    </div>
  );
};
