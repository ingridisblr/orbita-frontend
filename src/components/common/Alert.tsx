// #region Importações
import type { HTMLAttributes, ReactNode } from 'react';
import './Alert.css';
// #endregion

// #region Tipos
type AlertVariant = 'info' | 'warning' | 'error';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: AlertVariant;
  title?: string;
}
// #endregion

// #region Componente
export function Alert({
  children,
  variant = 'info',
  title,
  className,
  role,
  ...props
}: AlertProps) {
  // #region Classes
  const classes = [
    'alert',
    `alert--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  // #endregion

  // #region Renderização
  return (
    <div
      {...props}
      className={classes}
      role={role ?? (variant === 'error' ? 'alert' : undefined)}
    >
      <span className="alert__indicator" aria-hidden="true">
        {variant === 'info' ? 'ⓘ' : '⚠'}
      </span>

      <div className="alert__content">
        {title && <p className="alert__title">{title}</p>}

        <div className="alert__message">
          {children}
        </div>
      </div>
    </div>
  );
  // #endregion
}
// #endregion