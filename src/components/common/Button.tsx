import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { Spinner } from './Spinner'
import './Button.css'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, fullWidth = false, disabled, className, children, type = 'button', ...rest },
  ref,
) {
  const classes = ['btn', `btn--${variant}`, `btn--${size}`, fullWidth ? 'btn--full' : '', className ?? '']
    .filter(Boolean)
    .join(' ')
  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <Spinner size="sm" label="Carregando" />}
      <span>{children}</span>
    </button>
  )
})
