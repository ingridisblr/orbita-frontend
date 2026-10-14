import { useState } from 'react';
import './MinhasIdeias.css';

interface IdeiaSubmetida {
  id: string;
  titulo: string;
  desafio: string;
  data: string;
  status: 'Em Triagem' | 'Aprovada' | 'Em Desenvolvimento' | 'Arquivada';
}

const minhasIdeiasIniciais: IdeiaSubmetida[] = [
  {
    id: '101',
    titulo: 'Aplicativo de Autoatendimento Rápido',
    desafio: 'Otimização do Fluxo de Atendimento ao Cliente no Balcão',
    data: '12/10/2026',
    status: 'Em Triagem',
  },
];

export function MinhasIdeias() {
  const [ideias] = useState<IdeiaSubmetida[]>(minhasIdeiasIniciais);

  return (
    <div className="minhas-ideias-container">
      <header className="minhas-ideias-header">
        <h1>Minhas Ideias Submetidas</h1>
        <p>Acompanhe o andamento das propostas enviadas por você e verifique o feedback dos avaliadores.</p>
      </header>

      <div className="ideias-list">
        {ideias.length === 0 ? (
          <p className="ideias-empty">Você ainda não submeteu nenhuma ideia.</p>
        ) : (
          ideias.map((ideia) => (
            <div key={ideia.id} className="ideia-card">
              <div className="ideia-card-info">
                <span className={`status-badge ${ideia.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {ideia.status}
                </span>
                <span className="ideia-data">Submetida em: {ideia.data}</span>
              </div>
              <h3>{ideia.titulo}</h3>
              <p className="ideia-desafio"><strong>Desafio:</strong> {ideia.desafio}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}