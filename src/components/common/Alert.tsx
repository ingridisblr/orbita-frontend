import type { ReactNode } from 'react'
import './Alert.css'

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children: ReactNode
  onClose?: () => void
}

export function Alert({ variant = 'info', title, children, onClose }: AlertProps) {
  // Erros e avisos interrompem o leitor de tela; informações aguardam a pausa.
  const role = variant === 'error' || variant === 'warning' ? 'alert' : 'status'
  return (
    <div className={`alert alert--${variant}`} role={role}>
      <div className="alert__body">
        {title && <strong className="alert__title">{title}</strong>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button type="button" className="alert__close" onClick={onClose} aria-label="Fechar aviso">
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  )
}
