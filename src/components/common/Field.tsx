import type { ReactNode } from 'react'
import './Field.css'

interface FieldProps {
  id: string
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: ReactNode
}

/** Associa rótulo, dica e erro ao campo. Usado por Input, Textarea e Select. */
export function Field({ id, label, required, hint, error, children }: FieldProps) {
  return (
    <div className="field" data-invalid={error ? 'true' : undefined}>
      <label className="field__label" htmlFor={id}>
        {label}
        {required && <span className="field__required" aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && <p className="field__hint" id={`${id}-hint`}>{hint}</p>}
      {error && <p className="field__error" id={`${id}-error`}>{error}</p>}
    </div>
  )
}
