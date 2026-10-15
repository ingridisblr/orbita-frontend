import { Card } from '../components/common'
import { useOrbita } from '../hooks/useOrbita'
import { IDEIA_STATUS_LABEL, KANBAN_COLUNAS } from '../types/orbita'
import type { IdeiaStatus } from '../types/orbita'
import './DashboardPage.css'
import './Pages.css'

export function DashboardPage() {
  const { desafios, ideias, matches, projetos } = useOrbita()

  const triadas = ideias.filter((i) => i.triagem)
  const aprovadas = ideias.filter((i) => i.status === 'aprovada').length
  const taxa = triadas.length === 0 ? '—' : `${Math.round((aprovadas / triadas.length) * 100)}%`

  const stats = [
    { label: 'Desafios abertos', value: desafios.filter((d) => d.status === 'aberto').length },
    { label: 'Ideias recebidas', value: ideias.length },
    { label: 'Aguardando triagem', value: ideias.filter((i) => i.status === 'enviada').length },
    { label: 'Matches pendentes', value: matches.filter((m) => m.status === 'pendente').length },
    { label: 'Taxa de aprovação', value: taxa },
    { label: 'Projetos no Kanban', value: projetos.length },
  ]

  const porStatus = (Object.keys(IDEIA_STATUS_LABEL) as IdeiaStatus[]).map((s) => ({
    label: IDEIA_STATUS_LABEL[s],
    count: ideias.filter((i) => i.status === s).length,
  }))
  const porColuna = KANBAN_COLUNAS.map((c) => ({ label: c.label, count: projetos.filter((p) => p.coluna === c.id).length }))

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="page-lead">Visão geral da inovação na empresa.</p>
        </div>
      </div>

      <div className="dash__stats">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="dash__label">{s.label}</p>
            <p className="dash__number">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="dash__charts">
        <Card title="Ideias por situação">
          <Bars rows={porStatus} total={ideias.length} />
        </Card>
        <Card title="Projetos por etapa">
          <Bars rows={porColuna} total={projetos.length} />
        </Card>
      </div>
    </>
  )
}

function Bars({ rows, total }: { rows: { label: string; count: number }[]; total: number }) {
  return (
    <ul className="dash__bars">
      {rows.map((r) => (
        <li key={r.label}>
          <span>{r.label}</span>
          <progress max={Math.max(total, 1)} value={r.count} aria-label={`${r.label}: ${r.count}`} />
          <strong>{r.count}</strong>
        </li>
      ))}
    </ul>
  )
}
