// #region Importações
import      { forwardRef, useId }      from 'react';
import type { TextareaHTMLAttributes } from 'react';
import './Textarea.css';
// #endregion

// #region Tipos
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label:       string;
  error?:      string;
  helperText?: string;
}
// #endregion

// #region Componente
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      error,
      helperText,
      id,
      rows = 4,
      className,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      ...props
    },
    ref,
  ) {
    // #region Identificação e acessibilidade
    const generatedId = useId();
    const textareaId  = id ?? generatedId;
    const messageId   = `${textareaId}-message`;
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
      'textarea',
      error ? 'textarea--error' : undefined,
      className,
    ]
      .filter(Boolean)
      .join(' ');
    // #endregion

    // #region Renderização
    return (
      <div className="textarea-field">
        <label className="textarea-field__label" htmlFor={textareaId}>
          {label}
          {props.required && <span> (obrigatório)</span>}
        </label>

        <textarea
          {...props}
          ref=              {ref}
          id=               {textareaId}
          rows=             {rows}
          className=        {classes}
          aria-invalid=     {error ? true : ariaInvalid}
          aria-describedby= {describedBy}
        />

        {message && (
          <p
            id={messageId}
            className={
              error
                ? 'textarea-field__message textarea-field__message--error'
                : 'textarea-field__message'
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