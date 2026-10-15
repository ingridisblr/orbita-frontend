import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { Alert, Button, Input, Select, Textarea } from '../common'
import type { Desafio } from '../../types/orbita'

export interface IdeiaFormValues {
  titulo: string
  descricao: string
  desafioId: string | null
}

interface IdeiaFormProps {
  desafiosAbertos: Desafio[]
  initialDesafioId?: string | null
  onSubmit: (values: IdeiaFormValues) => void
  onCancel: () => void
}

export function IdeiaForm({ desafiosAbertos, initialDesafioId = null, onSubmit, onCancel }: IdeiaFormProps) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [desafioId, setDesafioId] = useState(initialDesafioId ?? '')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const errors = {
    titulo: titulo.trim().length < 5 ? 'Informe um título com pelo menos 5 caracteres.' : undefined,
    descricao: descricao.trim().length < 20 ? 'Explique a ideia com pelo menos 20 caracteres.' : undefined,
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setError('')
    if (errors.titulo || errors.descricao) return
    try {
      onSubmit({ titulo, descricao, desafioId: desafioId || null })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a ideia.')
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="form-alert">
          <Alert variant="error">{error}</Alert>
        </div>
      )}
      <Select
        label="Desafio relacionado"
        hint="Opcional. Se você não escolher, o analista poderá vincular depois."
        options={desafiosAbertos.map((d) => ({ value: d.id, label: d.titulo }))}
        placeholder="Sem desafio específico"
        value={desafioId}
        onChange={(e) => setDesafioId(e.target.value)}
      />
      <Input
        label="Título da ideia"
        required
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        error={submitted ? errors.titulo : undefined}
      />
      <Textarea
        label="Descreva a solução"
        required
        hint="Explique o que propõe e como isso resolve o problema."
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        error={submitted ? errors.descricao : undefined}
      />
      <div className="modal__actions">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Enviar ideia</Button>
      </div>
    </form>
  )
}
