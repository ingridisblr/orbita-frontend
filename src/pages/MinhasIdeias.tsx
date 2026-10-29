import { useEffect, useState } from 'react';
import type { Ideia } from '../types/ideia';
import { listarIdeias } from '../services/ideiaService';
import './MinhasIdeias.css';

export function MinhasIdeias() {
  const [ideias, setIdeias] = useState<Ideia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    listarIdeias({ minhas: true })
      .then((resultado) => { if (ativo) setIdeias(resultado); })
      .catch((error: unknown) => {
        if (ativo) setErro(error instanceof Error ? error.message : 'Não foi possível carregar suas ideias.');
      })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  return (
    <main className="minhas-ideias-container">
      <header className="minhas-ideias-header">
        <h1>Minhas Ideias</h1>
        <p>Ideias que você submeteu ao sistema</p>
      </header>

      {carregando && <p role="status">Carregando suas ideias...</p>}
      {erro && <p role="alert" style={{ color: '#b91c1c' }}>{erro}</p>}
      <section className="ideias-list" aria-label="Lista de ideias">
        {!carregando && !erro && ideias.length === 0 ? (
          <p className="ideias-empty">Você ainda não submeteu nenhuma ideia.</p>
        ) : (
          ideias.map((ideia) => (
            <article key={ideia.id} className="ideia-card">
              <div className="ideia-card-topo">
                <div className="ideia-identificacao">
                  <div className="ideia-status-linha">
                    <span className="ideia-id">{ideia.codigo || `IDE-${ideia.id}`}</span>
                    <span className={`status-badge status-${ideia.status.toLowerCase().replace(/\s+/g, '-')}`}>{ideia.status}</span>
                  </div>
                  <h2>{ideia.titulo}</h2>
                </div>
              </div>

              <p className="ideia-descricao">{ideia.descricao}</p>
              {ideia.beneficioEsperado && (
                <p className="ideia-descricao"><strong>Problema resolvido: </strong>{ideia.beneficioEsperado}</p>
              )}

              <div className="ideia-card-rodape">
                {ideia.categoria && <span className="ideia-categoria">{ideia.categoria}</span>}
                <span className="ideia-desafio">Desafio: {ideia.desafio || ideia.desafioId}</span>
                {ideia.data && <span className="ideia-desafio">Submetida em: {ideia.data}</span>}
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
