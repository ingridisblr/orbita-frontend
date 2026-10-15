import { Card } from '../components/common'
import { useOrbita } from '../hooks/useOrbita'
import { formatDateTime } from '../utils/format'
import './Pages.css'

export function AuditoriaPage() {
  const { auditoria } = useOrbita()

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Auditoria</h1>
          <p className="page-lead">Registro das últimas ações feitas na plataforma (até 300).</p>
        </div>
      </div>
      <Card>
        {auditoria.length === 0 ? (
          <p className="empty">Nenhuma ação registrada ainda.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Data</th>
                  <th scope="col">Pessoa</th>
                  <th scope="col">Ação</th>
                  <th scope="col">Detalhe</th>
                </tr>
              </thead>
              <tbody>
                {auditoria.map((a) => (
                  <tr key={a.id}>
                    <td>{formatDateTime(a.em)}</td>
                    <td>{a.usuario}</td>
                    <td>{a.acao}</td>
                    <td>{a.detalhe}</td>
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
