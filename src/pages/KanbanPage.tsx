import { ActionFeedback, Badge, Button } from '../components/common'
import { useActionRunner } from '../hooks/useActionRunner'
import { useOrbita } from '../hooks/useOrbita'
import * as store from '../services/orbitaStore'
import { KANBAN_COLUNAS } from '../types/orbita'
import './KanbanPage.css'
import './Pages.css'

export function KanbanPage() {
  const { projetos, ideias, desafios } = useOrbita()
  const { error, notice, run, clear } = useActionRunner()

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Kanban de projetos</h1>
          <p className="page-lead">Acompanhe as ideias aprovadas até o MVP. Use os botões para mover cada cartão.</p>
        </div>
      </div>

      <ActionFeedback error={error} notice={notice} onClear={clear} />

      <div className="kanban">
        {KANBAN_COLUNAS.map((coluna, index) => {
          const cards = projetos.filter((p) => p.coluna === coluna.id)
          return (
            <section key={coluna.id} className="kanban__col" aria-labelledby={`col-${coluna.id}`}>
              <h2 id={`col-${coluna.id}`} className="kanban__title">
                {coluna.label} <Badge>{cards.length}</Badge>
              </h2>
              {cards.length === 0 && <p className="kanban__empty">Nenhum projeto.</p>}
              <ul className="kanban__list">
                {cards.map((p) => {
                  const ideia = ideias.find((i) => i.id === p.ideiaId)
                  const desafio = desafios.find((d) => d.id === ideia?.desafioId)
                  const anterior = KANBAN_COLUNAS[index - 1]
                  const proxima = KANBAN_COLUNAS[index + 1]
                  return (
                    <li key={p.id} className="kanban__card">
                      <strong>{p.titulo}</strong>
                      <span className="kanban__meta">
                        {desafio ? desafio.titulo : 'Sem desafio vinculado'}
                        {ideia?.triagem && ` · nota ${ideia.triagem.notaFinal}`}
                      </span>
                      <div className="kanban__actions">
                        <Button
                          variant="secondary"
                          disabled={!anterior}
                          onClick={() => anterior && run(() => store.moveProjeto(p.id, anterior.id))}
                        >
                          <span aria-hidden="true">←</span>
                          <span className="visually-hidden">Mover para {anterior?.label}</span>
                        </Button>
                        <Button
                          disabled={!proxima}
                          onClick={() => proxima && run(() => store.moveProjeto(p.id, proxima.id))}
                        >
                          <span aria-hidden="true">→</span>
                          <span className="visually-hidden">Mover para {proxima?.label}</span>
                        </Button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </>
  )
}
