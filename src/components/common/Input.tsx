// #region Importações
import      { forwardRef, useId }   from 'react';
import type { InputHTMLAttributes } from 'react';
import './Input.css';
// #endregion

// #region Tipos
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label:       string;
  error?:      string;
  helperText?: string;
}
// #endregion

// #region Componente
export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      error,
      helperText,
      id,
      className,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      ...props
    },
    ref,
  ) {
    // #region Identificação e acessibilidade
    const generatedId = useId();
    const inputId     = id ?? generatedId;
    const messageId   = `${inputId}-message`;
    const message     = error || helperText;

    const describedBy = [
      ariaDescribedBy,
      message ? messageId : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;
    // #endregion

    // #region Classes
    const classes = [
      'input',
      error ? 'input--error' : undefined,
      className,
    ]
      .filter(Boolean)
      .join(' ');
    // #endregion

    // #region Renderização
    return (
      <div className="input-field">
        <label className="input-field__label" htmlFor={inputId}>
          {label}
          {props.required && <span> (obrigatório)</span>}
        </label>

        <input
          {...props}
          ref=              {ref}
          id=               {inputId}
          className=        {classes}
          aria-invalid=     {error ? true : ariaInvalid}
          aria-describedby= {describedBy}
        />

        {message && (
          <p
            id={messageId}
            className={
              error
                ? 'input-field__message input-field__message--error'
                : 'input-field__message'
            }
            aria-live="polite"
          >
            {message}
          </p>
        )}
      </div>
    );
    // #endregion
  },
);
// #endregion