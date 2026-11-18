import { useEffect, useMemo, useState } from 'react';
import { listarDesafios } from '../services/desafioService';
import type { Desafio } from '../types/desafio';
import './DesafiosAbertos.css';

interface DesafiosAbertosProps {
  onProporIdeia: (desafioId: string) => void;
}

export function DesafiosAbertos({ onProporIdeia }: DesafiosAbertosProps) {
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

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

  const desafiosFiltrados = useMemo(() => desafios.filter((desafio) => {
    const ativo = ['ativo', 'aberto'].includes(
    desafio.status.trim().toLowerCase()
  );
    const termo = termoBusca.trim().toLowerCase();
    return ativo && (!termo || [desafio.titulo, desafio.descricao, desafio.areaDemandante].some((valor) => valor.toLowerCase().includes(termo)));
  }), [desafios, termoBusca]);

  return (
    <div className="desafios-container">
      <header className="desafios-header">
        <h1>Desafios Abertos</h1>
        <p>Explore os gargalos operacionais e estratégicos da organização e submeta a sua proposta de solução.</p>
      </header>
      <div className="desafios-banner-info"><strong>Dica para o Colaborador:</strong> Escolha um desafio abaixo que esteja alinhado à sua área de atuação e clique em “Propor Ideia”.</div>
      <div>
        <input type="text" className="desafios-search-input" placeholder="Pesquisar desafios por título, descrição ou área..." value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} />
      </div>
      {carregando && <p role="status">Carregando desafios...</p>}
      {erro && <p role="alert" style={{ color: '#b91c1c' }}>{erro}</p>}
      <div className="desafios-grid">
        {!carregando && !erro && desafiosFiltrados.length === 0 ? (
          <p className="desafios-empty">Nenhum desafio ativo encontrado.</p>
        ) : desafiosFiltrados.map((desafio) => (
          <div key={desafio.id} className="desafio-card">
            <div>
              <div className="desafio-card-header">
                <span className="desafio-badge">{desafio.areaDemandante}</span>
                <span className="desafio-data">{desafio.dataCriacao ? `Criado em: ${desafio.dataCriacao}` : `Desafio #${desafio.id}`}</span>
              </div>
              <div className="desafio-card-body" style={{ marginTop: '0.75rem' }}>
                <h3>{desafio.titulo}</h3><p>{desafio.descricao}</p>
              </div>
            </div>
            <div className="desafio-card-footer">
              <span className="desafio-autor">Impacto {desafio.impacto} · Urgência {desafio.urgencia}</span>
              <button className="desafio-btn-propor" onClick={() => onProporIdeia(desafio.id)}>Propor Ideia</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
