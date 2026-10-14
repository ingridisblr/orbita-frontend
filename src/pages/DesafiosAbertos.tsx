import { useState } from 'react';
import './DesafiosAbertos.css';

interface Desafio {
  id: string;
  titulo: string;
  descricao: string;
  area: string;
  autor: string;
  dataCriacao: string;
  status: 'aberto' | 'em_andamento' | 'concluido';
}

const desafiosIniciais: Desafio[] = [
  {
    id: '1',
    titulo: 'Otimização do Fluxo de Atendimento ao Cliente no Balcão',
    descricao: 'Buscamos ideias inovadoras para reduzir o tempo de espera dos clientes e agilizar a triagem inicial nas unidades físicas.',
    area: 'Atendimento Operacional',
    autor: 'Maria Souza (Gestor)',
    dataCriacao: '10/10/2026',
    status: 'aberto',
  },
  {
    id: '2',
    titulo: 'Automação na Gestão de Resíduos do Hub de Inovação',
    descricao: 'Proposta para monitorizar e otimizar a recolha e reciclagem de resíduos gerados nos espaços comuns e laboratórios.',
    area: 'Sustentabilidade',
    autor: 'Carlos Eduardo (Gestor)',
    dataCriacao: '12/10/2026',
    status: 'aberto',
  },
];

export function DesafiosAbertos()  {
  const [desafios] = useState<Desafio[]>(desafiosIniciais);
  const [termoBusca, setTermoBusca] = useState('');

  const desafiosFiltrados = desafios.filter(
    (d) =>
      d.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
      d.descricao.toLowerCase().includes(termoBusca.toLowerCase()) ||
      d.area.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div className="desafios-container">
      <header className="desafios-header">
        <h1>Desafios Abertos</h1>
        <p>Explore os gargalos operacionais e estratégicos da organização e submeta a sua proposta de solução.</p>
      </header>

      <div className="desafios-banner-info">
        <strong>Dica para o Colaborador:</strong> Escolha um desafio abaixo que esteja alinhado à sua área de atuação e clique em "Propor Ideia" para participar ativamente do ecossistema de inovação.
      </div>

      <div>
        <input
          type="text"
          className="desafios-search-input"
          placeholder="Pesquisar desafios por título, descrição ou área..."
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
        />
      </div>

      <div className="desafios-grid">
        {desafiosFiltrados.length === 0 ? (
          <p className="desafios-empty">Nenhum desafio encontrado com o termo pesquisado.</p>
        ) : (
          desafiosFiltrados.map((desafio) => (
            <div key={desafio.id} className="desafio-card">
              <div>
                <div className="desafio-card-header">
                  <span className="desafio-badge">{desafio.area}</span>
                  <span className="desafio-data">Criado em: {desafio.dataCriacao}</span>
                </div>

                <div className="desafio-card-body" style={{ marginTop: '0.75rem' }}>
                  <h3>{desafio.titulo}</h3>
                  <p>{desafio.descricao}</p>
                </div>
              </div>

              <div className="desafio-card-footer">
                <span className="desafio-autor">Responsável: {desafio.autor}</span>
                <button
                  className="desafio-btn-propor"
                  onClick={() => alert(`Redirecionando para propor ideia para o desafio: ${desafio.titulo}`)}
                >
                  Propor Ideia
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}