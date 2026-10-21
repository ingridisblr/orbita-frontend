// #region Importações
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';
// #endregion

// #region Tipos
type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children:     ReactNode;
  variant?:     ButtonVariant;
  isLoading?:   boolean;
  loadingText?: string;
}
// #endregion

// #region Componente
export function Button({
  children,
  variant     = 'primary',
  type        = 'button',
  isLoading   = false,
  loadingText = 'Carregando...',
  disabled,
  className,
  ...props
}: ButtonProps) {
  const classes = [
    'button',
    `button--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...props}
      type=      {type}
      className= {classes}
      disabled=  {disabled || isLoading}
      aria-busy= {isLoading}
    >
      {isLoading ? loadingText : children}
    </button>
  );
}
// #endregion