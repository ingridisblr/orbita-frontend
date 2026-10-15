import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { Alert, Button, Select, Textarea } from '../common'
import type { TriagemInput } from '../../services/orbitaStore'

const NOTAS = [
  { value: '1', label: '1 — Muito baixo' },
  { value: '2', label: '2 — Baixo' },
  { value: '3', label: '3 — Médio' },
  { value: '4', label: '4 — Alto' },
  { value: '5', label: '5 — Muito alto' },
]

type Criterio = 'impacto' | 'viabilidade' | 'custo' | 'alinhamento'

const CRITERIOS: { id: Criterio; label: string; hint?: string }[] = [
  { id: 'impacto', label: 'Impacto no negócio' },
  { id: 'viabilidade', label: 'Viabilidade técnica' },
  { id: 'custo', label: 'Custo', hint: '5 significa o mais barato.' },
  { id: 'alinhamento', label: 'Alinhamento estratégico' },
]

interface TriagemFormProps {
  onSubmit: (input: TriagemInput) => void
  onCancel: () => void
}

export function TriagemForm({ onSubmit, onCancel }: TriagemFormProps) {
  const [notas, setNotas] = useState<Record<Criterio, string>>({ impacto: '', viabilidade: '', custo: '', alinhamento: '' })
  const [parecer, setParecer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const preenchidas = Object.values(notas).every(Boolean)
  const notaFinal = preenchidas
    ? Math.round((Object.values(notas).reduce((soma, n) => soma + Number(n), 0) / 4) * 10) / 10
    : null

  const decidir = (decisao: 'aprovada' | 'rejeitada') => {
    setSubmitted(true)
    setError('')
    if (!preenchidas) return
    try {
      onSubmit({
        impacto: Number(notas.impacto),
        viabilidade: Number(notas.viabilidade),
        custo: Number(notas.custo),
        alinhamento: Number(notas.alinhamento),
        parecer,
        decisao,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível registrar a triagem.')
    }
  }

  return (
    <form onSubmit={(event: SubmitEvent<HTMLFormElement>) => event.preventDefault()} noValidate>
      {error && (
        <div className="form-alert">
          <Alert variant="error">{error}</Alert>
        </div>
      )}
      <div className="form-grid">
        {CRITERIOS.map((c) => (
          <Select
            key={c.id}
            label={c.label}
            required
            hint={c.hint}
            options={NOTAS}
            placeholder="Selecione a nota"
            value={notas[c.id]}
            onChange={(e) => setNotas({ ...notas, [c.id]: e.target.value })}
            error={submitted && !notas[c.id] ? 'Escolha uma nota de 1 a 5.' : undefined}
          />
        ))}
      </div>
      <p><strong>Nota final: {notaFinal ?? '—'}</strong> (média dos quatro critérios)</p>
      <Textarea
        label="Parecer do analista"
        hint="Obrigatório para rejeitar a ideia."
        value={parecer}
        onChange={(e) => setParecer(e.target.value)}
      />
      <div className="modal__actions">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button variant="danger" onClick={() => decidir('rejeitada')}>Rejeitar</Button>
        <Button onClick={() => decidir('aprovada')}>Aprovar</Button>
      </div>
    </form>
  )
}
