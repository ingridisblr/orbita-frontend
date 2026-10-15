import { useState } from 'react'
import { ActionFeedback, Badge, Button, Card, Modal } from '../components/common'
import { TriagemForm } from '../components/ideias/TriagemForm'
import { useActionRunner } from '../hooks/useActionRunner'
import { useOrbita } from '../hooks/useOrbita'
import * as store from '../services/orbitaStore'
import type { Ideia } from '../types/orbita'
import { formatDate } from '../utils/format'
import './Pages.css'

export function TriagemPage() {
  const { ideias, desafios } = useOrbita()
  const { error, notice, clear, flash } = useActionRunner()
  const [avaliando, setAvaliando] = useState<Ideia | null>(null)

  const fila = ideias.filter((i) => i.status === 'enviada')
  const concluidas = ideias.filter((i) => i.triagem)
  const desafioDe = (i: Ideia) => desafios.find((d) => d.id === i.desafioId)?.titulo ?? 'Sem desafio vinculado'

  const handleSubmit = (input: store.TriagemInput) => {
    if (!avaliando) return
    store.triarIdeia(avaliando.id, input)
    flash(
      input.decisao === 'aprovada'
        ? 'Ideia aprovada e enviada ao Kanban.'
        : 'Ideia rejeitada. O parecer ficou registrado.',
    )
    setAvaliando(null)
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Triagem</h1>
          <p className="page-lead">Avalie cada ideia com notas de 1 a 5. Ideias aprovadas entram no Kanban.</p>
        </div>
      </div>

      <ActionFeedback error={error} notice={notice} onClear={clear} />

      <Card title="Fila de triagem">
        {fila.length === 0 ? (
          <p className="empty">Nenhuma ideia aguardando triagem.</p>
        ) : (
          <ul className="item-list">
            {fila.map((i) => (
              <li key={i.id} className="item">
                <h3 className="item__title">{i.titulo}</h3>
                <p className="item__meta">{i.autorNome} · {formatDate(i.criadoEm)} · {desafioDe(i)}</p>
                <p>{i.descricao}</p>
                <div className="item__actions">
                  <Button onClick={() => setAvaliando(i)}>Avaliar</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Triagens concluídas">
        {concluidas.length === 0 ? (
          <p className="empty">Nenhuma triagem concluída ainda.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Ideia</th>
                  <th scope="col">Resultado</th>
                  <th scope="col">Nota final</th>
                  <th scope="col">Parecer</th>
                  <th scope="col">Analista</th>
                </tr>
              </thead>
              <tbody>
                {concluidas.map((i) => (
                  <tr key={i.id}>
                    <td>{i.titulo}</td>
                    <td><Badge tone={i.status === 'aprovada' ? 'success' : 'danger'}>{i.status === 'aprovada' ? 'Aprovada' : 'Rejeitada'}</Badge></td>
                    <td>{i.triagem?.notaFinal}</td>
                    <td>{i.triagem?.parecer || '—'}</td>
                    <td>{i.triagem?.analistaNome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={avaliando !== null} onClose={() => setAvaliando(null)} title="Triagem multicritério">
        {avaliando && (
          <>
            <p><strong>{avaliando.titulo}</strong></p>
            <p className="page-lead">{avaliando.descricao}</p>
            <TriagemForm onSubmit={handleSubmit} onCancel={() => setAvaliando(null)} />
          </>
        )}
      </Modal>
    </>
  )
}
