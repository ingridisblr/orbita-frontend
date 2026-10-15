import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { Alert, Button, Input, Select, Textarea } from '../common'
import { AREAS, PRIORIDADES } from '../../types/orbita'
import type { Prioridade } from '../../types/orbita'

export interface DesafioFormValues {
  titulo: string
  descricao: string
  area: string
  prioridade: Prioridade
}

interface DesafioFormProps {
  initial?: DesafioFormValues
  submitLabel: string
  /** Pode lançar erro: a mensagem aparece dentro do formulário. */
  onSubmit: (values: DesafioFormValues) => void
  onCancel: () => void
}

export function DesafioForm({ initial, submitLabel, onSubmit, onCancel }: DesafioFormProps) {
  const [values, setValues] = useState<DesafioFormValues>(
    initial ?? { titulo: '', descricao: '', area: '', prioridade: 'media' },
  )
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const errors = {
    titulo: values.titulo.trim().length < 5 ? 'Informe um título com pelo menos 5 caracteres.' : undefined,
    descricao: values.descricao.trim().length < 10 ? 'Descreva o desafio com pelo menos 10 caracteres.' : undefined,
    area: !values.area ? 'Escolha a área.' : undefined,
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setError('')
    if (Object.values(errors).some(Boolean)) return
    try {
      onSubmit(values)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.')
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="form-alert">
          <Alert variant="error">{error}</Alert>
        </div>
      )}
      <Input
        label="Título"
        required
        value={values.titulo}
        onChange={(e) => setValues({ ...values, titulo: e.target.value })}
        error={submitted ? errors.titulo : undefined}
      />
      <Textarea
        label="Descrição do problema"
        required
        hint="Explique o gargalo e quem é afetado por ele."
        value={values.descricao}
        onChange={(e) => setValues({ ...values, descricao: e.target.value })}
        error={submitted ? errors.descricao : undefined}
      />
      <div className="form-grid">
        <Select
          label="Área"
          required
          options={AREAS}
          placeholder="Selecione"
          value={values.area}
          onChange={(e) => setValues({ ...values, area: e.target.value })}
          error={submitted ? errors.area : undefined}
        />
        <Select
          label="Prioridade"
          options={PRIORIDADES}
          value={values.prioridade}
          onChange={(e) => setValues({ ...values, prioridade: e.target.value as Prioridade })}
        />
      </div>
      <div className="modal__actions">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}
