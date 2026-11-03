import React from 'react';
import './IdeiasRelacionadas.css';

interface IdeiaFigma {
  id: string;
  codigo: string;
  status: 'Em Match' | 'Aprovada';
  titulo: string;
  descricao: string;
  autor: string;
  area: string;
  categoria: string;
  desafioRef: string;
}

interface IdeiasRelacionadasProps {
  onVoltarParaMeusDesafios?: () => void;
}

export const IdeiasRelacionadas: React.FC<IdeiasRelacionadasProps> = ({ onVoltarParaMeusDesafios }) => {
  const ideiasMock: IdeiaFigma[] = [
    {
      id: '1',
      codigo: 'IDA-001',
      status: 'Em Match',
      titulo: 'Portal de autoatendimento para compras',
      descricao: 'Redução de 40% no tempo de processo',
      autor: 'Pedro Alves',
      area: 'Administrativa',
      categoria: 'Eficiência Operacional',
      desafioRef: 'DSF-001',
    },
    {
      id: '2',
      codigo: 'IDA-002',
      status: 'Em Match',
      titulo: 'App de digitalização com OCR inteligente',
      descricao: 'Eliminação de 90% dos arquivos físicos',
      autor: 'Carla Mendes',
      area: 'TI',
      categoria: 'Transformação Digital',
      desafioRef: 'DSF-002',
    },
    {
      id: '3',
      codigo: 'IDA-003',
      status: 'Aprovada',
      titulo: 'Chatbot para triagem de atendimento',
      descricao: 'Redução de filas em 60%',
      autor: 'Rafael Costa',
      area: 'Atendimento',
      categoria: 'Experiência do Usuário',
      desafioRef: 'DSF-003',
    },
  ];

  return (
    <div className="gestor-container">
      {/* Link de retorno idêntico ao Figma */}
      <button 
        className="link-voltar-gestor"
        onClick={onVoltarParaMeusDesafios}
      >
        ← Meus Desafios
      </button>

      <div className="gestor-header">
        <h1>Ideias Relacionadas</h1>
        <p>Ideias propostas para os seus desafios</p>
      </div>

      <div className="alerta-aviso-gestor">
        A avaliação, triagem e aprovação das ideias é realizada pelo Analista/Hub de Inovação. Sua função é acompanhar o andamento.
      </div>

      <div className="ideias-list">
        {ideiasMock.map((ideia) => (
          <div key={ideia.id} className="ideia-item-card">
            <div className="ideia-item-header">
              <span className="badge-ida-id">{ideia.codigo}</span>
              <span className={`badge-ida-status ${ideia.status === 'Aprovada' ? 'aprovada' : 'match'}`}>
                {ideia.status}
              </span>
            </div>

            <h3>{ideia.titulo}</h3>
            <p className="ideia-subtitulo">{ideia.descricao}</p>

            <div className="ideia-item-footer">
              <div className="tags-container">
                <span className="tag-item">{ideia.autor}</span>
                <span className="tag-item">{ideia.area}</span>
                <span className="tag-item">{ideia.categoria}</span>
              </div>
              <span className="dsf-codigo">→ {ideia.desafioRef}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};