import React from 'react';
import './MeusDesafios.css';

interface DesafioCardData {
  id: string;
  codigo: string;
  status: string;
  qtdIdeias: number;
  titulo: string;
  descricao: string;
  impacto: 'Alto' | 'Médio';
  urgencia: 'Alta' | 'Média';
  area: string;
}

interface MeusDesafiosProps {
  onIrParaNovoDesafio: () => void;
  onIrParaIdeias?: () => void;
}

export const MeusDesafios: React.FC<MeusDesafiosProps> = ({ onIrParaNovoDesafio, onIrParaIdeias }) => {
  const desafiosMock: DesafioCardData[] = [
    {
      id: '1',
      codigo: 'DSF-001',
      status: 'Aberto',
      qtdIdeias: 3,
      titulo: 'Redução de tempo em processos de compras',
      descricao: 'O processo atual de aquisição envolve etapas manuais redundantes, gerando atrasos médios de 45 dias. Necessita de uma solução digital que automatize etapas e garanta rastreabilidade.',
      impacto: 'Alto',
      urgencia: 'Alta',
      area: 'Administrativa',
    },
    {
      id: '2',
      codigo: 'DSF-002',
      status: 'Em Análise',
      qtdIdeias: 2,
      titulo: 'Digitalização de documentos físicos acumulados',
      descricao: 'O acervo físico ocupa espaço crítico e dificulta o acesso remoto a informações. É necessário digitalizar e indexar documentos históricos com precisão.',
      impacto: 'Médio',
      urgencia: 'Média',
      area: 'TI',
    },
    {
      id: '3',
      codigo: 'DSF-003',
      status: 'Com Ideias',
      qtdIdeias: 4,
      titulo: 'Melhoria no atendimento ao cidadão',
      descricao: 'O tempo médio de espera no atendimento presencial supera 40 minutos. Soluções de triagem inteligente ou autoatendimento podem reduzir filas e melhorar a satisfação.',
      impacto: 'Alto',
      urgencia: 'Alta',
      area: 'Atendimento',
    },
  ];

  return (
    <div className="gestor-container">
      <div className="gestor-header">
        <div>
          <h1>Meus Desafios</h1>
          <p>Desafios cadastrados pela sua área</p>
        </div>
        <button className="btn-novo-desafio" onClick={onIrParaNovoDesafio}>
          + Novo Desafio
        </button>
      </div>

      <div className="alerta-aviso-gestor">
        Um <strong>desafio</strong> é um problema ou necessidade da sua área. Após cadastrado, colaboradores poderão propor ideias e o Hub de Inovação realizará o processo de match e avaliação. A decisão final sobre aprovação é do Analista/Hub.
      </div>

      <div className="desafios-list">
        {desafiosMock.map((desafio) => (
          <div key={desafio.id} className="desafio-card">
            <div className="desafio-card-content">
              <div className="desafio-meta-top">
                <span className="badge-dsf-id">{desafio.codigo}</span>
                <span className={`badge-dsf-status ${desafio.status === 'Aberto' ? 'aberto' : ''}`}>
                  {desafio.status}
                </span>
                <span className="badge-ideias-qtd">{desafio.qtdIdeias} ideias</span>
              </div>

              <h3>{desafio.titulo}</h3>
              <p className="desafio-descricao">{desafio.descricao}</p>

              <div className="desafio-tags-bottom">
                <span className={desafio.impacto === 'Alto' ? 'tag-impacto-alto' : 'tag-impacto-medio'}>
                  Impacto {desafio.impacto}
                </span>
                <span className={desafio.urgencia === 'Alta' ? 'tag-impacto-alto' : 'tag-impacto-medio'}>
                  Urgência {desafio.urgencia}
                </span>
                <span className="tag-area">{desafio.area}</span>
              </div>
            </div>

            <div className="desafio-card-actions">
              <button 
                className="btn-card-acao"
                onClick={() => alert(`Editar desafio: ${desafio.codigo}`)}
              >
                Editar
              </button>
              <button 
                className="btn-card-acao"
                onClick={onIrParaIdeias}
              >
                Ver ideias
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};