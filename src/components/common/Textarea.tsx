import { forwardRef, useId } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { Field } from './Field'
import { describedBy } from './describedBy'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, id, required, className, ...rest },
  ref,
) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <Field id={fieldId} label={label} required={required} hint={hint} error={error}>
      <textarea
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
