// #region Importações
import type { HTMLAttributes, ReactNode } from 'react';
import './Badge.css';
// #endregion

// #region Tipos
type BadgeVariant = 'neutral' | 'outlined' | 'dark' | 'primary';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
}
// #endregion

// #region Componente
export function Badge({
  children,
  variant = 'neutral',
  className,
  ...props
}: BadgeProps) {
  // #region Classes
  const classes = [
    'badge',
    `badge--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  // #endregion

  // #region Renderização
  return (
    <span {...props} className={classes}>
      {children}
    </span>
  );
  // #endregion
}
// #endregion