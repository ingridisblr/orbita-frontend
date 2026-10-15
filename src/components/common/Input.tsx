import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Field } from './Field'
import { describedBy } from './describedBy'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, id, required, className, ...rest },
  ref,
) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <Field id={fieldId} label={label} required={required} hint={hint} error={error}>
      <input
        ref={ref}
        id={fieldId}
        className={`field__control ${className ?? ''}`.trim()}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, hint, error)}
        {...rest}
      />
    </Field>
  )
})
