import { useState } from 'react'
import { ActionFeedback, Alert, Badge, Button, Card, Select } from '../components/common'
import { useActionRunner } from '../hooks/useActionRunner'
import { useOrbita } from '../hooks/useOrbita'
import * as store from '../services/orbitaStore'
import { formatDateTime } from '../utils/format'
import './Pages.css'

export function MatchesPage() {
  const { matches, ideias, desafios } = useOrbita()
  const { error, notice, run, clear } = useActionRunner()
  const [ideiaId, setIdeiaId] = useState('')
  const [desafioId, setDesafioId] = useState('')

  const titleOfIdeia = (id: string) => ideias.find((i) => i.id === id)?.titulo ?? 'Ideia removida'
  const titleOfDesafio = (id: string) => desafios.find((d) => d.id === id)?.titulo ?? 'Desafio removido'
  const pendentes = matches.filter((m) => m.status === 'pendente')
  const decididos = matches.filter((m) => m.status !== 'pendente')

  const handleManual = () => {
    const ok = run(() => store.createManualMatch(ideiaId, desafioId), 'Vínculo manual registrado.')
    if (ok) {
      setIdeiaId('')
      setDesafioId('')
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Matches da IA</h1>
          <p className="page-lead">A IA sugere, mas a decisão final é sempre humana.</p>
        </div>
      </div>

      <div className="form-alert">
        <Alert variant="info" title="Sugestões simuladas">
          Por enquanto as sugestões são calculadas no navegador, por semelhança entre as palavras da ideia e do desafio.
          Quando a API de IA estiver ligada, elas virão do backend. Se o serviço ficar indisponível, use o vínculo manual abaixo.
        </Alert>
      </div>

      <ActionFeedback error={error} notice={notice} onClear={clear} />

      <Card title="Sugestões pendentes">
        {pendentes.length === 0 ? (
          <p className="empty">Nenhuma sugestão aguardando decisão.</p>
        ) : (
          <ul className="item-list">
            {pendentes.map((m) => (
              <li key={m.id} className="item">
                <div className="item__head">
                  <Badge tone="warning">Pendente</Badge>
                  <Badge tone="info">Compatibilidade {m.score}%</Badge>
                </div>
                <p><strong>Ideia:</strong> {titleOfIdeia(m.ideiaId)}</p>
                <p><strong>Desafio:</strong> {titleOfDesafio(m.desafioId)}</p>
                <div className="item__actions">
                  <Button onClick={() => run(() => store.decideMatch(m.id, 'confirmado'), 'Associação confirmada.')}>Confirmar</Button>
                  <Button variant="secondary" onClick={() => run(() => store.decideMatch(m.id, 'descartado'), 'Sugestão descartada.')}>
                    Descartar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Vínculo manual">
        <p className="page-lead">Associe uma ideia a um desafio sem depender da sugestão da IA.</p>
        <div className="filters">
          <Select
            label="Ideia"
            placeholder="Selecione a ideia"
            options={ideias.map((i) => ({ value: i.id, label: i.titulo }))}
            value={ideiaId}
            onChange={(e) => setIdeiaId(e.target.value)}
          />
          <Select
            label="Desafio"
            placeholder="Selecione o desafio"
            options={desafios.map((d) => ({ value: d.id, label: d.titulo }))}
            value={desafioId}
            onChange={(e) => setDesafioId(e.target.value)}
          />
        </div>
        <Button onClick={handleManual} disabled={!ideiaId || !desafioId}>Vincular</Button>
      </Card>

      <Card title="Histórico de decisões">
        {decididos.length === 0 ? (
          <p className="empty">Nenhuma decisão registrada ainda.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Ideia</th>
                  <th scope="col">Desafio</th>
                  <th scope="col">Resultado</th>
                  <th scope="col">Origem</th>
                  <th scope="col">Decidido por</th>
                </tr>
              </thead>
              <tbody>
                {decididos.map((m) => (
                  <tr key={m.id}>
                    <td>{titleOfIdeia(m.ideiaId)}</td>
                    <td>{titleOfDesafio(m.desafioId)}</td>
                    <td><Badge tone={m.status === 'confirmado' ? 'success' : 'danger'}>{m.status === 'confirmado' ? 'Confirmado' : 'Descartado'}</Badge></td>
                    <td>{m.origem === 'ia' ? `IA (${m.score}%)` : 'Manual'}</td>
                    <td>{m.decididoPor}{m.decididoEm && ` · ${formatDateTime(m.decididoEm)}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
