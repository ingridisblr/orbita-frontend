import { useEffect, useState } from 'react';

import { Alert } from '../components/common/Alert';
import { desafioEstaAberto, listarDesafios } from '../services/desafioService';
import type { Desafio } from '../types/desafio';
import { descreverErro, formatarData } from '../utils/formatters';
import './DesafiosAbertos.css';

interface DesafiosAbertosProps {
  onProporIdeia: (idDesafio: number) => void;
}

export function DesafiosAbertos({ onProporIdeia }: DesafiosAbertosProps) {
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [termoBusca, setTermoBusca] = useState('');

  useEffect(() => {
    let ativo = true;

    listarDesafios()
      .then((lista) => {
        if (ativo) setDesafios(lista.filter(desafioEstaAberto));
      })
      .catch((error) => {
        if (ativo) setErro(descreverErro(error));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const termo = termoBusca.toLowerCase();

  const desafiosFiltrados = desafios.filter(
    (d) =>
      d.titulo.toLowerCase().includes(termo) ||
      d.descricao_problema.toLowerCase().includes(termo) ||
      d.area_demandante.toLowerCase().includes(termo)
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

      {erro && <Alert variant="error">{erro}</Alert>}

      <div className="desafios-grid">
        {carregando ? (
          <p className="desafios-empty">Carregando desafios...</p>
        ) : desafiosFiltrados.length === 0 ? (
          <p className="desafios-empty">
            {desafios.length === 0
              ? 'Nenhum desafio aberto no momento.'
              : 'Nenhum desafio encontrado com o termo pesquisado.'}
          </p>
        ) : (
          desafiosFiltrados.map((desafio) => (
            <div key={desafio.id_desafio} className="desafio-card">
              <div>
                <div className="desafio-card-header">
                  <span className="desafio-badge">{desafio.area_demandante}</span>
                  <span className="desafio-data">Criado em: {formatarData(desafio.data_criacao)}</span>
                </div>

                <div className="desafio-card-body" style={{ marginTop: '0.75rem' }}>
                  <h3>{desafio.titulo}</h3>
                  <p>{desafio.descricao_problema}</p>
                </div>
              </div>

              <div className="desafio-card-footer">
                <span className="desafio-autor" />
                <button
                  className="desafio-btn-propor"
                  onClick={() => onProporIdeia(desafio.id_desafio)}
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
