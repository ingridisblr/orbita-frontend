
import type { Ideia } from '../types/ideia';
import                     './MinhasIdeias.css';

interface MinhasIdeiasProps {
  ideias: Ideia[];
}

export function MinhasIdeias({ ideias }: MinhasIdeiasProps) {
  return (
    <main className="minhas-ideias-container">
      <header className="minhas-ideias-header">
        <h1>Minhas Ideias</h1>
        <p>Ideias que você submeteu ao sistema</p>
      </header>

      <section className="ideias-list" aria-label="Lista de ideias">
        {ideias.length === 0 ? (
          <p className="ideias-empty">
            Você ainda não submeteu nenhuma ideia.
          </p>
        ) : (
          ideias.map((ideia) => (
            <article key={ideia.id} className="ideia-card">
              <div className="ideia-card-topo">
                <div className="ideia-identificacao">
                  <div className="ideia-status-linha">
                    <span className="ideia-id">
                      IDA-{ideia.id.slice(0, 8)}
                    </span>

                    <span
                      className={`status-badge status-${ideia.status
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`}
                    >
                      {ideia.status}
                    </span>
                  </div>

                  <h2>{ideia.titulo}</h2>
                </div>
              </div>

              <p className="ideia-descricao">{ideia.descricao}</p>

              {ideia.beneficioEsperado && (
                <p className="ideia-descricao">
                  <strong>Benefício esperado: </strong>
                  {ideia.beneficioEsperado}
                </p>
              )}

              <div className="ideia-card-rodape">
                {ideia.categoria && (
                  <span className="ideia-categoria">
                    {ideia.categoria}
                  </span>
                )}

                <span className="ideia-desafio">
                  Desafio: {ideia.desafioId}
                </span>

                <span className="ideia-desafio">
                  Submetida em: {ideia.data}
                </span>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
